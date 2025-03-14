const asyncHandler = require("express-async-handler");
const Budget = require("../model/Budget");
const Category = require("../model/Category");
const Notification = require("../model/Notification");
const mongoose = require("mongoose");

const budgetCtr = {
    //!Create a new budget
    createBudget: asyncHandler(async (req, res) => {
        const { 
            category, 
            amount,
            currency,
            period, 
            endDate 
        } = req.body;

        //!Check if the category is provided as a name or ID
        let categoryId = category;

        //!If category is a name, find the corresponding category ID
        if (typeof category === "string" && !mongoose.Types.ObjectId.isValid(category)) {
            const categoryDoc = await Category.findOne({ 
                name: category.toLowerCase(), 
                user: req.user.id 
            });

            if (!categoryDoc) {
                res.status(404);
                throw new Error("Category not found");
            }

            categoryId = categoryDoc._id;
        }

        //!check if the category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            res.status(404);
            throw new Error("Use an existing category");
        }

        const budget = await Budget.create({
            user: req.user.id,
            category, //!store the category ID
            amount,
            currency,
            period,
            endDate,
        });

        res.status(201).json(budget);
    }),

    //!get all budgets
    getBudgets: asyncHandler(async (req, res) => {
        const budgets = await Budget.find({ 
            user: req.user.id 
        }).populate("category"); // Populate category details

        res.json(budgets);
    }),

    //!update a budget
    updateBudget: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { 
            category, 
            amount, 
            period, 
            endDate 
        } = req.body;

        const budget = await Budget.findOne({ 
            _id: id, 
            user: req.user.id 
        });

        if (!budget) {
            res.status(404);
            throw new Error("Budget not found or unauthorized");
        }

        //!check if the new category exists
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                res.status(404);
                throw new Error("Category not found");
            }
            budget.category = category;
        }

        budget.amount = amount || budget.amount;
        budget.period = period || budget.period;
        budget.endDate = endDate || budget.endDate;

        await budget.save();

        res.json(budget);
    }),

    //!delete a budget
    deleteBudget: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const budget = await Budget.findOne({ 
            _id: id, 
            user: req.user.id 
        });

        if (!budget) {
            res.status(404);
            throw new Error("Budget not found or unauthorized");
        }

        await budget.deleteOne();

        res.json({ message: "Budget deleted successfully" });
    }),
};

module.exports = budgetCtr;