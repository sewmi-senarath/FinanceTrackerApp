const asyncHandler = require("express-async-handler");
const Notification = require("../model/Notification");

const notificationCtr = {
    //! Get all notifications for the logged-in user
    getNotifications: asyncHandler(async (req, res) => {
        const notifications = await Notification.find({ 
            user: req.user.id 
        })
            .sort({ 
                createdAt: -1 
            });
        res.json(notifications);
    }),

    //! Mark a notification as read
    markAsRead: asyncHandler(async (req, res) => {
        const { id } = req.params;

        // Find the notification
        const notification = await Notification.findOne({
            _id: id,
            user: req.user.id,
        });

        if (!notification) {
            throw new Error("Notification not found or unauthorized");
        }

        // Mark the notification as read
        notification.isRead = true;
        await notification.save();

        res.json(notification);
    }),
};

module.exports = notificationCtr;