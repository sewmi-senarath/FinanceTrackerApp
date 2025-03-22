
const categoryCtr = require('../../../controllers/categoryController');
const Category = require('../../../model/Category');
const Transaction = require('../../../model/Transaction');

// Mock all dependencies
jest.mock('../../../model/Category.js');
jest.mock('../../../model/Transaction.js');

describe('Category Controller', () => {
    let req, res;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Mock request and response objects
        req = {
            user: { id: 'user123' }, // Mock authenticated user
            body: {},
            params: {},
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
    });

    // Test for create category
    describe('create', () => {
        it('should create a new category', async () => {
            // Mock request body
            req.body = {
                name: 'Food',
                type: 'expense',
            };

            // Mock Category.findOne to return null (category does not exist)
            Category.findOne.mockResolvedValue(null);

            // Mock Category.create
            const mockCategory = {
                _id: 'category123',
                name: 'food',
                type: 'expense',
                user: 'user123',
            };
            Category.create.mockResolvedValue(mockCategory);

            // Call the controller method
            await categoryCtr.create(req, res);

            // Assertions
            expect(Category.findOne).toHaveBeenCalledWith({
                name: 'food',
                user: 'user123',
            });
            expect(Category.create).toHaveBeenCalledWith({
                name: 'food',
                type: 'expense',
                user: 'user123',
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockCategory);
        });

        it('should throw an error if name or type is missing', async () => {
            // Mock request body with missing fields
            req.body = {};

            // Call the controller method and expect an error
            await expect(categoryCtr.create(req, res)).rejects.toThrow(
                'Name and Type are required!'
            );
        });

        it('should throw an error if category already exists', async () => {
            // Mock request body
            req.body = {
                name: 'Food',
                type: 'expense',
            };

            // Mock Category.findOne to return a category (category already exists)
            Category.findOne.mockResolvedValue({
                name: 'food',
                user: 'user123',
            });

            // Call the controller method and expect an error
            await expect(categoryCtr.create(req, res)).rejects.toThrow(
                'Category food already exists'
            );
        });
    });

    // Test for lists
    describe('lists', () => {
        it('should return all categories for the user', async () => {
            // Mock Category.find to return a list of categories
            const mockCategories = [
                { _id: 'category123', name: 'Food', type: 'expense', user: 'user123' },
            ];
            Category.find.mockResolvedValue(mockCategories);

            // Call the controller method
            await categoryCtr.lists(req, res);

            // Assertions
            expect(Category.find).toHaveBeenCalledWith({ user: 'user123' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockCategories);
        });
    });

    // Test for update
    describe('update', () => {
        it('should update a category', async () => {
            // Mock request params and body
            req.params.categoryId = 'category123';
            req.body = {
                name: 'Groceries',
                type: 'expense',
            };

            // Mock Category.findOne to return a category
            const mockCategory = {
                _id: 'category123',
                name: 'Food',
                type: 'expense',
                user: 'user123',
                save: jest.fn().mockResolvedValue(true),
            };
            Category.findOne.mockResolvedValue(mockCategory);

            // Call the controller method
            await categoryCtr.update(req, res);

            // Assertions
            expect(Category.findOne).toHaveBeenCalledWith({
                _id: 'category123',
                user: 'user123',
            });
            expect(mockCategory.name).toBe('groceries');
            expect(mockCategory.type).toBe('expense');
            expect(mockCategory.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockCategory);
        });

        it('should throw an error if category is not found', async () => {
            // Mock request params and body
            req.params.categoryId = 'category123';
            req.body = {
                name: 'Groceries',
                type: 'expense',
            };

            // Mock Category.findOne to return null
            Category.findOne.mockResolvedValue(null);

            // Call the controller method and expect an error
            await expect(categoryCtr.update(req, res)).rejects.toThrow(
                'Category not found or User not authenticated'
            );
        });
    });

    // Test for delete
    describe('delete', () => {
        it('should delete a category and update transactions', async () => {
            // Mock request params
            req.params.id = 'category123';

            // Mock Category.findOne to return a category
            const mockCategory = {
                _id: 'category123',
                name: 'Food',
                type: 'expense',
                user: 'user123',
            };
            Category.findOne.mockResolvedValue(mockCategory);

            // Mock Transaction.updateMany
            Transaction.updateMany.mockResolvedValue(true);

            // Mock Category.findByIdAndDelete
            Category.findByIdAndDelete.mockResolvedValue(true);

            // Call the controller method
            await categoryCtr.delete(req, res);

            // Assertions
            expect(Category.findOne).toHaveBeenCalledWith({
                _id: 'category123',
                user: 'user123',
            });
            expect(Transaction.updateMany).toHaveBeenCalledWith(
                { user: 'user123', category: 'Food' },
                { $set: { category: 'Uncategorized' } }
            );
            expect(Category.findByIdAndDelete).toHaveBeenCalledWith('category123');
            expect(res.json).toHaveBeenCalledWith({ message: 'Category removed successfully' });
        });

        it('should throw an error if category is not found', async () => {
            // Mock request params
            req.params.id = 'category123';

            // Mock Category.findOne to return null
            Category.findOne.mockResolvedValue(null);

            // Call the controller method and expect an error
            await expect(categoryCtr.delete(req, res)).rejects.toThrow(
                'Category not found or User not authorized'
            );
        });
    });

});