const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
require('dotenv').config();


//!User registration

const userCtr = {
    //!Register
    register: asyncHandler(async(req, res) =>{
        const{username, email, password, role} = req.body;
        
        //!validate
        if(!username || !email || !password){
            throw new Error("All fields are required");
        }

        //!check if user exists
        const userExists = await User.findOne({ email });
        if (userExists){
            throw new Error("User already exists"); 
        }

        //!Hash the user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        //!create user and save it into db
        const userCreated = await User.create({
            email,
            username,
            password: hashedPassword,
            role: role || "user", // Default to "user" if role is not provided
        });

        //!send the response
        res.json({
            username: userCreated.username,
            email:userCreated.email,
            id:userCreated._id,
            role: userCreated.role, // Include role in the response
        });
    }),

    //!Login
    login: asyncHandler(async(req,res)=>{
        //get user data
        const{email,password} = req.body;

        //check if email is valid
        const user = await User.findOne({email});
        if(!user){
            throw new Error('Invalid login credentials')
        }

        //compare user password
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            throw new Error('Invalid login credentials');
        }

        //generate a token
        const token = jwt.sign({ id: user._id, role: user.role },
            process.env.JWT_SECRET ,
            { expiresIn: "365d",}
        );

        //send the response
        res.json({
            message:'Login successful!',
            token,
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role, // Include role in the response
        });

    }),
    //!profile
    profile: asyncHandler(async(req, res)=>{
        
        //find the user
        console.log(req.user);
        const user=await User.findById(req.user.id);
        
        if(!user){
            throw new Error ("User not found");
        }
        //send the response
        res.json({ 
            username:user.username, 
            email:user.email,
            role: user.role,
        });
    }),

    //!update password
    changeUserPassword: asyncHandler(async (req, res)=>{
        const {newPassword} = req.body;

        //find the user
        const user =await User.findById(req.user.id);
        if(!user){
            throw new Error ("User not found");
        }

        //hash the new password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;

        //resave
        await user.save();

        //send the response
        res.json({ message:"Password changed successfully" });
    }),

    //!update user profile
    updateUserProfile: asyncHandler(async (req, res)=>{
        const {email, username} = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            {
                username,
                email,
        },{
            new:true,
        }
    );
        //send the response
        res.json({ message:"User Profile updated successfully", updatedUser});
    }),


    //edits

    //! Get all users (Admin only)
    getAllUsersAdminOnly: asyncHandler(async (req, res) => {
        const users = await User.find({}).select("-password"); // Exclude passwords
        res.json(users);
    }),

    //! Delete a user (Admin only)
    deleteUserAdminOnly: asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);
        if (!user) {
            throw new Error("User not found");
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    }),

};

module.exports = userCtr;