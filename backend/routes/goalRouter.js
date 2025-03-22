const express = require("express");
const goalController = require("../controllers/goalController");
const isAuthenticated = require("../middleware/isAuth");

const router = express.Router();

//! Create a new goal
router.post(
    "/create", 
    isAuthenticated, 
    goalController.createGoal
);

//! Get all goals for the logged-in user
router.get(
    "/lists", 
    isAuthenticated, 
    goalController.getGoals
);

//! Update a goal
router.put(
    "/update/:id", 
    isAuthenticated, 
    goalController.updateGoal
);

//! Delete a goal
router.delete(
    "/delete/:id", 
    isAuthenticated, 
    goalController.deleteGoal);

module.exports = router;