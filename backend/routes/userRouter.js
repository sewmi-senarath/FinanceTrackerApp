const express = require("express");
const userCtr = require("../controllers/userController");

const userRouter = express.Router();
userRouter.post("/api/v1/users/register", userCtr.register);

module.exports = userRouter;