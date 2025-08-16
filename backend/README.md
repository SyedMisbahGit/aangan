# Aangan Backend

This is the backend service for Aangan, a real-time, AI-powered campus platform built with Node.js, Express, and Socket.IO.

## ✨ Features

- **Redis-Optional Architecture**: Run with or without Redis in development
- **Real-time Communication**: WebSocket support with Socket.IO
- **In-Memory Pub/Sub**: Fallback system when Redis is not available
- **Scalable**: Designed to scale from development to production

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Complete setup and configuration instructions
- [Troubleshooting](./TROUBLESHOOTING.md) - Solutions to common issues
- [API Documentation](../docs/API.md) - API endpoints and usage
- [WebSocket Guide](./WEBSOCKET.md) - Real-time communication documentation
- [Deployment Guide](../docs/DEPLOYMENT.md) - Production deployment instructions

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/college-whisper.git
   cd college-whisper/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   # For development without Redis, ensure USE_REDIS=false
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🛠 Development

### Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── dal/           # Data Access Layer
│   ├── middleware/    # Express middleware
│   ├── models/        # Database models
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── utils/        # Utility functions
│   ├── app.js        # Express application
│   └── server.js     # Server entry point
├── migrations/       # Database migrations
├── seeds/            # Database seeds
└── tests/            # Test files
```

## 🌐 WebSocket API

The backend provides real-time capabilities through Socket.IO. Key features include:

- **Channels**: Subscribe to specific channels for targeted messaging
- **Pub/Sub**: Publish and subscribe to messages with optional persistence
- **Redis Integration**: Optional Redis backend for distributed pub/sub

### Basic Usage

1. **Connect** to the WebSocket server:
   ```javascript
   import { io } from 'socket.io-client';
   const socket = io('http://your-backend-url');
   ```

2. **Subscribe** to a channel:
   ```javascript
   socket.emit('subscribe', 'channel-name');
   ```

3. **Publish** a message:
   ```javascript
   socket.emit('publish', {
     channel: 'channel-name',
     message: { text: 'Hello, world!' }
   });
   ```

4. **Listen** for messages:
   ```javascript
   socket.on('message', (data) => {
     console.log(`[${data.channel}]`, data.message);
   });
   ```

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot-reload
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run linter
- `npm run lint:fix` - Fix linting issues
- `npx knex migrate:latest` - Run database migrations
- `npx knex seed:run` - Seed the database

## 📦 Dependencies

- **Runtime**: Node.js 18+, npm 9+
- **Database**: PostgreSQL 13+
- **Cache**: Redis 6+ (optional, uses in-memory fallback)
- **Package Manager**: npm

### Development Dependencies

- **nodemon**: For development server reloading
- **eslint**: Code linting
- **jest**: Testing framework
- **supertest**: HTTP assertions

## 🔧 Development without Redis

For local development, you can run the application without Redis:

1. Set `USE_REDIS=false` in your `.env` file
2. The application will use an in-memory pub/sub system
3. All WebSocket functionality remains available

```bash
# Example .env configuration for development without Redis
NODE_ENV=development
PORT=3001
USE_REDIS=false
DATABASE_URL=postgres://user:password@localhost:5432/your_database
```

## 🧪 Testing WebSocket Functionality

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the test client in your browser:
   ```
   http://localhost:3001/socketio-test.html
   ```

3. Use the test interface to verify WebSocket connectivity and pub/sub functionality.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
