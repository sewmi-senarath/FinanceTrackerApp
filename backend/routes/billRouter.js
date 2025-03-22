const express = require("express");
const billController = require("../controllers/billController");
const isAuthenticated = require("../middleware/isAuth");

const router = express.Router();

// Create a new bill
router.post(
    "/add", 
    isAuthenticated, 
    billController.createBill
);

// Get all bills for the logged-in user
router.get(
    "/lists", 
    isAuthenticated, 
    billController.getBills
);

// Update a bill
router.put(
    "/update/:id", 
    isAuthenticated, 
    billController.updateBill
);

// Delete a bill
router.delete(
    "/delete/:id", 
    isAuthenticated, 
    billController.deleteBill
);

module.exports = router;