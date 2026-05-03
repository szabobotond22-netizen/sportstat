const request = require('supertest');
const express = require('express');
const { router: authRouter, authenticateToken } = require('../../routes/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

// Protected route for testing middleware
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected resource', userId: req.user.userId });
});

describe('Auth API Routes', () => {
  
  describe('POST /api/auth/register', () => {
    test('Should register new user with 201 status', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeTruthy();
      expect(response.body.user.username).toBe('newuser');
    });

    test('Should return 400 for duplicate email', async () => {
      const userData = {
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password123'
      };
      
      await request(app).post('/api/auth/register').send(userData);
      
      const duplicateData = {
        username: 'user2',
        email: 'duplicate@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateData);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });

    test('Should return 400 for duplicate username', async () => {
      const userData = {
        username: 'sameusername',
        email: 'email1@example.com',
        password: 'password123'
      };
      
      await request(app).post('/api/auth/register').send(userData);
      
      const duplicateData = {
        username: 'sameusername',
        email: 'email2@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateData);
      
      expect(response.status).toBe(400);
    });

    test('Should create user with default role "user"', async () => {
      const userData = {
        username: 'roletest',
        email: 'roletest@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.body.user.role).toBe('user');
    });

    test('Should hash password before saving', async () => {
      const userData = {
        username: 'hashtest',
        email: 'hashtest@example.com',
        password: 'plainpassword123'
      };
      
      await request(app).post('/api/auth/register').send(userData);
      
      const user = await User.findOne({ email: 'hashtest@example.com' });
      expect(user.password).not.toBe('plainpassword123');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'correctpassword'
      });
    });

    test('Should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'correctpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    test('Should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/verify-login', () => {
    test('Should return 400 if email and code not provided', async () => {
      const response = await request(app)
        .post('/api/auth/verify-login')
        .send({});
      
      expect(response.status).toBe(400);
    });

    test('Should return 400 for non-existent user email', async () => {
      const response = await request(app)
        .post('/api/auth/verify-login')
        .send({
          email: 'nonexistent@example.com',
          code: '123456'
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      await User.create({
        username: 'forgottest',
        email: 'forgottest@example.com',
        password: 'password123'
      });
    });

    test('Should return 400 if email not provided', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({});
      
      expect(response.status).toBe(400);
    });

    test('Should return success message even if email not found', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('If this email exists');
    });

    test('Should create reset code for valid email', async () => {
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'forgottest@example.com' });
      
      const user = await User.findOne({ email: 'forgottest@example.com' });
      expect(user.passwordResetCode).toBeTruthy();
      expect(user.passwordResetExpires).toBeTruthy();
    });
  });

  describe('POST /api/auth/reset-password', () => {
    beforeEach(async () => {
      const user = await User.create({
        username: 'resettest',
        email: 'resettest@example.com',
        password: 'oldpassword123'
      });
      
      user.passwordResetCode = '123456';
      user.passwordResetExpires = new Date(Date.now() + 15 * 60000);
      await user.save();
    });

    test('Should return 400 if required fields missing', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          email: 'resettest@example.com',
          code: '123456'
        });
      
      expect(response.status).toBe(400);
    });

    test('Should return 400 for short password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          email: 'resettest@example.com',
          code: '123456',
          newPassword: 'short'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('at least 6 characters');
    });

    test('Should return 400 for invalid reset code', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          email: 'resettest@example.com',
          code: 'wrongcode',
          newPassword: 'newpassword123'
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('JWT Token Middleware', () => {
    test('Should allow access with valid token', async () => {
      const userData = {
        username: 'middlewaretest',
        email: 'middlewaretest@example.com',
        password: 'password123'
      };
      
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      const token = registerResponse.body.token;
      
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Protected resource');
    });

    test('Should return 401 if no token provided', async () => {
      const response = await request(app).get('/api/protected');
      
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('required');
    });

    test('Should return 403 for invalid token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(403);
    });

    test('Should return 403 for expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: '507f1f77bcf86cd799439011' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '-1h' }
      );
      
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${expiredToken}`);
      
      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/auth/profile', () => {
    test('Should return 401 without token', async () => {
      const response = await request(app).get('/api/auth/profile');
      
      expect(response.status).toBe(401);
    });

    test('Should return user profile with valid token', async () => {
      const userData = {
        username: 'profiletest',
        email: 'profiletest@example.com',
        password: 'password123'
      };
      
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      const token = registerResponse.body.token;
      
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.username).toBe('profiletest');
    });
  });
});
