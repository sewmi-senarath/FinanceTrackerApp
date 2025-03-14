const express = require("express");
const notificationController = require("../controllers/notificationController");
const isAuthenticated = require("../middleware/isAuth");

const router = express.Router();

//! Get all notifications for the logged-in user
router.get(
    "/api/v1/notify/lists", 
    isAuthenticated, 
    notificationController.getNotifications
);

//! Mark a notification as read
router.put(
    "/api/v1/notify/:id/markRead", 
    isAuthenticated, 
    notificationController.markAsRead
);

module.exports = router;