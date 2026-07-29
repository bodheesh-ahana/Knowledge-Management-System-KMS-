# Authentication Implementation Guide

## Overview

This document explains the complete authentication system for the KMS application using Next.js, NextAuth.js, MongoDB, and bcryptjs.

---

## Architecture

### Components

1. **NextAuth.js v5**: Authentication middleware and session management
   - JWT-based sessions
   - CredentialsProvider for email/password authentication
   - Role-based access control

2. **bcryptjs**: Password hashing and verification
   - 12-round salting for security
   - Password comparison during login

3. **MongoDB + Mongoose**: User data persistence
   - User schema with email, name, password, role, and metadata
   - Unique email index for fast lookups

4. **Middleware**: Route protection
   - `/dashboard/*`
   - `/knowledge/*`
   - `/tickets/*`
   - `/tracker/*`

---

## Setup

### 1. Environment Variables

Create `.env.local` with:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/kms-dev
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl
```

Generate a strong secret:
```bash
openssl rand -base64 32
```

### 2. Database

MongoDB connection is automatically established on first request via `src/lib/mongodb.ts`.

User schema includes:
- `email`: Unique, required
- `name`: Required
- `password`: Required, hashed with bcrypt, select: false (excluded from default queries)
- `role`: Engineer | TeamLead | Manager | Admin (default: Engineer)
- `avatar`: Optional profile picture URL
- `active`: Boolean (default: true)
- `createdAt`, `updatedAt`: Timestamps

---

## Authentication Flow

### Sign Up

**Endpoint**: `POST /api/auth/signup`

**Request**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "Demo@123",
  "confirmPassword": "Demo@123"
}
```

**Response** (201):
```json
{
  "message": "User created successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "Engineer"
  }
}
```

**Validation**:
- All fields required
- Email format validation
- Password minimum 6 characters
- Passwords must match
- Email must be unique

**Process**:
1. Validate input
2. Check if user exists
3. Hash password with bcryptjs (12 rounds)
4. Create user in MongoDB
5. Return user data (password excluded)

### Sign In

**Process**:
1. User fills email and password on `/auth/login`
2. Form submits to NextAuth.js CredentialsProvider
3. Provider queries MongoDB for user by email
4. Uses bcrypt.compare() to validate password
5. If valid, returns user object with role
6. NextAuth.js creates JWT token
7. Token stored in session cookie
8. User redirected to `/dashboard` or callback URL

**Request**:
```typescript
await signIn('credentials', {
  email: 'user@example.com',
  password: 'Demo@123',
  redirect: false,
});
```

**Authentication Check** (`src/app/api/auth/[...nextauth]/route.ts`):
```typescript
const passwordMatch = await bcrypt.compare(
  credentials.password,
  user.password
);

if (!passwordMatch) {
  throw new Error('Invalid password');
}

return {
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role,
};
```

---

## Testing

### Create Test Users

Run the seed script to populate test users:

```bash
npm run seed
```

This creates 4 test users with password `Demo@123`:

| Email | Role | Password |
|-------|------|----------|
| engineer@kms.com | Engineer | Demo@123 |
| lead@kms.com | TeamLead | Demo@123 |
| manager@kms.com | Manager | Demo@123 |
| admin@kms.com | Admin | Demo@123 |

### Manual Testing

1. **Sign Up**: Visit `http://localhost:3001/auth/signup`
   - Create new account
   - Redirects to login on success

2. **Sign In**: Visit `http://localhost:3001/auth/login`
   - Use credentials from seed or newly created user
   - Redirects to `/dashboard` on success

3. **Protected Routes**: Navigate to `/dashboard`
   - Accessible only when authenticated
   - Redirects to login if not authenticated

---

## Usage in Components

### Check Authentication Status

```typescript
'use client';

import { useSession } from 'next-auth/react';

export function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return <p>Not authenticated</p>;
  }

  return (
    <div>
      <p>Welcome, {session?.user?.name}</p>
      <p>Role: {(session?.user as any)?.role}</p>
    </div>
  );
}
```

### Sign Out

```typescript
import { signOut } from 'next-auth/react';

export function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: '/auth/login' })}>
      Logout
    </button>
  );
}
```

### Server-Side Authentication Check

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function MyServerComponent() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p>Not authenticated</p>;
  }

  return <p>Welcome, {session.user?.name}</p>;
}
```

---

## Security Considerations

### Password Storage
- ✅ Passwords hashed with bcryptjs (12 rounds)
- ✅ Never stored or logged in plain text
- ✅ `select: false` on password field in queries

### Session Security
- ✅ JWT tokens with 8-hour expiration
- ✅ NEXTAUTH_SECRET required for token signing
- ✅ HTTP-only cookies (set by NextAuth.js)

### Route Protection
- ✅ Middleware redirects unauthenticated users
- ✅ Server-side session validation
- ✅ Role-based access control ready

### HTTPS in Production
- ⚠️ Always use HTTPS in production
- ⚠️ Update NEXTAUTH_URL to https://yourdomain.com
- ⚠️ Set NEXTAUTH_COOKIE_SECURE=true

---

## File Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx         # Login form
│   │   └── signup/
│   │       └── page.tsx         # Signup form
│   └── api/
│       └── auth/
│           ├── signup/
│           │   └── route.ts     # Signup API
│           └── [...nextauth]/
│               └── route.ts     # NextAuth config
├── lib/
│   └── mongodb.ts               # DB connection
├── models/
│   ├── User.ts                  # User schema
│   └── index.ts                 # Model exports
└── types/
    └── index.ts                 # TypeScript types
```

---

## Troubleshooting

### "User not found" on login
- Verify email exists in database
- Check spelling and case sensitivity
- Run seed script to create test users

### "Invalid password" on login
- Ensure password is correct (case-sensitive)
- Note: First-time users need to sign up first
- Demo password is `Demo@123` (case-sensitive)

### Session not persisting
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches application URL
- Clear browser cookies if changed

### Middleware not redirecting
- Verify middleware.ts is in `src/` directory
- Check route patterns in matcher configuration
- Ensure NextAuth session is configured properly

---

## Next Steps

### Phase 2: Advanced Features
1. Email verification
2. Password reset via email
3. Google/GitHub OAuth integration
4. Two-factor authentication
5. Session management dashboard
6. Rate limiting on auth endpoints

### Phase 3: Enterprise
1. LDAP/Active Directory integration
2. SSO (SAML/OpenID)
3. Audit logging for auth events
4. IP-based access controls
5. Device fingerprinting

---

## References

- [NextAuth.js Documentation](https://next-auth.js.org)
- [bcryptjs NPM Package](https://www.npmjs.com/package/bcryptjs)
- [MongoDB Mongoose](https://mongoosejs.com)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication-and-authorization)

---

## Support

For issues or questions:
1. Check console for error messages
2. Review `.env.local` variables
3. Verify MongoDB connection
4. Check middleware configuration
5. Review TypeScript types
