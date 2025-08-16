// Enhanced version with database connection
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import knex from 'knex';
import inMemoryPubSub from './test-in-memory-pubsub.js';

// Setup environment
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting enhanced app with database and Redis-optional config...');

// Redis configuration
const USE_REDIS = process.env.USE_REDIS === 'true';
console.log(`Redis is ${USE_REDIS ? 'enabled' : 'disabled'}`);

// Database configuration
const dbConfig = {
  client: 'sqlite3', // Force SQLite for testing
  connection: {
    filename: path.join(__dirname, 'dev.sqlite3')
  },
  useNullAsDefault: true,
  debug: true
};

// Create Knex instance
const db = knex(dbConfig);

// Test database connection
async function testDatabase() {
  try {
    console.log('Testing database connection...');
    const result = await db.raw('SELECT 1+1 as result');
    console.log('✅ Database connection successful');
    return result;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Create Express app
const app = express();
const server = createServer(app);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.send('Enhanced app with database is running');
});

// Database test route
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.raw('SELECT 1+1 as result');
    res.json({ success: true, result: result[0] });
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// WebSocket connection handler with pub/sub
io.on('connection', (socket) => {
  console.log('New WebSocket connection:', socket.id);
  
  // Subscribe to channels when client joins
  socket.on('subscribe', (channel) => {
    console.log(`Client ${socket.id} subscribed to ${channel}`);
    inMemoryPubSub.subscribe(channel, (message) => {
      socket.emit('message', { channel, message });
    });
  });
  
  // Publish messages from client
  socket.on('publish', async ({ channel, message }) => {
    console.log(`Publishing to ${channel}:`, message);
    await inMemoryPubSub.publish(channel, message);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('WebSocket disconnected:', socket.id);
  });
});

// Test pub/sub endpoint
app.get('/test-pubsub', async (req, res) => {
  const testChannel = 'test-channel';
  const testMessage = { text: 'Hello from server!', timestamp: new Date().toISOString() };
  
  try {
    await inMemoryPubSub.publish(testChannel, testMessage);
    const history = await inMemoryPubSub.getHistory(testChannel);
    
    res.json({
      success: true,
      message: 'Test message published',
      channel: testChannel,
      message: testMessage,
      history: history
    });
  } catch (error) {
    console.error('Pub/Sub test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Pub/Sub test failed',
      details: error.message
    });
  }
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

// Initialize database and start server
async function startApp() {
  try {
    await testDatabase();
    
    server.listen(PORT, '0.0.0.0', () => {
      const address = server.address();
      console.log(`✅ Enhanced app running on http://localhost:${PORT}`);
      console.log('Server details:', {
        address: address.address,
        port: address.port,
        family: address.family
      });
    });
  } catch (error) {
    console.error('❌ Failed to start app:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nShutting down enhanced app...');
  io.close(() => {
    console.log('WebSocket server closed');
    server.close(async () => {
      console.log('HTTP server closed');
      await db.destroy();
      console.log('Database connection closed');
      process.exit(0);
    });
  });
});

// Start the application
startApp();
