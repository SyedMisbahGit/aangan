# Changelog

## v1.8 (Unreleased)
- AI reply flow refactored to async job queue (background-safe, non-blocking)
- Ghost whisper generator: idempotent, time-of-day distribution, overlap avoidance
- Standardized prompt templates (zone+emotion) for all AI/ghost/ambient replies
- Enhanced logging, fallback, and retry logic for AI jobs
- Manual AI pull endpoint is async and returns pending/cached
- Unit tests for AI reply job queue
- Documentation updated for all above changes

## v1.7 (Unreleased)
- API documentation and architecture docs added for developer onboarding
- Improved test coverage and CI reliability
- Minor UI/UX refinements in Dreamy Courtyard and zone navigation
- Performance optimizations for real-time features

## v1.6 (2025-07-07)
- **CUJ (Aangan) Integration:**
  - Zone-based emotional engagement and Dreamy Courtyard UX
  - New onboarding flows and campus zone logic
- **AI Whispering:**
  - Probabilistic, poetic AI replies tailored to zones/emotions
  - Enhanced AI listener for context-aware responses
- **Backend Migration:**
  - Modular Node.js/Express backend
  - PostgreSQL migration and improved data models
  - Socket.IO integration for real-time activity and live feeds
- **Frontend Improvements:**
  - React + Vite migration for faster development
  - New UI components for zones, emotions, and activity streams
- **Moderation & Safety:**
  - Improved content moderation and safety checks
- **Testing:**
  - Switched to Vitest for React/component/unit tests
  - Increased test coverage for core features
- **Bugfixes & Misc:**
  - Fixed edge cases in whisper posting and activity feeds
  - Improved error handling and logging

## [v1.9.1] - First Impressions Fix

### Added
- Full-screen, high-contrast notification permission modal with custom prompt.
- Persistent bottom navigation bar with clear icons.
- Floating help icon ('?') on every screen, with quick help modal.
- 'Why this exists' button in help modal, with poetic app purpose explanation.
- Guided onboarding modal with emotional CTA buttons: 'I feel something', 'Wander', 'Listen quietly'.
- Poetic ghost whispers and real-time echo/AI reply animation on Home (Aangan tab).

### Changed
- Onboarding 'Enter Name' field: higher contrast, blurred background, strong shadow, WCAG AA compliant.
- Whisper composer: higher contrast placeholder, solid semi-dark background, strong shadow, clear focus ring.

### Fixed
- Native notification permission UI no longer appears over unreadable backgrounds.
- Home screen is no longer empty or static for new users.

## v2.0 (2025-07)
- Major “Alive & Real” UX update: emotional clarity, accessibility, and real human presence
- New 3-step onboarding: clear, visual, progressive, skippable, accessible from Help
- All inputs, modals, and flows: WCAG AA+ contrast, ARIA, keyboard navigation, prefers-reduced-motion
- Home Feed: top 3 real whispers, ghost/real distinction, trending/zone, live pulse/echo, animated transitions
- Composer: feedback toast, reply ETA, fallback animation, emotion tagging, animated prompt/pickers/button
- AI Replies: “WhisperBot replied”, “Whisper again”, “Did this help?” reactions, animated feedback
- Navigation: redesigned bottom nav, tooltips, active highlight, persistent Help overlay, full accessibility
- Emotional Layer: affirmation after 3 whispers, private journal unlock after 5, animated banners/confetti
- Analytics/Admin: event tracking for onboarding, zone usage, AI reply success/timeout, animated dashboard
- Animation & Polish: smooth, accessible animations, micro-interactions, visual polish everywhere

## [Unreleased]

### Added
- Performance optimizations for `/whispers` page:
  - Switched main feed to real data fetching using React Query (`useWhispers` hook).
  - Added pagination with a "Load More" button (fetches 20 at a time).
  - Virtualized the main whispers list using `react-window` for smooth scrolling and low memory usage.
  - Memoized whisper card rendering for further efficiency.

### Changed
- Updated `docs/PERFORMANCE_GUIDE.md` with new best practices and implementation details for large lists and async data fetching.

## [2025-07] Aangan Interaction Audit
- Removed all fake/random presence data; only real presence is shown if available.
- Merged intro and onboarding into a single, poetic, seamless experience.
- Rewrote all error and empty state messages with poetic, gentle language.
- Ensured full keyboard accessibility: ARIA labels, focus rings, and logical tab order throughout the app.
- See `docs/UX_V2_ALIVE_AND_REAL.md` for full details and rationale.

---

See previous versions for earlier changes. 