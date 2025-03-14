const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }, // User who owns the bill
    name: { 
        type: String, 
        required: true 
    }, // Name of the bill (e.g., "Electricity Bill")
    amount: { 
        type: Number, 
        required: true 
    }, // Amount due
    dueDate: { 
        type: Date, 
        required: true 
    }, // Due date of the bill
    isPaid: { 
        type: Boolean, 
        default: false 
    }, // Whether the bill has been paid
    createdAt: { 
        type: Date, 
        default: Date.now 
    }, // When the bill was created
});

module.exports = mongoose.model("Bill", billSchema);