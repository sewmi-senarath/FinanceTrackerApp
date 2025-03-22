const userCtr = require('../../../controllers/userController');
const User = require('../../../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//!Mock all dependencies
jest.mock('../../../model/User.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('User Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: {},
            user: { 
                id: 'user123' 
            }, // Mock authenticated user
            params: {},
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
    });

    //!Test for user registration
    describe('register', () => {
        it('should register a new user', async () => {
            req.body = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                role: 'user',
                currency: 'USD',
            };

            User.findOne.mockResolvedValue(null);

            //mock bcrypt.genSalt and bcrypt.hash
            bcrypt.genSalt.mockImplementation(() => Promise.resolve('salt'));
            bcrypt.hash.mockResolvedValue('hashedPassword');

            //mock User.create
            User.create.mockResolvedValue({
                username: 'testuser',
                email: 'test@example.com',
                _id: 'user123',
                role: 'user',
                currency: 'USD',
            });

            // Call the controller method
            await userCtr.register(req, res);

            // Assertions
            expect(User.findOne).toHaveBeenCalledWith({ 
                email: 'test@example.com' 
            });
            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');

            expect(User.create).toHaveBeenCalledWith({
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'user',
                currency: 'USD',
            });

            expect(res.json).toHaveBeenCalledWith({
                username: 'testuser',
                email: 'test@example.com',
                id: 'user123',
                role: 'user',
                currency: 'USD',
            });
        });

        it('should throw an error if required fields are missing', async () => {
            req.body = {};

            await expect(userCtr.register(req, res)).rejects.toThrow(
                'All fields are required'
            );
        });

        it('should throw an error if user already exists', async () => {
            req.body = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
            };

            User.findOne.mockResolvedValue({ email: 'test@example.com' });

            await expect(userCtr.register(req, res)).rejects.toThrow(
                'User already exists'
            );
        });
    });

    //!Test for user login
    describe('login', () => {
        it('should log in a user and return a token', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'password123',
            };

            const mockUser = {
                _id: 'user123',
                email: 'test@example.com',
                password: 'hashedPassword',
                username: 'testuser',
                role: 'user',
            };
            User.findOne.mockResolvedValue(mockUser);

            // Mock bcrypt.compare to return true
            bcrypt.compare.mockResolvedValue(true);

            // Mock jwt.sign to return a token
            jwt.sign.mockReturnValue('token123');

            // Call the controller method
            await userCtr.login(req, res);

            // Assertions
            expect(User.findOne).toHaveBeenCalledWith({ 
                email: 'test@example.com' 
            });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(jwt.sign).toHaveBeenCalledWith(
                { 
                    id: 'user123',
                    role: 'user' 
                },
                process.env.JWT_SECRET,
                { expiresIn: '365d' }
            );
            expect(res.json).toHaveBeenCalledWith({
                message: 'Login successful!',
                token: 'token123',
                id: 'user123',
                email: 'test@example.com',
                username: 'testuser',
                role: 'user',
            });
        });

        it('should throw an error if email is invalid', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'password123',
            };

            // Mock User.findOne to return null (user does not exist)
            User.findOne.mockResolvedValue(null);

            // Call the controller method and expect an error
            await expect(userCtr.login(req, res)).rejects.toThrow(
                'Invalid login credentials'
            );
        });

        it('should throw an error if password is invalid', async () => {
            // Mock request body
            req.body = {
                email: 'test@example.com',
                password: 'password123',
            };

            // Mock User.findOne to return a user
            const mockUser = {
                _id: 'user123',
                email: 'test@example.com',
                password: 'hashedPassword',
            };
            User.findOne.mockResolvedValue(mockUser);

            // Mock bcrypt.compare to return false
            bcrypt.compare.mockResolvedValue(false);

            // Call the controller method and expect an error
            await expect(userCtr.login(req, res)).rejects.toThrow(
                'Invalid login credentials'
            );
        });
    });

    //!Test for user profile
    describe('profile', () => {
        it('should return the user profile', async () => {
            // Mock User.findById to return a user
            const mockUser = {
                _id: 'user123',
                username: 'testuser',
                email: 'test@example.com',
                role: 'user',
            };
            User.findById.mockResolvedValue(mockUser);

            // Call the controller method
            await userCtr.profile(req, res);

            // Assertions
            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(res.json).toHaveBeenCalledWith({
                username: 'testuser',
                email: 'test@example.com',
                role: 'user',
            });
        });

        it('should throw an error if user is not found', async () => {
            // Mock User.findById to return null
            User.findById.mockResolvedValue(null);

            // Call the controller method and expect an error
            await expect(userCtr.profile(req, res)).rejects.toThrow(
                'User not found'
            );
        });
    });
    
});