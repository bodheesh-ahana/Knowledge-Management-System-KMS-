# Security & Compliance Guide

**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-27  

---

## Security Overview

This document outlines security practices and compliance requirements for the KMS application.

---

## Data Security

### Encryption in Transit

- ✅ TLS/SSL (HTTPS) for all connections
- ✅ Minimum TLS 1.2
- ✅ HSTS header (Strict-Transport-Security)
- ✅ Certificate pinning (optional)

### Encryption at Rest

- ✅ Database encryption (MongoDB Atlas)
- ✅ File storage encryption
- ✅ Sensitive field encryption (passwords, API keys)

**Fields Encrypted:**
- User passwords (bcrypt)
- API keys and tokens
- Personal data (when required)

### Key Management

- ✅ Secrets stored in environment variables
- ✅ Never commit secrets to Git
- ✅ Rotate secrets every 90 days
- ✅ Use AWS Secrets Manager or Vercel KV for secrets

---

## Access Control

### Authentication

- ✅ Microsoft Entra ID (OAuth 2.0)
- ✅ Email/password with bcrypt (12 rounds)
- ✅ JWT tokens (8-hour expiration)
- ✅ httpOnly cookies (prevent XSS)
- ✅ Secure flag (HTTPS only)
- ✅ SameSite=lax (CSRF protection)

### Authorization

- ✅ Role-Based Access Control (RBAC)
- ✅ Four roles: Engineer, Team Lead, Manager, Admin
- ✅ Permissions enforced at API level
- ✅ Resource-level permissions (can user edit this article?)
- ✅ Audit trail (who changed what)

### Session Management

- ✅ Session timeout: 8 hours
- ✅ Inactivity logout: 1 hour
- ✅ "Logout all devices" option
- ✅ Session invalidation on password change
- ✅ Session invalidation on role change

---

## Input Validation & Sanitization

### Server-Side Validation

```typescript
// Validate with Zod
const createArticleSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().max(500),
  content: z.string().min(50),
  application: z.enum(['Drake', 'QBD', 'CCH']),
});

// Validate API input
const result = createArticleSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ errors: result.error });
}
```

### XSS Prevention

- ✅ HTML sanitization (DOMPurify)
- ✅ Escape user input in templates
- ✅ Content Security Policy (CSP) header
- ✅ No inline scripts

### SQL Injection Prevention

- ✅ Parameterized queries (MongoDB + Mongoose)
- ✅ Schema validation
- ✅ No string concatenation in queries

### CSRF Prevention

- ✅ SameSite cookies
- ✅ CSRF token validation on state-changing operations
- ✅ Check Origin/Referer headers

---

## API Security

### Rate Limiting

```
100 requests/minute per authenticated user
20 requests/minute per IP (unauthenticated)
```

