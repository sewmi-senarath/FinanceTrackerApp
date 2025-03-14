const asyncHandler = require("express-async-handler");
const Goal = require("../model/Goal");

const goalCtr = {
    //! Create a new goal
    createGoal: asyncHandler(async (req, res) => {
        const { name, targetAmount, targetDate, allocationPercentage } = req.body;

        if (!name || !targetAmount) {
            throw new Error("Name and target amount are required");
        }

        // Create the goal
        const goal = await Goal.create({
            user: req.user.id,
            name,
            targetAmount,
            targetDate,
            allocationPercentage,
        });

        res.status(201).json(goal);
    }),

    //! Get all goals for the logged-in user
    getGoals: asyncHandler(async (req, res) => {
        const goals = await Goal.find({ user: req.user.id });
        res.json(goals);
    }),

    //! Update a goal
    updateGoal: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, targetAmount, targetDate, savedAmount, allocationPercentage } = req.body;

        // Find the goal
        const goal = await Goal.findOne({
            _id: id,
            user: req.user.id,
        });

        if (!goal) {
            throw new Error("Goal not found or unauthorized");
        }

        // Update the goal
        goal.name = name || goal.name;
        goal.targetAmount = targetAmount || goal.targetAmount;
        goal.targetDate = targetDate || goal.targetDate;
        goal.savedAmount = savedAmount || goal.savedAmount;
        goal.allocationPercentage = allocationPercentage || goal.allocationPercentage;

        const updatedGoal = await goal.save();
        res.json(updatedGoal);
    }),

    //! Delete a goal
    deleteGoal: asyncHandler(async (req, res) => {
        const { id } = req.params;

        // Find the goal
        const goal = await Goal.findOne({
            _id: id,
            user: req.user.id,
        });

        if (!goal) {
            throw new Error("Goal not found or unauthorized");
        }

        // Delete the goal
        await Goal.findByIdAndDelete(id);
        res.json({ message: "Goal deleted successfully" });
    }),
};

module.exports = goalCtr;