import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import authRoutes from '../../routes/auth.routes';
import { authService } from '../../services/auth.service';
import { BadRequestError, UnauthorizedError } from '../../utils/errors';

// Mock the auth service
jest.mock('../../services/auth.service');

// Create test app
const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  // Mock user data
  const mockUser = {
    id: uuidv4(),
    email: 'test@example.com',
    name: 'Test User',
  };

  // Mock tokens
  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';
  const mockTokens = {
    accessToken: mockAccessToken,
    refreshToken: mockRefreshToken,
    expiresIn: 900, // 15 minutes in seconds
    tokenType: 'Bearer',
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      (authService.register as jest.Mock).mockResolvedValue(mockTokens);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockTokens);
      expect(authService.register).toHaveBeenCalledWith(
        'newuser@example.com',
        'password123',
        'New User'
      );
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123',
          name: '',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      (authService.login as jest.Mock).mockResolvedValue(mockTokens);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTokens);
      expect(authService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });

    it('should return 401 for invalid credentials', async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedError('Invalid credentials')
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      (authService.refreshToken as jest.Mock).mockResolvedValue(mockTokens);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: mockRefreshToken,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTokens);
      expect(authService.refreshToken).toHaveBeenCalledWith(mockRefreshToken);
    });

    it('should return 400 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout and revoke refresh token', async () => {
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .send({
          refreshToken: mockRefreshToken,
        });

      expect(response.status).toBe(204);
      expect(authService.logout).toHaveBeenCalledWith(mockRefreshToken);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      (authService.verifyEmail as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: 'valid-verification-token',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Email verified successfully' });
      expect(authService.verifyEmail).toHaveBeenCalledWith('valid-verification-token');
    });

    it('should return 400 for invalid token', async () => {
      (authService.verifyEmail as jest.Mock).mockRejectedValue(
        new BadRequestError('Invalid token')
      );

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: 'invalid-token',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email', async () => {
      (authService.requestPasswordReset as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(200);
      expect(authService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-reset-token',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Password reset successfully' });
      expect(authService.resetPassword).toHaveBeenCalledWith(
        'valid-reset-token',
        'newpassword123'
      );
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: '',
          newPassword: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/google', () => {
    it('should authenticate with valid Google ID token', async () => {
      (authService.authenticateWithGoogle as jest.Mock).mockResolvedValue(mockTokens);

      const response = await request(app)
        .post('/api/auth/google')
        .send({
          idToken: 'google-id-token',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTokens);
      expect(authService.authenticateWithGoogle).toHaveBeenCalledWith('google-id-token');
    });

    it('should return 400 for missing ID token', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  // Note: Facebook and Apple OAuth flows are typically tested with integration tests
  // due to their reliance on HTTP redirects and sessions
});
