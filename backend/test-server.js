// Test server to diagnose port binding issues
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

express.json();

// Create Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple test route
app.get('/', (req, res) => {
  res.send('Test server is running');
});

// WebSocket connection handler
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
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log('Server details:', {
    address: address.address,
    port: address.port,
    family: address.family
  });
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down test server...');
  io.close(() => {
    console.log('WebSocket server closed');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});

console.log('Test server starting...');
