import express from 'express';
import bcrypt from 'bcrypt';
import { generateTokens } from '../utils/jwtUtils';
import { validateEmail, validatePassword } from '../middleware/validation';

const router = express.Router();

// User login
router.post('/login', validateEmail, validatePassword, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await req.db('users')
      .where({ email })
      .first();

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const tokens = await generateTokens(user);
    
    // Update last login time
    await req.db('users')
      .where({ id: user.id })
      .update({ last_login: new Date() });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User registration
router.post('/register', validateEmail, validatePassword, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await req.db('users')
      .where({ email })
      .first();
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [userId] = await req.db('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        role: 'user', // Default role
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('id');

    // Get the created user
    const user = await req.db('users')
      .where({ id: userId })
      .first();

    // Generate tokens
    const tokens = await generateTokens(user);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      ...tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Token refresh
router.post('/refresh-token', async (req, res) => {
  const { handleTokenRefresh } = require('../middleware/auth');
  return handleTokenRefresh(req, res);
});

// Logout
router.post('/logout', (req, res) => {
  const { revokeTokens } = require('../middleware/auth');
  return revokeTokens(req, res);
});

export default router;
