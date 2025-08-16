// Enhanced test server to identify backend issues
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'local.env') });

console.log('🚀 Starting enhanced test server...');
console.log(`Node.js version: ${process.version}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`DB_PATH: ${process.env.DB_PATH || 'Not set (using default)'}`);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Enhanced middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use('/api/', apiLimiter);

// Import and use auth routes
console.log('\n🔍 Loading auth routes...');
try {
  // First, try to import the auth routes
  console.log('Attempting to import auth module...');
  const authModule = await import('./src/routes/auth.js');
  console.log('Auth module imported successfully');
  
  if (!authModule || !authModule.default) {
    throw new Error('Auth routes module does not have a default export');
  }
  
  // Log the module structure for debugging
  console.log('Auth module structure:', Object.keys(authModule));
  
  // Add error handling middleware before the routes
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
  
  // Add error handling for the auth routes
  const authRouter = authModule.default;
  
  // Add error handling to the router
  const routerWithErrorHandling = (req, res, next) => {
    try {
      return authRouter(req, res, next);
    } catch (error) {
      console.error('Error in auth route handler:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
  // Use the auth routes with error handling
  app.use('/api/auth', routerWithErrorHandling);
  console.log('✅ Auth routes loaded successfully');
  
  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });
  
} catch (error) {
  console.error('❌ Failed to load auth routes:');
  console.error('Name:', error.name);
  console.error('Message:', error.message);
  console.error('Code:', error.code);
  console.error('Stack:', error.stack);
  
  // Check for common issues
  if (error.code === 'ERR_MODULE_NOT_FOUND') {
    console.error('\n🔍 The module or one of its dependencies could not be found');
    const match = error.message.match(/Cannot find module '([^']+)'/);
    if (match) {
      console.error(`Missing module: ${match[1]}`);
    }
  }
  
  process.exit(1);
}

// Test route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Simple server is running',
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    
    // Dynamically import Knex and db to ensure fresh state
    const { db } = await import('./src/db.js');
    
    // Test the connection
    const result = await db.raw('SELECT 1+1 as result');
    console.log('Database connection test result:', result);
    
    res.json({ 
      status: 'success',
      message: 'Database connection successful',
      result: result[0]
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start the server with enhanced error handling
const startServer = async () => {
  try {
    console.log(`\n🔍 Starting server on port ${PORT}...`);
    
    // Test database connection before starting the server
    console.log('Testing database connection...');
    try {
      const { db } = await import('./src/db.js');
      await db.raw('SELECT 1+1 as result');
      console.log('✅ Database connection test passed');
    } catch (dbError) {
      console.error('❌ Database connection test failed:', dbError);
      throw new Error(`Database connection failed: ${dbError.message}`);
    }
    
    // Start the HTTP server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n✅ Server is running on http://localhost:${PORT}`);
      console.log('Environment:', process.env.NODE_ENV || 'development');
      console.log('Press Ctrl+C to stop the server\n');
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });
    
    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
const server = startServer();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server has been stopped');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider restarting the server or logging to an external service
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Consider restarting the server or logging to an external service
  process.exit(1);
});
