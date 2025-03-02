const express = require("express");
const userCtr = require("../controllers/userController");

const userRouter = express.Router();

//!register
userRouter.post("/api/v1/users/register", userCtr.register);

//!login
userRouter.post("/api/v1/users/login", userCtr.login);

//!profile
userRouter.get("/api/v1/users/profile", userCtr.profile);

module.exports = userRouter;