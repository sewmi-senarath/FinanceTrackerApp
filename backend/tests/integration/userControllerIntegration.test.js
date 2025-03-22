require('dotenv').config(); 
const request = require('supertest');
const { app } = require('../../app');
const User = require('../../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('../testSetupDB');

describe('User Registration', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.username).toBe('testuser');
    expect(res.body.role).toBe('user');
    expect(res.body.currency).toBe('USD');
  });

  it('should throw an error if fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({
        username: 'testuser',
      });
    console.log('Fields missing response:', res.statusCode, res.body); // Debug log
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('All fields are required');
  });

  it('should throw an error if user already exists', async () => {
    await User.create({
      username: "testuser",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 10),
    });

    const res = await request(app)
      .post('/api/v1/users/register')
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });
    console.log('User already exists response:', res.statusCode, res.body); // Debug log
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('User already exists');
  });
});

describe('User Profile', () => {
  let token;

  beforeEach(async () => {
    await User.deleteMany({});

    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
    });
    token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should fetch user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.username).toBe('testuser');
    expect(res.body.role).toBe('user');
  });

  it('should throw an error without a token', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile');
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe('Access denied. No token provided.');
  });
});