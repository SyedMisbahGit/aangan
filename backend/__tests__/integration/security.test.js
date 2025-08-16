/**
 * Comprehensive Security Integration Tests
 * Tests JWT refresh flow, CORS lockdown, express-validator, middleware
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { app } from '../../src/app.js';
import { 
  JWTSecurityManager, 
  securityConfig,
  validationRules 
} from '../../src/middleware/security.js';

describe('🔐 Security Integration Tests', () => {
  let request;
  let server;

  beforeAll(async () => {
    server = app.listen(0);
    request = supertest(app);
  });

  afterAll(async () => {
    server?.close();
  });

  beforeEach(() => {
    // Reset environment for each test
    process.env.NODE_ENV = 'test';
  });

  describe('🎫 JWT Token Management & Refresh Flow', () => {
    test('should generate valid token pairs', () => {
      const payload = {
        userId: 'test-user-123',
        email: 'test@example.com',
        role: 'user'
      };

      const tokens = JWTSecurityManager.generateTokenPair(payload);
      
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });

    test('should verify valid access tokens', () => {
      const payload = {
        userId: 'test-user-123',
        email: 'test@example.com',
        role: 'user'
      };

      const tokens = JWTSecurityManager.generateTokenPair(payload);
      const result = JWTSecurityManager.verifyAccessToken(tokens.accessToken);

      expect(result.valid).toBe(true);
      expect(result.decoded).toHaveProperty('userId', payload.userId);
      expect(result.decoded).toHaveProperty('email', payload.email);
      expect(result.decoded).toHaveProperty('role', payload.role);
      expect(result.decoded).toHaveProperty('type', 'access');
    });

    test('should verify valid refresh tokens', () => {
      const payload = {
        userId: 'test-user-123',
        email: 'test@example.com',
        role: 'user'
      };

      const tokens = JWTSecurityManager.generateTokenPair(payload);
      const result = JWTSecurityManager.verifyRefreshToken(tokens.refreshToken);

      expect(result.valid).toBe(true);
      expect(result.decoded).toHaveProperty('userId', payload.userId);
      expect(result.decoded).toHaveProperty('type', 'refresh');
    });

    test('should reject invalid/malformed tokens', () => {
      const invalidTokens = [
        'invalid.token.string',
        'Bearer invalid-token',
        '',
        null,
        undefined,
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature'
      ];

      invalidTokens.forEach(token => {
        const accessResult = JWTSecurityManager.verifyAccessToken(token);
        const refreshResult = JWTSecurityManager.verifyRefreshToken(token);
        
        expect(accessResult.valid).toBe(false);
        expect(refreshResult.valid).toBe(false);
        expect(accessResult.error).toBeDefined();
        expect(refreshResult.error).toBeDefined();
      });
    });

    test('should refresh access token using valid refresh token', () => {
      const payload = {
        userId: 'test-user-123',
        email: 'test@example.com',
        role: 'user'
      };

      const originalTokens = JWTSecurityManager.generateTokenPair(payload);
      const newTokens = JWTSecurityManager.refreshAccessToken(originalTokens.refreshToken);

      expect(newTokens).toHaveProperty('accessToken');
      expect(newTokens).toHaveProperty('refreshToken');
      expect(newTokens.accessToken).not.toBe(originalTokens.accessToken);
      
      // Verify new tokens are valid
      const accessResult = JWTSecurityManager.verifyAccessToken(newTokens.accessToken);
      const refreshResult = JWTSecurityManager.verifyRefreshToken(newTokens.refreshToken);
      
      expect(accessResult.valid).toBe(true);
      expect(refreshResult.valid).toBe(true);
      expect(accessResult.decoded.userId).toBe(payload.userId);
    });

    test('should fail refresh with invalid refresh token', () => {
      const invalidRefreshTokens = [
        'invalid.refresh.token',
        '',
        null,
        undefined
      ];

      invalidRefreshTokens.forEach(token => {
        expect(() => {
          JWTSecurityManager.refreshAccessToken(token);
        }).toThrow();
      });
    });

    test('should not accept access token as refresh token', () => {
      const payload = {
        userId: 'test-user-123',
        email: 'test@example.com',
        role: 'user'
      };

      const tokens = JWTSecurityManager.generateTokenPair(payload);
      
      // Try to use access token for refresh (should fail)
      expect(() => {
        JWTSecurityManager.refreshAccessToken(tokens.accessToken);
      }).toThrow('Invalid token type');
    });
  });

  describe('🌐 CORS Security Policy', () => {
    test('should allow requests from development origins', async () => {
      process.env.NODE_ENV = 'development';
      
      const response = await request
        .options('/api/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    test('should block unauthorized origins in production', async () => {
      process.env.NODE_ENV = 'production';
      
      const unauthorizedOrigins = [
        'http://malicious-site.com',
        'https://evil.com',
        'http://localhost:3000', // Blocked in production
        'https://random-domain.org'
      ];

      for (const origin of unauthorizedOrigins) {
        const response = await request
          .options('/api/health')
          .set('Origin', origin)
          .set('Access-Control-Request-Method', 'GET');

        // Should not have CORS headers for blocked origins
        expect(response.headers['access-control-allow-origin']).not.toBe(origin);
      }
    });

    test('should allow staging origins in staging environment', async () => {
      process.env.NODE_ENV = 'staging';
      
      const allowedOrigins = [
        'https://staging.aangan.app',
        'http://localhost:3000',
        'http://localhost:5173'
      ];

      for (const origin of allowedOrigins) {
        const response = await request
          .options('/api/health')
          .set('Origin', origin)
          .set('Access-Control-Request-Method', 'GET');

        expect(response.headers['access-control-allow-origin']).toBe(origin);
      }
    });
  });

  describe('📝 Input Validation & Sanitization', () => {
    test('should validate whisper content properly', async () => {
      const testCases = [
        {
          data: { content: '', emotion: 'happy', zone: 'library' },
          shouldPass: false,
          reason: 'empty content'
        },
        {
          data: { 
            content: 'A'.repeat(1001), 
            emotion: 'happy', 
            zone: 'library' 
          },
          shouldPass: false,
          reason: 'content too long'
        },
        {
          data: { 
            content: 'Valid whisper content', 
            emotion: 'invalid-emotion', 
            zone: 'library' 
          },
          shouldPass: false,
          reason: 'invalid emotion'
        },
        {
          data: { 
            content: 'Valid whisper content', 
            emotion: 'happy', 
            zone: '' 
          },
          shouldPass: false,
          reason: 'empty zone'
        },
        {
          data: { 
            content: 'Valid whisper content', 
            emotion: 'happy', 
            zone: 'library' 
          },
          shouldPass: true,
          reason: 'valid data'
        }
      ];

      for (const testCase of testCases) {
        const response = await request
          .post('/api/whispers')
          .send(testCase.data);

        if (testCase.shouldPass) {
          expect(response.status).not.toBe(400);
        } else {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty('error', 'Validation failed');
          expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
          expect(response.body.details).toBeDefined();
        }
      }
    });

    test('should validate authentication inputs', async () => {
      const loginTestCases = [
        {
          data: { email: 'invalid-email', password: 'password123' },
          shouldPass: false,
          reason: 'invalid email format'
        },
        {
          data: { email: 'test@example.com', password: '123' },
          shouldPass: false,
          reason: 'password too short'
        },
        {
          data: { email: 'test@example.com', password: 'validpassword123' },
          shouldPass: true,
          reason: 'valid login data'
        }
      ];

      for (const testCase of loginTestCases) {
        const response = await request
          .post('/api/auth/login')
          .send(testCase.data);

        if (testCase.shouldPass) {
          expect(response.status).not.toBe(400);
        } else {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty('error', 'Validation failed');
        }
      }
    });

    test('should sanitize dangerous input characters', async () => {
      const dangerousInputs = [
        { content: 'Test\0null-byte', emotion: 'happy', zone: 'library' },
        { content: '<script>alert("xss")</script>', emotion: 'happy', zone: 'library' },
        { content: 'SQL \'; DROP TABLE users; --', emotion: 'happy', zone: 'library' }
      ];

      for (const input of dangerousInputs) {
        const response = await request
          .post('/api/whispers')
          .send(input);

        // Should either reject or sanitize the input
        if (response.status === 200 || response.status === 201) {
          // If accepted, ensure dangerous characters are removed/escaped
          expect(response.body.content).not.toContain('\0');
          expect(response.body.content).not.toContain('<script>');
        }
      }
    });
  });

  describe('🚦 Rate Limiting', () => {
    test('should apply rate limiting to general endpoints', async () => {
      process.env.NODE_ENV = 'production'; // Stricter rate limits
      
      const endpoint = '/api/health';
      const maxRequests = securityConfig.rateLimit.general.max;
      
      // Make requests up to the limit
      const requests = [];
      for (let i = 0; i < maxRequests + 5; i++) {
        requests.push(request.get(endpoint));
      }
      
      const responses = await Promise.all(requests);
      
      // First requests should succeed
      expect(responses[0].status).not.toBe(429);
      
      // Later requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
      
      // Check rate limit headers
      const rateLimitedResponse = rateLimitedResponses[0];
      expect(rateLimitedResponse.body).toHaveProperty('code', 'RATE_LIMIT_EXCEEDED');
    });

    test('should have stricter rate limiting for auth endpoints', async () => {
      process.env.NODE_ENV = 'production';
      
      const authEndpoint = '/api/auth/login';
      const maxAuthRequests = securityConfig.rateLimit.auth.max;
      
      const requests = [];
      for (let i = 0; i < maxAuthRequests + 2; i++) {
        requests.push(
          request
            .post(authEndpoint)
            .send({ email: 'test@example.com', password: 'password123' })
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
      expect(rateLimitedResponses[0].body).toHaveProperty('code', 'AUTH_RATE_LIMIT_EXCEEDED');
    });
  });

  describe('🛡️ Security Headers', () => {
    test('should include security headers in responses', async () => {
      const response = await request.get('/api/health');
      
      // Check essential security headers
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
      expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
      
      // Ensure dangerous headers are removed
      expect(response.headers).not.toHaveProperty('x-powered-by');
      expect(response.headers).not.toHaveProperty('server');
    });

    test('should include CSP headers', async () => {
      const response = await request.get('/api/health');
      
      expect(response.headers).toHaveProperty('content-security-policy');
      const csp = response.headers['content-security-policy'];
      
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("frame-src 'none'");
    });

    test('should set cache control for sensitive endpoints', async () => {
      const response = await request.get('/api/health');
      
      expect(response.headers['cache-control']).toContain('no-store');
      expect(response.headers['cache-control']).toContain('no-cache');
      expect(response.headers).toHaveProperty('pragma', 'no-cache');
    });
  });

  describe('🔐 Authentication Middleware Integration', () => {
    test('should require authentication for protected endpoints', async () => {
      const protectedEndpoints = [
        '/api/user/profile',
        '/api/whispers/create',
        '/api/admin/users'
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await request.get(endpoint);
        
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('code', 'NO_TOKEN_PROVIDED');
      }
    });

    test('should accept valid access tokens', async () => {
      const payload = {
        userId: 'test-user-123',
        email: 'test@example.com',
        role: 'user'
      };

      const tokens = JWTSecurityManager.generateTokenPair(payload);
      
      const response = await request
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${tokens.accessToken}`);

      // Should not be rejected for auth reasons (might 404 or other errors)
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    test('should handle token refresh automatically', async () => {
      const payload = {
        userId: 'test-user-123',
        email: 'test@example.com',
        role: 'user'
      };

      const tokens = JWTSecurityManager.generateTokenPair(payload);
      
      // Simulate expired access token by using only refresh token
      const response = await request
        .get('/api/user/profile')
        .set('X-Refresh-Token', tokens.refreshToken);

      // Should either succeed or provide new tokens in headers
      if (response.status !== 401) {
        expect(response.headers).toHaveProperty('x-access-token');
        expect(response.headers).toHaveProperty('x-refresh-token');
      }
    });

    test('should enforce role-based access control', async () => {
      const userPayload = {
        userId: 'regular-user-123',
        email: 'user@example.com',
        role: 'user'
      };

      const adminPayload = {
        userId: 'admin-user-123',
        email: 'admin@example.com',
        role: 'admin'
      };

      const userTokens = JWTSecurityManager.generateTokenPair(userPayload);
      const adminTokens = JWTSecurityManager.generateTokenPair(adminPayload);

      // Regular user should be blocked from admin endpoints
      const userResponse = await request
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userTokens.accessToken}`);

      expect(userResponse.status).toBe(403);
      expect(userResponse.body).toHaveProperty('code', 'INSUFFICIENT_PERMISSIONS');

      // Admin should have access
      const adminResponse = await request
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminTokens.accessToken}`);

      expect(adminResponse.status).not.toBe(403);
    });
  });

  describe('⚡ Security Performance & Edge Cases', () => {
    test('should handle malformed JWT gracefully', async () => {
      const malformedTokens = [
        'Bearer ',
        'Bearer malformed.token',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', // Missing payload and signature
        'Bearer ...', // Only dots
        'Bearer token-with-spaces in it'
      ];

      for (const token of malformedTokens) {
        const response = await request
          .get('/api/user/profile')
          .set('Authorization', token);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('code');
        
        // Should not leak internal error details
        expect(response.body.message).not.toContain('jwt');
        expect(response.body.message).not.toContain('secret');
      }
    });

    test('should prevent timing attacks on token verification', async () => {
      const tokens = [
        'invalid-token-1',
        'invalid-token-2-longer',
        'invalid-token-3-even-longer-string'
      ];

      const times = [];
      
      for (const token of tokens) {
        const start = process.hrtime.bigint();
        
        await request
          .get('/api/user/profile')
          .set('Authorization', `Bearer ${token}`);
          
        const end = process.hrtime.bigint();
        times.push(Number(end - start) / 1000000); // Convert to milliseconds
      }

      // Verify timing differences are not significant (within reasonable variance)
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      const timeDifference = maxTime - minTime;
      
      // Should not vary by more than 50ms (adjust based on system performance)
      expect(timeDifference).toBeLessThan(50);
    });

    test('should handle concurrent authentication requests safely', async () => {
      const payload = {
        userId: 'concurrent-test-123',
        email: 'concurrent@example.com',
        role: 'user'
      };

      const tokens = JWTSecurityManager.generateTokenPair(payload);
      
      // Make 10 concurrent requests
      const requests = Array(10).fill().map(() =>
        request
          .get('/api/user/profile')
          .set('Authorization', `Bearer ${tokens.accessToken}`)
      );

      const responses = await Promise.all(requests);
      
      // All should have consistent auth results
      const statusCodes = responses.map(r => r.status);
      const uniqueStatuses = [...new Set(statusCodes)];
      
      // Should all have the same auth result
      expect(uniqueStatuses.length).toBe(1);
    });
  });
});
