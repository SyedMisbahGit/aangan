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
const PORT = process.env.PORT || 3001;

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
  const authModule = await import('./src/routes/auth.js');
  if (!authModule || !authModule.default) {
    throw new Error('Auth routes module does not have a default export');
  }
  
  // Log the module structure for debugging
  console.log('Auth module structure:', Object.keys(authModule));
  
  // Use the auth routes
  app.use('/api/auth', authModule.default);
  console.log('✅ Auth routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load auth routes:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error code:', error.code);
  console.error('Error stack:', error.stack);
  
  // Try to log the directory contents for debugging
  try {
    const fs = await import('fs');
    const path = await import('path');
    const routesDir = path.join(__dirname, 'src', 'routes');
    console.log('\nRoutes directory contents:');
    const files = fs.readdirSync(routesDir);
    console.log(files.map(f => `- ${f}`).join('\n'));
  } catch (fsError) {
    console.error('Could not read routes directory:', fsError.message);
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

// Start the server
const server = app.listen(PORT, () => {
  console.log(`\n✅ Server is running on http://localhost:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Press Ctrl+C to stop the server\n');
});

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
