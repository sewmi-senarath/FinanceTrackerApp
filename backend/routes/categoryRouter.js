const express = require("express");
const isAuthenticated = require("../middleware/isAuth");
const categoryCtr = require("../controllers/categoryController");

const categoryRouter = express.Router();

//!add
categoryRouter.post("/create",
    isAuthenticated, 
    categoryCtr.create
);

//!lists
categoryRouter.get("/lists", 
    isAuthenticated,
    categoryCtr.lists
);

//!update
categoryRouter.put("/update/:categoryId", 
    isAuthenticated,
    categoryCtr.update
);

//!delete
categoryRouter.delete("/delete/:id", 
    isAuthenticated,
    categoryCtr.delete
);



module.exports = categoryRouter;