# 🏫 Aangan

A full-stack, real-time, AI-powered campus platform built with Node.js/Express (backend), React + Vite (frontend), PostgreSQL, and Socket.IO. The platform enables anonymous, emotional expression and connection through whispers, with features like real-time interactions, emotional mapping, and AI-powered responses.

> **Note**: We recently completed a major codebase cleanup (v2.0-beta-cleanup) to improve maintainability and performance. See [CHANGELOG.md](CHANGELOG.md) for details.

## 📚 Documentation

- [Code Organization & Linting Guidelines](./docs/CODE_ORGANIZATION.md) - Guidelines for maintaining code quality and consistency
- [API Documentation](./docs/API.md) - API endpoints and usage
- [Deployment Guide](./docs/DEPLOYMENT.md) - Instructions for deploying the application
- [Dependencies](./docs/DEPENDENCIES.md) - Documentation about project dependencies and cleanup status
- [Contributing](./CONTRIBUTING.md) - Guidelines for contributing to the project

## 🛠 Code Quality

We maintain high code quality through:

- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** for code formatting
- **Husky** for git hooks
- **Depcheck** for identifying unused dependencies
- **Automated CI/CD** with dependency and security checks

To run the linter:
```bash
# Check for issues
npm run lint

# Auto-fix fixable issues
npm run lint:fix

# Check for unused dependencies
npx depcheck

# Run tests with coverage
npm run test:coverage
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Docker and Docker Compose (for containerized development)
- PostgreSQL (or use the included Docker configuration)

### Local Development

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
   # Using Docker Compose (recommended)
   docker-compose up
   
   # Or manually:
   cd backend && npm install && npm run dev
   cd ../frontend && npm install && npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- pgAdmin: http://localhost:5050 (if using Docker Compose)

## 🐳 Docker Deployment

### Production Build
```bash
docker build -t aangan .
docker run -p 3001:3001 --env-file .env aangan
```

### Development with Hot-Reloading
```bash
docker-compose -f docker-compose.dev.yml up --build
```

## ☁️ Railway Deployment

1. Push your code to a GitHub repository
2. Create a new Railway project and connect your repository
3. Add required environment variables (see `.env.example`)
4. Railway will automatically deploy using the `railway.toml` configuration

## 📦 Project Structure

```
aangan/
├── backend/             # Express.js API server
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── middleware/ # Express middleware
│   │   └── app.js      # Express application
│   └── start.sh        # Production start script
│
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   └── App.tsx     # Root component
│   └── vite.config.ts  # Vite configuration
│
├── docker/             # Docker-related files
├── .env.example        # Environment variables template
├── docker-compose.yml  # Development environment
└── railway.toml        # Railway deployment config
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options. Key variables:

```env
# Application
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aangan
DB_PATH=./whispers.db  # For SQLite in development

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 🛠 Development

### Backend Commands
```bash
# Install dependencies
cd backend && npm install

# Run development server
npm run dev

# Run tests
npm test

# Run migrations
npx knex migrate:latest
```

### Frontend Commands
```bash
# Install dependencies
cd frontend && npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✨ Recent Updates (v1.9.3)

### Type Safety & Error Handling
- Added centralized error handling with `errorUtils.ts`
- Implemented robust error boundaries with proper typing
- Fixed all remaining TypeScript errors across the codebase
- Standardized error messages and logging patterns

### v1.9.2 - Codebase Audit & Polish

### Code Quality & Type Safety
- Replaced all console statements with a centralized logger utility
- Fixed TypeScript errors across frontend and backend
- Implemented proper error handling with type checking
- Standardized error handling patterns

### Security Enhancements
- Added comprehensive JWT verification middleware
- Improved authentication flow with role-based access control
- Enhanced service worker registration and security

### Developer Experience
- Added comprehensive test suite for vector database operations
- Improved API documentation and type definitions
- Standardized code style and naming conventions

