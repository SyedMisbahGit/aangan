const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const contentService = require('./content.service');
const userService = require('./user.service');

/**
 * @typedef {Object} FlagContentParams
 * @property {string} contentId - ID of the content being flagged
 * @property {string} contentType - Type of content (e.g., 'whisper', 'comment')
 * @property {string} reason - Reason for flagging
 * @property {string} [details] - Additional details about the flag
 * @property {string} [reportedBy] - ID of the user reporting the content
 * @property {string} [reporterIp] - IP address of the reporter
 */

/**
 * @typedef {Object} ReviewActionParams
 * @property {string} flagId - ID of the flag to review
 * @property {'approve'|'reject'|'delete'} action - Action to take
 * @property {string} moderatorId - ID of the moderator
 * @property {string} [moderatorNote] - Note from the moderator
 */

/**
 * Flag content for moderation review
 * @param {FlagContentParams} params
 * @returns {Promise<Object>} Created flag record
 */
async function flagContent({
  contentId,
  contentType,
  reason,
  details,
  reportedBy,
  reporterIp,
}) {
  // Check if content exists
  const content = await contentService.getContentById(contentType, contentId);
  if (!content) {
    throw new NotFoundError('Content not found');
  }

  // Check if user has already flagged this content
  const existingFlag = await db('content_flags')
    .where({
      content_id: contentId,
      content_type: contentType,
      reported_by: reportedBy,
      status: 'pending',
    })
    .first();

  if (existingFlag) {
    return existingFlag; // Return existing flag if already reported
  }

  // Create new flag
  const [flag] = await db('content_flags')
    .insert({
      id: uuidv4(),
      content_id: contentId,
      content_type: contentType,
      reason,
      details,
      reported_by: reportedBy,
      reporter_ip: reporterIp,
      status: 'pending',
      created_at: new Date(),
    })
    .returning('*');

  logger.info(`Content flagged: ${contentType} ${contentId} for ${reason}`);
  
  // Check if we've reached the threshold for auto-moderation
  await checkAutoModeration(contentId, contentType);

  return flag;
}

/**
 * Check if content should be auto-moderated based on flags
 * @param {string} contentId
 * @param {string} contentType
 */
async function checkAutoModeration(contentId, contentType) {
  const flagThreshold = 3; // Number of flags needed for auto-moderation
  
  const flagCount = await db('content_flags')
    .where({
      content_id: contentId,
      content_type: contentType,
      status: 'pending',
    })
    .count('id', { as: 'count' })
    .first();

  if (flagCount >= flagThreshold) {
    // Auto-hide content that gets too many flags
    await contentService.updateContentStatus(contentType, contentId, 'hidden', 'auto-moderation');
    
    // Update all pending flags
    await db('content_flags')
      .where({
        content_id: contentId,
        content_type: contentType,
        status: 'pending',
      })
      .update({
        status: 'resolved',
        resolved_at: new Date(),
        resolution: 'auto-moderated',
      });
    
    logger.info(`Auto-moderated ${contentType} ${contentId} after ${flagCount} flags`);
  }
}

/**
 * Get a list of flagged content for review
 * @param {Object} options
 * @param {string} [options.status] - Filter by status (pending, resolved, etc.)
 * @param {string} [options.type] - Filter by content type
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Items per page
 * @returns {Promise<Object>} Paginated list of flagged content
 */
async function getFlaggedContent({ status, type, page = 1, limit = 20 }) {
  const query = db('content_flags')
    .select('*')
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset((page - 1) * limit);

  if (status) {
    query.where('status', status);
  }
  
  if (type) {
    query.where('content_type', type);
  }

  const [items, [{ count }]] = await Promise.all([
    query.clone(),
    db('content_flags').count('*', { as: 'count' })
  ]);

  return {
    items,
    pagination: {
      total: parseInt(count, 10),
      page,
      limit,
      pages: Math.ceil(count / limit),
    },
  };
}

/**
 * Review a flagged content item
 * @param {ReviewActionParams} params
 * @returns {Promise<Object>} Updated flag and content
 */
async function reviewFlaggedContent({ flagId, action, moderatorId, moderatorNote }) {
  return db.transaction(async (trx) => {
    // Get the flag
    const flag = await trx('content_flags')
      .where({ id: flagId, status: 'pending' })
      .first();

    if (!flag) {
      throw new NotFoundError('Flag not found or already resolved');
    }

    // Update the flag
    const [updatedFlag] = await trx('content_flags')
      .where({ id: flagId })
      .update({
        status: action === 'reject' ? 'rejected' : 'resolved',
        resolved_at: new Date(),
        resolved_by: moderatorId,
        resolution: action,
        moderator_note: moderatorNote,
      })
      .returning('*');

    // Take action on the content if needed
    if (action === 'delete') {
      await contentService.updateContentStatus(
        flag.content_type,
        flag.content_id,
        'deleted',
        'moderator_action',
        moderatorId,
        trx
      );
      
      // Optionally, take action against the user who posted the content
      const content = await contentService.getContentById(flag.content_type, flag.content_id, trx);
      if (content && content.user_id) {
        await userService.recordModerationAction({
          userId: content.user_id,
          action: 'content_removed',
          reason: 'Violation of community guidelines',
          moderatorId,
          contentId: flag.content_id,
          contentType: flag.content_type,
        }, trx);
      }
    } else if (action === 'approve') {
      await contentService.updateContentStatus(
        flag.content_type,
        flag.content_id,
        'approved',
        'moderator_review',
        moderatorId,
        trx
      );
    }

    return {
      flag: updatedFlag,
      action,
    };
  });
}

/**
 * Get moderation statistics
 * @returns {Promise<Object>} Moderation stats
 */
async function getModerationStats() {
  const [
    pendingFlags,
    resolvedFlags,
    activeModerators,
    recentActions,
  ] = await Promise.all([
    db('content_flags').where({ status: 'pending' }).count('*', { as: 'count' }).first(),
    db('content_flags').whereNot({ status: 'pending' }).count('*', { as: 'count' }).first(),
    db('user_roles')
      .join('users', 'user_roles.user_id', 'users.id')
      .where('user_roles.role', 'moderator')
      .where('users.is_active', true)
      .count('*', { as: 'count' })
      .first(),
    db('moderation_actions')
      .select('action', db.raw('count(*) as count'))
      .where('created_at', '>=', db.raw("now() - interval '7 days'"))
      .groupBy('action'),
  ]);

  return {
    pendingFlags: parseInt(pendingFlags.count, 10) || 0,
    resolvedFlags: parseInt(resolvedFlags.count, 10) || 0,
    activeModerators: parseInt(activeModerators.count, 10) || 0,
    recentActions: recentActions.reduce((acc, { action, count }) => ({
      ...acc,
      [action]: parseInt(count, 10) || 0,
    }), {}),
  };
}

module.exports = {
  flagContent,
  getFlaggedContent,
  reviewFlaggedContent,
  getModerationStats,
};
