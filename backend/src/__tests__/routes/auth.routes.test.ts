import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import authRoutes from '../../routes/auth.routes.js';
import { authService } from '../../services/auth.service.js';
import { BadRequestError, UnauthorizedError } from '../../utils/errors.js';

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
      // Make the request with invalid data
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123',
          name: '',
        });

      // Check the response structure
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      
      const { error } = response.body;
      expect(error).toHaveProperty('status', 400);
      expect(error).toHaveProperty('message');
      
      // Check for validation errors in context.details
      const errorDetails = error.context?.details || [];
      
      // Verify we have exactly 3 validation errors (one for each field)
      expect(errorDetails).toHaveLength(3);
      
      // Check for expected error patterns - using the actual error messages from the API
      const hasEmailError = errorDetails.some((err: { value: string; location: string }) => 
        err.value === 'invalid-email' && err.location === 'body'
      );
      
      const hasPasswordError = errorDetails.some((err: { value: string; location: string }) => 
        err.value === '123' && err.location === 'body'
      );
      
      const hasNameError = errorDetails.some((err: { value: string; location: string }) => 
        err.value === '' && err.location === 'body'
      );
      
      // Expect all validation errors to be present
      expect(hasEmailError).toBe(true);
      expect(hasPasswordError).toBe(true);
      expect(hasNameError).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      (authService.login as Mock).mockResolvedValue(mockTokens);

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
      expect(response.body).toMatchObject({
        error: {
          status: 401,
          message: 'Invalid credentials'
        }
      });
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      (authService.refreshToken as Mock).mockResolvedValue(mockTokens);

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
      (authService.logout as Mock).mockResolvedValue(undefined);

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
      (authService.verifyEmail as Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .get('/api/auth/verify-email')
        .query({ token: 'valid-verification-token' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Email verified successfully' });
      expect(authService.verifyEmail).toHaveBeenCalledWith('valid-verification-token');
    });

    it('should return 400 for invalid token', async () => {
      (authService.verifyEmail as Mock).mockRejectedValue(
        new BadRequestError('Invalid token')
      );

      const response = await request(app)
        .get('/api/auth/verify-email')
        .query({ token: 'invalid-token' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: {
          status: 400,
          message: 'Invalid token'
        }
      });
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email', async () => {
      (authService.requestPasswordReset as Mock).mockResolvedValue(undefined);

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
      (authService.resetPassword as Mock).mockResolvedValue(undefined);

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
      (authService.authenticateWithGoogle as Mock).mockResolvedValue(mockTokens);

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