**Implementation:**
```typescript
// Use rate-limit middleware
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### API Authentication

- ✅ JWT token validation on all endpoints
- ✅ Bearer token or session cookie
- ✅ Endpoint permission checks (RBAC)

### CORS Configuration

```typescript
// Only allow same-origin or specific domains
const cors = {
  origin: [
    'https://kms.yourdomain.com',
    'https://staging.kms.yourdomain.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

---

## Logging & Monitoring

### Audit Logging

Log all sensitive operations:

```typescript
// Log document changes
const auditLog = new AuditLog({
  user: userId,
  action: 'update',
  resourceType: 'KnowledgeArticle',
  resourceId: articleId,
  changes: {
    title: { old: oldTitle, new: newTitle },
  },
  timestamp: new Date(),
});
await auditLog.save();
```

### Security Monitoring

- ✅ Track failed login attempts
- ✅ Alert on suspicious activity
- ✅ Monitor permission denials
- ✅ Track data exports
- [ ] Implement SIEM (Security Information & Event Management)

### Error Logging

- ✅ Log errors without exposing sensitive data
- ✅ Track API errors
- ✅ Monitor database errors
- ✅ Alert on critical errors (Sentry)

---

## Vulnerability Management

### Dependencies

```bash
# Check for vulnerabilities
npm audit

# Update packages
npm update

# Automated updates
# Use Dependabot on GitHub
```

### Code Review

- ✅ All code changes require review
- ✅ Security-focused review process
- ✅ Automated security scanning (SonarQube, CodeQL)

### Penetration Testing

- [ ] Conduct quarterly penetration tests
- [ ] Test authentication bypasses
- [ ] Test authorization bypasses
- [ ] Test injection vulnerabilities
- [ ] Test CSRF vulnerabilities

---

## Compliance

### GDPR Compliance

- ✅ User consent for data collection
- ✅ Data retention policy (delete after 1 year if not active)
- ✅ Right to access data
- ✅ Right to delete data ("Delete my account")
- ✅ Data processing agreement with third parties

### Data Retention

- ✅ User data: Delete after 1 year of inactivity
- ✅ Search history: Delete after 30 days
- ✅ Notifications: Delete after 30 days (TTL index)
- ✅ Audit logs: Keep for 7 years (compliance)
- ✅ Backups: Retain for 35 days

### User Privacy

- ✅ Privacy policy (visible to users)
- ✅ Terms of service
- ✅ Clear data usage explanation
- ✅ No selling data to third parties
- ✅ HTTPS for all connections

---

## Infrastructure Security

### Database

- ✅ Authentication required (username + password)
- ✅ Network access restricted (IP whitelist)
- ✅ Encryption at rest
- ✅ Encryption in transit
- ✅ Regular backups
- ✅ Automated patching
- ✅ No public access

### Application Server

- ✅ No root access needed
- ✅ Minimal privileges
- ✅ Security headers configured
- ✅ Firewall rules configured
- ✅ DDoS protection enabled
- ✅ Auto-scaling for load spikes

### File Storage

- ✅ Private bucket (not public)
- ✅ File type validation
- ✅ File size limits
- ✅ Virus scanning
- ✅ Encrypted storage

---

## Security Checklist

### Development

- [ ] Use HTTPS in development
- [ ] Use .env.local for secrets
- [ ] Never commit .env files
- [ ] Validate all inputs
- [ ] Escape all outputs
- [ ] Use security headers
- [ ] Test authentication/authorization
- [ ] Log sensitive operations
- [ ] Use secure session management

### Staging

- [ ] Verify HTTPS enabled
- [ ] Verify CORS configured
- [ ] Verify rate limiting enabled
- [ ] Run security scanners
- [ ] Penetration test (basic)
- [ ] Check for hardcoded secrets
- [ ] Review security headers
- [ ] Test with malformed input

### Production

- [ ] All checks from staging
- [ ] Two-factor authentication ready
- [ ] Incident response plan
- [ ] Disaster recovery plan
- [ ] Security contact info updated
- [ ] Insurance/liability checked
- [ ] Legal review complete
- [ ] Penetration test (professional)

---

## Security Response

### Incident Response Plan

**If security breach detected:**

1. **Immediate (0-1 hour)**
   - Alert security team
   - Assess severity
   - Stop bleeding (if applicable)
   - Document timeline

2. **Short-term (1-24 hours)**
   - Investigation (what happened)
   - Impact assessment (what data affected)
   - Root cause analysis
   - Notify affected users (if required)

3. **Medium-term (1-7 days)**
   - Fix the vulnerability
   - Deploy patch
   - Verify fix
   - Post-incident review

4. **Long-term**
   - Monitor for repeat incidents
   - Implement preventative measures
   - Update security practices
   - Update documentation

### Communication

- [ ] Security team
- [ ] Affected users (if required)
- [ ] Legal/Compliance
- [ ] Management
- [ ] External authorities (if required)

---

## Third-Party Security

### Dependencies Security

- ✅ Use npm audit to check vulnerabilities
- ✅ Update regularly
- ✅ Review new dependencies
- ✅ Use security scanning tools

### External Services

- ✅ Microsoft Entra ID (SSO)
- ✅ MongoDB Atlas (database)
- ✅ Vercel (hosting)
- ✅ Sentry (error tracking)
- ✅ UploadThing (file storage)

**Agreements:**
- [ ] Review Terms of Service
- [ ] Review Privacy Policy
- [ ] Ensure compliance (GDPR, etc.)
- [ ] Review data processing agreements

---

## Security Training

### For Developers

- OWASP Top 10
- Secure coding practices
- Authentication & authorization
- Encryption basics
- Social engineering awareness

### For Users

- Password best practices
- Phishing awareness
- Data protection
- Confidentiality

---

## Regular Security Activities

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Dependency audit | Monthly | Dev Lead |
| Code security scan | Per PR | Pipeline |
| Penetration test | Quarterly | Security |
| Vulnerability assessment | Quarterly | Security |
| Security training | Annually | HR/Security |
| Incident review | Per incident | Security |

---

**Document Status:** ✅ Ready for Development
