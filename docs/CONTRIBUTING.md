# Contributing to College Whisper (Aangan/CUJ)

Welcome! This guide will help you get started with development, understand our standards, and safely contribute to the Aangan (CUJ) project.

---

## Project Overview
College Whisper (Aangan) is a real-time, AI-augmented campus social platform. It features Dreamy Courtyard UX, zone-based emotional engagement, and AI whispering. The codebase is modular, with a React frontend and Node.js/Express backend.
- Each whisper is now associated with a user/guest via a `guestId` (anonymous ID), enabling personal whisper history ("My Whispers") even for anonymous users.
- Contributors should ensure guestId is handled in backend, frontend, and tests for any whisper-related changes.
- The Lounge/Listen view now includes ambient presence avatars, a poetic presence line, and always preloads real whispers or shows a poetic fallback. Whisper cards display an AI reply footer for user feedback. Contributors should maintain these UX/QA standards in future features.

---

## Local Setup
1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd college-whisper
   ```
2. **Install dependencies:**
   ```sh
   npm install
   cd backend && npm install
   ```
3. **Environment variables:**
   - Copy `.env.example` to `.env` in the backend directory and fill in required values.
4. **Database setup:**
   - Ensure PostgreSQL is running.
   - Run migrations:
     ```sh
     cd backend
     npx knex migrate:latest
     ```
   - (Optional) Seed demo data:
     ```sh
     npm run seed
     ```
5. **Start the app:**
   - Frontend: `npm run dev`
   - Backend: `cd backend && npm start`

---

## Renaming Paths
- If you fork or rename the project, update all relevant paths in `package.json`, `backend/package.json`, and deployment configs.
- Update documentation links and references to match your new project name or structure.

---

## Running & Testing
- **Frontend:**
  - Start with `npm run dev` (uses Vite)
- **Backend:**
  - Start with `cd backend && npm start`
- **Tests:**
  - We use **Vitest** for React/component/unit tests:
    ```sh
    npm run test
    ```
  - Ensure all tests pass before submitting a PR.
  - Add/maintain tests for new features or bugfixes.

---

## Coding Standards
- Use Prettier and ESLint (config provided) for code formatting and linting.
- Write clear, modular, and well-documented code.
- Use descriptive variable and function names.
- Prefer functional components and hooks in React.
- Keep backend logic modular (routes, controllers, services).

---

## Commit Message Guidelines
- Use clear, concise commit messages.
- Prefix with type: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Example: `feat: add AI whispering for Dreamy Courtyard`

---

## Contribution Workflow
1. **Fork the repo and create a feature branch:**
   ```sh
   git checkout -b feat/your-feature
   ```
2. **Make your changes and add tests.**
3. **Run all tests and ensure lint passes.**
4. **Commit and push your branch.**
5. **Open a Pull Request (PR):**
   - Describe your changes and reference related issues.
   - Ensure your PR passes all CI checks.
6. **Review:**
   - Address feedback promptly.
   - Squash/fixup commits if requested.

---

## Test Coverage
- All new features and bugfixes must include relevant tests.
- Aim for high coverage, especially for core logic and CUJ-specific flows.
- Use `npm run coverage` to check coverage reports.

---

## Questions or Help?
- Check the [ARCHITECTURE.md](./ARCHITECTURE.md) and [API_REFERENCE.md](./API_REFERENCE.md) for more details.
- Open an issue or ask in the project chat for help.

Thank you for contributing to Aangan (CUJ)! Your work helps create a safer, more engaging campus community. 