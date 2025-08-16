// Debug script to start the server with enhanced logging
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('=== DEBUG: Starting server with the following environment ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || 3001);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('===========================================================');

// Create Express app
const app = express();
const server = createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "https://aangan.vercel.app"
    ],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n=== SERVER STARTED ===`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS allowed origins: ${JSON.stringify(io.engine.crossOrigin)}`);
  console.log(`Process ID: ${process.pid}`);
  console.log(`Node version: ${process.version}`);
  console.log(`Platform: ${process.platform} ${process.arch}`);
  console.log(`Current directory: ${process.cwd()}`);
  console.log(`Memory usage: ${JSON.stringify(process.memoryUsage())}`);
  console.log(`===========================\n`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('\n=== SERVER ERROR ===');
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  console.error('=========================\n');
  
  if (error.code === 'EADDRINUSE') {
    console.log('Port is already in use. Trying to find the process...');
    // You can add code here to find the process using the port
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n=== UNCAUGHT EXCEPTION ===');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  console.error('==========================\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n=== UNHANDLED REJECTION ===');
  console.error('Reason:', reason);
  console.error('==========================\n');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n=== SHUTTING DOWN ===');
  console.log('Server is shutting down...');
  server.close(() => {
    console.log('Server has been stopped');
    process.exit(0);
  });
});

console.log('Starting server...');
