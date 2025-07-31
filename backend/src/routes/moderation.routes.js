const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderation.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { body, param, query } = require('express-validator');

// Middleware that applies to all moderation routes
router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Moderation
 *   description: Content moderation endpoints
 */

/**
 * @swagger
 * /api/moderation/flags:
 *   post:
 *     summary: Flag content for moderation
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contentId
 *               - contentType
 *               - reason
 *             properties:
 *               contentId:
 *                 type: string
 *                 description: ID of the content to flag
 *               contentType:
 *                 type: string
 *                 enum: [whisper, comment, user]
 *                 description: Type of content being flagged
 *               reason:
 *                 type: string
 *                 description: Reason for flagging
 *               details:
 *                 type: string
 *                 description: Additional details about the flag
 *     responses:
 *       201:
 *         description: Content flagged successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/flags',
  [
    body('contentId').isString().notEmpty(),
    body('contentType').isIn(['whisper', 'comment', 'user']),
    body('reason').isString().notEmpty(),
    body('details').optional().isString(),
  ],
  validate,
  moderationController.flagContent
);

/**
 * @swagger
 * /api/moderation/flags:
 *   get:
 *     summary: Get list of flagged content
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, resolved, rejected]
 *         description: Filter by flag status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [whisper, comment, user]
 *         description: Filter by content type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of flagged content
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Moderator role required
 */
router.get(
  '/flags',
  requireRole('moderator'),
  [
    query('status').optional().isIn(['pending', 'resolved', 'rejected']),
    query('type').optional().isIn(['whisper', 'comment', 'user']),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  ],
  validate,
  moderationController.getFlaggedContent
);

/**
 * @swagger
 * /api/moderation/flags/{flagId}:
 *   post:
 *     summary: Review a flagged content item
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: flagId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the flag to review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject, delete]
 *                 description: Action to take on the flagged content
 *               moderatorNote:
 *                 type: string
 *                 description: Note from the moderator
 *     responses:
 *       200:
 *         description: Review action completed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Moderator role required
 *       404:
 *         description: Flag not found
 */
router.post(
  '/flags/:flagId',
  requireRole('moderator'),
  [
    param('flagId').isUUID(),
    body('action').isIn(['approve', 'reject', 'delete']),
    body('moderatorNote').optional().isString(),
  ],
  validate,
  moderationController.reviewFlaggedContent
);

/**
 * @swagger
 * /api/moderation/stats:
 *   get:
 *     summary: Get moderation statistics
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Moderation statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pendingFlags:
 *                   type: integer
 *                   description: Number of pending flags
 *                 resolvedFlags:
 *                   type: integer
 *                   description: Number of resolved flags
 *                 activeModerators:
 *                   type: integer
 *                   description: Number of active moderators
 *                 recentActions:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   description: Count of recent moderation actions by type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Moderator role required
 */
router.get(
  '/stats',
  requireRole('moderator'),
  moderationController.getModerationStats
);

module.exports = router;
