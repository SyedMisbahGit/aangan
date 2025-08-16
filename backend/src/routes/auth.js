import express from 'express';
import bcrypt from 'bcryptjs';
import { generateTokens } from '../utils/jwtUtils.js';
import { commonValidations } from '../middleware/validation.js';
const { email: validateEmail, password: validatePassword } = commonValidations;

const router = express.Router();

// Middleware to log request details
const logRequest = (req, res, next) => {
  const requestId = Math.random().toString(36).substring(2, 8);
  req.requestId = requestId;
  
  console.log(`\n=== New Request [${requestId}] ${req.method} ${req.path} ===`);
  console.log(`[${requestId}] From: ${req.ip}`);
  console.log(`[${requestId}] Headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`[${requestId}] Body:`, JSON.stringify(req.body, null, 2));
  console.log(`[${requestId}] Request URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  console.log(`[${requestId}] Request Method: ${req.method}`);
  console.log(`[${requestId}] Request Query:`, req.query);
  console.log(`[${requestId}] Request Params:`, req.params);
  
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    console.log(`[${requestId}] Response status: ${res.statusCode}`);
    if (chunk) {
      console.log(`[${requestId}] Response body:`, chunk.toString());
    }
    console.log(`[${requestId}] Response headers:`, res.getHeaders());
    originalEnd.apply(res, arguments);
  };
  
  next();
};

// User login
router.post('/login', logRequest, validateEmail, validatePassword, async (req, res) => {
  const requestId = req.requestId;
  
  try {
    const { email, password } = req.body;
    
    // Log request details
    console.log(`[${requestId}] Login attempt for email: ${email}`);
    
    // Log database connection details
    try {
      console.log(`[${requestId}] Database config:`, {
        client: req.db.client.config.client,
        connection: req.db.client.config.connection,
        database: req.db.client.databaseName,
        connected: req.db.client.pool ? 'Yes' : 'No'
      });
    } catch (dbConfigError) {
      console.error(`[${requestId}] Error getting database config:`, dbConfigError);
    }
    
    // Log middleware execution
    console.log(`[${requestId}] Middleware execution complete (validateEmail, validatePassword)`);
    
    // Find user by email
    console.log(`[${requestId}] [1/4] Querying database for user with email: ${email}`);
    
    // Log the SQL query that will be executed
    console.log(`[${requestId}] Executing query: select * from users where email = ?`, [email]);
    
    let user;
    try {
      // Log database connection details
      console.log(`[${requestId}] Database connection details:`, {
        client: req.db.client.config.client,
        filename: req.db.client.config.connection.filename,
        useNullAsDefault: req.db.client.config.useNullAsDefault
      });
      
      // Check if the users table exists
      const tableExists = await req.db.schema.hasTable('users');
      console.log(`[${requestId}] Users table exists: ${tableExists}`);
      
      if (!tableExists) {
        console.error(`[${requestId}] ❌ Users table does not exist in the database`);
        return res.status(500).json({ 
          error: 'Database configuration error',
          details: 'Users table not found',
          requestId: requestId
        });
      }
      
      // Execute the query
      user = await req.db('users')
        .where({ email })
        .first()
        .timeout(5000, { cancel: true }); // Add a timeout to prevent hanging
      
      console.log(`[${requestId}] Database query completed. User found:`, user ? 'Yes' : 'No');
      
      if (!user) {
        console.log(`[${requestId}] No user found with email: ${email}`);
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      console.log(`[${requestId}] User found. ID: ${user.id}, Email: ${user.email}`);
    } catch (err) {
      console.error(`[${requestId}] ❌ Database query error:`, err);
      
      // Log detailed error information
      const errorDetails = {
        message: err.message,
        code: err.code,
        name: err.name,
        stack: err.stack
      };
      
      // Add SQL-specific error details if available
      if (err.sql) errorDetails.sql = err.sql;
      if (err.sqlMessage) errorDetails.sqlMessage = err.sqlMessage;
      if (err.sqlState) errorDetails.sqlState = err.sqlState;
      
      console.error(`[${requestId}] Error details:`, JSON.stringify(errorDetails, null, 2));
      
      // Check for specific error types and provide more helpful messages
      let errorMessage = 'Database error during user lookup';
      let statusCode = 500;
      
      if (err.code === 'SQLITE_ERROR') {
        errorMessage = 'Database error. Please check the database connection and schema.';
      } else if (err.name === 'TimeoutError') {
        errorMessage = 'Database query timed out. The database might be locked or under heavy load.';
        statusCode = 504; // Gateway Timeout
      } else if (err.message && err.message.includes('no such table')) {
        errorMessage = 'Database table not found. The database schema might be incorrect.';
      }
      
      return res.status(statusCode).json({ 
        error: errorMessage,
        details: err.message,
        requestId: requestId
      });
    }
    
    console.log(`[${requestId}] [2/4] User lookup result:`, user ? `Found user ID: ${user.id}` : 'No user found');

    
    // Log user details (excluding sensitive info)
    console.log(`[${requestId}] User details:`, {
      id: user.id,
      email: user.email,
      username: user.username,
      is_verified: user.is_verified,
      created_at: user.created_at
    });
    
    // Log password comparison details
    console.log(`[${requestId}] [3/4] Verifying password...`);
    console.log(`[${requestId}] Input password length: ${password ? password.length : 0} characters`);
    console.log(`[${requestId}] Stored hash length: ${user.password_hash ? user.password_hash.length : 0} characters`);
    
    // Check if password is correct
    console.log(`[${requestId}] [3/4] Verifying password...`);
    console.log(`[${requestId}] Input password length: ${password ? password.length : 0} characters`);
    console.log(`[${requestId}] Stored hash length: ${user.password_hash ? user.password_hash.length : 0} characters`);
    
    // Compare password with hash
    console.log(`[${requestId}] Starting bcrypt.compare...`);
    let isPasswordValid = false;
    
    try {
      console.log(`[${requestId}] Password to check: ${password}`);
      console.log(`[${requestId}] Stored hash: ${user.password_hash ? user.password_hash.substring(0, 10) + '...' : 'No hash found'}`);
      
      // Check if the hash looks like a valid bcrypt hash
      const isBcryptHash = user.password_hash && 
                          user.password_hash.startsWith('$2a$') && 
                          user.password_hash.length >= 60;
      
      console.log(`[${requestId}] Hash appears to be a valid bcrypt hash: ${isBcryptHash}`);
      
      if (!isBcryptHash) {
        console.error(`[${requestId}] ❌ Invalid bcrypt hash format`);
        return res.status(500).json({ 
          error: 'Authentication error',
          details: 'Invalid password hash format',
          requestId: requestId
        });
      }
      
      // Perform the comparison
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      console.log(`[${requestId}] bcrypt.compare result:`, isPasswordValid);
      
      if (!isPasswordValid) {
        console.log(`[${requestId}] ❌ Login failed: Invalid password for user: ${email}`);
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
    } catch (bcryptError) {
      console.error(`[${requestId}] ❌ Error during password comparison:`, bcryptError);
      console.error(`[${requestId}] Error details:`, {
        message: bcryptError.message,
        code: bcryptError.code,
        stack: bcryptError.stack
      });
      return res.status(500).json({ 
        error: 'Authentication error',
        details: 'Failed to verify password',
        requestId: requestId
      });
    }
    
    console.log(`[${requestId}] [4/4] Password validation result: ${isPasswordValid ? '✅ Valid' : '❌ Invalid'}`);

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
