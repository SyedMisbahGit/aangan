# Project Structure Summary

This document provides an overview of the main structure and components of the `college-whisper` project.

## Top-Level Directories & Files

- **admin/**: (Contents not detailed)
- **api/**: Contains API-related scripts, e.g., `fcm-token.js`.
- **backend/**: Backend server code, database config, migrations, and seeds.
  - `app.js`, `db.js`, `db.ts`: Main backend logic and DB connection.
  - `migrations/`, `seeds/`: Database migration and seed scripts.
  - `scripts/`: Utility and seed scripts.
- **backups/**: Database or data backup files.
- **coverage/**: Code coverage reports and related assets.
- **dev-dist/**: Development build output (e.g., service workers).
- **public/**: Static assets (icons, manifest, HTML, etc.).
- **scripts/**: Project maintenance, testing, and automation scripts.
- **src/**: Main frontend source code.
  - `components/`: React components, organized by feature/domain.
  - `constants/`, `contexts/`, `hooks/`, `lib/`, `services/`: App logic, state, and utilities.
    - `contexts/`: Each context is split into `XContext.context.ts` (context object) and `XContext.tsx` (provider/hook) for Fast Refresh compliance.
  - `pages/`: Top-level pages/routes for the app.
  - `data/`: Static data files.
- **test-*.js**: Test scripts for endpoints and features.
- **package.json**, **README.md**, **tsconfig*.json**, etc.: Standard project config and documentation files.

## Notable Features

- **Frontend**: Located in `src/`, with modular React components and context/state management.
- **Backend**: In `backend/`, with database migrations, seeds, and server logic.
- **Testing**: Includes both frontend tests (`src/__tests__/`) and backend test scripts.
- **Coverage**: HTML and JS files for code coverage reports.
- **Automation**: Scripts for seeding, backups, and maintenance.

---
This summary is based on the provided file tree and may omit some details for brevity. Refer to the actual directories for full contents. 