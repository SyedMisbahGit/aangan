# Development Guide

This document provides comprehensive guidance for developers working on the Aangan platform.

## Table of Contents
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Debugging](#debugging)
- [API Documentation](#api-documentation)
- [Frontend Development](#frontend-development)
- [Backend Development](#backend-development)
- [Database Management](#database-management)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- Git
- Docker and Docker Compose (optional but recommended)
- PostgreSQL (or use Docker)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SyedMisbahGit/aangan.git
   cd aangan
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
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

## Project Structure

```
aangan/
├── backend/             # Express.js API server
│   ├── src/
│   │   ├── config/     # Configuration files
│   │   ├── controllers/# Request handlers
│   │   ├── middleware/ # Express middleware
│   │   ├── models/     # Database models
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   ├── utils/      # Utility functions
│   │   ├── app.js      # Express application
│   │   └── server.js   # Server entry point
│   ├── migrations/     # Database migrations
│   ├── seeds/          # Database seed files
│   ├── tests/          # Backend tests
│   └── start.sh        # Production start script
│
├── frontend/           # React + Vite application
│   ├── public/         # Static files
│   ├── src/
│   │   ├── assets/     # Static assets
│   │   ├── components/ # Reusable components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   ├── store/      # State management
│   │   ├── styles/     # Global styles
│   │   ├── types/      # TypeScript type definitions
│   │   ├── utils/      # Utility functions
│   │   ├── App.tsx     # Root component
│   │   └── main.tsx    # Application entry point
│   ├── tests/          # Frontend tests
│   └── vite.config.ts  # Vite configuration
│
├── docker/             # Docker configuration files
├── docs/               # Documentation
├── .env.example        # Environment variables template
├── docker-compose.yml  # Development environment
└── railway.toml        # Railway deployment config
```

## Development Workflow

### Branching Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes

### Git Workflow
1. Create a new branch from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit with a descriptive message
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Push your branch and create a pull request
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. After code review, merge into `develop`

## Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow the [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- Use `camelCase` for variables and functions
- Use `PascalCase` for types and interfaces
- Use `UPPER_CASE` for constants
- Use `kebab-case` for file names

### React Components
- Use functional components with hooks
- Use TypeScript interfaces for props and state
- Keep components small and focused
- Use meaningful component and prop names
- Follow the [React Style Guide](https://reactjs.org/docs/faq-structure.html)

### Backend
- Follow RESTful API design principles
- Use async/await for asynchronous operations
- Handle errors appropriately
- Validate all input data
- Write clean, self-documenting code

## Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run all tests
npm run test:all
```

### Writing Tests
- Write unit tests for utility functions
- Write integration tests for API endpoints
- Write component tests for React components
- Aim for good test coverage (80%+)
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

## Debugging

### Frontend Debugging
- Use React DevTools
- Use the browser's developer tools
- Add `debugger` statements
- Use `console.log` strategically

### Backend Debugging
- Use `console.log` or a proper logger
- Use Node.js debugger
- Check server logs
- Use Postman or curl to test API endpoints

## API Documentation

API documentation is available at `/api-docs` when running the development server.

### Generating Documentation

1. Install the API documentation generator:
   ```bash
   cd backend
   npm install -g apidoc
   ```

2. Generate documentation:
   ```bash
   npm run docs
   ```

3. View documentation at `http://localhost:3001/api-docs`

## Frontend Development

### Styling
- Use CSS Modules for component-specific styles
- Follow the [BEM](http://getbem.com/) methodology
- Use CSS variables for theming
- Keep styles maintainable and reusable

### State Management
- Use React Context for global state
- Use custom hooks for reusable state logic
- Keep state as local as possible
- Use the [React Query](https://react-query.tanstack.com/) for server state

## Backend Development

### API Development
- Follow RESTful principles
- Use proper HTTP methods and status codes
- Version your API
- Document your endpoints
- Handle errors gracefully

### Database
- Use migrations for schema changes
- Write seed files for test data
- Use transactions for multiple related operations
- Optimize queries for performance

## Database Management

### Migrations

Create a new migration:
```bash
cd backend
npx knex migrate:make migration_name
```

Run migrations:
```bash
npx knex migrate:latest
```

Rollback the latest migration:
```bash
npx knex migrate:rollback
```

### Seeding

Create a new seed file:
```bash
npx knex seed:make 01_seed_name
```

Run seeds:
```bash
npx knex seed:run
```

## Common Tasks

### Adding a New API Endpoint
1. Create a new route file in `backend/src/routes/`
2. Create a controller in `backend/src/controllers/`
3. Add the route to `backend/src/app.js`
4. Write tests for the new endpoint
5. Update API documentation

### Adding a New Page
1. Create a new component in `frontend/src/pages/`
2. Add a route in `frontend/src/App.tsx`
3. Create any necessary components in `frontend/src/components/`
4. Add styles in `frontend/src/styles/`
5. Write tests for the new components

## Troubleshooting

### Common Issues

**Frontend not connecting to backend**
- Check CORS settings
- Verify the API base URL in the frontend config
- Check if the backend server is running

**Database connection issues**
- Check database credentials
- Verify the database server is running
- Check if the database exists and the user has permissions

**Docker issues**
- Check if all services are running: `docker ps`
- View logs: `docker-compose logs`
- Rebuild containers: `docker-compose up --build`

### Getting Help
- Check the project's issue tracker
- Ask for help in the project's chat or forum
- Create a new issue if you've found a bug

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
