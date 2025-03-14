const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
    // User who created the goal
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }, 
    // Goal name (e.g., "Save for a car")
    name: { 
        type: String, 
        required: true 
    },
    // Target amount to save
    targetAmount: { 
        type: Number, 
        required: true 
    }, 
    // Amount saved so far
    savedAmount: { 
        type: Number, 
        default: 0 
    }, 
    // Optional: Target date to achieve the goal
    targetDate: { 
        type: Date 
    }, 
    // When the goal was created
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
},
    {
        timestamps:true,
    } 
);

module.exports = mongoose.model("Goal", goalSchema);