const express = require("express");
const isAuthenticated = require("../middleware/isAuth");
const categoryCtr = require("../controllers/categoryController");
const transactionCtr = require("../controllers/transactionController");
const isAdmin = require("../middleware/isAdmin");

const transactionRouter = express.Router();

//!create(add)
transactionRouter.post("/create",
    isAuthenticated, 
    transactionCtr.create
);

//!lists
transactionRouter.get("/lists", 
    isAuthenticated,
    transactionCtr.getFilteredTransactions
);

//!update
transactionRouter.put("/update/:id", 
    isAuthenticated,
    transactionCtr.update
);

//!delete
transactionRouter.delete("/delete/:id", 
    isAuthenticated,
    transactionCtr.delete
);

//!financial reports
transactionRouter.get("/reports", 
    isAuthenticated, 
    transactionCtr.getFinancialReports
);

//! Admin-only routes
transactionRouter.get("/admin/all", 
    isAuthenticated, 
    isAdmin, 
    transactionCtr.getAllTransactions
);

transactionRouter.delete("/admin/delete/:id", 
    isAuthenticated, 
    isAdmin, 
    transactionCtr.deleteTransaction
);



module.exports = transactionRouter;