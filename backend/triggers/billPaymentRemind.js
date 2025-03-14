const asyncHandler = require("express-async-handler");
const Notification = require("../model/Notification");
const Bill = require("../model/Bill");

const checkBillPayments = async(userId) => {

    const today = new Date();

    const upcomingBills = await Bill.find({
        user: userId,
        dueDate: { $gte: today }, // Bills that are not yet due
    });

    for (const bill of upcomingBills) {
        const daysUntilDue = Math.ceil((bill.dueDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 3) {
            // Create a notification
            await Notification.create({
                user: userId,
                type: "bill_reminder",
                message: `Your ${bill.name} is due in ${daysUntilDue} days.`,
                link: `/bills/${bill._id}`, //link to the bill
            });
        }
    }
};

module.exports = checkBillPayments;