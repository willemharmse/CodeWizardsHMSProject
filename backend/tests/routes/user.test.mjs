import request from 'supertest';
import express from 'express';
import { User } from '../src/models/users.mjs';
import userRoutes from '../src/routes/user.mjs';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../src/middleware/verifyJWTToken.mjs');
jest.mock('../src/middleware/restrictUser.mjs');
jest.mock('../src/models/users.mjs');
jest.mock('../src/models/student.mjs');
jest.mock('../src/models/admins.mjs');
jest.mock('../src/models/lecturers.mjs');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../src/config/logger.mjs');

// Create an Express app instance for testing
const app = express();
app.use(express.json());
app.use('/user', userRoutes);

// Sample data
const sampleUser = {
  username: 'testuser',
  password: 'hashedPassword',
  email: 'testuser@example.com',
  role: 'student',
};

describe('User Routes', () => {
  describe('POST /create', () => {
    it('should create a new user when all conditions are met', async () => {
      // Mock bcrypt.hash to return a dummy hashed password
      bcrypt.hash.mockResolvedValue('hashedPassword');

      // Mock User.findOne to return null (indicating the username is not taken)
      User.findOne.mockResolvedValue(null);

      // Mock User save
      User.prototype.save = jest.fn().mockResolvedValue(sampleUser);

      // Mock Student save (role-specific)
      Student.prototype.save = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/user/create')
        .send({
          username: 'testuser',
          password: 'password123',
          email: 'testuser@example.com',
          role: 'student',
          enrollmentYear: 2022,
        })
        .set('Authorization', 'Bearer some-valid-token');

      expect(response.statusCode).toBe(200);
      expect(User.prototype.save).toHaveBeenCalled();
      expect(Student.prototype.save).toHaveBeenCalled();
    });

    it('should return 400 if username already exists', async () => {
      // Mock User.findOne to return an existing user
      User.findOne.mockResolvedValue(sampleUser);

      const response = await request(app)
        .post('/user/create')
        .send({
          username: 'testuser',
          password: 'password123',
          email: 'testuser@example.com',
          role: 'student',
        })
        .set('Authorization', 'Bearer some-valid-token');

      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('User with this username already exists');
    });
  });

  describe('POST /login', () => {
    it('should return a JWT token on successful login', async () => {
      // Mock User.findOne to return a user
      User.findOne.mockResolvedValue(sampleUser);

      // Mock bcrypt.compare to return true (indicating correct password)
      bcrypt.compare.mockResolvedValue(true);

      // Mock jwt.sign to return a dummy token
      jwt.sign.mockReturnValue('dummyToken');

      const response = await request(app)
        .post('/user/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBe('dummyToken');
    });

    it('should return 401 if the password is incorrect', async () => {
      // Mock User.findOne to return a user
      User.findOne.mockResolvedValue(sampleUser);

      // Mock bcrypt.compare to return false (indicating incorrect password)
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/user/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        });

      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('Invalid username or password');
    });
  });

  describe('GET /student/:username', () => {
    it('should return student details for a valid student user', async () => {
      // Mock User.findOne to return a user with the 'student' role
      User.findOne.mockResolvedValue({ ...sampleUser, role: 'student' });

      // Mock Student.findOne to return student details
      Student.findOne.mockResolvedValue({
        user: sampleUser._id,
        enrollmentYear: 2022,
      });

      const response = await request(app).get('/user/student/testuser');

      expect(response.statusCode).toBe(200);
      expect(response.body.enrollmentYear).toBe(2022);
    });

    it('should return 404 if the user does not exist', async () => {
      // Mock User.findOne to return null (indicating no user found)
      User.findOne.mockResolvedValue(null);

      const response = await request(app).get('/user/student/testuser');

      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('User not found');
    });
  });
});
