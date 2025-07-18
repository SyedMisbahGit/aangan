# Aangan Architecture (vNext)

## Error Boundaries & Suspense
- All routes and major components are wrapped in `<Suspense>` and a page-specific error boundary.
- The universal `<ErrorPage />` is used for all error boundaries, with narrator lines and feedback/report actions.

## Analytics & Error Logging
- All errors (render and async) are logged to `/api/logs/error` with route, session, and breadcrumbs.
- User feedback is POSTed to `/api/logs/feedback` from the error page modal.

## Skeletons & Fallbacks
- All loading states use animated shimmer skeletons (`WhisperSkeleton`, `CustomSkeletonCard`).
- Skeletons are used as Suspense fallbacks and for network loading states.

## Offline & Network Handling
- A global offline banner is shown using the `navigator.onLine` API and event listeners.
- All network-dependent features show skeletons and network status indicators.

## Storybook & MSW
- Storybook is used for all skeletons, error boundaries, and fallback states.
- MSW is used to mock API endpoints for local dev, Storybook, and tests.
- Handlers simulate success, slow, and error responses for `/api/whispers`, `/api/logs/error`, and `/api/logs/feedback`.

## Testing
- Unit, accessibility, visual regression, and E2E tests are required for all fallback UIs.
- Playwright and axe-core are used for E2E and a11y testing.

---

_See also: docs/DEVELOPMENT_CHECKLIST.md, docs/UX_V2_ALIVE_AND_REAL.md_ 