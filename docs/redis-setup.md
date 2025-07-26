# Redis Setup Guide for College Whisper

This guide will help you set up Redis for rate limiting and caching in the College Whisper application.

## Prerequisites

- Node.js 16+
- npm or yarn
- Redis server (local or remote)

## Installation

### 1. Install Redis Server

#### Windows
1. Download and install Redis for Windows from: https://github.com/microsoftarchive/redis/releases
2. Add Redis to your system PATH
3. Start the Redis server by running `redis-server` in a new terminal

#### macOS (using Homebrew)
```bash
brew install redis
brew services start redis
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 2. Install Dependencies

```bash
# Navigate to the backend directory
cd backend

# Install required npm packages
npm install redis@4.6.0 rate-limit-redis@4.0.1
```

## Configuration

1. Add Redis connection URL to your `.env` file:

```env
# For local Redis
REDIS_URL=redis://localhost:6379

# For production Redis with password
# REDIS_URL=redis://:password@hostname:port
```

2. (Optional) Configure rate limiting in `.env`:

```env
# Rate limiting configuration
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100            # Max requests per window
RATE_LIMIT_AUTH_MAX=20        # Max auth requests per window
RATE_LIMIT_API_MAX=1000       # Max API key requests per hour

# Whitelist IPs (comma-separated)
RATE_LIMIT_WHITELIST=127.0.0.1,::1
```

## Verifying the Setup

1. Start your application:
   ```bash
   npm run dev
   ```

2. Test the Redis connection by making a request to the health check endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

   You should see a response like:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-07-25T05:20:00.000Z",
     "uptime": 123.45,
     "redis": "connected"
   }
   ```

## Monitoring Redis

You can monitor Redis using the Redis CLI:

```bash
# Connect to Redis CLI
redis-cli

# Monitor Redis in real-time
MONITOR

# Get Redis info
INFO

# Check connected clients
CLIENT LIST
```

## Production Considerations

1. **Security**:
   - Always use a strong password for Redis in production
   - Enable SSL/TLS for encrypted connections
   - Use a firewall to restrict access to the Redis port (default: 6379)

2. **Persistence**:
   - Configure Redis persistence (RDB or AOF) to prevent data loss
   - Set up regular backups

3. **High Availability**:
   - Consider using Redis Sentinel for high availability
   - Or use a managed Redis service (AWS ElastiCache, Redis Labs, etc.)

4. **Monitoring**:
   - Set up monitoring for Redis metrics
   - Configure alerts for memory usage and connection issues

## Troubleshooting

### Connection Issues
- Verify Redis server is running: `redis-cli ping` (should return "PONG")
- Check if the port is accessible: `telnet localhost 6379`
- Verify the Redis URL in your `.env` file

### Performance Issues
- Check Redis memory usage: `redis-cli info memory`
- Monitor slow queries: `redis-cli SLOWLOG GET 10`
- Consider increasing maxmemory if needed

### Rate Limiting Not Working
- Check application logs for Redis connection errors
- Verify the rate limit configuration
- Test with different IP addresses to confirm rate limiting is working
