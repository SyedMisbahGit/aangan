import { verifyAccessToken } from '../utils/jwtUtils';
import { PERMISSIONS, checkPermissions } from '../utils/permissions';
import db from '../db';

// Admin-specific security options
const DEFAULT_ADMIN_OPTIONS = {
  // Require admin role
  requireAdminRole: true,
  
  // Additional security validations
  requireMfa: true,
  requireRecentLogin: true, // Require recent login (within last 15 minutes)
  checkIp: true,
  checkUserAgent: true,
  
  // Logging options
  logAccess: true,
  logDetails: true
};

/**
 * Admin authentication middleware with enhanced security
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware function
 */
const requireAdmin = (options = {}) => {
  const config = { ...DEFAULT_ADMIN_OPTIONS, ...options };
  
  // Required permissions for admin access
  const requiredPermissions = [
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.SYSTEM_MAINTENANCE
  ];
  
  return [
    // First, verify JWT and basic authentication
    async (req, res, next) => {
      try {
        // Get client information for security validation
        const clientIp = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ 
            error: 'Admin access requires authentication',
            code: 'ADMIN_AUTH_REQUIRED'
          });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
          return res.status(401).json({ 
            error: 'Invalid authorization token',
            code: 'INVALID_AUTH_TOKEN'
          });
        }

        // Verify access token with enhanced security
        let decoded;
        try {
          decoded = verifyAccessToken(
            token,
            config.checkIp ? clientIp : null,
            config.checkUserAgent ? userAgent : null
          );
        } catch (error) {
          // Log failed authentication attempts
          if (config.logAccess) {
            console.warn(`Admin authentication failed: ${error.message}`, {
              ip: clientIp,
              userAgent,
              timestamp: new Date().toISOString()
            });
          }
          
          return res.status(401).json({
            error: 'Invalid or expired authentication token',
            code: 'INVALID_OR_EXPIRED_TOKEN',
            details: config.logDetails ? error.message : undefined
          });
        }

        // Check admin role if required
        if (config.requireAdminRole && decoded.role !== 'admin') {
          if (config.logAccess) {
            console.warn(`Unauthorized admin access attempt by non-admin user`, {
              userId: decoded.sub,
              role: decoded.role,
              ip: clientIp,
              timestamp: new Date().toISOString()
            });
          }
          
          return res.status(403).json({
            error: 'Admin privileges required',
            code: 'ADMIN_PRIVILEGES_REQUIRED'
          });
        }

        // Check for recent login if required
        if (config.requireRecentLogin) {
          const now = Math.floor(Date.now() / 1000);
          const tokenAge = now - decoded.iat;
          const maxTokenAge = 15 * 60; // 15 minutes in seconds
          
          if (tokenAge > maxTokenAge) {
            return res.status(401).json({
              error: 'Session expired. Please log in again.',
              code: 'SESSION_EXPIRED',
              requiresReauthentication: true
            });
          }
        }

        // Check MFA if required
        if (config.requireMfa && !decoded.mfa_verified) {
          return res.status(403).json({
            error: 'Multi-factor authentication required',
            code: 'MFA_REQUIRED'
          });
        }

        // Fetch additional user data from database
        const user = await db('users')
          .where('id', decoded.sub)
          .select('id', 'email', 'role', 'is_active', 'mfa_enabled', 'last_login_at')
          .first();

        if (!user || !user.is_active) {
          return res.status(403).json({
            error: 'User account is inactive or does not exist',
            code: 'ACCOUNT_INACTIVE'
          });
        }

        // Attach user information to request
        req.user = {
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role,
          jti: decoded.jti,
          isAdmin: true,
          permissions: getPermissionsForRole(decoded.role),
          mfaEnabled: user.mfa_enabled,
          lastLogin: user.last_login_at
        };

        // Add security headers
        res.set({
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'"
        });

        // Log successful admin access
        if (config.logAccess) {
          console.info(`Admin access granted`, {
            userId: decoded.sub,
            email: decoded.email,
            ip: clientIp,
            userAgent,
            timestamp: new Date().toISOString()
          });
        }

        next();
      } catch (error) {
        console.error('Admin authentication error:', error);
        return res.status(500).json({
          error: 'Internal server error during authentication',
          code: 'AUTHENTICATION_ERROR',
          details: config.logDetails ? error.message : undefined
        });
      }
    },
    
    // Then, check permissions
    checkPermissions(requiredPermissions)
  ];
};

export default requireAdmin;
