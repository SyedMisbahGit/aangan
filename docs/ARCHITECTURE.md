# Updated Project Architecture (July 2025)

## Folder Structure

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

## Aliases
- `@` → `frontend/src`
- `@lib` → `frontend/lib`
- `@theme` → `frontend/theme/theme.ts`

## Test Setup
- Uses [Vitest](https://vitest.dev/) for unit/integration tests
- Test files use `.test.tsx`/`.test.ts` extensions and import from `vitest`
- Test environment: `jsdom` (set in Vite config)
- Test setup file: `frontend/src/setupTests.ts`
- All tests pass as of July 2025

## Automation
- Barrel files (`index.ts`) auto-generated for components and lib
- Codemod used to update all import paths
- ESLint boundaries enforced 

## React Context & Provider Structure (Best Practice)

- Each React context is now split into two files for optimal Fast Refresh and code clarity:
  - `XContext.context.ts`: Exports only the context object (created with `createContext`).
  - `XContext.tsx`: Exports the provider component and any hooks, importing the context from the `.context.ts` file.
- This ensures that provider files only export components, which is required for React Fast Refresh to work optimally and avoids hot-reload issues.
- Example usage:
  ```ts
  // src/contexts/AuthContext.context.ts
  export const AuthContext = createContext<AuthContextType | undefined>(undefined);

  // src/contexts/AuthContext.tsx
  import { AuthContext } from './AuthContext.context';
  export const AuthProvider = ({ children }) => { ... }
  export const useAuth = () => useContext(AuthContext);
  ```
- All major contexts (Auth, Realtime, Whispers, DreamTheme, SummerPulse, SummerSoul, CUJHotspot, ShhhNarrator) now follow this pattern. 