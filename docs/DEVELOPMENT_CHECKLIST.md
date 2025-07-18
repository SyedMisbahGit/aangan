# Aangan Development Checklist (vNext)

## Error Boundaries & Suspense
- All major pages/components must be wrapped in `<Suspense fallback={<Skeleton />}>` and a page-specific error boundary.
- Use the universal `<ErrorPage />` for error boundaries, with narrator lines and feedback/report actions.

## Skeletons & Loading States
- Use `<WhisperSkeleton />` and `<CustomSkeletonCard />` for realistic, animated loading states.
- All skeletons must use shimmer animation and match the app’s color palette and spacing.
- Show a 'Reload' button if loading takes longer than 8 seconds.

## Analytics & Error Logging
- Use `useErrorBoundaryLogger` to log all async/background errors with route, session, and breadcrumbs.
- All error boundaries log to `/api/logs/error` with full context.
- User feedback modal is required on all error pages.

## Testing
- All error and skeleton states must have:
  - Unit tests (Vitest/React Testing Library)
  - Accessibility tests (axe-core)
  - Visual regression tests (Playwright)
  - E2E tests for network/offline/error edge cases (Playwright)

## Linting & Type Safety
- ESLint must block `console.log`, `any` types, and `TODO`/`FIXME` comments in production code.
- TypeScript strict mode is required.

## Offline & Network UX
- Show a global offline banner when offline.
- All network-dependent features must show skeletons and network status indicators.
- Retry/report actions must be accessible and visible on all error/skeleton states.

## UI Contextualization
- All global UI elements (headers, info bars, PrivacyBanner, feedback/CTA strips) must only be rendered on user-facing pages.
- Use the shared `isUserFacingRoute` utility to conditionally render these elements.
- Admin, login, and error pages must not show these UI fragments.

## Storybook & MSW
- All skeletons, error boundaries, and fallback states must have Storybook stories.
- Use MSW to simulate network errors, slow responses, and offline states in Storybook and tests.

## Dev Experience
- All new UI states must be demoed in Storybook before merging.
- Use MSW and Storybook for rapid iteration and design review.

---

_See also: docs/UX_V2_ALIVE_AND_REAL.md, docs/SECURITY_GUIDE.md, docs/ARCHITECTURE.md_ 