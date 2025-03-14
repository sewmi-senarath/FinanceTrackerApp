// const asyncHandler = require("express-async-handler");
// const Budget = require("../model/Budget");
// const Transaction = require("../model/Transaction");
// const Notification = require("../model/Notification");
// const axios = require("axios");

// // Currency conversion function
// const convertCurrency = async (amount, fromCurrency, toCurrency) => {
//     try {
//         const response = await axios.get(
//             `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
//         );
//         const exchangeRate = response.data.rates[toCurrency];
//         if (!exchangeRate) {
//             throw new Error(`Exchange rate not found for ${toCurrency}`);
//         }
//         return amount * exchangeRate;
//     } catch (error) {
//         console.error("Currency conversion failed:", error.message);
//         throw error;
//     }
// };

// const checkBudgetUsage = async (userId) => {
//     const budgets = await Budget.find({ 
//         user: userId 
//     }).populate("category");

//     for (const budget of budgets) {
//         // Calculate total spending for the budget category in the current period
//         const startOfPeriod = new Date(); 
//         const endOfPeriod = new Date();

//         const totalSpending = await Transaction.aggregate([
//             {
//                 $match: {
//                     user: userId,
//                     category: budget.category._id, // Category ID
//                     date: { 
//                         $gte: startOfPeriod, 
//                         $lte: endOfPeriod 
//                     },
//                 },
//             },
//             {
//                 $group: {
//                     _id: null,
//                     total: { 
//                         $sum: "$amount" 
//                     },
//                 },
//             },
//         ]);

//         // Convert spending to the budget's currency
//         const spending = totalSpending.length > 0 ? totalSpending[0].total : 0;
//         const spendingInBudgetCurrency = await convertCurrency(
//             spending, 
//             "USD", // Assuming transactions are in USD
//             budget.currency // Budget currency
//         );

//         const remainingBudget = budget.amount - spendingInBudgetCurrency;

//         // Notify if nearing or exceeding the budget
//         if (remainingBudget <= 0) {
//             await Notification.create({
//                 user: userId,
//                 type: "budget_alert",
//                 message: `You have exceeded your ${budget.category.name} budget of ${budget.currency} ${budget.amount}.`,
//             });
//         } else if (remainingBudget <= budget.amount * 0.2) {
//             await Notification.create({
//                 user: userId,
//                 type: "budget_alert",
//                 message: `You are nearing your ${budget.category.name} budget. Only ${budget.currency} ${remainingBudget.toFixed(2)} remaining.`,
//             });
//         }
//     }
// };

// module.exports = checkBudgetUsage;

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
        console.error("Currency conversion failed:", error.message);
        throw error;
    }
};

const checkBudgetUsage = async (userId, categoryId, amount) => {
    try {
        // Find all budgets for the user
        const budgets = await Budget.find({ 
            user: userId 
        }).populate("category");

        for (const budget of budgets) {
            // Calculate the start and end of the budget period
            const now = new Date();
            let startOfPeriod, endOfPeriod;

            if (budget.period === "monthly") {
                startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
                endOfPeriod = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            } 
            else if (budget.period === "weekly") {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
                startOfPeriod = new Date(startOfWeek);
                endOfPeriod = new Date(startOfWeek);
                endOfPeriod.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)
            } 
            else {
                // Handle custom or other periods
                startOfPeriod = budget.startDate;
                endOfPeriod = budget.endDate;
            }

            // Calculate total spending for the budget category in the current period
            const totalSpending = await Transaction.aggregate([
                {
                    $match: {
                        user: userId,
                        category: budget.category._id, // Category ID
                        date: { 
                            $gte: startOfPeriod, 
                            $lte: endOfPeriod 
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { 
                            $sum: "$amount" 
                        },
                    },
                },
            ]);

            // Convert spending to the budget's currency
            const spending = totalSpending.length > 0 ? totalSpending[0].total : 0;
            let spendingInBudgetCurrency;

            try {
                spendingInBudgetCurrency = await convertCurrency(
                    spending, 
                    "USD", // Assuming transactions are in USD
                    budget.currency // Budget currency
                );
            } catch (error) {
                console.error(`Currency conversion failed for budget ${budget._id}. Using spending as-is.`);
                spendingInBudgetCurrency = spending; // Fallback to spending without conversion
            }

            const remainingBudget = budget.amount - spendingInBudgetCurrency;

            // Notify if nearing or exceeding the budget
            if (remainingBudget <= 0) {
                await Notification.create({
                    user: userId,
                    type: "budget_alert",
                    message: `You have exceeded your ${budget.category.name} budget of ${budget.currency} ${budget.amount}.`,
                });
            } else if (remainingBudget <= budget.amount * 0.2) {
                await Notification.create({
                    user: userId,
                    type: "budget_alert",
                    message: `You are nearing your ${budget.category.name} budget. Only ${budget.currency} ${remainingBudget.toFixed(2)} remaining.`,
                });
            }
        }
    } catch (error) {
        console.error("Error in checkBudgetUsage:", error);
    }
};

module.exports = checkBudgetUsage;