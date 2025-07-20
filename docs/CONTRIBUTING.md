# Contributing to Aangan

Thank you for helping improve Aangan! Please follow these guidelines:

## Project Structure
- See the root README and `docs/ARCHITECTURE.md` for the latest folder layout and alias conventions.
- The Vite frontend root is `frontend/`, with main HTML at `frontend/public/index.html` and config at `config/vite.config.ts`.

## Setup
- Install dependencies: `npm install`
- Run backend: `cd backend && npm start`
- Run frontend: `cd frontend && npm run dev`

## Testing
- All code must pass `npx vitest run --config vitest.config.ts` before submitting a PR.
- Test files must use `.test.tsx`/`.test.ts` and import from `vitest`.
- Use the `jsdom` environment for React tests.

## Aliases
- Use `@`, `@lib`, and `@theme` for imports as documented.

## Automation
- Use barrels (`index.ts`) for exports in components/lib.
- Run codemods for large refactors.
- Follow ESLint boundaries rules.

## PRs
- Keep PRs focused and well-described.
- Update docs if you change structure or APIs.

Thank you for contributing! 