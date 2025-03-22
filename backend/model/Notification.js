//to store notifications for each user
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }, 

    type: { 
        type: String, 
        required: true 
    }, // Type of notification
    
    message: { 
        type: String, 
        required: true 
    }, 
    isRead: { 
        type: Boolean, 
        default: false 
    }, 

    link: { 
        type: String, 
        default: "" 
    }, 
    createdAt: { 
        type: Date, 
        default: Date.now 
    }, 
});

module.exports = mongoose.model("Notification", notificationSchema);