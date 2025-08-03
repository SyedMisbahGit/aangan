# Contributing to College Whisper

Thank you for your interest in contributing to College Whisper! This document outlines the process for contributing to our codebase.

## Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Code Style

- Follow the existing code style in the codebase
- Use TypeScript types wherever possible
- Write meaningful commit messages
- Keep PRs focused and small when possible

## Testing

- Write tests for new features
- Ensure all tests pass before submitting a PR
- Update tests when fixing bugs

## Deprecation Standards

### 1. Marking for Deprecation
- Add `@deprecated` JSDoc comment with version and alternative
- Update component to log deprecation warning
- Document removal timeline in code comments

Example:
```typescript
/**
 * @deprecated since v1.2.0 - Will be removed in v2.0.0. Use NewComponent instead.
 */
```

### 2. Removal Process
1. Move to `archive/future-features/` if experimental
2. Remove from main exports in `index.ts` files
3. Update all documentation
4. Add to CHANGELOG.md under "Removed"
5. Create a migration guide if needed

### 3. Static Analysis
- Run `npx depcheck` to find unused dependencies
- Maintain 80%+ test coverage
- Document all breaking changes

## Code Review Process

1. All PRs require at least one approval
2. Ensure CI tests pass
3. Update documentation as needed
4. Tag relevant team members for review

## Reporting Issues

- Check existing issues before creating a new one
- Use the issue templates when available
- Include steps to reproduce, expected behavior, and actual behavior

## License

By contributing, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE) file.
