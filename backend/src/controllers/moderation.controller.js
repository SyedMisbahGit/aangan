const moderationService = require('../services/moderation.service');
const { ForbiddenError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * @typedef {Object} FlagContentRequest
 * @property {string} contentId - ID of the content being flagged
 * @property {string} contentType - Type of content (e.g., 'whisper', 'comment')
 * @property {string} reason - Reason for flagging
 * @property {string} [details] - Additional details about the flag
 */

/**
 * @typedef {Object} ReviewActionRequest
 * @property {string} action - Action to take ('approve', 'reject', 'delete')
 * @property {string} [moderatorNote] - Note from the moderator
 */

class ModerationController {
  /**
   * Flag content for moderation review
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async flagContent(req, res, next) {
    try {
      const { contentId, contentType, reason, details } = req.body;
      const userId = req.user?.id;
      const userIp = req.ip;

      if (!contentId || !contentType || !reason) {
        throw new Error('Missing required fields');
      }

      const flag = await moderationService.flagContent({
        contentId,
        contentType,
        reason,
        details,
        reportedBy: userId,
        reporterIp: userIp,
      });

      res.status(201).json({
        success: true,
        data: { flag },
      });
    } catch (error) {
      logger.error('Error flagging content:', error);
      next(error);
    }
  }

  /**
   * Get a list of flagged content for review
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async getFlaggedContent(req, res, next) {
    try {
      const { status, type, page = 1, limit = 20 } = req.query;
      const result = await moderationService.getFlaggedContent({
        status,
        type,
        page: parseInt(page, 10),
        limit: Math.min(parseInt(limit, 10), 50),
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching flagged content:', error);
      next(error);
    }
  }

  /**
   * Review a flagged content item
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async reviewFlaggedContent(req, res, next) {
    try {
      const { flagId } = req.params;
      const { action, moderatorNote } = req.body;
      const moderatorId = req.user.id;

      if (!['approve', 'reject', 'delete'].includes(action)) {
        throw new Error('Invalid action');
      }

      const result = await moderationService.reviewFlaggedContent({
        flagId,
        action,
        moderatorId,
        moderatorNote,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error reviewing flagged content:', error);
      next(error);
    }
  }

  /**
   * Get moderation stats
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async getModerationStats(req, res, next) {
    try {
      const stats = await moderationService.getModerationStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error fetching moderation stats:', error);
      next(error);
    }
  }
}

module.exports = new ModerationController();
