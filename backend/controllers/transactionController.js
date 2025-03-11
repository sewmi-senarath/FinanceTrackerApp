const asyncHandler = require("express-async-handler");
const Category = require("../model/Category");
const Transaction = require("../model/Transaction");
const User = require("../model/User");
const {getExchangeRate} = require("../utils/exchangeRate");

const transactionCtr = {
    //!add
    create: asyncHandler(async(req, res) =>{
        const{type, category, amount, date, description, currency} = req.body;

        if(!amount || !type || !date || !currency ){
            throw new Error("Please fill required fields!!");
        }

        //!create transaction
        const transaction = await Transaction.create({
            user: req.user.id,
            type,
            category,
            amount,
            currency,
            description,
        });

        res.status(201).json(transaction);
    }),

    //!lists
    getFilteredTransactions: asyncHandler(async(req,res)=>{
        const {startDate, endDate, type, category} = req.query;
        let filters = {user: req.user.id};

        if(startDate){
            filters.date = { ...filters.date, $gte:new Date(startDate)};
        }
        if(endDate){
            filters.date = { ...filters.date, $lte:new Date(startDate)};
        }
        if(type){
            filters.type = type;
        }
        if(category){
            if (category === 'All'){
                //*no category filter needed
            }else if (category === 'Uncategorized'){
                //*transactions that are specified as uncategorized
                filters.category = "Uncategorized";
            }else{
                filters.category = category;
            }
        }

        //fetch transactions
        const transactions = await Transaction.find(filters).sort({ date:-1 });

        // Get the user's preferred currency
        const user = await User.findById(req.user.id);
        const userCurrency = user.currency;

        // Convert transactions to the user's preferred currency
        const convertedTransactions = await Promise.all(
            transactions.map(async (transaction) => {
                const exchangeRate = await getExchangeRate(transaction.currency, userCurrency);
                return {
                    ...transaction._doc,
                    convertedAmount: transaction.amount * exchangeRate,
                    convertedCurrency: userCurrency,
                };
            })
        );

        res.json(convertedTransactions);
    }),


    //!update
    update: asyncHandler(async(req, res)=>{

        //find the transaction
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.user.id, // Use only the user ID (ObjectId)
        });

        if (!transaction) {
            throw new Error("Transaction not found or unauthorized");
        }

        // Update the transaction
    transaction.type = req.body.type || transaction.type;
    transaction.category = req.body.category || transaction.category;
    transaction.amount = req.body.amount || transaction.amount;
    transaction.currency = req.body.currency || transaction.currency;
    transaction.date = req.body.date || transaction.date;
    transaction.description = req.body.description || transaction.description;

    // Save the updated transaction
    const updatedTransaction = await transaction.save();

    res.json(updatedTransaction);
        
    }),

    //!delete
    delete: asyncHandler(async (req, res)=>{
        //find the transaction
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.user.id, //*Ensure the transaction belongs to the logged-in user
        });

        if (!transaction) {
            throw new Error("Transaction not found or unauthorized");
        }
    
        // Delete the transaction
        await Transaction.findByIdAndDelete(req.params.id);
    
        res.json({ message: "Transaction deleted successfully" });
    }),

    //! Get all transactions (Admin only)
    getAllTransactions: asyncHandler(async (req, res) => {
        const transactions = await Transaction.find({});
        res.json(transactions);
    }),

    //! Delete any transaction (Admin only)
    deleteTransaction: asyncHandler(async (req, res) => {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            throw new Error("Transaction not found");
        }
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ message: "Transaction deleted successfully" });
    }),

};

module.exports = transactionCtr;