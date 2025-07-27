# Deployment Guide

This document provides detailed instructions for deploying the College Whisper platform to various environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Railway Deployment](#railway-deployment)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Troubleshooting](#troubleshooting)

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

### Prerequisites
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

See `.env.example` for all available variables. Required variables include:

- `NODE_ENV`: Application environment (development/production)
- `PORT`: Port to run the server on
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing
- `CORS_ORIGIN`: Allowed CORS origins

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

## Monitoring

- Check application logs:
  ```bash
  # Docker logs
  docker logs college-whisper
  
  # Railway logs
  railway logs
  ```

- Monitor application health:
  ```
  GET /api/health
  ```

## Scaling

For production deployments, consider:
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
