const express = require("express");
const goalController = require("../controllers/goalController");
const isAuthenticated = require("../middleware/isAuth");

const router = express.Router();

//! Create a new goal
router.post(
    "/api/v1/goals/create", 
    isAuthenticated, 
    goalController.createGoal
);

//! Get all goals for the logged-in user
router.get(
    "/api/v1/goals/lists", 
    isAuthenticated, 
    goalController.getGoals
);

//! Update a goal
router.put(
    "/api/v1/goals/update/:id", 
    isAuthenticated, 
    goalController.updateGoal
);

//! Delete a goal
router.delete(
    "/api/v1/goals/delete/:id", 
    isAuthenticated, 
    goalController.deleteGoal);

module.exports = router;