// Test Express + Socket.IO server
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

console.log('=== Starting Express + Socket.IO Test ===');

// Create Express app
const app = express();
const server = createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://aangan.vercel.app"],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('Express + Socket.IO server is running!');
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Test event
  socket.emit('welcome', { message: 'Connected to test server!' });
});

// Start the server
const PORT = 3003; // Different port to avoid conflicts
server.listen(PORT, () => {
  console.log(`\n=== SERVER RUNNING ===`);
  console.log(`Express: http://localhost:${PORT}`);
  console.log(`Socket.IO: ws://localhost:${PORT}`);
  console.log(`Process ID: ${process.pid}`);
  console.log(`Node version: ${process.version}`);
  console.log(`Platform: ${process.platform} ${process.arch}`);
  console.log(`Current directory: ${process.cwd()}`);
  console.log(`===========================\n`);
});

// Error handling
server.on('error', (error) => {
  console.error('\n=== SERVER ERROR ===');
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  console.error('=========================\n');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n=== SHUTTING DOWN ===');
  server.close(() => {
    console.log('Test server has been stopped');
    process.exit(0);
  });
});
