import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../db';
import { authService } from '../../services/auth.service';
import { BadRequestError, UnauthorizedError } from '../../utils/errors';

// Mock the database and other dependencies
jest.mock('../../db');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Mock the email service
jest.mock('../../services/email.service', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  // Mock user data
  const mockUser = {
    id: uuidv4(),
    email: 'test@example.com',
    password: 'hashedpassword',
    name: 'Test User',
    username: 'testuser',
    email_verified: true,
    is_active: true,
    role: 'user',
    created_at: new Date(),
    updated_at: new Date(),
    last_login: null,
  };

  // Mock tokens
  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';
  const mockTokenId = uuidv4();

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock bcrypt.compare
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    
    // Mock bcrypt.hash
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
    
    // Mock bcrypt.genSalt
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    
    // Mock jwt.sign
    (jwt.sign as jest.Mock).mockImplementation((payload, secret, options) => {
      if (options?.expiresIn === '15m') {
        return mockAccessToken;
      } else if (options?.expiresIn === '7d') {
        return mockRefreshToken;
      }
      return 'mock-token';
    });
    
    // Mock jwt.verify
    (jwt.verify as jest.Mock).mockImplementation(() => ({
      userId: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      tokenId: mockTokenId,
    }));
    
    // Mock database responses
    (db as any).mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(mockUser),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([mockUser.id]),
      leftJoin: jest.fn().mockReturnThis(),
      transaction: jest.fn(callback => 
        callback({
          ...db(),
          commit: jest.fn(),
          rollback: jest.fn(),
        })
      ),
    }));
  });

  describe('register', () => {
    it('should register a new user', async () => {
      // Mock that no user exists with this email
      (db as any)().first.mockResolvedValueOnce(null);
      
      const result = await authService.register(
        'newuser@example.com',
        'password123',
        'New User'
      );
      
      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(result).toHaveProperty('refreshToken', mockRefreshToken);
      expect(db().insert).toHaveBeenCalledWith(expect.objectContaining({
        email: 'newuser@example.com',
        name: 'New User',
      }));
    });

    it('should throw an error if email is already in use', async () => {
      await expect(
        authService.register(
          'test@example.com',
          'password123',
          'Test User'
        )
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const result = await authService.login('test@example.com', 'password123');
      
      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(result).toHaveProperty('refreshToken', mockRefreshToken);
      expect(db().update).toHaveBeenCalledWith({
        last_login: expect.any(Date),
      });
    });

    it('should throw an error for invalid credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      
      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw an error for unverified email', async () => {
      (db as any)().first.mockResolvedValueOnce({
        ...mockUser,
        email_verified: false,
      });
      
      await expect(
        authService.login('unverified@example.com', 'password123')
      ).rejects.toThrow('Please verify your email address');
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token with valid refresh token', async () => {
      // Mock refresh token in database
      (db as any)().first.mockResolvedValueOnce({
        id: mockTokenId,
        user_id: mockUser.id,
        token: mockRefreshToken,
        revoked: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });
      
      const result = await authService.refreshToken(mockRefreshToken);
      
      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(result).toHaveProperty('refreshToken', mockRefreshToken);
      
      // Should revoke the old refresh token
      expect(db().update).toHaveBeenCalledWith({ revoked: true });
      
      // Should store the new refresh token
      expect(db().insert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: mockUser.id,
        token: mockRefreshToken,
      }));
    });

    it('should throw an error for expired refresh token', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        const error = new Error('Token expired') as any;
        error.name = 'TokenExpiredError';
        throw error;
      });
      
      await expect(
        authService.refreshToken('expired-token')
      ).rejects.toThrow('Refresh token has expired');
    });
  });

  describe('logout', () => {
    it('should revoke the refresh token', async () => {
      await authService.logout(mockRefreshToken);
      
      expect(db().update).toHaveBeenCalledWith({ revoked: true });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, purpose: 'email_verification' },
        'secret',
        { expiresIn: '1h' }
      );
      
      await authService.verifyEmail(token);
      
      expect(db().update).toHaveBeenCalledWith({
        email_verified: true,
        updated_at: expect.any(Date),
      });
    });

    it('should throw an error for invalid token', async () => {
      const token = 'invalid-token';
      
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });
      
      await expect(
        authService.verifyEmail(token)
      ).rejects.toThrow('Invalid or expired verification token');
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset email for existing user', async () => {
      const { sendEmail } = require('../../services/email.service');
      
      await authService.requestPasswordReset('test@example.com');
      
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        subject: 'Reset your password',
      }));
    });

    it('should not throw error for non-existent email', async () => {
      (db as any)().first.mockResolvedValueOnce(null);
      
      await expect(
        authService.requestPasswordReset('nonexistent@example.com')
      ).resolves.not.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, purpose: 'password_reset' },
        'secret',
        { expiresIn: '1h' }
      );
      
      await authService.resetPassword(token, 'newpassword123');
      
      // Should hash the new password
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', expect.any(String));
      
      // Should update the user's password
      expect(db().update).toHaveBeenCalledWith({
        password: 'hashedpassword',
        updated_at: expect.any(Date),
      });
      
      // Should revoke all user's refresh tokens
      expect(db().update).toHaveBeenCalledWith({ revoked: true });
    });
  });

  describe('authenticateWithGoogle', () => {
    it('should authenticate with valid Google ID token', async () => {
      // Mock Google OAuth2Client
      const mockVerifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => ({
          sub: 'google-user-id',
          email: 'google@example.com',
          name: 'Google User',
          given_name: 'Google',
          family_name: 'User',
          picture: 'https://example.com/avatar.jpg',
          email_verified: true,
        }),
      });
      
      const originalGoogleClient = authService['googleClient'];
      authService['googleClient'] = {
        verifyIdToken: mockVerifyIdToken,
      } as any;
      
      const result = await authService.authenticateWithGoogle('google-id-token');
      
      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(result).toHaveProperty('refreshToken', mockRefreshToken);
      
      // Restore original googleClient
      authService['googleClient'] = originalGoogleClient;
    });
  });
});
