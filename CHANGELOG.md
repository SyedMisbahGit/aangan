# Changelog

All notable changes to the College Whisper platform will be documented in this file.

## [Unreleased]

### Added

- New `routeUtils.ts` utility file for route-related functions
- Comprehensive code organization and linting documentation in `docs/CODE_ORGANIZATION.md`
- Markdown lint configuration (`.markdownlint.json`)

### Changed

- Moved `isUserFacingRoute` from `DreamHeader.tsx` to `utils/routeUtils.ts`
- Updated README.md with code quality section and documentation links
- Improved code organization and component structure

### Fixed

- Linting issues in multiple files including `ErrorBoundary.test.tsx` and `CUJHotspotContext.tsx`
- Fixed Fast Refresh warnings by properly organizing component exports
- Resolved TypeScript type issues and improved type safety
- Addressed all critical linting errors and warnings

## [1.0.0] - 2025-07-29

### Initial Release Features

- Initial release of College Whisper platform
- Core functionality for anonymous emotional expression and connection
- Real-time interactions using Socket.IO
- Emotional mapping features
