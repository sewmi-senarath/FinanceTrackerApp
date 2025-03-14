const express = require("express");
const billController = require("../controllers/billController");
const isAuthenticated = require("../middleware/isAuth");

const router = express.Router();

// Create a new bill
router.post(
    "/api/v1/bills/add", 
    isAuthenticated, 
    billController.createBill
);

// Get all bills for the logged-in user
router.get(
    "/api/v1/bills/lists", 
    isAuthenticated, 
    billController.getBills
);

// Update a bill
router.put(
    "/api/v1/bills/update/:id", 
    isAuthenticated, 
    billController.updateBill
);

// Delete a bill
router.delete(
    "/api/v1/bills/delete/:id", 
    isAuthenticated, 
    billController.deleteBill
);

module.exports = router;