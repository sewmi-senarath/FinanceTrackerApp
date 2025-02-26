const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routes/userRouter");
const app = express();

//connect to MongoDB
mongoose
    .connect()
    .then(() => console.log("MongoDB connected"))
    .catch((e) =>console.log(e));


//Routes
app.use("/",userRouter);

//start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT,
    () => console.log(`Server is running on the PORT ${PORT}...!`)
);
