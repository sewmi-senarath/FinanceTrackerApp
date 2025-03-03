const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routes/userRouter");
const errorHandler = require("./middleware/errorHandlerMiddleware");
const categoryRouter = require("./routes/categoryRouter");
const app = express();

//!connect to MongoDB
mongoose
    .connect("mongodb+srv://sewmisenarath:vqNR2YhfP39Rf1RT@cluster2.jr9ix.mongodb.net/FinanceTracker")
    .then(() => console.log("MongoDB connected"))
    .catch((e) =>console.log(e));

//!middleware
app.use(express.json()) //*pass incoming json data

//!Routes
app.use("/",userRouter);
app.use("/",categoryRouter)

//!error
app.use(errorHandler);

//!start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT,
    () => console.log(`Server is running on PORT ${PORT}...!`)
);
