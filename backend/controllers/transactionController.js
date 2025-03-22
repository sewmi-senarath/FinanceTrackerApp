const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Category = require("../model/Category");
const Transaction = require("../model/Transaction");
const User = require("../model/User");
const { getExchangeRate } = require("../utils/exchangeRate");
const Goal = require("../model/Goal");
const checkBudgetUsage = require("../triggers/checkBudgetUsage");

const transactionCtr = {
    //!add
    create: asyncHandler(async (req, res) => {
        const { type, category, amount, date, description, currency } = req.body;

        if (!amount || !type || !date || !currency) {
            throw new Error("Please fill required fields!!");
        }

        //!Resolve category name to ensure consistency
        let categoryName = category;
        if (mongoose.Types.ObjectId.isValid(category)) {
            const categoryDoc = await Category.findById(category);
            if (!categoryDoc) {
                throw new Error("Category not found");
            }
            categoryName = categoryDoc.name;
        } else {
            const categoryDoc = await Category.findOne({
                name: category.toLowerCase(),
                user: req.user.id,
            });
            if (!categoryDoc) {
                throw new Error("Category not found");
            }
            categoryName = categoryDoc.name;
        }

        //!create transaction
        const transaction = await Transaction.create({
            user: req.user.id,
            type,
            category: categoryName,
            amount,
            currency,
            description,
        });

        //!Trigger budget usage check
        await checkBudgetUsage(
            req.user.id,
            categoryName, 
            amount
        );

        //!If the transaction is an income, allocate savings to goals
        if (type === "income") {
            const goals = await Goal.find({ user: req.user.id });

            for (const goal of goals) {
                if (goal.allocationPercentage > 0) {
                    const allocatedAmount = (amount * goal.allocationPercentage) / 100;
                    goal.savedAmount += allocatedAmount;
                    await goal.save();
                }
            }
        }

        res.status(201).json(transaction);
    }),

    //!lists
    getFilteredTransactions: asyncHandler(async (req, res) => {
        const { startDate, endDate, type, category } = req.query;
        let filters = { user: req.user.id };

        if (startDate) {
            filters.date = { ...filters.date, $gte: new Date(startDate) };
        }
        if (endDate) {
            filters.date = { ...filters.date, $lte: new Date(endDate) };
        }
        if (type) {
            filters.type = type;
        }
        if (category) {
            if (category === "All") {
                //*no category filter needed
            } else if (category === "Uncategorized") {
                //*transactions that are specified as uncategorized
                filters.category = "Uncategorized";
            } else {
                filters.category = category;
            }
        }

        //fetch transactions
        const transactions = await Transaction.find(filters).sort({ date: -1 });

        // Get the user's preferred currency
        const user = await User.findById(req.user.id);
        const userCurrency = user.currency;

        // Convert transactions to the user's preferred currency
        const convertedTransactions = await Promise.all(
            transactions.map(async (transaction) => {
                let convertedAmount = transaction.amount;
                let convertedCurrency = transaction.currency;
                let conversionFailed = false;

                if (transaction.currency !== userCurrency) {
                    try {
                        const exchangeRate = await getExchangeRate(transaction.currency, userCurrency);
                        convertedAmount = transaction.amount * exchangeRate;
                        convertedCurrency = userCurrency;
                    } catch (error) {
                        console.error(
                            `Failed to convert currency for transaction ${transaction._id} from ${transaction.currency} to ${userCurrency}: ${error.message}`
                        );
                        conversionFailed = true;
                        convertedAmount = transaction.amount;
                        convertedCurrency = transaction.currency;
                    }
                }

                return {
                    ...transaction._doc,
                    convertedAmount,
                    convertedCurrency,
                    conversionFailed, // Indicate if conversion failed
                };
            })
        );

        res.json(convertedTransactions);
    }),

    //!update
    update: asyncHandler(async (req, res) => {
        //find the transaction
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.user.id, // Use only the user ID (ObjectId)
        });

        if (!transaction) {
            throw new Error("Transaction not found or unauthorized");
        }

        // Store the old category for comparison
        const oldCategory = transaction.category;

        // Update the transaction
        let categoryName = req.body.category || transaction.category;
        if (req.body.category) {
            if (mongoose.Types.ObjectId.isValid(req.body.category)) {
                const categoryDoc = await Category.findById(req.body.category);
                if (!categoryDoc) {
                    throw new Error("Category not found");
                }
                categoryName = categoryDoc.name;
            } else {
                const categoryDoc = await Category.findOne({
                    name: req.body.category.toLowerCase(),
                    user: req.user.id,
                });
                if (!categoryDoc) {
                    throw new Error("Category not found");
                }
                categoryName = categoryDoc.name;
            }
        }

        transaction.type = req.body.type || transaction.type;
        transaction.category = categoryName;
        transaction.amount = req.body.amount || transaction.amount;
        transaction.currency = req.body.currency || transaction.currency;
        transaction.date = req.body.date || transaction.date;
        transaction.description = req.body.description || transaction.description;

        // Save the updated transaction
        const updatedTransaction = await transaction.save();

        // Trigger budget usage check for both old and new categories (if changed)
        await checkBudgetUsage(req.user.id, oldCategory, transaction.amount);
        if (oldCategory !== categoryName) {
            await checkBudgetUsage(req.user.id, categoryName, transaction.amount);
        }

        res.json(updatedTransaction);
    }),

    //!delete
    delete: asyncHandler(async (req, res) => {
        //find the transaction
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.user.id, //*Ensure the transaction belongs to the logged-in user
        });

        if (!transaction) {
            throw new Error("Transaction not found or unauthorized");
        }

        // Trigger budget usage check before deletion
        await checkBudgetUsage(req.user.id, transaction.category, transaction.amount);

        // Delete the transaction
        await Transaction.findByIdAndDelete(req.params.id);

        res.json({ message: "Transaction deleted successfully" });
    }),

    //! Get all transactions (Admin only)
    getAllTransactions: asyncHandler(async (req, res) => {
        const transactions = await Transaction.find({});
        res.json(transactions);
    }),

    //! Delete any transaction (Admin only)
    deleteTransaction: asyncHandler(async (req, res) => {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            throw new Error("Transaction not found");
        }
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ message: "Transaction deleted successfully" });
    }),

   //! Get financial reports (spending trends and income vs expenses)
    getFinancialReports: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const user = await User.findById(userId);
        const userCurrency = user.currency;

        // Aggregation for spending trends (group by month for expenses)
        const spendingTrends = await Transaction.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), type: "expense" } },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                    },
                    totalSpent: { $sum: "$amount" },
                    transactions: { $push: "$$ROOT" },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 },
            },
        ]);

        // Aggregation for income vs expenses (total for the user)
        const incomeVsExpenses = await Transaction.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" },
                    transactions: { $push: "$$ROOT" },
                },
            },
        ]);

        // Convert spending trends to user's preferred currency
        const formattedSpendingTrends = await Promise.all(
            spendingTrends.map(async (trend) => {
                let convertedTotal = 0;
                let conversionFailed = false;

                for (const transaction of trend.transactions) {
                    let exchangeRate = 1;
                    if (transaction.currency !== userCurrency) {
                        try {
                            exchangeRate = await getExchangeRate(transaction.currency, userCurrency);
                        } catch (error) {
                            console.error(
                                `Failed to convert currency for transaction ${transaction._id} in financial reports: ${error.message}`
                            );
                            conversionFailed = true;
                            exchangeRate = 1; // Fallback to no conversion
                        }
                    }
                    convertedTotal += transaction.amount * exchangeRate;
                }

                return {
                    month: `${trend._id.month}/${trend._id.year}`,
                    totalSpent: convertedTotal,
                    currency: userCurrency,
                    conversionFailed, // Indicate if conversion failed
                };
            })
        );

        // Convert income vs expenses to user's preferred currency
        const formattedIncomeVsExpenses = {
            income: 0,
            expenses: 0,
            currency: userCurrency,
            conversionFailed: false,
        };

        for (const item of incomeVsExpenses) {
            let convertedTotal = 0;
            let conversionFailed = false;

            for (const transaction of item.transactions) {
                let exchangeRate = 1;
                if (transaction.currency !== userCurrency) {
                    try {
                        exchangeRate = await getExchangeRate(transaction.currency, userCurrency);
                    } catch (error) {
                        console.error(
                            `Failed to convert currency for transaction ${transaction._id} in financial reports: ${error.message}`
                        );
                        conversionFailed = true;
                        exchangeRate = 1; // Fallback to no conversion
                    }
                }
                convertedTotal += transaction.amount * exchangeRate;
            }

            if (item._id === "income") {
                formattedIncomeVsExpenses.income = convertedTotal;
            } else if (item._id === "expense") {
                formattedIncomeVsExpenses.expenses = convertedTotal;
            }
            formattedIncomeVsExpenses.conversionFailed = formattedIncomeVsExpenses.conversionFailed || conversionFailed;
        }

        res.status(200).json({
            spendingTrends: formattedSpendingTrends,
            incomeVsExpenses: formattedIncomeVsExpenses,
        });
    }),
};

module.exports = transactionCtr;