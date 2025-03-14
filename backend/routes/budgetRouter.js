const express = require("express");
const budgetController = require("../controllers/budgetController");
const isAuthenticated = require("../middleware/isAuth");

const budgetRouter = express.Router();

//!create budget
budgetRouter.post(
    "/api/v1/budgets/create",
    isAuthenticated,
    budgetController.createBudget
);

//!get budget
budgetRouter.get(
    "/api/v1/budgets/lists",
    isAuthenticated,
    budgetController.getBudgets
);

//!update
budgetRouter.put(
    "/api/v1/budgets/update/:id",
    isAuthenticated,
    budgetController.updateBudget
);

//!delete 
budgetRouter.delete(
    "/api/v1/budgets/delete/:id",
    isAuthenticated,
    budgetController.deleteBudget
);

module.exports = budgetRouter;
