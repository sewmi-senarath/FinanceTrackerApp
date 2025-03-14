const asyncHandler = require("express-async-handler");
const Goal = require("../model/Goal");
const Notification = require("../model/Notification");

const checkGoalDeadlines = async(userId) => {

    const today = new Date();

    // Find goals with upcoming deadlines
    const goals = await Goal.find({
        user: userId,
        targetDate: { $gte: today }, // Goals that are not yet completed
    });

    for (const goal of goals) {
        const daysUntilDeadline = Math.ceil((goal.targetDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDeadline <= 7) {
            // Create a notification
            await Notification.create({
                user: userId,
                type: "goal_deadline",
                message: `Your goal "${goal.name}" is due in ${daysUntilDeadline} days.`,
                link: `/goals/${goal._id}`, //link to the goal
            });
        }
    }

};

module.exports = checkGoalDeadlines;
