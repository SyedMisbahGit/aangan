# 🔒 Security Guide - Aangan Platform

## Overview
This document outlines the security measures implemented in the Aangan platform to ensure user privacy, data protection, and system integrity.

## 🛡️ Security Measures

### 1. Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication with 24-hour expiration
- **bcrypt Hashing**: Admin passwords are hashed using bcrypt with salt rounds
- **Role-based Access**: Admin-only routes protected with middleware
- **Session Management**: Secure session handling with proper token validation

### 2. Input Validation & Sanitization
- **XSS Prevention**: Input sanitization removes potentially dangerous characters
- **SQL Injection Protection**: Parameterized queries using Knex.js
- **Content Moderation**: Pre-filter for inappropriate content before storage
- **Request Size Limits**: 10MB limit on JSON payloads

### 3. Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Whispers**: 5 whispers per 10 minutes per IP
- **Comments**: 10 comments per minute per IP
- **Health Checks**: Excluded from rate limiting

### 4. HTTP Security Headers
- **Helmet.js**: Comprehensive security headers
- **Content Security Policy**: Strict CSP with allowed sources only
- **HSTS**: HTTP Strict Transport Security enabled
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Referrer Policy**: Strict origin-when-cross-origin

### 5. CORS Configuration
- **Whitelisted Origins**: Only allowed frontend domains
- **Credentials**: CORS credentials enabled for authenticated requests
- **Methods**: Restricted to necessary HTTP methods

### 6. Real-time Security
- **Socket.IO Authentication**: All WebSocket connections require clientKey
- **Message Rate Limiting**: Per-IP limits on socket messages
- **Connection Validation**: Proper connection state management

## 🚫 Fail-Safe Defaults

### Core Principle
**"Default should be denial; permission must be explicit."**

Access control is designed so that unless access is specifically granted, it is denied. This principle ensures that:
- If a system mistakenly blocks access, users will notice quickly
- If it mistakenly allows unauthorized access, the breach may remain unnoticed for long periods

### Implementation in Aangan

#### 1. **Backend Route Protection**
All sensitive routes require explicit authentication:

```javascript
// ❌ WRONG: Public by default
app.get('/api/admin/analytics', (req, res) => { ... });

// ✅ CORRECT: Explicit authentication required
app.get('/api/admin/analytics', authenticateAdminJWT, (req, res) => { ... });
```

**Protected Routes:**
- `/api/analytics/*` - All analytics endpoints require admin authentication
- `/api/admin/*` - All admin endpoints require admin authentication
- `/api/auth/verify` - Token verification requires valid JWT
- `/api/features/toggles` (POST) - Feature updates require admin authentication

**Public Routes (Explicitly Allowed):**
- `/api/health` - Health checks for monitoring
- `/api/whispers` - Public whisper reading and creation
- `/api/auth/login` - Authentication entry point
- `/api/features/toggles` (GET) - Public feature status reading

#### 2. **Frontend Route Protection**
All sensitive pages require explicit authentication:

```typescript
// ❌ WRONG: No protection
<Route path="/admin" element={<Admin />} />

// ✅ CORRECT: Explicit protection
<Route path="/admin" element={
  <PrivateRoute adminOnly>
    <Admin />
  </PrivateRoute>
} />
```

**Protected Frontend Routes:**
- `/admin` - Admin dashboard
- `/admin-insights` - Analytics dashboard
- All user-specific pages require guest authentication

#### 3. **Database Access Control**
- **Parameterized Queries**: All database queries use parameterized statements
- **Role-based Data Access**: Admin routes only access admin-authorized data
- **Input Validation**: All inputs are validated before database operations

#### 4. **WebSocket Security**
- **Authentication Required**: All Socket.IO connections require `clientKey`
- **Rate Limiting**: Per-IP limits on socket messages
- **Zone Validation**: Only valid zones are allowed for joining

### 5. **Environment Variables**
- **Secure by Default**: All sensitive configuration requires explicit environment variables
- **No Hardcoded Secrets**: Secrets are never committed to version control
- **Validation**: Environment variables are validated on startup

