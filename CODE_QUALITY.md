# Code Quality & Development Setup

This document outlines the code quality standards and development setup for the Aangan project.

## Prerequisites

- Node.js 18+ and npm 9+
- VS Code (recommended) or another modern code editor
- Git

## Development Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up Git Hooks**

   ```bash
   npx husky install
   ```

3. **Install VS Code Extensions**

   - Open the Command Palette (Ctrl+Shift+P)
   - Run "Extensions: Show Recommended Extensions"
   - Install all recommended extensions

## Code Quality Tools

### ESLint

- **Purpose**: Static code analysis and code style enforcement
- **Run Linter**: `npm run lint`
- **Auto-fix Issues**: `npm run lint:fix`
- **Configuration**: `.eslintrc.js`

### Prettier

- **Purpose**: Code formatting
- **Run Formatter**: `npx prettier --write .`
- **Configuration**: `.prettierrc`

### TypeScript

- **Purpose**: Static type checking
- **Run Type Check**: `npm run typecheck`
- **Configuration**: `tsconfig.json`, `tsconfig.base.json`, `tsconfig.check.json`

## Git Hooks

- **Pre-commit**: Runs linter and formatter on staged files
- **Pre-push**: Runs test suite

## VS Code Settings

- Format on Save: Enabled
- Auto Fix on Save: Enabled for ESLint issues
- Default Formatter: Prettier

## Development Workflow

1. Create a new branch for your feature/fix

2. Make your changes

3. Stage and commit your changes

   ```bash
   git add .
   git commit -m "feat: your commit message"
   ```

4. Push your changes

   ```bash
   git push origin your-branch
   ```

## Best Practices

- Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
- Keep commits small and focused
- Write unit tests for new features
- Document complex logic with comments
- Use TypeScript types and interfaces
- Avoid `any` type unless absolutely necessary

## Troubleshooting

- **ESLint/Prettier Conflicts**: Ensure you have the recommended VS Code extensions installed
- **Type Errors**: Run `npm run typecheck` to identify and fix type issues
- **Dependency Issues**: Delete `node_modules` and `package-lock.json` then run `npm install`
