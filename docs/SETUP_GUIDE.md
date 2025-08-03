# Setup Guide for Aangan

This guide will help you set up the Aangan platform for local development.

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Git
- Docker and Docker Compose (optional but recommended)

## Quick Start with Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/SyedMisbahGit/aangan.git
   cd aangan
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the development environment**

   ```bash
   docker-compose up
   ```

4. **Access the application**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3001](http://localhost:3001)
   - pgAdmin: [http://localhost:5050](http://localhost:5050) (if using Docker Compose)

## Manual Setup

### Backend Setup

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Set up the database**
   - Create a new PostgreSQL database
   - Update the database connection in `.env`
   - Run migrations:

     ```bash
     npx knex migrate:latest
     npx knex seed:run
     ```

3. **Start the backend server**

   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

3. **Access the frontend**
   - Open [http://localhost:5173](http://localhost:5173) in your browser

## Environment Variables

### Backend (`.env`)

```env
# Database
DATABASE_URL=postgres://user:password@localhost:5432/aangan

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173

# AI Services (optional)
OPENAI_API_KEY=your_openai_api_key
```

### Frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## Development Workflow

1. **Code Style**
   - Use Prettier for code formatting
   - Follow the project's ESLint rules
   - Write meaningful commit messages

2. **Testing**
   - Run tests: `npm test`
   - Check test coverage: `npm run test:coverage`

3. **Git Workflow**
   - Create a new branch for your feature: `git checkout -b feature/your-feature`
   - Make your changes and commit them
   - Push your branch and create a pull request

## Common Tasks

### Running Migrations

```bash
cd backend
npx knex migrate:make migration_name
npx knex migrate:latest
```

### Seeding the Database

```bash
cd backend
npx knex seed:run
```

### Generating API Documentation

```bash
# Install required tools
npm install -g @redocly/cli

# Generate OpenAPI spec (if available)
# redocly build-docs openapi.yaml --output docs/api.html
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify the database credentials in `.env`
- Check if the database exists and is accessible

### Port Conflicts

If you encounter port conflicts, update the following in `.env`:

- `PORT` (backend)
- `FRONTEND_PORT` (frontend)
- `PGADMIN_PORT` (pgAdmin)

### Missing Dependencies

If you see module not found errors:

```bash
# In both backend/ and frontend/ directories
rm -rf node_modules package-lock.json
npm install
```

## Getting Help

- Check the [FAQ](./FAQ.md)

- Search the [GitHub issues](https://github.com/SyedMisbahGit/aangan/issues)

- Create a new issue if you can't find a solution

## Next Steps

- [Architecture Overview](./ARCHITECTURE.md)

- [API Reference](./API_REFERENCE.md)

- [Database Schema](./DATABASE_SCHEMA.md)
