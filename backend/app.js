const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routes/userRouter");
const errorHandler = require("./middleware/errorHandlerMiddleware");
const categoryRouter = require("./routes/categoryRouter");
const transactionRouter = require("./routes/transactionRouter");
const goalRouter = require("./routes/goalRouter");
const notificationRouter = require("./routes/notificationRouter");
const Scheduler = require("./scheduler");
const billRouter = require("./routes/billRouter");
const budgetRouter = require("./routes/budgetRouter");
require('dotenv').config();
const app = express();

//!connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((e) =>console.log(e));

//!middleware
app.use(express.json()) //*pass incoming json data

//!Routes
app.use("/",userRouter);
app.use("/",categoryRouter);
app.use("/",transactionRouter);
app.use("/", goalRouter);
app.use("/",notificationRouter);
app.use("/",billRouter);
app.use("/",budgetRouter);

//!error
app.use(errorHandler);

//!start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT,
    () => console.log(`Server is running on PORT ${PORT}...!`)
);

