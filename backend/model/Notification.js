//to store notifications for each user
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }, // User who receives the notification

    type: { 
        type: String, 
        required: true 
    }, // Type of notification (e.g., "spending_alert", "bill_reminder", "goal_deadline")
    
    message: { 
        type: String, 
        required: true 
    }, // Notification message

    isRead: { 
        type: Boolean, 
        default: false 
    }, // Whether the notification has been read

    link: { 
        type: String, 
        default: "" 
    }, // Optional link for navigation

    createdAt: { 
        type: Date, 
        default: Date.now 
    }, // When the notification was created
});

module.exports = mongoose.model("Notification", notificationSchema);