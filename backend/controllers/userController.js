const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
//const { use } = require("../routes/userRouter");


//!User registration

const userCtr = {
    //!Register
    register: asyncHandler(async(req, res) =>{
        const{username, email, password} = req.body;
        
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
        });

        //!send the response
        res.json({
            username: userCreated.username,
            email:userCreated.email,
            id:userCreated._id,
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
        const token = jwt.sign({ id: user._id }, "financeTrackerKey",{
            expiresIn: "365d",
        });

        //send the response
        res.json({
            message:'Login successful!',
            token,
            id: user._id,
            email: user.email,
            username: user.username,
        });

    }),
    //!profile
    profile: asyncHandler(async(req, res)=>{
        
        //find the user
        console.log(req.user);
        const user=await User.findById(req.user);
        
        if(!user){
            throw new Error ("User not found");
        }
        //send the response
        res.json({ username:user.username, email:user.email });
    }),

    //!update password
    changeUserPassword: asyncHandler(async (req, res)=>{
        const {newPassword} = req.body;

        //find the user
        const user =await User.findById(req.user);
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

        const updatedUser = await User.findByIdAndUpdate(req.user, {
            username,
            email,
        },{
            new:true,
        }
    );
        //send the response
        res.json({ message:"User Profile updated successfully", updatedUser});
    }),

};

module.exports = userCtr;