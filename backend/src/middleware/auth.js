import { verifyAccessToken, verifyRefreshToken, revokeRefreshToken } from '../utils/jwtUtils';

/**
 * Authentication middleware with enhanced security
 * @param {string[]} roles - Array of allowed roles (empty array allows any authenticated user)
 * @param {Object} options - Additional options
 * @param {boolean} options.requireEmailVerified - Whether to require email verification
 * @param {boolean} options.checkIp - Whether to validate IP address from token
 * @param {boolean} options.checkUserAgent - Whether to validate User-Agent from token
 */
export const authenticateJWT = (roles = [], options = {}) => {
  const {
    requireEmailVerified = true,
    checkIp = true,
    checkUserAgent = true
  } = options;

  return async (req, res, next) => {
    try {
      // Get client information for security validation
      const clientIp = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'No token provided',
          code: 'NO_TOKEN'
        });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ 
          error: 'No token provided',
          code: 'NO_TOKEN'
        });
      }

      // Verify access token with client context
      const decoded = verifyAccessToken(
        token,
        checkIp ? clientIp : null,
        checkUserAgent ? userAgent : null
      );

      // Check if email is verified if required
      if (requireEmailVerified && !decoded.email_verified) {
        return res.status(403).json({ 
          error: 'Email verification required',
          code: 'EMAIL_NOT_VERIFIED'
        });
      }
      
      // Check if user has required role
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        // Log unauthorized access attempts for security monitoring
        console.warn(`Unauthorized access attempt by user ${decoded.sub} with role ${decoded.role} to ${req.method} ${req.originalUrl}`);
        
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: roles,
          userRole: decoded.role
        });
      }

      // Check if token is about to expire soon (within 5 minutes)
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = decoded.exp - now;
      
      if (expiresIn < 300) { // 5 minutes
        // Add header to notify client to refresh token
        res.set('X-Token-Expiring-Soon', 'true');
      }

      // Attach minimal user information to request
      req.user = {
        id: decoded.sub, // Using 'sub' claim for user ID (standard JWT)
        email: decoded.email,
        role: decoded.role,
        jti: decoded.jti,
        isAdmin: decoded.role === 'admin',
        permissions: getPermissionsForRole(decoded.role)
      };

      // Add security headers
      res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'"
      });

      next();
    } catch (error) {
      if (error.message === 'Access token expired') {
        return res.status(401).json({ 
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};

export const handleTokenRefresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken);
    
    // Get user from database
    const user = await req.db('users')
      .where({ id: decoded.userId })
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Revoke the used refresh token
    await revokeRefreshToken(decoded.jti);

    // Generate new tokens
    const { generateTokens } = require('../../utils/jwtUtils');
    const tokens = await generateTokens(user);

    res.json(tokens);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const revokeTokens = async (req, res) => {
  try {
    const { allDevices = false } = req.body;
    
    if (allDevices) {
      // Revoke all refresh tokens for this user
      const { revokeUserRefreshTokens } = require('../../utils/jwtUtils');
      await revokeUserRefreshTokens(req.user.id);
    } else if (req.user?.jti) {
      // Revoke only the current refresh token
      await revokeRefreshToken(req.user.jti);
    } else {
      return res.status(400).json({ error: 'Invalid request' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error revoking tokens:', error);
    res.status(500).json({ error: 'Failed to revoke tokens' });
  }
};
