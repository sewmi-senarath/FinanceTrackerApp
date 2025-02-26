const asyncHandler = require("express-async-handler");
const User = require("../model/User");


//!User registration

const userCtr = {
    //!Register
    register: asyncHandler(async(req, res) =>{
        res.json({message: "register"});
    }),

    //!Login
    //!profile
};

module.exports = userCtr;