### Performance
- Optimized real-time event handling
- Improved error boundaries and fallback UIs
- Enhanced logging for better debugging

---

## 🛡️ Security Features

- **Rate Limiting**: Protect against brute force and DDoS attacks
- **Input Validation**: Secure data handling and sanitization
- **Authentication**: JWT-based with secure token handling
- **Request Validation**: All API endpoints validate input data
- **Security Headers**: CSP, HSTS, and other security headers
- **Redis Integration**: For distributed rate limiting and caching

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- PostgreSQL
- Redis (for production)

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/yourusername/aangan.git
   cd aangan
   ```

2. **Install dependencies**
   ```sh
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env` in both root and backend directories
   - Update with your configuration

4. **Set up Redis** (optional for development, required for production)
   - See [Redis Setup Guide](./docs/redis-setup.md) for detailed instructions

5. **Start the development servers**
   ```sh
   # Start backend
   cd backend
   npm run dev
   
   # In a new terminal, start frontend
   cd frontend
   npm run dev
   ```

6. **Run tests**
   ```sh
   # Run all tests
   npx vitest run --config vitest.config.ts
   
   # Run backend tests
   cd backend
   npm test
   ```

---

## 🗂️ Project Structure (2025)

```
/ (root)
  backend/           # Node.js/Express backend, migrations, seeds, backend scripts
    src/             # Main backend source (app.js, db.js, routes/, etc.)
    scripts/         # Backend-only scripts
    migrations/      # DB migrations
    seeds/           # DB seeders
    config/          # Backend config (knexfile.js, env.example, etc.)
  frontend/          # React + Vite frontend, components, pages, lib, theme
    src/             # Main frontend source (components/, pages/, hooks/, etc.)
    lib/             # Frontend helpers (aiWorker.ts, utils.ts, etc.)
    public/          # Static assets (favicon, icons, manifest, etc.)
    theme/           # Theme files (theme.ts, tailwind config, etc.)
  shared/            # (empty, for future shared code)
  scripts/           # Project-level scripts (maintenance, test, etc.)
  docs/              # All markdown documentation
  config/            # Project-level config (eslint, vite, postcss, etc.)
  .env, .gitignore, README.md, etc.
```

---

## ✨ 2025 Feature Decisions & UI/UX Simplification

- **ModularWhisperCard**: Simplified UI—lighter borders, reduced padding, softer typography, more organic and emotionally lightweight feel.
- **ListeningCircle**: Fully removed from codebase, routes, and UI.
- **EchoBack**: Now a gentle icon/gesture on ModularWhisperCard (no reply box).
- **SharedSilence**: Hidden from UI/navigation, but component remains in codebase.
- **PresenceToast**: Replaced with a subtle ambient indicator (e.g., soft pulse near top bar/footer).
- **WhisperPad**: Unchanged.
- **Cross-platform**: All changes apply to both desktop and mobile views.
- **Cleanup**: Related CSS, routes, and contexts have been updated/removed for consistency and maintainability.

See `docs/README.md` for more details on the user experience and design philosophy.

---

## 🔗 Aliases
- `@` → `frontend/src`
- `@lib` → `frontend/lib`
- `@theme` → `frontend/theme/theme.ts`

---

## 🧪 Testing
- Uses [Vitest](https://vitest.dev/) for unit/integration tests
- Test files use `.test.tsx`/`.test.ts` extensions and import from `vitest`
- Test environment: `jsdom` (set in Vite config)
- Test setup file: `frontend/src/setupTests.ts`
- All tests pass as of July 2025

---

## 🤖 Automation
- Barrel files (`index.ts`) auto-generated for components and lib
- Codemod used to update all import paths
- ESLint boundaries enforced

---

## 📚 Documentation
- See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) for more details.
- **React Contexts:** All React context/provider files now follow the best-practice split: `XContext.context.ts` (context object) and `XContext.tsx` (provider/hook). See ARCHITECTURE.md for details. 