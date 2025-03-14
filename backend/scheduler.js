const cron = require("node-cron");
const checkSpendingPatterns = require("./triggers/spendingPatterns");
const checkBillPayments = require("./triggers/billPaymentRemind");
const checkGoalDeadlines = require("./triggers/goalDeadline");
const User = require("./model/User");
const checkBudgetUsage = require("./triggers/checkBudgetUsage");
require("dotenv").config();

//notifications triggers

//!check spending patterns every day at midnight
cron.schedule(process.env.SPENDING_CRON_SCHEDULE, async () => {
    console.log("Checking spending patterns...");
    const users = await User.find({});
    users.forEach(async (user) => {
        await checkSpendingPatterns(user._id);
    });
});

//!Check bill payments every day at 8 AM
cron.schedule(process.env.BILL_CRON_SCHEDULE, async () => {
    console.log("Checking bill payments...");
    const users = await User.find({});
    users.forEach(async (user) => {
        await checkBillPayments(user._id);
    });
});

//!Check goal deadlines every day at 7 AM
cron.schedule(process.env.GOAL_CRON_SCHEDULE, async () => {
    console.log("Checking goal deadlines...");
    const users = await User.find({});
    users.forEach(async (user) => {
        await checkGoalDeadlines(user._id);
    });
});

//!check budget usage every day at midnight
cron.schedule(process.env.BUDGET_CRON_SCHEDULE, async () => {
    console.log("Checking budget usage...");
    const users = await User.find({});
    users.forEach(async (user) => {
        await checkBudgetUsage(user._id);
    });
});

console.log("Scheduled jobs are running...");