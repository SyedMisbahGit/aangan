/**
 * Role-based access control (RBAC) configuration
 * Defines permissions for each role in the system
 * This is a renamed version of permissions.js to work around import issues
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

// Role definitions with their associated permissions
const ROLES = {
  GUEST: {
    name: 'guest',
    permissions: [
      PERMISSIONS.CONTENT_READ
    ]
  },
  USER: {
    name: 'user',
    permissions: [
      PERMISSIONS.CONTENT_CREATE,
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_UPDATE,
      PERMISSIONS.CONTENT_DELETE
    ]
  },
  MODERATOR: {
    name: 'moderator',
    permissions: [
      PERMISSIONS.CONTENT_CREATE,
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_UPDATE,
      PERMISSIONS.CONTENT_DELETE,
      PERMISSIONS.MODERATE_CONTENT,
      PERMISSIONS.BAN_USERS
    ]
  },
  ADMIN: {
    name: 'admin',
    permissions: Object.values(PERMISSIONS) // Admins have all permissions
  }
};

/**
 * Get all permissions for a specific role
 * @param {string} role - The role name
 * @returns {string[]} Array of permission strings
 */
const getPermissionsForRole = (role) => {
  const roleData = Object.values(ROLES).find(r => r.name === role);
  if (!roleData) {
    console.warn(`Unknown role: ${role}`);
    return [];
  }
  return roleData.permissions || [];
};

/**
 * Check if a role has a specific permission
 * @param {string} role - The role name
 * @param {string} permission - The permission to check
 * @returns {boolean} True if the role has the permission
 */
const hasPermission = (role, permission) => {
  if (!permission) return true; // No permission required
  const rolePermissions = getPermissionsForRole(role);
  return rolePermissions.includes(permission);
};

/**
 * Middleware to check if user has required permissions
 * @param {string[]} requiredPermissions - Array of required permissions
 * @returns {Function} Express middleware function
 */
const checkPermissions = (requiredPermissions = []) => {
  return (req, res, next) => {
    // Skip permission check for public routes
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return next();
    }

    // Get user from request (attached by auth middleware)
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(user.role, permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    // User has all required permissions, proceed
    next();
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

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PERMISSIONS,
    ROLES,
    getPermissionsForRole,
    hasPermission,
    checkPermissions
  };
}
