# Scripts Directory

This directory contains various utility scripts for development, testing, maintenance, and deployment of the Aangan application.

## Directory Structure

- `maintenance/` - Maintenance and cleanup scripts
- `dev/` - Development utilities
- `ci/` - CI/CD related scripts
- `test/` - Test utilities and scripts
- `deploy/` - Deployment scripts

## Available Scripts

### Maintenance Scripts

- `maintenance.js` - Main maintenance script with various subcommands
  ```bash
  # Run all maintenance tasks
  npm run maintenance
  
  # Run specific maintenance task
  npm run maintenance -- --security
  npm run maintenance -- --performance
  npm run maintenance -- --quality
  npm run maintenance -- --cleanup
  npm run maintenance -- --update
  ```

- `backup-db.js` - Database backup utility
  ```bash
  node scripts/backup-db.js
  ```

- `rotate-credentials.js` - Rotate application credentials
  ```bash
  node scripts/rotate-credentials.js
  ```

### Development Scripts

- `test-email.cjs` - Test email functionality
  ```bash
  node scripts/test-email.cjs
  ```

- `test-fcm-push.js` - Test Firebase Cloud Messaging
  ```bash
  node scripts/test-fcm-push.js
  ```

### Test Scripts

- `test-all-endpoints.js` - Test all API endpoints
  ```bash
  node scripts/test-all-endpoints.js
  ```

- `test-realtime-system.js` - Test WebSocket/realtime functionality
  ```bash
  node scripts/test-realtime-system.js
  ```

### Deployment Scripts

- `clean-build.sh` - Clean build artifacts (Linux/macOS)
  ```bash
  ./scripts/clean-build.sh
  ```

- `clean-build.ps1` - Clean build artifacts (Windows)
  ```powershell
  .\scripts\clean-build.ps1
  ```

## Best Practices

1. **Script Naming**
   - Use `.js` for Node.js scripts
   - Use `.cjs` for CommonJS modules when needed
   - Use `.ps1` for PowerShell scripts
   - Use `.sh` for shell scripts

2. **Documentation**
   - Add a JSDoc header to each script
   - Document required environment variables
   - Include usage examples

3. **Error Handling**
   - Always include try/catch blocks
   - Provide meaningful error messages
   - Set appropriate exit codes

4. **Dependencies**
   - Keep scripts self-contained when possible
   - Document any external dependencies
   - Use ES modules when possible

## Adding New Scripts

1. Place the script in the appropriate subdirectory
2. Add documentation to this README
3. Update the root `package.json` if a new npm script is needed
4. Test the script in a development environment

## Environment Variables

Many scripts require environment variables to be set. Create a `.env` file in the project root with the necessary variables. See `.env.example` for reference.

## Contributing

When adding or modifying scripts:

1. Follow the existing style and patterns
2. Add or update documentation
3. Test your changes thoroughly
4. Update this README if needed
