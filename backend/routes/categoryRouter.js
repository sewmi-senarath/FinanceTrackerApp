const express = require("express");
const isAuthenticated = require("../middleware/isAuth");
const categoryCtr = require("../controllers/categoryController");

const categoryRouter = express.Router();

//!add
categoryRouter.post("/api/v1/categories/create",
    isAuthenticated, 
    categoryCtr.create
);

//!lists
categoryRouter.get("/api/v1/categories/lists", 
    isAuthenticated,
    categoryCtr.lists
);



module.exports = categoryRouter;