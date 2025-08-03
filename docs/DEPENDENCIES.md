# Dependencies Documentation

This document provides an overview of the project's dependencies, including why certain packages are kept despite being flagged as potentially unused.

## Unused Dependencies (To Be Removed)

The following dependencies were identified as unused and can likely be removed:

- `@headlessui/react` - Not currently used in the codebase
- `@hookform/resolvers` - Not currently used in the codebase
- `@radix-ui/react-*` - Various Radix UI components not currently used
- `class-variance-authority` - Not currently used in the codebase
- `cmdk` - Not currently used in the codebase
- `embla-carousel-react` - Not currently used in the codebase
- `input-otp` - Not currently used in the codebase
- `react-day-picker` - Not currently used in the codebase

## Intentionally Kept Dependencies

These dependencies are flagged as unused but are being kept for specific reasons:

### Development Dependencies
- `@testing-library/react` - Used for testing (might be a false positive in depcheck)
- `eslint-plugin-boundaries` - Used for enforcing architectural boundaries
- `jest-environment-jsdom` - Required for JSDOM environment in tests
- `lovable-tagger` - Used for semantic versioning and releases

### Runtime Dependencies
- `@tanstack/react-query` - Used for data fetching (might be a false positive)
- `framer-motion` - Used for animations (might be dynamically imported)
- `react-hook-form` - Used for form handling (might be a false positive)
- `recharts` - Used for data visualization (might be dynamically imported)
- `zod` - Used for schema validation (might be a false positive)

## Missing Dependencies

These packages are used but not listed in package.json:

### Runtime Dependencies
- `node-fetch` - Used in test scripts
- `nodemailer` - Used in email testing scripts
- `firebase-admin` - Used in Firebase admin scripts
- `@supabase/supabase-js` - Used in Supabase integration
- `uuid` - Used for generating unique IDs
- `sqlite3` - Used in development scripts
- `@playwright/test` - Used for end-to-end testing

## How to Update Dependencies

1. **To remove unused dependencies**:
   ```bash
   npm uninstall package1 package2
   ```

2. **To add missing dependencies**:
   ```bash
   npm install --save-dev package1 package2
   ```

3. **To update all dependencies**:
   ```bash
   npm update
   ```

## Version Pinning

All dependencies should be pinned to specific versions to ensure consistent installations. Avoid using `^` or `~` in package.json unless there's a specific reason to allow minor or patch updates.

## Security Considerations

Regularly run `npm audit` to check for known vulnerabilities in dependencies. Update any vulnerable packages as needed.
