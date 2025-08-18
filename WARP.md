# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Aangan** (आंगन) is a full-stack, real-time, AI-powered campus platform built for Central University of Jammu (CUJ). It's an emotionally intelligent anonymous social platform that serves as a "dreamy courtyard" where students can share whispers, connect through emotion, and express themselves safely.

**Tech Stack:** React 18 + TypeScript (frontend), Node.js + Express (backend), Socket.IO (real-time), PostgreSQL (production), SQLite (development), Vite (build tool), Tailwind CSS (styling).

## Common Development Commands

### Full-Stack Development

```bash
# Start both frontend and backend in development
npm run start-all

# Install dependencies for both projects
npm install && cd backend && npm install && cd ../frontend && npm install
```

### Frontend Commands (Run from project root)

```bash
# Development server (localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

### Backend Commands (Run from backend/ directory)

```bash
# Development server with hot reload
cd backend && npm run dev

# Production server
cd backend && npm start

# Database migrations
cd backend && npx knex migrate:latest

# Database seeding
cd backend && npx knex seed:run
```

### Testing Commands (Run from project root)

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:endpoints
npm run test:realtime

# Run single test file
npx vitest run backend/__tests__/specific-test.test.js
```

### Docker Development

```bash
# Start full environment with PostgreSQL
docker-compose up

# Development with hot-reloading
docker-compose -f docker-compose.dev.yml up --build

# Production build
docker build -t aangan .
docker run -p 3001:3001 --env-file .env aangan
```

### Maintenance & Utility Scripts

```bash
# Run maintenance tasks
npm run maintenance
npm run maintenance:security
npm run maintenance:cleanup

# Database backup
npm run backup:db

# Analyze bundle size
npm run analyze

# Clean build artifacts
npm run clean
```

## High-Level Architecture

### Project Structure

```
aangan/
├── backend/           # Node.js/Express API server
│   ├── src/
│   │   ├── routes/    # API route handlers
│   │   ├── controllers/ # Business logic controllers
│   │   ├── middleware/  # Express middleware (auth, rate limiting)
│   │   ├── services/    # Core business services
│   │   ├── dal/         # Data Access Layer
│   │   ├── utils/       # Utility functions
│   │   └── app.js       # Express app entry point
│   ├── migrations/      # Database schema migrations
│   └── seeds/           # Database seed data
├── frontend/          # React + TypeScript SPA
│   ├── src/
│   │   ├── components/  # UI components (organized by feature)
│   │   ├── pages/       # Route-level components
│   │   ├── contexts/    # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API and external service logic
│   │   └── utils/       # Frontend utilities
│   ├── lib/             # Shared utility functions
│   └── theme/           # Tailwind configuration and themes
├── scripts/           # Development and maintenance scripts
└── docs/              # Project documentation
```

### Key Architectural Patterns

**Backend Architecture:**

- **Express.js** with modular route organization
- **Socket.IO** for real-time communication with memory-based pub/sub
- **Knex.js** ORM with PostgreSQL (prod) / SQLite (dev) database switching
- **JWT-based authentication** with role-based access control
- **Rate limiting** and security middleware (Helmet, CORS)
- **Graceful error handling** with centralized error middleware
- **Health checks** and connection monitoring for production deployment

**Frontend Architecture:**

- **React 18** with TypeScript and strict type checking
- **Context-based state management** (Auth, Realtime, Theme, Whispers)
- **React Query** for server state management and caching
- **React Router** for client-side routing with lazy-loaded pages
- **Framer Motion** for animations and page transitions
- **Tailwind CSS** with custom theme system and glassmorphism design
- **PWA support** with service worker and offline capabilities
- **Error boundaries** with graceful fallbacks and user feedback

**Real-Time System:**

- **Socket.IO** with authentication via shared keys
- **Memory-based pub/sub** (no Redis dependency for development)
- **Connection management** with cleanup and rate limiting
- **Graceful reconnection** and connection state recovery

### Database Schema Concepts

- **Whispers**: Anonymous posts with emotion metadata and moderation
- **Users**: Guest-based system with JWT tokens (no permanent accounts)
- **Real-time events**: Socket message persistence and presence tracking
- **Zones/Channels**: Location or topic-based whisper categorization

### Key Integration Points

- **Firebase**: Push notifications and messaging (optional)
- **AI Services**: Emotional intelligence and content moderation
- **Deployment**: Railway (backend), Vercel (frontend)
- **Monitoring**: Custom logging with Winston, health checks

## Development Environment Setup

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL (production) or SQLite (development)
- Docker (optional, for full environment)

### Environment Configuration

```bash
# Root .env (for frontend)
VITE_API_URL=http://localhost:3001/api
VITE_REALTIME_URL=http://localhost:3001

# Backend .env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/aangan
JWT_SECRET=your-secret-key
SOCKET_SHARED_KEY=your-socket-key
CORS_ORIGIN=http://localhost:5173
```

### Path Aliases & Imports

- `@` → `frontend/src` (Vite alias for frontend imports)
- `@lib` → `frontend/lib`
- `@theme` → `frontend/theme/theme.ts`

### Important Development Notes

- **Monorepo Structure**: Frontend and backend are in separate directories but share root package.json for unified scripts
- **Database Switching**: Automatically uses PostgreSQL in production, SQLite in development
- **Real-time Development**: Socket.IO works without Redis in development (uses memory adapter)
- **Type Safety**: Strict TypeScript enabled across both frontend and backend
- **Hot Reloading**: Both frontend (Vite) and backend (nodemon) support hot reload
- **Testing**: Vitest for unit/integration tests, includes coverage reporting
- **PWA**: Full Progressive Web App support with offline capabilities

### Debugging Tips

- **Backend logs**: Check Winston logs in development console
- **Socket connections**: Monitor connection stats in backend logs
- **Database queries**: Enable knex debug mode for SQL query logging
- **Frontend errors**: Use React Error Boundaries with detailed error context
- **Network issues**: Proxy configuration in Vite handles API routing during development

### Production Considerations

- **Database**: Requires PostgreSQL with proper connection pooling
- **Socket.IO**: Uses memory adapter (suitable for single-instance deployment)
- **Build optimization**: Code splitting, image optimization, and bundle analysis available
- **Health checks**: `/api/health` endpoint for monitoring
- **Rate limiting**: IP-based rate limiting for both HTTP and WebSocket connections
