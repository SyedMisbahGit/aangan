# Aangan Project

Aangan is a full-stack, real-time, AI-powered campus platform built with Node.js/Express (backend), React + Vite (frontend), PostgreSQL, and Socket.IO.

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Run the backend:**
   ```sh
   cd backend
   npm start
   ```
3. **Run the frontend:**
   ```sh
   cd frontend
   npm run dev
   ```
4. **Run tests:**
   ```sh
   npx vitest run --config vitest.config.ts
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