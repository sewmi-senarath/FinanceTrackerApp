const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
    //!user who set the budget
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }, 
    //!Reference to the Category model
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Category", 
        required: true 
    },

    amount: { 
        type: Number, 
        required: true 
    },

     currency: { 
        type: String, 
        required: true, 
    }, // Budget currency 

    period: {
        type: String, 
        enum: ["monthly", "weekly", "custom"], 
        default: "monthly" 
    },

    startDate: { 
        type: Date, 
        default: Date.now 
    }, 
    endDate: { 
        type: Date 
    }, 
    createdAt: { 
        type: Date, 
        default: Date.now 
    }, 
});

module.exports = mongoose.model("Budget", budgetSchema);