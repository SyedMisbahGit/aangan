# College Whisper Deployment Guide

This document provides comprehensive instructions for deploying the College Whisper platform across different environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Railway Deployment](#railway-deployment)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Monitoring and Maintenance](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security)

## Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (for containerized deployment)
- Git
- Railway CLI (for Railway deployment)

## Local Development

### Without Docker

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/college-whisper.git
   cd college-whisper
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install dependencies**

   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Start the development servers**

   ```bash
   # In one terminal (backend)
   cd backend
   npm run dev
   
   # In another terminal (frontend)
   cd frontend
   npm run dev
   ```

### With Docker Compose

1. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start the services**

   ```bash
   docker-compose up --build
   ```

## Docker Deployment

### Building the Image

```bash
docker build -t college-whisper .
```

### Running the Container

```bash
docker run -d \
  --name college-whisper \
  -p 3001:3001 \
  --env-file .env \
  college-whisper
```

### Using Docker Compose for Production

1. Create a `docker-compose.prod.yml` file:

   ```yaml
   version: '3.8'

   services:
     app:
       build: .
       ports:
         - "3001:3001"
       environment:
         - NODE_ENV=production
         - PORT=3001
         - DATABASE_URL=${DATABASE_URL}
         - JWT_SECRET=${JWT_SECRET}
       restart: unless-stopped
   ```

2. Start the services:

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Railway Deployment

### Railway Prerequisites

- Railway account
- GitHub repository with the project
- Railway CLI installed (`npm i -g @railway/cli`)

### Deployment Steps

1. **Link your repository**
   - Create a new project in Railway
   - Connect your GitHub repository
   - Railway will automatically detect the `railway.toml` file

2. **Set environment variables**
   - Go to your Railway project settings
   - Add all required environment variables from `.env.example`
   - Set `NODE_ENV=production`

3. **Deploy**
   - Push your code to the connected repository
   - Railway will automatically build and deploy your application

### Using Railway CLI

```bash
# Login
railway login

# Link to project
railway link

# Set environment variables
railway env set NODE_ENV production
railway env set PORT 3001
# ... set other variables

# Deploy
railway up
```

## Environment Variables

### Backend Variables

Create a `.env` file in the `backend` directory with these required variables:

```env
# Application
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/college_whisper

# Authentication
JWT_SECRET=your-secure-jwt-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Redis (for rate limiting and caching)
REDIS_URL=redis://localhost:6379

# Sentry (error tracking)
SENTRY_DSN=your-sentry-dsn

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Variables

Create a `.env` file in the `frontend` directory with these variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3001

# Authentication
VITE_JWT_SECRET=your-frontend-jwt-secret

# Environment
NODE_ENV=production

# Sentry (error tracking)
VITE_SENTRY_DSN=your-sentry-dsn
VITE_SENTRY_ENVIRONMENT=production

# Feature Flags
VITE_ENABLE_ANALYTICS=true
```

### Production Overrides

For production, consider these additional settings:

- Set `NODE_ENV=production`
- Use HTTPS for all URLs
- Set appropriate CORS origins
- Enable production-grade logging and monitoring
- Use environment-specific database credentials

## Database Migrations

Migrations are automatically run on application startup in production. To manually run migrations:

```bash
# Using Docker
npm run migrate

# Or directly with Knex
npx knex migrate:latest --knexfile backend/knexfile.js
```

## Troubleshooting

### Health Check Failing

- Verify the server is running and accessible
- Check application logs for errors
- Ensure all required environment variables are set
- Verify database connectivity

### Database Connection Issues

- Check if the database is running
- Verify connection string in `DATABASE_URL`
- Check if the database user has correct permissions

### Common Errors

- **Port already in use**: Stop other services using the same port or change the port in `.env`
- **Missing environment variables**: Ensure all required variables are set
- **Migration errors**: Check if the database exists and the user has permissions

## Frontend Deployment

### Building for Production

1. **Build the application**

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Serve the built files**
   - The build output will be in the `dist` directory
   - You can serve it using any static file server:

     ```bash
     # Using serve
     npx serve -s dist -l 3000
     
     # Or with nginx
     # See nginx configuration below
     ```

### Nginx Configuration

Create an Nginx configuration file at `/etc/nginx/sites-available/college-whisper`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'" always;
    
    # Root directory
    root /path/to/college-whisper/frontend/dist;
    index index.html;
    
    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API Proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}

## Monitoring

### Application Logs

```bash
# Docker logs
docker logs college-whisper

# Follow logs
docker logs -f college-whisper

# View logs with timestamps
docker logs --timestamps college-whisper

# View logs for a specific time period
docker logs --since 1h college-whisper

# Railway logs
railway logs
```

### Performance Monitoring

1. **Node.js Process**

   ```bash
   # Check memory usage
   docker stats college-whisper
   
   # Get process metrics
   docker exec -it college-whisper top
   ```

2. **Database Monitoring**

   ```sql
   -- Active queries
   SELECT * FROM pg_stat_activity;
   
   -- Query performance
   SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;
   ```

3. **Redis Monitoring**

   ```bash
   # Connect to Redis CLI
   redis-cli
   
   # Get Redis info
   INFO
   
   # Monitor Redis commands in real-time
   MONITOR
   ```

### Health Checks

1. **API Health Endpoint**

   ```bash
   curl -X GET http://localhost:3001/api/health
   ```

2. **Database Connection Check**

   ```bash
   docker exec college-whisper node -e "
     const { Pool } = require('pg');
     const pool = new Pool({ connectionString: process.env.DATABASE_URL });
     pool.query('SELECT NOW()', (err) => {
       if (err) {
         console.error('Database connection failed', err);
         process.exit(1);
       }
       console.log('Database connection successful');
       process.exit(0);
     });
   "
   ```

### Backup and Recovery

1. **Database Backup**

   ```bash
   # Create backup
   docker exec -t your_postgres_container pg_dumpall -c -U postgres > dump_$(date +%Y-%m-%d_%H_%M_%S).sql
   
   # Restore from backup
   cat your_dump.sql | docker exec -i your_postgres_container psql -U postgres
   ```

2. **File Backups**

   ```bash
   # Backup uploads directory
   tar -czvf uploads_backup_$(date +%Y-%m-%d).tar.gz /path/to/uploads
   
   # Sync to remote storage (e.g., S3)
   aws s3 cp uploads_backup_$(date +%Y-%m-%d).tar.gz s3://your-bucket/backups/
   ```

## Scaling

For production deployments, consider the following:

- Using a process manager like PM2 for Node.js
- Setting up a reverse proxy (Nginx, Caddy)
- Configuring load balancing for high traffic
- Enabling database connection pooling

## Backup and Recovery

Regularly backup your database:

```bash
# PostgreSQL backup
pg_dump -U username -d dbname > backup.sql

# Restore from backup
psql -U username -d dbname < backup.sql
```

## Security Considerations

- Always use HTTPS in production
- Keep dependencies updated
- Use strong secrets for JWT and database credentials
- Implement rate limiting
- Set appropriate CORS policies
- Regularly backup your database
