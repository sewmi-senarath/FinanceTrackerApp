const isAdmin = require('../../../middleware/isAdmin');

describe('isAdmin Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            user: {}, 
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn(); 
    });

    it('should call next() if user role is admin', () => {
        req.user.role = 'admin';

        isAdmin(req, res, next);

        // Assertions
        expect(next).toHaveBeenCalled(); 
        expect(res.status).not.toHaveBeenCalled(); 
        expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 403 if user role is not admin', () => {
        req.user.role = 'user';

        isAdmin(req, res, next);

        // Assertions
        expect(res.status).toHaveBeenCalledWith(403); // 403 status should be set
        expect(res.json).toHaveBeenCalledWith({
            message: 'Access denied. Admin privileges required.',
        }); 
        expect(next).not.toHaveBeenCalled(); 
    });

    it('should return 403 if user role is undefined', () => {
        req.user.role = undefined;

        isAdmin(req, res, next);

        // Assertions
        expect(res.status).toHaveBeenCalledWith(403); 
        expect(res.json).toHaveBeenCalledWith({
            message: 'Access denied. Admin privileges required.',
        }); 
        expect(next).not.toHaveBeenCalled(); 
    });
});