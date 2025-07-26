# Security Policy

## Security Measures

### Rate Limiting
- **Standard API Endpoints**: 100 requests per 15 minutes per IP
- **Authentication Endpoints**: 20 requests per 15 minutes per IP
- **API Key Endpoints**: 1000 requests per hour per API key

### Input Validation
- All user inputs are validated using express-validator
- XSS protection and request sanitization enabled
- Content Security Policy (CSP) headers implemented

### Authentication & Authorization
- JWT-based authentication with secure token handling
- Role-based access control (RBAC) for admin routes
- Secure password hashing with bcrypt

### Data Protection
- Environment variables for sensitive configuration
- Request/response logging with sensitive data redaction
- Secure headers (CSP, HSTS, XSS Protection)

## Reporting Security Issues

If you discover any security vulnerabilities, please report them by creating a new issue with the "security" label.

## Dependencies

Regularly updated dependencies with security audits. Use `npm audit` to check for vulnerabilities.

## Security Headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'`

## Rate Limiting

Rate limiting is implemented using Redis for distributed rate limiting in production and in-memory for development.
