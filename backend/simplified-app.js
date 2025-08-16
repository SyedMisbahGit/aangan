// Simplified version of app.js for debugging startup issues
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Setup environment
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting simplified app...');

// Create Express app
const app = express();
const server = createServer(app);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.send('Simplified app is running');
});

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Basic WebSocket connection handler
io.on('connection', (socket) => {
  console.log('New WebSocket connection:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('WebSocket disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3001;

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Unexpected error:', error);
  }
  process.exit(1);
});

// Start listening
server.listen(PORT, '0.0.0.0', () => {
  const address = server.address();
  console.log(`✅ Simplified app running on http://localhost:${PORT}`);
  console.log('Server details:', {
    address: address.address,
    port: address.port,
    family: address.family
  });
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down simplified app...');
  io.close(() => {
    console.log('WebSocket server closed');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});
