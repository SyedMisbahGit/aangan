import express from 'express';
import requireAdmin from '../middleware/adminAuth';

const router = express.Router();

// Apply admin middleware to all routes in this router
router.use(requireAdmin({
  // Enable all security features for admin routes
  requireMfa: true,
  requireRecentLogin: true,
  checkIp: true,
  checkUserAgent: true,
  logAccess: true,
  logDetails: process.env.NODE_ENV !== 'production' // More details in non-production
}));

// Admin dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalWhispers,
      reportedContent
    ] = await Promise.all([
      req.db('users').count('id as count').first(),
      req.db('users')
        .where('last_login', '>=', req.db.raw("NOW() - INTERVAL '30 days'"))
        .count('id as count')
        .first(),
      req.db('whispers').count('id as count').first(),
      req.db('reports')
        .where({ status: 'pending' })
        .count('id as count')
        .first()
    ]);

    res.json({
      users: {
        total: parseInt(totalUsers.count, 10),
        active: parseInt(activeUsers.count, 10)
      },
      content: {
        totalWhispers: parseInt(totalWhispers.count, 10),
        pendingReports: parseInt(reportedContent.count, 10)
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// User management endpoints
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    // Base query
    let query = req.db('users')
      .select(
        'id',
        'email',
        'name',
        'role',
        'is_active',
        'created_at',
        'last_login',
        'mfa_enabled'
      )
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
    
    // Add search filter if provided
    if (search) {
      query = query.where(function() {
        this.where('email', 'ilike', `%${search}%`)
          .orWhere('name', 'ilike', `%${search}%`);
      });
    }
    
    const users = await query;
    
    // Get total count for pagination
    const countQuery = req.db('users');
    if (search) {
      countQuery.where(function() {
        this.where('email', 'ilike', `%${search}%`)
          .orWhere('name', 'ilike', `%${search}%`);
      });
    }
    const total = (await countQuery.count('id as count').first()).count;
    
    res.json({
      data: users,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: parseInt(total, 10),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Content moderation endpoints
router.get('/reports', async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const reports = await req.db('reports as r')
      .select(
        'r.id',
        'r.reason',
        'r.status',
        'r.created_at',
        'r.updated_at',
        'r.reporter_id',
        'r.whisper_id',
        'w.content as whisper_content',
        'w.user_id as whisper_author_id',
        'reporter.email as reporter_email',
        'author.email as author_email'
      )
      .leftJoin('whispers as w', 'r.whisper_id', 'w.id')
      .leftJoin('users as reporter', 'r.reporter_id', 'reporter.id')
      .leftJoin('users as author', 'w.user_id', 'author.id')
      .where('r.status', status)
      .orderBy('r.created_at', 'desc')
      .limit(limit)
      .offset(offset);
    
    const total = (await req.db('reports')
      .where('status', status)
      .count('id as count')
      .first()).count;
    
    res.json({
      data: reports,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: parseInt(total, 10),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Handle report action (approve/reject)
router.post('/reports/:id/action', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    // Start transaction
    await req.db.transaction(async (trx) => {
      // Get the report
      const report = await trx('reports')
        .where({ id })
        .first();
      
      if (!report) {
        throw new Error('Report not found');
      }
      
      // Update report status
      await trx('reports')
        .where({ id })
        .update({
          status: action === 'approve' ? 'resolved' : 'rejected',
          resolved_by: req.user.id,
          resolved_at: new Date(),
          resolution_reason: reason
        });
      
      // If approved, take action on the content
      if (action === 'approve') {
        // For example, delete the reported whisper
        await trx('whispers')
          .where({ id: report.whisper_id })
          .update({ is_removed: true, removed_at: new Date() });
        
        // Log the moderation action
        await trx('moderation_logs').insert({
          moderator_id: req.user.id,
          action: 'remove_whisper',
          target_id: report.whisper_id,
          reason: `Report approved: ${reason || 'No reason provided'}`,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        });
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Report action error:', error);
    res.status(500).json({ error: 'Failed to process report action' });
  }
});

// System settings endpoints
router.get('/settings', async (req, res) => {
  try {
    const settings = await req.db('settings')
      .select('key', 'value', 'description', 'updated_at')
      .orderBy('key');
    
    // Convert array to object
    const settingsObj = settings.reduce((acc, { key, value, ...rest }) => ({
      ...acc,
      [key]: { value, ...rest }
    }), {});
    
    res.json(settingsObj);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update system settings
router.post('/settings', async (req, res) => {
  try {
    const updates = req.body;
    
    // Validate updates
    const validKeys = await req.db('settings').select('key');
    const validKeySet = new Set(validKeys.map(item => item.key));
    
    const invalidKeys = Object.keys(updates).filter(key => !validKeySet.has(key));
    if (invalidKeys.length > 0) {
      return res.status(400).json({
        error: 'Invalid setting keys',
        invalidKeys
      });
    }
    
    // Update settings in transaction
    await req.db.transaction(async (trx) => {
      for (const [key, value] of Object.entries(updates)) {
        await trx('settings')
          .where({ key })
          .update({
            value: JSON.stringify(value),
            updated_at: new Date()
          });
      }
    });
    
    // Log the settings update
    await req.db('audit_logs').insert({
      user_id: req.user.id,
      action: 'update_settings',
      details: {
        updatedSettings: Object.keys(updates),
        ip: req.ip
      },
      created_at: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
