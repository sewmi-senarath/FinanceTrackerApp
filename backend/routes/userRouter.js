const express = require("express");
const userCtr = require("../controllers/userController");
const isAuthenticated = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");
const userRouter = express.Router();

//!register
userRouter.post("/register", 
    userCtr.register
);

//!login
userRouter.post("/login", 
    userCtr.login
);

//!profile
userRouter.get("/profile", 
    isAuthenticated, 
    userCtr.profile
);

//!update password
userRouter.put("/changePassword", 
    isAuthenticated, 
    userCtr.changeUserPassword
);

//!update profile
userRouter.put("/updateProfile", 
    isAuthenticated, 
    userCtr.updateUserProfile
);

//?ADMIN ONLY ROUTERS
//!Get all users (Admin only)
userRouter.get(
    "/admin/getUsers",
    isAuthenticated,
    isAdmin, // Only admins can access this route
    userCtr.getAllUsersAdminOnly
);

//!Delete a user (Admin only)
userRouter.delete(
    "/admin/delete/:id",
    isAuthenticated,
    isAdmin, // Only admins can access this route
    userCtr.deleteUserAdminOnly
);

module.exports = userRouter;