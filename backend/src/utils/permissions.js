/**
 * Role-based access control (RBAC) configuration
 * Defines permissions for each role in the system
 */

// Permission levels
const PERMISSIONS = {
  // User management
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  
  // Content management
  CONTENT_CREATE: 'content:create',
  CONTENT_READ: 'content:read',
  CONTENT_UPDATE: 'content:update',
  CONTENT_DELETE: 'content:delete',
  
  // Moderation
  MODERATE_CONTENT: 'moderate:content',
  BAN_USERS: 'moderate:ban',
  
  // Admin
  MANAGE_ROLES: 'admin:roles',
  SITE_CONFIG: 'admin:config',
  VIEW_LOGS: 'admin:logs',
  
  // System
  SYSTEM_MAINTENANCE: 'system:maintenance'
};

// Role definitions with associated permissions
const ROLES = {
  // Regular authenticated user
  user: [
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_UPDATE,
    PERMISSIONS.CONTENT_DELETE
  ],
  
  // Moderator role (can manage content and users)
  moderator: [
    ...ROLES.user, // Inherit all user permissions
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.BAN_USERS,
    PERMISSIONS.USERS_READ
  ],
  
  // Administrator role (full access)
  admin: [
    ...ROLES.moderator, // Inherit all moderator permissions
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.SITE_CONFIG,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.SYSTEM_MAINTENANCE
  ]
};

// Cache for role permissions
const rolePermissionsCache = new Map();

/**
 * Get all permissions for a specific role
 * @param {string} role - The role name
 * @returns {string[]} Array of permission strings
 */
const getPermissionsForRole = (role) => {
  if (!role) return [];
  
  // Check cache first
  if (rolePermissionsCache.has(role)) {
    return rolePermissionsCache.get(role);
  }
  
  // Get permissions for role (default to empty array if role doesn't exist)
  const permissions = ROLES[role] || [];
  
  // Cache the result
  rolePermissionsCache.set(role, permissions);
  
  return permissions;
};

/**
 * Check if a role has a specific permission
 * @param {string} role - The role name
 * @param {string} permission - The permission to check
 * @returns {boolean} True if the role has the permission
 */
const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
};

/**
 * Middleware to check if user has required permissions
 * @param {string[]} requiredPermissions - Array of required permissions
 * @returns {Function} Express middleware function
 */
const checkPermissions = (requiredPermissions = []) => {
  return (req, res, next) => {
    try {
      // Skip if no permissions required
      if (!requiredPermissions.length) {
        return next();
      }
      
      // Check if user is authenticated
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }
      
      // Check each required permission
      const missingPermissions = requiredPermissions.filter(
        permission => !hasPermission(req.user.role, permission)
      );
      
      if (missingPermissions.length > 0) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredPermissions,
          missingPermissions,
          userRole: req.user.role
        });
      }
      
      // User has all required permissions
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        error: 'Internal server error during permission check',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

// Export public API
export {
  PERMISSIONS,
  ROLES,
  getPermissionsForRole,
  hasPermission,
  checkPermissions
};

// Export default for easier imports
export default {
  PERMISSIONS,
  ROLES,
  getPermissionsForRole,
  hasPermission,
  checkPermissions
};
