const asyncHandler = require("express-async-handler");
const Bill = require("../model/Bill");

const billCtr = {
    // Create a new bill
    createBill: asyncHandler(async (req, res) => {
        const { name, amount, dueDate } = req.body;

        const bill = await Bill.create({
            user: req.user.id,
            name,
            amount,
            dueDate,
        });

        res.status(201).json(bill);
    }),

    // Get all bills for the logged-in user
    getBills: asyncHandler(async (req, res) => {
        const bills = await Bill.find({ 
            user: req.user.id 
        }).sort({ dueDate: 1 });

        res.json(bills);
    }),

    // Update a bill
    updateBill: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const { 
            name, 
            amount, 
            dueDate, 
            isPaid 
        } 
        = req.body;

        const bill = await Bill.findOne({ 
            _id: id, 
            user: req.user.id 
        });

        if (!bill) {
            res.status(404);
            throw new Error("Bill not found or unauthorized");
        }

        bill.name = name || bill.name;
        bill.amount = amount || bill.amount;
        bill.dueDate = dueDate || bill.dueDate;
        bill.isPaid = isPaid !== undefined ? isPaid : bill.isPaid;

        await bill.save();

        res.json(bill);
    }),

    // Delete a bill
    deleteBill: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const bill = await Bill.findOne({
             _id: id, 
             user: req.user.id 
            });

        if (!bill) {
            res.status(404);
            throw new Error("Bill not found or unauthorized");
        }

        await bill.deleteOne();

        res.json({ message: "Bill deleted successfully" });
    }),
};

module.exports = billCtr;