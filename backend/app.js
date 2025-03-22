const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routes/userRouter');
const errorHandler = require('./middleware/errorHandlerMiddleware');
const categoryRouter = require('./routes/categoryRouter');
const transactionRouter = require('./routes/transactionRouter');
const goalRouter = require('./routes/goalRouter');
const notificationRouter = require('./routes/notificationRouter');
const billRouter = require('./routes/billRouter');
const budgetRouter = require('./routes/budgetRouter');
const Scheduler = require("./scheduler");
require('dotenv').config();

const app = express();

//! Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('MongoDB connected');
    }
  })
  .catch((e) => {
    console.error('MongoDB connection error:', e);
  });

//! Middleware
app.use(express.json()); // Parse incoming JSON data

//! Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/goals", goalRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/bills", billRouter);
app.use("/api/v1/budgets", budgetRouter);

//! Error handler
app.use(errorHandler);

//! Start the server
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`Server is running on PORT ${PORT}...!`);
  }
});

//!export app for testing
module.exports = {app, server};