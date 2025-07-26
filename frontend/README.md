# college-whisper-frontend

## Project Overview

- **Framework:** React 19.1.0 + Vite 5.4.19
- **Language:** TypeScript
- **Structure:** Modular, with clear separation of components, contexts, hooks, pages, and utilities.
- **PWA:** Service worker and Workbox integration for offline support.
- **Styling:** Tailwind CSS (custom config in `theme/`), plus global and component styles.

---

## Directory Structure

```
frontend/
├── src/
│   ├── components/         # All UI and logic components (modular, grouped by feature)
│   ├── contexts/           # React context providers and helpers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Route-level components (each page/route)
│   ├── services/           # API, realtime, and other service logic
│   ├── data/               # Static or mock data
│   ├── constants/          # App-wide constants
│   ├── __tests__/          # Unit and integration tests
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   ├── index.css           # Global styles
│   └── App.css             # App-specific styles
├── public/                 # Static assets (favicon, manifest, offline.html, etc.)
├── dev-dist/               # Generated service worker and workbox files
├── lib/                    # Utility and shared logic
├── theme/                  # Tailwind and theme configuration
├── package.json            # Project dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig*.json          # TypeScript configuration
├── README.md               # Project overview and troubleshooting
└── TROUBLESHOOTING.md      # Detailed troubleshooting guide
```

---

## Key Files and Their Roles

- **`src/App.tsx`**: Main application component, sets up providers and routes.
- **`src/main.tsx`**: Entry point, renders `<App />` into the DOM.
- **`src/components/`**: All reusable and feature-specific components, organized by domain.
- **`src/contexts/`**: All React context providers (e.g., Auth, Theme, Realtime, Narrator).
- **`src/hooks/`**: Custom hooks (e.g., `use-toast`, `useErrorBoundaryLogger`).
- **`src/pages/`**: Each file is a route/page (e.g., `HomeFeed.tsx`, `Profile.tsx`).
- **`public/`**: Static files served at the root (e.g., `manifest.json`, `logo.svg`).
- **`dev-dist/`**: Service worker and Workbox files for PWA support.
- **`theme/`**: Tailwind and theme configuration.
- **`lib/`**: Utility functions and shared logic.

---

## Development Workflow

### Starting the Dev Server
```sh
cd frontend
npm install
npm run dev
```
- The app will be available at [http://localhost:8080/](http://localhost:8080/).

### Building for Production
```sh
npm run build
```

### Previewing Production Build
```sh
npm run preview
```

---

## Troubleshooting

- **Invalid Hook Call:** See `TROUBLESHOOTING.md` for step-by-step fixes.
- **404 Errors:** Always run the dev server from the `frontend` directory.
- **Service Worker Issues:** Use Incognito or unregister the service worker in DevTools.

---

## Advanced Revamp Suggestions

### A. Code Quality & Consistency
- Enforce linting and formatting (ESLint, Prettier).
- Use TypeScript strict mode for better type safety.
- Add more unit and integration tests in `__tests__/`.

### B. Performance
- Audit bundle size with Vite’s analyzer.
- Use React.lazy and Suspense for code splitting.
- Optimize images and static assets (use WebP, AVIF).

### C. Accessibility
- Use semantic HTML and ARIA attributes.
- Add automated accessibility tests (e.g., axe-core).

### D. Security
- Review and update dependencies regularly.
- Use Content Security Policy (CSP) headers.
- Sanitize all user input and output.

### E. PWA & Offline
- Ensure all critical assets are precached.
- Test offline mode and fallback UI (`offline.html`).

### F. Documentation
- Keep `README.md` and `TROUBLESHOOTING.md` up to date.
- Add code comments and JSDoc for all public functions and components.
- Document all custom hooks and context providers.

### G. DevOps
- Set up CI/CD for linting, testing, and deployment.
- Use environment variables for API endpoints and secrets.

---

## Minute Details & Best Practices

- **Component Naming:** Use PascalCase for components, camelCase for hooks.
- **Imports:** Use absolute imports via path aliases (see `vite.config.ts`).
- **State Management:** Prefer React context for global state, local state for component-specific logic.
- **Error Handling:** Use `useErrorBoundaryLogger` for logging errors with context.
- **Testing:** Place all tests in `__tests__/` and use descriptive test names.
- **Service Workers:** Register in production only, handle updates gracefully.

---

## How to Add a New Page

1. Create a new file in `src/pages/` (e.g., `NewFeature.tsx`).
2. Add a route in your router setup (usually in `App.tsx`).
3. Use context/hooks as needed.
4. Add tests in `__tests__/`.

---

## How to Add a New Component

1. Create a new file in `src/components/` or a relevant subfolder.
2. Use TypeScript for props and state.
3. Add JSDoc comments for public APIs.
4. Write tests for the component.

---

## How to Add a New Context

1. Create a new file in `src/contexts/`.
2. Export the context and provider.
3. Document usage in the file and in `README.md`.

---

## How to Add a New Hook

1. Create a new file in `src/hooks/`.
2. Prefix the file and function with `use`.
3. Add usage examples in the file comments.

---

## How to Add Static Assets

- Place images, icons, and other static files in `public/`.
- Reference them with `/filename.ext` in your code.

---

## How to Update Dependencies

1. Run `npm outdated` to see outdated packages.
2. Update with `npm install <package>@latest`.
3. Test the app thoroughly after updates.

---

## How to Deploy

- Use Vercel, Netlify, or your preferred platform.
- Configure environment variables as needed.
- Ensure service worker and PWA settings are correct.

---

## Contact & Contribution

- For questions, open an issue or contact the maintainers.
- To contribute, fork the repo, create a feature branch, and submit a pull request. 