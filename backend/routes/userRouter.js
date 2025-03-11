const express = require("express");
const userCtr = require("../controllers/userController");
const isAuthenticated = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");
const userRouter = express.Router();

//!register
userRouter.post("/api/v1/users/register", 
    userCtr.register
);

//!login
userRouter.post("/api/v1/users/login", 
    userCtr.login
);

//!profile
userRouter.get("/api/v1/users/profile", 
    isAuthenticated, 
    userCtr.profile
);

//!update password
userRouter.put("/api/v1/users/changePassword", 
    isAuthenticated, 
    userCtr.changeUserPassword
);

//!update profile
userRouter.put("/api/v1/users/updateProfile", 
    isAuthenticated, 
    userCtr.updateUserProfile
);

//?ADMIN ONLY ROUTERS
//!Get all users (Admin only)
userRouter.get(
    "/api/v1/admin/users",
    isAuthenticated,
    isAdmin, // Only admins can access this route
    userCtr.getAllUsersAdminOnly
);

//!Delete a user (Admin only)
userRouter.delete(
    "/api/v1/admin/users/delete/:id",
    isAuthenticated,
    isAdmin, // Only admins can access this route
    userCtr.deleteUserAdminOnly
);


module.exports = userRouter;