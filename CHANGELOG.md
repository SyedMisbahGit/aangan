# Changelog

## [v1.7.1] - UI Fixes and Improvements
- Replaced floating whisper button with an embedded composer at the bottom of the feed.
- Fixed composer font visibility with a light translucent background and dark text.
- Implemented optimistic UI for whisper posting, showing it in the feed immediately with a soft pulse animation.
- Fixed "ESC to Exit" instruction on the Listen view to be conditional based on screen size.
- Added back navigation support with a soft "< Back" button in modals and proper browser history handling.
- Added a "Send Feedback" option in MyCorner (formerly Menu) with a modal for submission.

## [v1.6.3] - Reviewer-Happiness Patch
- Remove FloatingActionButton, embed Bench Composer at bottom of Whispers
- Improve composer font/contrast
- Hide 'Press ESC' on mobile in Listen
- Add SoftBack button and swipe-down to dismiss in Listen
- Seed demo whispers in dev
- Lint/test safety, docs update

## [v.1.7] - Memory & Map Upgrade (in progress)
- See PR: feat/v1.7-memory-map
- Major: PostgreSQL, Chroma vector memory, LangChain AI, D3 ZoneMap, Capacitor shell, rate-limits, and more.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.5.0] - 2025-01-XX

### Added
- Comment rate limiting (10 req/min per IP) for future comment system
- Jest and React Testing Library setup with basic test coverage
- GitHub Actions CI workflow for automated testing
- Comprehensive ESLint configuration with TypeScript support

### Changed
- Removed all dark mode remnants from UI components
- Fixed React hooks rules violations in App.tsx
- Improved TypeScript typing by replacing `any` types with explicit interfaces
- Enhanced error handling and type safety across components

### Fixed
- ESLint errors and warnings across the codebase
- React hooks conditional calling issues
- TypeScript strict mode compliance
- Unused imports and dead code cleanup

### Technical
- Added Jest configuration with ts-jest preset
- Created test setup file with DOM mocks
- Added CI/CD pipeline with automated testing
- Improved build process and development workflow

## [1.4.0] - 2025-01-XX

### Added
- Emotional Gravity navigation refactor
- Home feed upgrades with ambient whisper fallback
- Explore page with swipeable tabs (Spaces, Stars, Trends)
- Lounge ambient mode with full-screen experience
- Diary enhancements with streak counter and AI prompts
- Menu overflow page for additional features
- Analytics page view tracking

### Changed
- Bottom navigation redesign with new icons and layout
- Floating "Whisper +" button repositioned to bottom-center
- Enhanced contrast and typography improvements
- Mobile responsiveness optimizations

## [1.3.0] - 2025-01-XX

### Added
- Real-time whisper feed with WebSocket integration
- Ambient whisper system for continuous engagement
- AI-powered whisper generation and clustering
- Campus pulse monitoring and analytics
- Enhanced privacy features and data protection

### Changed
- Improved performance and stability
- Enhanced user experience with smoother animations
- Better error handling and offline support

## [1.2.0] - 2025-01-XX

### Added
- PWA support with offline functionality
- Push notifications for real-time updates
- Enhanced mobile experience
- Improved accessibility features

### Changed
- Updated UI components for better mobile responsiveness
- Enhanced performance optimizations

## [1.1.0] - 2025-01-XX

### Added
- Basic whisper functionality
- User authentication system
- Real-time updates
- Basic moderation features

### Changed
- Initial platform setup
- Core architecture implementation

## [1.0.0] - 2025-01-XX

### Added
- Initial release of Shhh platform
- Anonymous whispering system
- Basic campus integration
- Core social features 