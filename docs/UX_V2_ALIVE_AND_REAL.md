# Aangan UX v2: Alive, Real, and Resilient

## Loading & Skeletons
- All loading states use animated shimmer skeletons matching the real UI layout.
- Skeletons must be visually consistent, accessible, and never block navigation.
- If loading takes longer than 8 seconds, show a 'Reload' button.

## Error Handling
- All errors are caught by page-level error boundaries using `<ErrorPage />`.
- ErrorPage must show a narrator line, technical details, and offer retry, home, and feedback/report actions.
- User feedback modal is required for all error states.

## Offline-First
- A global offline banner appears when the app is offline.
- Users are informed that some features may be unavailable.
- All network-dependent features must degrade gracefully and show skeletons/network indicators.

## Accessibility
- All skeletons, error, and offline states must pass axe-core accessibility checks.
- Focus management and color contrast are required for all fallback UIs.

## Retry & Report
- All error and skeleton states must have accessible retry and 'Report Issue' buttons.
- Feedback modal must be keyboard accessible and screen reader friendly.

## Visual Consistency
- All fallback UIs use the app’s color palette, border radius, and spacing.
- Visual regression tests are required for all skeletons and error states.

---

_See also: docs/DEVELOPMENT_CHECKLIST.md, docs/SECURITY_GUIDE.md_ 

---

## 2025-07 Full App Optimization & UX Audit: Key Takeaways

- All main pages and flows were audited for functionality, performance, accessibility, and UX.
- Most flows are modular, animated, and accessible, but some subcomponents need improved async state handling (loading/error/empty states).
- Some links (e.g., /settings) are dead-ends and should be removed or implemented.
- Dark mode and accessibility should be verified app-wide, especially for modals and charts.
- Replace demo/static data with real API calls in production.
- Add a custom /500 error page for server errors.
- See PERFORMANCE_GUIDE.md for technical best practices and audit-driven recommendations.

This audit supports the v2.0 "Alive & Real" UX goals: emotional clarity, accessibility, and a seamless, real human presence throughout the app. 

## Contextual Info Bars, Banners, and Feedback Strips (2025-07)
- All global UI elements such as the main header/info bar, PrivacyBanner, and feedback/CTA strips are now rendered **only on user-facing pages**.
- Admin, login, and error pages do **not** show these elements.
- This is enforced using a shared utility (`isUserFacingRoute`) that checks the current route.
- Example: The PrivacyBanner and DreamHeader are only rendered if the route is user-facing.
- This ensures a clean, minimal, and purposeful layout, with no irrelevant banners on admin, 404, 500, or deep paths. 