### 6. **Error Handling**
- **Information Disclosure Prevention**: Error messages don't leak sensitive information
- **Graceful Degradation**: System continues to function with reduced capabilities
- **Audit Logging**: All authentication attempts and failures are logged

### Fail-Safe Defaults Checklist

#### Backend Routes
- [x] All `/api/admin/*` routes require `authenticateAdminJWT`
- [x] All `/api/analytics/*` routes require `authenticateAdminJWT`
- [x] Public routes are explicitly defined and minimal
- [x] No sensitive data exposed through public endpoints
- [x] All database queries are parameterized
- [x] Input validation on all endpoints

#### Frontend Routes
- [x] Admin routes wrapped in `PrivateRoute` with `adminOnly`
- [x] User routes wrapped in `PrivateRoute`
- [x] Public routes explicitly defined
- [x] No sensitive UI elements exposed to unauthenticated users

#### Authentication
- [x] JWT tokens required for all protected routes
- [x] Token expiration enforced (24 hours)
- [x] bcrypt password hashing
- [x] No default admin credentials
- [x] Session management with proper cleanup

#### Real-time Security
- [x] Socket.IO connections require `clientKey`
- [x] Rate limiting on all socket events
- [x] Zone validation for room joining
- [x] Connection timeout and cleanup

### Testing Fail-Safe Defaults

#### Automated Tests
```bash
# Test that unauthenticated access is denied
npm run test:security

# Test that authenticated access is allowed
npm run test:auth

# Test rate limiting
npm run test:rate-limits
```

#### Manual Testing Checklist
- [ ] Unauthenticated users cannot access admin routes
- [ ] Invalid tokens are rejected
- [ ] Expired tokens are rejected
- [ ] Rate limits are enforced
- [ ] CORS blocks unauthorized origins
- [ ] Input validation prevents malicious data

### Incident Response for Fail-Safe Violations

#### Immediate Actions
1. **Disable Affected Endpoints**: If unauthorized access is detected
2. **Rotate Secrets**: Change JWT secrets and admin passwords
3. **Audit Logs**: Review all access logs for the affected period
4. **Notify Stakeholders**: Alert team and users if necessary

#### Investigation
1. **Identify Root Cause**: Determine how the violation occurred
2. **Assess Impact**: Evaluate what data or functionality was exposed
3. **Document Findings**: Record the incident and lessons learned
4. **Implement Fixes**: Correct the underlying security issue

#### Prevention
1. **Code Review**: Ensure all new routes follow fail-safe principles
2. **Automated Testing**: Add tests for unauthorized access scenarios
3. **Regular Audits**: Periodically review all route protections
4. **Security Training**: Educate team on fail-safe default principles

## 🛂 Complete Mediation

### Core Principle
**"Check every access, not just the first."**

Every access request should be validated against the current security policy, not just at login or when the session starts. Cached access decisions can become outdated and dangerous, especially in long-running processes.

#### Example
A user starts a session with read access, but their access rights are revoked during the session. Without re-checking (mediation), they can still read data.

### Implementation in Aangan

#### 1. **Backend (API)**
- **JWT Authentication:**
  - Every protected API route checks the JWT on every request (not just at login).
  - If a token is expired or invalid, access is denied immediately.
  - Role checks (e.g., admin) are performed on every request.
- **Role/Permission Changes:**
  - If a user's role changes, a new token is required for continued access.
  - For instant revocation, implement token blacklisting or use short-lived tokens with refresh.

#### 2. **Frontend**
- **Route Guards:**
  - Protected routes/components check for a valid JWT on every navigation.
  - If the token is removed or invalidated, the user is redirected to login.

#### 3. **WebSocket/Real-Time**
- **Socket.IO Authentication:**
  - The clientKey is checked on every connection.
  - If permissions change after connection, the socket remains open. For complete mediation, implement periodic re-authentication or disconnect on role change.

### Recommendations for Complete Mediation

- **Short-Lived Tokens:**
  - Use short-lived JWTs (e.g., 15 minutes) and require refresh. This limits the window for stale permissions.
