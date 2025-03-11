const asyncHandler = require("express-async-handler");
const Category = require("../model/Category");
const Transaction = require("../model/Transaction");

const transactionCtr = {
    //!add
    create: asyncHandler(async(req, res) =>{
        const{type, category, amount, date, description} = req.body;

        if(!amount || !type || !date){
            throw new Error("Please fill required fields!!");
        }

        //!create transaction
        const transaction = await Transaction.create({
            user: req.user,
            type,
            category,
            amount,
            description,
        });

        res.status(201).json(transaction);
    }),

    //!lists
    getFilteredTransactions: asyncHandler(async(req,res)=>{
        const {startDate, endDate, type, category} = req.query;
        let filters = {user: req.user};

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

        const transactions = await Transaction.find(filters).sort({ date:-1 });

        res.json(transactions);
    }),

    //!update
    update: asyncHandler(async(req, res)=>{

          //find the transaction
          const transaction = await Transaction.findById(req.params.id);

          if(transaction && transaction.user.toString() === req.user.toString()){
            (transaction.type = req.body.type || transaction.type);
            (transaction.category = req.body.category || transaction.category);
            (transaction.amount = req.body.amount || transaction.amount);
            (transaction.date = req.body.date || transaction.date);
            (transaction.description = req.body.description || transaction.description);

            //update
            const updatedTransaction = await transaction.save();
            res.json(updatedTransaction);
          }
    }),

    //!delete
    delete: asyncHandler(async (req, res)=>{
        //find the transaction
        const transaction = await Transaction.findById(req.params.id);

        if(transaction && transaction.user.toString() === req.user.toString()){
            await Transaction.findByIdAndDelete(req.params.id);
            res.json({message: "Transaction Deleted!"});
        }
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