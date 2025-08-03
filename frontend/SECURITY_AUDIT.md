# Security Audit: Aangan Frontend

## Checklist

- [ ] All dependencies are up to date and reviewed for vulnerabilities
- [ ] No sensitive data or secrets are committed to the repo
- [ ] All user input is validated and sanitized
- [ ] Authentication and authorization are enforced for protected routes and APIs
- [ ] HTTPS is used in production
- [ ] Content Security Policy (CSP) headers are set
- [ ] Service worker does not expose sensitive data
- [ ] No use of `eval` or other unsafe code patterns
- [ ] PWA features are secure and do not leak data

## Summary

- Review dependencies regularly with `npm audit` and `npm outdated`
- Use environment variables for secrets and API keys
- Validate and sanitize all user input on both client and server
- Use HTTPS and set security headers in production
- Test service worker and PWA features for security issues

---
*Update this file after each security review or audit.* 