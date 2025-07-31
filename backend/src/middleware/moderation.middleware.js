const db = require('../db');
const { ForbiddenError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Middleware to check if the current user is suspended
 * Blocks requests from suspended users
 */
const checkSuspended = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(); // No user to check
  }

  try {
    const activeSuspension = await db('user_suspensions')
      .where({
        user_id: req.user.id,
        is_active: true,
      })
      .andWhere(function() {
        this.where('ends_at', '>', new Date())
          .orWhereNull('ends_at'); // Permanent suspension
      })
      .first();

    if (activeSuspension) {
      const isPermanent = activeSuspension.ends_at === null;
      const message = isPermanent
        ? 'Your account has been permanently suspended.'
        : `Your account is suspended until ${new Date(activeSuspension.ends_at).toLocaleString()}.`;
      
      if (activeSuspension.reason) {
        message += ` Reason: ${activeSuspension.reason}`;
      }
      
      throw new ForbiddenError('ACCOUNT_SUSPENDED', message, {
        suspensionId: activeSuspension.id,
        endsAt: activeSuspension.ends_at,
        isPermanent,
        reason: activeSuspension.reason,
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to filter out hidden/deleted content from responses
 * Should be used after the main route handler but before sending the response
 */
const filterContent = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (!data || typeof data !== 'object') {
      return originalJson.call(this, data);
    }
    
    // Check if the response contains content that might need filtering
    const filterContentItems = (items) => {
      if (!Array.isArray(items)) return items;
      
      return items.filter(item => {
        // Skip if item doesn't have a status or is active
        if (!item || item.status === undefined || item.status === 'active') {
          return true;
        }
        
        // Show hidden/deleted content only to moderators or the original author
        const isModerator = req.user && req.user.roles && req.user.roles.includes('moderator');
        const isAuthor = item.user_id && req.user && item.user_id === req.user.id;
        
        return isModerator || isAuthor;
      });
    };
    
    // Apply filtering to common response structures
    if (Array.isArray(data)) {
      data = filterContentItems(data);
    } else if (data.items && Array.isArray(data.items)) {
      // Handle paginated responses
      data.items = filterContentItems(data.items);
    } else if (data.data && Array.isArray(data.data)) {
      // Handle data array responses
      data.data = filterContentItems(data.data);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Middleware to log moderation actions
 */
const logModerationAction = async (action, metadata = {}) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return next();
      }
      
      const targetUserId = metadata.targetUserId || 
                         (req.params && req.params.userId) ||
                         (req.body && req.body.userId);
      
      const logData = {
        action,
        moderator_id: req.user.id,
        target_user_id: targetUserId,
        metadata: {
          ...metadata,
          ip: req.ip,
          userAgent: req.get('user-agent'),
        },
      };
      
      // Log to database
      await db('moderation_actions').insert({
        id: require('uuid').v4(),
        ...logData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      
      // Update user's last moderated timestamp
      if (req.user.id) {
        await db('users')
          .where({ id: req.user.id })
          .update({
            last_moderated_at: new Date(),
            updated_at: new Date(),
          });
      }
      
      next();
    } catch (error) {
      logger.error('Error logging moderation action:', error);
      next(); // Don't block the request if logging fails
    }
  };
};

module.exports = {
  checkSuspended,
  filterContent,
  logModerationAction,
};
