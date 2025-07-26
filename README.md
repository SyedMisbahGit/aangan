# Aangan Project

Aangan is a full-stack, real-time, AI-powered campus platform built with Node.js/Express (backend), React + Vite (frontend), PostgreSQL, and Socket.IO. The platform enables anonymous, emotional expression and connection through whispers, with features like real-time interactions, emotional mapping, and AI-powered responses.

## ✨ Recent Updates (v1.9.2)

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
   git clone https://github.com/yourusername/college-whisper.git
   cd college-whisper
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