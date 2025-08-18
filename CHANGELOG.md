# Changelog

All notable changes to the College Whisper platform will be documented in this file.

## [Unreleased]

### Security

- Updated `esbuild` to v0.25.0 to address security vulnerability (CVE-2023-45133)
  - Added explicit dependency on `esbuild@^0.25.0` in both root and frontend packages
  - Added package overrides to ensure consistent version usage across all dependencies
  - Performed clean install to verify the fix

### Added

- Comprehensive form validation system with Zod schemas
- Loading states and error handling utilities
- Enhanced form component with validation and submission handling
- Unit tests for core components and utilities
- Integration tests for form submission flow
- Detailed API documentation in `frontend/docs/API.md`
- Comprehensive deployment guide in `DEPLOYMENT.md`
- Maintenance guide in `MAINTENANCE.md`

### Changed

- Improved error handling with custom error boundaries
- Set up Git hooks with Husky for automated code quality checks
  - Pre-commit hook runs ESLint and Prettier on staged files
  - Pre-push hook runs test suite before allowing push

### Removed

- Removed unused components: `EmotionSlowMode.tsx`, `MidnightConfessional.tsx`
- Cleaned up admin dashboard by removing unused components:
  - `AdminAISummaryCard.tsx`
  - `CommunityStats.tsx`
  - `ContentSeeder.tsx`
  - `EngagementAnalytics.tsx`
  - `ModerationFeedback.tsx`
  - `ModerationSandbox.tsx`
  - `SafetyDashboard.tsx`
  - `SummerSoulAnalytics.tsx`
- Archived experimental features to `frontend/src/archive/future-features/`:
  - `WhisperMilestones.tsx`
  - `WhisperMurmurs.tsx`
  - `WhisperRituals.tsx`
  - `WhisperShrines.tsx`
- Moved unused development scripts to `scripts/archive/`
- Enhanced form validation with better user feedback
- Updated loading states for better user experience
- Refactored form components for better reusability
- Improved test coverage for critical paths
- Updated documentation with new features and improvements

### Fixed

- Fixed form validation edge cases
- Resolved TypeScript type issues
- Addressed accessibility concerns in form components
- Fixed loading state management in async operations
- Improved error message clarity and user feedback

## [1.0.0] - 2025-07-29

### Initial Release Features

- Initial release of College Whisper platform
- Core functionality for anonymous emotional expression and connection
- Real-time interactions using Socket.IO
- Emotional mapping features
