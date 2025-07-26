# Development Guide: college-whisper-frontend

## Setup

1. Install Node.js (LTS recommended, e.g., 20.x).
2. Install dependencies:
   ```sh
   cd frontend
   npm install
   ```

## Environment Variables

- Configure any required environment variables in a `.env` file in the `frontend` directory.
- Example:
  ```env
  VITE_API_URL=https://api.example.com
  ```

## Running the App

```sh
npm run dev
```
- App runs at [http://localhost:8080/](http://localhost:8080/)

## Building for Production

```sh
npm run build
```
- Output in `dist/`

## Previewing Production Build

```sh
npm run preview
```

## Testing

```sh
npm run test
```
- Place tests in `src/__tests__/`

## Debugging

- Use VSCode or your preferred IDE for breakpoints and debugging.
- Use React DevTools and browser DevTools for UI and state inspection.

## Linting & Formatting

```sh
npm run lint
npm run format
```
- ESLint and Prettier are configured for code quality and consistency.

## Advanced Tips

- Use absolute imports via path aliases (see `vite.config.ts`).
- Use React.lazy and Suspense for code splitting.
- Use service worker and PWA features for offline support.
- For troubleshooting, see `TROUBLESHOOTING.md`.

---
Happy coding! 