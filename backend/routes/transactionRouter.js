const express = require("express");
const isAuthenticated = require("../middleware/isAuth");
const categoryCtr = require("../controllers/categoryController");
const transactionCtr = require("../controllers/transactionController");


const transactionRouter = express.Router();

//!create(add)
transactionRouter.post("/api/v1/transactions/create",
    isAuthenticated, 
    transactionCtr.create
);

//!lists
transactionRouter.get("/api/v1/transactions/lists", 
    isAuthenticated,
    transactionCtr.getFilteredTransactions
);

//!update
transactionRouter.put("/api/v1/transactions/update/:id", 
    isAuthenticated,
    transactionCtr.update
);

//!delete
transactionRouter.delete("/api/v1/transactions/delete/:id", 
    isAuthenticated,
    transactionCtr.delete
);



module.exports = transactionRouter;