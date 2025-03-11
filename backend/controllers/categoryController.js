const asyncHandler = require("express-async-handler");
const Category = require("../model/Category");
const Transaction = require("../model/Transaction");

const categoryCtr = {
    //!add
    create: asyncHandler(async(req, res) =>{
        const{name, type} = req.body;

        if(!name || !type){
            throw new Error("Name and Type are required!");
        }

        //convert the name to lowercase
        const normalizedName = name.toLowerCase();

        //check if type is valid
        const validTypes = ['income' ,'expense'];
        if(!validTypes.includes(type.toLowerCase())){
            throw new Error("Invalid category type: " + type);
        }

        //check if category already exists on the user account
        const categoryExists = await Category.findOne({
            name: normalizedName, 
            user:req.user.id,
        });
        if(categoryExists){
            throw new Error(`Category ${categoryExists.name} already exists`);
        }

        //create the category
        const category = await Category.create({
            name: normalizedName,
            user: req.user.id,
            type,
        });

        res.status(201).json(category);
    }),

    //!lists
    lists: asyncHandler(async(req,res)=>{
        const categories = await Category.find({
            user: req.user.id,
        });
        res.status(200).json(categories);
    }),
    //!update
    update: asyncHandler(async(req, res)=>{
        const {categoryId} = req.params;
        const {type , name} = req.body;
        const normalizedName = name.toLowerCase();

        //find category
        const category = await Category.findOne({
            _id: categoryId,
            user: req.user.id,
        });

        if (!category) {
            throw new Error("Category not found or User not authenticated");
        }

        const oldName = category.name;

        //update category properties
        category.name = normalizedName || category.name;
        category.type = type || category.type;
        const updatedCategory = await category.save();
        
        //update affected transactions
        if (oldName !== updatedCategory.name){
            await Transaction.updateMany(
            {
                user: req.user.id,
                category: oldName,
            },
            { $set:{ category: updatedCategory.name }}
            );
        }
        res.json(updatedCategory);
    }),

    //!delete
    delete: asyncHandler(async (req, res)=>{
        // Find the category
        const category = await Category.findOne({
            _id: req.params.id,
            user: req.user.id, 
        });

        if (!category) {
            throw new Error("Category not found or User not authorized");
        }
            
        //update transactions that have this category
        const defaultCategory = "Uncategorized";
        await Transaction.updateMany(
            { user: req.user.id, category: category.name }, // Use only the user ID (ObjectId)
            { $set: { category: defaultCategory } }
        );

        // Remove category
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category removed successfully" });
    }),

    //! Get all categories (Admin only)
    getAllCategories: asyncHandler(async (req, res) => {
        const categories = await Category.find({});
        res.json(categories);
    }),

    //! Delete any category (Admin only)
    deleteCategory: asyncHandler(async (req, res) => {
        const category = await Category.findById(req.params.id);
        if (!category) {
            throw new Error("Category not found");
        }
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category deleted successfully" });
    }),

};

module.exports = categoryCtr;