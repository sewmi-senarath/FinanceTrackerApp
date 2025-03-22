const notificationCtr = require('../../../controllers/notificationController');
const Notification = require('../../../model/Notification');

// Mock all dependencies
jest.mock('../../../model/Notification.js');

describe('Notification Controller', () => {
    let req, res;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Mock request and response objects
        req = {
            user: { id: 'user123' }, // Mock authenticated user
            params: {},
        };
        res = {
            json: jest.fn(),
        };
    });

    // Test for getNotifications
    describe('getNotifications', () => {
        it('should return all notifications for the logged-in user', async () => {
            const mockNotifications = [
                { 
                    _id: 'notification123', 
                    user: 'user123', 
                    message: 'Test notification', 
                    isRead: false 
                },
            ];

            // Mock the query chain without exec
            const mockQuery = {
                sort: jest.fn().mockResolvedValue(mockNotifications), // Resolve directly at sort
            };
            Notification.find.mockReturnValue(mockQuery);

            // Call the controller method
            await notificationCtr.getNotifications(req, res);

            // Assertions
            expect(Notification.find).toHaveBeenCalledWith({ user: 'user123' });
            expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(res.json).toHaveBeenCalledWith(mockNotifications);
        });
    });

    // Test for markAsRead
    describe('markAsRead', () => {
        it('should mark a notification as read', async () => {
            // Mock request params
            req.params.id = 'notification123';

            // Mock Notification.findOne to return a notification
            const mockNotification = {
                _id: 'notification123',
                user: 'user123',
                isRead: false,
                save: jest.fn().mockResolvedValue(true),
            };
            Notification.findOne.mockResolvedValue(mockNotification);

            // Call the controller method
            await notificationCtr.markAsRead(req, res);

            // Assertions
            expect(Notification.findOne).toHaveBeenCalledWith({
                _id: 'notification123',
                user: 'user123',
            });
            expect(mockNotification.isRead).toBe(true);
            expect(mockNotification.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockNotification);
        });

        it('should throw an error if notification is not found', async () => {
            // Mock request params
            req.params.id = 'notification123';

            // Mock Notification.findOne to return null
            Notification.findOne.mockResolvedValue(null);

            // Call the controller method and expect an error
            await expect(notificationCtr.markAsRead(req, res)).rejects.toThrow(
                'Notification not found or unauthorized'
            );
        });
    });
});