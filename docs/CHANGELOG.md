# Changelog

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

---

See previous versions for earlier changes. 