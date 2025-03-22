require('dotenv').config(); 
const request = require('supertest');
const { app } = require('../../app'); 
const Notification = require('../../model/Notification');
const User = require('../../model/User');
const jwt = require('jsonwebtoken');
require('../testSetupDB'); 

describe('Notification Controller', () => {
  let token;
  let user;
  let notification;

  beforeEach(async () => {
    await User.deleteMany({});
    await Notification.deleteMany({});

    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );

    notification = await Notification.create({
      user: user._id,
      message: 'Test notification',
      isRead: false,
      type: 'bill_reminder',
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Notification.deleteMany({});
  });

  it('should get all notifications for the logged-in user', async () => {
    const res = await request(app)
      .get('/api/v1/notifications/lists') 
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].message).toBe('Test notification');
    expect(res.body[0].user).toBe(String(user._id));
    expect(res.body[0].isRead).toBe(false);
  });
});