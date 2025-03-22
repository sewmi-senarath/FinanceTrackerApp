const asyncHandler = require("express-async-handler");
const Transaction = require("../model/Transaction");
const Notification = require("../model/Notification");

const checkSpendingPatterns = async (userId) => {

    // Calculate total spending for the current month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const totalSpending = await Transaction.aggregate([
        {
            $match: {
                user: userId,
                type: "expense",
                date: { $gte: startOfMonth, $lte: endOfMonth },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amount" },
            },
        },
    ]);

    const spendingThreshold = 1000; //threshold
    if (totalSpending.length > 0 && totalSpending[0].total > spendingThreshold) {
        // Create a notification
        await Notification.create({
            user: userId,
            type: "spending_alert",
            message: `Your spending this month has exceeded the threshold of $${spendingThreshold}.`,
        });
    }
};

module.exports = checkSpendingPatterns;
