const mongoose = require("mongoose"); 
const Budget = require("../model/Budget");
const Transaction = require("../model/Transaction");
const Notification = require("../model/Notification");
const axios = require("axios");

// Currency conversion function
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    try {
        const response = await axios.get(
            `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
        );
        const exchangeRate = response.data.rates[toCurrency];
        if (!exchangeRate) {
            throw new Error(`Exchange rate not found for ${toCurrency}`);
        }
        return amount * exchangeRate;
    } catch (error) {
        console.error(`Currency conversion failed: ${error.message}`);
        throw error;
    }
};

const checkBudgetUsage = async (userId, categoryName, transactionAmount) => {
    try {
        // Find all budgets for the user
        const budgets = await Budget.find({ 
            user: userId 
        }).populate("category");

        for (const budget of budgets) {
            // Skip if the budget category doesn't match the transaction category
            if (budget.category.name.toLowerCase() !== categoryName.toLowerCase()) {
                continue;
            }

            // Calculate the start and end of the budget period
            const now = new Date();
            let startOfPeriod, endOfPeriod;

            if (budget.period === "monthly") {
                startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
                endOfPeriod = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            } else if (budget.period === "weekly") {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
                startOfPeriod = new Date(startOfWeek);
                endOfPeriod = new Date(startOfWeek);
                endOfPeriod.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)
            } else {
                // Handle custom or other periods
                startOfPeriod = budget.startDate;
                endOfPeriod = budget.endDate || now;
            }

            // Calculate total spending for the budget category in the current period
            const transactions = await Transaction.find({
                user: new mongoose.Types.ObjectId(userId),
                category: budget.category.name, // Compare with category name (string)
                date: { 
                    $gte: startOfPeriod, 
                    $lte: endOfPeriod 
                },
            });

            // Sum the spending in the budget's currency
            let totalSpending = 0;
            for (const transaction of transactions) {
                try {
                    const convertedAmount = await convertCurrency(
                        transaction.amount,
                        transaction.currency, // Use the transaction's currency
                        budget.currency // Budget currency
                    );
                    totalSpending += convertedAmount;
                } catch (error) {
                    console.error(`Failed to convert currency for transaction ${transaction._id}: ${error.message}`);
                    totalSpending += transaction.amount; // Fallback to unconverted amount
                }
            }

            const remainingBudget = budget.amount - totalSpending;

            // Check if a similar notification already exists
            const existingNotification = await Notification.findOne({
                user: userId,
                type: "budget_alert",
                message: {
                    $in: [
                        `You have exceeded your ${budget.category.name} budget of ${budget.currency} ${budget.amount}.`,
                        `You are nearing your ${budget.category.name} budget. Only ${budget.currency} ${remainingBudget.toFixed(2)} remaining.`,
                    ],
                },
            });

            if (existingNotification) {
                continue; // Skip if a similar notification already exists
            }

            // Notify if nearing or exceeding the budget
            if (remainingBudget <= 0) {
                await Notification.create({
                    user: userId,
                    type: "budget_alert",
                    message: `You have exceeded your ${budget.category.name} budget of ${budget.currency} ${budget.amount}.`,
                });
                console.log(`Notification created: Exceeded budget for ${budget.category.name}`);
            } else if (remainingBudget <= budget.amount * 0.2) {
                await Notification.create({
                    user: userId,
                    type: "budget_alert",
                    message: `You are nearing your ${budget.category.name} budget. Only ${budget.currency} ${remainingBudget.toFixed(2)} remaining.`,
                });
                console.log(`Notification created: Nearing budget for ${budget.category.name}`);
            }
        }
    } catch (error) {
        console.error("Error in checkBudgetUsage:", error.message);
    }
};

module.exports = checkBudgetUsage;