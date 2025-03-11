const isAdmin = (req, res, next) => {
    console.log("User role:", req.user.role); // Debugging: Check the user's role
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    next();
};

module.exports = isAdmin;