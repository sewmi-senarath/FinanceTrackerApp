const jwt = require("jsonwebtoken");

const isAuthenticated = async (req, res, next) =>{
    //!get the token from header
    const headerObj = req.headers;
    const token = headerObj?.authorization?.split(' ')[1]
    
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    //! Verify the token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Save the user ID in the request object
        next();
    } catch (err) {
        const error = new Error("Token expired or invalid. Please login again.");
        error.statusCode = 401;
        next(error);
    }

};

module.exports = isAuthenticated;