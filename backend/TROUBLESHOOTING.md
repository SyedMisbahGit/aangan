# Troubleshooting Guide

This document provides solutions to common issues encountered during development and deployment of the Aangan backend.

## Table of Contents
- [Module Import/Export Issues](#module-importexport-issues)
- [Database Connection Problems](#database-connection-problems)
- [Redis Connection Issues](#redis-connection-issues)
- [Service Initialization Errors](#service-initialization-errors)
- [WebSocket Connection Problems](#websocket-connection-problems)

## Module Import/Export Issues

### Problem: "The requested module does not provide an export named 'X'"
**Symptoms**:
- Server fails to start with module import errors
- Errors about missing exports in the console

**Solution**:
1. Check the export style in the source file (default vs named exports)
2. Update the import statement to match:
   ```javascript
   // For default exports
   import db from './db.js';
   
   // For named exports
   import { someFunction } from './module.js';
   ```
3. If using CommonJS modules, ensure `"type": "module"` is set in package.json

### Problem: "Cannot use import statement outside a module"
**Solution**:
1. Ensure `"type": "module"` is set in package.json
2. Or use `.mjs` extension for ES modules
3. Or configure Babel/TypeScript for module transpilation

## Database Connection Problems

### Problem: Database connection fails
**Symptoms**:
- "Connection refused" or "ECONNREFUSED" errors
- Server fails to start

**Solution**:
1. Verify PostgreSQL is running:
   ```bash
   psql -U postgres -c "SELECT 1"
   ```
2. Check connection string in `.env`:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/dbname
   ```
3. Ensure the database exists and user has permissions
4. Check PostgreSQL logs for errors

## Redis Connection Issues

### Problem: Redis reconnection attempts in logs
**Symptoms**:
- Logs show "Redis reconnecting (attempt X)..."
- Real-time features may not work

**Solution**:
1. Install and start Redis server:
   - **Windows**: Download from [Redis for Windows](https://github.com/tporadowski/redis/releases)
   - **macOS**: `brew install redis && brew services start redis`
   - **Linux**: `sudo apt install redis-server && sudo systemctl start redis`

2. Or disable Redis in development by setting:
   ```env
   REDIS_URL=
   ```

3. Or update Redis connection URL in `.env`:
   ```env
   REDIS_URL=redis://localhost:6379
   ```

## Service Initialization Errors

### Problem: Services fail to initialize
**Symptoms**:
- Server starts but certain features don't work
- Errors in logs about service initialization

**Solution**:
1. Check logs for specific error messages
2. Verify all required environment variables are set
3. Check database and Redis connections
4. Look for circular dependencies in service initialization

## WebSocket Connection Problems

### Problem: WebSocket connection fails
**Symptoms**:
- Browser console shows WebSocket connection errors
- Real-time features don't work

**Solution**:
1. Ensure the backend server is running and accessible
2. Check CORS and proxy settings
3. Verify WebSocket URL in frontend code:
   ```javascript
   const socket = io('http://localhost:3001');
   ```
4. Check for network/firewall issues

## Common Error Messages

### "Port X is already in use"
```bash
# Find and kill the process
lsof -i :3001
kill -9 <PID>

# Or on Windows
taskkill /F /PID <PID>
```

### "Cannot find module 'X'"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Getting Help

If you encounter an issue not covered here:
1. Check the logs for detailed error messages
2. Search the project's issue tracker
3. If the problem persists, open a new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages and logs
   - Environment details

## Debugging Tips

1. **Enable Debug Logging**
   ```bash
   DEBUG=* npm run dev
   ```

2. **Check Service Status**
   ```bash
   # Check if services are running
   ps aux | grep -E 'node|postgres|redis'
   
   # Check service logs
   journalctl -u postgresql
   journalctl -u redis
   ```

3. **Test Database Connection**
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

4. **Test Redis Connection**
   ```bash
   redis-cli ping
   ```
