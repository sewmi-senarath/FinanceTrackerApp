const express = require("express");
const budgetController = require("../controllers/budgetController");
const isAuthenticated = require("../middleware/isAuth");

const budgetRouter = express.Router();

//!create budget
budgetRouter.post(
    "/create",
    isAuthenticated,
    budgetController.createBudget
);

//!get budget
budgetRouter.get(
    "/lists",
    isAuthenticated,
    budgetController.getBudgets
);

//!update
budgetRouter.put(
    "/update/:id",
    isAuthenticated,
    budgetController.updateBudget
);

//!delete 
budgetRouter.delete(
    "/delete/:id",
    isAuthenticated,
    budgetController.deleteBudget
);

module.exports = budgetRouter;
