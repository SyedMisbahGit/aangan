# Backend Setup Guide

This guide provides detailed instructions for setting up and configuring the Aangan backend service.

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 13+
- Redis 6+ (optional, but recommended for production)
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/college-whisper.git
   cd college-whisper/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/aangan_db

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info
```

### Database Setup

1. **Using Docker (recommended for development)**
   ```bash
   docker-compose up -d postgres redis
   ```

2. **Manual Setup**
   - Install PostgreSQL and create a new database
   - Run database migrations:
     ```bash
     npx knex migrate:latest
     ```
   - Seed initial data (if needed):
     ```bash
     npx knex seed:run
     ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Service Dependencies

### Redis (Optional but Recommended)
Redis is used for caching and real-time features. The application will run without Redis, but with reduced functionality.

To install Redis:
- **Windows**: Use WSL or download from [Redis for Windows](https://github.com/tporadowski/redis/releases)
- **macOS**: `brew install redis`
- **Linux**: `sudo apt-get install redis-server`

### PostgreSQL
Required for data persistence. The application uses Knex.js as the query builder.

## Troubleshooting

### Common Issues

1. **Module Not Found Errors**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install`

2. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check `.env` file for correct database credentials

3. **Redis Connection Issues**
   - Ensure Redis server is running
   - Check if the port in `REDIS_URL` matches your Redis configuration
   - Set `REDIS_URL` to an empty string to disable Redis in development

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── dal/           # Data Access Layer
│   ├── middleware/    # Express middleware
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── utils/         # Utility functions
│   ├── app.js         # Express application
│   └── server.js      # Server entry point
├── migrations/        # Database migrations
├── seeds/             # Database seeds
├── tests/             # Test files
└── .env.example       # Example environment variables
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

See the main [DEPLOYMENT.md](../docs/DEPLOYMENT.md) for deployment instructions.