- **Token Revocation/Blacklist:**
  - Maintain a blacklist of revoked tokens or a “last password change” timestamp to invalidate old tokens.
- **WebSocket Re-Auth:**
  - Periodically re-validate socket connections or disconnect users if their permissions change.
- **Admin Actions:**
  - For highly sensitive actions, require re-authentication (e.g., password prompt).

### Example: Short-Lived JWTs with Refresh
```js
// Issue short-lived JWT (e.g., 15 min)
const token = jwt.sign(payload, secret, { expiresIn: '15m' });

// On each request, check token validity
app.use((req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
});

// Implement refresh endpoint
app.post('/api/auth/refresh', (req, res) => {
  // Validate refresh token, issue new short-lived JWT
});
```

### Example: WebSocket Re-Authentication
```js
// On connection, check clientKey
io.use((socket, next) => {
  // ...
});

// Periodically ask client to re-authenticate
setInterval(() => {
  socket.emit('reauthenticate');
}, 10 * 60 * 1000); // every 10 minutes

// On client, respond with fresh credentials
socket.on('reauthenticate', () => {
  socket.emit('auth', { token: getNewToken() });
});
```

### Checklist for Complete Mediation
- [x] All protected API routes check JWT and role on every request
- [x] No long-lived sessions without revalidation
- [x] WebSocket connections require authentication on connect
- [ ] (Recommended) Implement short-lived tokens and refresh
- [ ] (Recommended) Add token revocation/blacklist support
- [ ] (Recommended) Add periodic WebSocket re-authentication

---

## 🔧 Environment Variables

### Required for Production
```bash
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_USERNAME=admin
ADMIN_PASS_HASH=$2a$10$your-bcrypt-hash-here
SOCKET_SHARED_KEY=superSecretSocketKey
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Security Best Practices
1. **Use Strong Secrets**: Generate cryptographically secure random strings
2. **Rotate Regularly**: Change secrets periodically
3. **Environment Separation**: Different secrets for dev/staging/prod
4. **Secure Storage**: Never commit secrets to version control

## 🚨 Security Monitoring

### Logging
- All authentication attempts logged
- Rate limit violations tracked
- Error responses logged with context
- Admin actions audited

### Monitoring
- Health check endpoints for uptime monitoring
- Performance metrics tracking
- Error rate monitoring
- Database connection monitoring

## 🔍 Security Testing

### Automated Tests
```bash
# Run security tests
npm test -- --grep "security"

# Test rate limiting
npm run test:rate-limits

# Test authentication
npm run test:auth
```

### Manual Security Checklist
- [ ] JWT tokens expire correctly
- [ ] Rate limiting works as expected
- [ ] Input sanitization prevents XSS
- [ ] CORS headers are properly set
- [ ] Admin routes are protected
- [ ] Database queries are parameterized
- [ ] Error messages don't leak sensitive info

## 🛠️ Incident Response

### Security Breach Response
1. **Immediate Actions**
   - Disable affected endpoints
   - Rotate all secrets
   - Review logs for intrusion scope
   - Notify stakeholders

2. **Investigation**
   - Analyze attack vectors
   - Review security logs
   - Assess data exposure
   - Document findings

3. **Recovery**
   - Patch vulnerabilities
   - Restore from clean backup
   - Implement additional security measures
   - Monitor for recurrence

## 📚 Security Resources

### Tools & Libraries
- **Helmet.js**: Security headers
- **express-rate-limit**: Rate limiting
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT handling
- **cors**: CORS configuration

### Best Practices
- OWASP Top 10 compliance
- Principle of least privilege
- Defense in depth
- Regular security audits
- Dependency vulnerability scanning

## 🔄 Security Updates

### Regular Maintenance
- **Dependencies**: Monthly security updates
- **Secrets**: Quarterly rotation
- **Audit**: Annual security review
- **Training**: Ongoing security awareness

### Update Process
1. Test security updates in staging
2. Schedule maintenance windows
3. Backup before updates
4. Monitor post-update
5. Document changes

---

*Last updated: January 2025*
*Maintained by: CUJ Community* 