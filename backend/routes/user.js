import express from 'express';
import { db } from '../src/db.js';
import { authenticateJWT } from '../src/middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(authenticateJWT());

/**
 * @route GET /api/user/profile
 * @description Get the authenticated user's profile
 * @access Private
 */
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user profile from database
    const user = await db('users')
      .where({ id: userId })
      .select('id', 'email', 'username', 'role', 'created_at', 'last_login')
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.created_at,
      lastLogin: user.last_login
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * @route PUT /api/user/profile
 * @description Update the authenticated user's profile
 * @access Private
 */
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email } = req.body;

    // Validate input
    if (!username && !email) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;

    // Update user in database
    const [updatedUser] = await db('users')
      .where({ id: userId })
      .update(updates)
      .returning(['id', 'email', 'username', 'role', 'created_at']);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      role: updatedUser.role,
      createdAt: updatedUser.created_at
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    // Handle duplicate email/username errors
    if (error.code === '23505') {
      const detail = error.detail || '';
      if (detail.includes('email')) {
        return res.status(400).json({ error: 'Email already in use' });
      } else if (detail.includes('username')) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }
    
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

export default router;
