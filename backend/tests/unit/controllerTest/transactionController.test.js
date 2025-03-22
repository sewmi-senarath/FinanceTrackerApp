const mongoose = require("mongoose");
const transactionCtr = require("../../../controllers/transactionController");
const Category = require("../../../model/Category");
const Transaction = require("../../../model/Transaction");
const Goal = require("../../../model/Goal");
const checkBudgetUsage = require("../../../triggers/checkBudgetUsage");

jest.mock("../../../model/Category");
jest.mock("../../../model/Transaction");
jest.mock("../../../model/Goal");
jest.mock("../../../triggers/checkBudgetUsage");

describe("Transaction Controller", () => {
    describe("create", () => {
        it("should create a new transaction and allocate savings to goals if type is income", async () => {
            const userId = new mongoose.Types.ObjectId().toString(); // Generate a valid ObjectId
            const req = {
                user: { id: userId }, // Use a valid ObjectId instead of "user123"
                body: {
                    type: "income",
                    category: "Food",
                    amount: 100,
                    date: "2025-03-21",
                    currency: "USD",
                    description: "Salary",
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Mock dependencies
            Category.findOne.mockResolvedValue({ name: "Food" });
            Transaction.create.mockResolvedValue({ _id: "transaction123" });
            Goal.find.mockResolvedValue([
                { allocationPercentage: 10, savedAmount: 0, save: jest.fn() },
            ]);
            checkBudgetUsage.mockResolvedValue();

            await transactionCtr.create(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ _id: "transaction123" });
            expect(Goal.find).toHaveBeenCalledWith({ user: userId });
        });
    });
});