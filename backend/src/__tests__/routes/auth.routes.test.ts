import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import authRoutes from '../../routes/auth.routes.js';
import { authService } from '../../services/auth.service.js';
import { BadRequestError, UnauthorizedError, ValidationError } from '../../utils/errors.js';

// Mock the auth service
vi.mock('../../services/auth.service.js', () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    verifyEmail: vi.fn(),
    authenticateWithGoogle: vi.fn(),
  },
}));

// Create test app
const app = express();
app.use(bodyParser.json());

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, req.body);
  next();
});

app.use('/api/auth', authRoutes);

// Error handling middleware that matches the main app's error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error in request:', {
    message: err.message,
    status: err.statusCode || 500,
    name: err.name,
    stack: err.stack,
    ...(err.context && { context: err.context }),
  });

  if (res.headersSent) {
    return next(err);
  }

  // Format the error response
  const statusCode = err.statusCode || 500;
  const errorResponse: any = {
    error: {
      status: statusCode,
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  };

  // Add error details for validation errors
  if (err.name === 'ValidationError' || err.errorCode === 'VALIDATION_ERROR') {
    errorResponse.error.details = err.errors || [];
  }

  // Add context if available
  if (err.context) {
    errorResponse.error.context = err.context;
  }

  res.status(statusCode).json(errorResponse);
});

describe('Auth Routes', () => {
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
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    // Add error handler to catch unhandled rejections
    beforeAll(() => {
      process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      });
    });

    it('should register a new user', async () => {
      (authService.register as vi.Mock).mockResolvedValue(mockTokens);

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
      // Mock the authService.register to throw a validation error
      const validationErrors = [
        { path: 'email', msg: 'Invalid email format' },
        { path: 'password', msg: 'Password must be at least 6 characters' },
        { path: 'name', msg: 'Name is required' }
      ];
      
      // Create a mock error that matches what the error handler expects
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      validationError.statusCode = 400;
      validationError.errors = validationErrors;
      
      console.log('Mocking authService.register to throw:', {
        name: validationError.name,
        message: validationError.message,
        statusCode: validationError.statusCode,
        errors: validationError.errors
      });
      
      (authService.register as vi.Mock).mockImplementation(() => {
        console.log('authService.register mock called, throwing error');
        return Promise.reject(validationError);
      });

      try {
        // Make the request and capture the response
        console.log('Sending request to /api/auth/register');
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'invalid-email',
            password: '123',
            name: '',
          });

        console.log('Request completed with status:', response.status);
        console.log('Response body:', JSON.stringify(response.body, null, 2));
        
        // Check the response structure
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('status', 400);
        expect(response.body.error).toHaveProperty('message', 'Validation failed');
        
        // Check that details is an array with the expected errors
        expect(response.body.error).toHaveProperty('details');
        const { details } = response.body.error;
        expect(Array.isArray(details)).toBe(true);
        expect(details.length).toBeGreaterThan(0);
        
        // Check that all expected validation errors are present
        const errorMessages = details.map((d: any) => d.msg || d.message);
        expect(errorMessages).toContain('Invalid email format');
        expect(errorMessages).toContain('Password must be at least 6 characters');
        expect(errorMessages).toContain('Name is required');
      } catch (error) {
        console.error('Test error details:', {
          name: error.name,
          message: error.message,
          status: error.status,
          response: {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            body: error.response?.body,
            headers: error.response?.headers,
          },
          stack: error.stack
        });
        throw error; // Re-throw to fail the test
      }
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      (authService.login as vi.Mock).mockResolvedValue(mockTokens);

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
      console.log('Running test: should return 401 for invalid credentials');
      
      (authService.login as vi.Mock).mockRejectedValue(
        new UnauthorizedError('Invalid credentials')
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .catch(err => {
          console.error('Request error:', err);
          throw err;
        });

      console.log('Response status:', response.status);
      console.log('Response body:', JSON.stringify(response.body, null, 2));
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      (authService.refreshToken as vi.Mock).mockResolvedValue(mockTokens);

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
      (authService.logout as vi.Mock).mockResolvedValue(undefined);

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
      (authService.verifyEmail as vi.Mock).mockResolvedValue(undefined);

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
      (authService.verifyEmail as vi.Mock).mockRejectedValue(
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
      (authService.requestPasswordReset as vi.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@example.com',
        });

      // The route returns 202 (Accepted), not 200 (OK)
      expect(response.status).toBe(202); 
      expect(authService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      (authService.resetPassword as vi.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-reset-token',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(200);
      // The message should be "Password has been reset successfully"
      expect(response.body).toEqual({ message: 'Password has been reset successfully' });
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
      (authService.authenticateWithGoogle as vi.Mock).mockResolvedValue(mockTokens);

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
});