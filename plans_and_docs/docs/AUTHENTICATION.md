# Authentication & Authorization (RBAC) Guide

**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-27  

---

## Authentication Overview

### Authentication Method

**Primary:** Microsoft Entra ID (OAuth 2.0)  
**Fallback:** Email + Password (bcrypt hashed)  
**Session:** JWT token (httpOnly cookie) + Server session  

---

## Authentication Flow

### 1. Microsoft OAuth Login Flow

```
User clicks "Sign in with Microsoft"
    ↓
Frontend redirects to /api/auth/signin/microsoft
    ↓
NextAuth initiates OAuth with Microsoft Entra ID
    ↓
Microsoft Entra ID login page
    ↓
User authenticates
    ↓
Microsoft redirects to /api/auth/callback/microsoft?code=xxx
    ↓
Backend exchanges code for tokens
    ↓
Fetch user profile from Microsoft Graph
    ↓
Check if user exists in MongoDB
    ├─ YES: Update lastLogin timestamp
    ├─ NO: Create new user (if domain allowed)
    ↓
Check if user is in allowed AD groups
    ├─ YES: Detect role from AD groups
    ├─ NO: Return 403 Forbidden
    ↓
Create session (JWT + httpOnly cookie)
    ↓
Redirect to /dashboard
    ↓
Frontend loads dashboard with authenticated session
```

### 2. Email/Password Login Flow

```
User enters email and password
    ↓
POST /api/auth/login
    ├─ Email exists in database?
    │   ├─ NO: Return 404 Not Found
    │   ├─ YES: Continue
    ├─ Password correct?
    │   ├─ NO: Increment failed attempts
    │   ├─ YES: Reset failed attempts
    ├─ Account active?
    │   ├─ NO: Return 403 Forbidden
    │   ├─ YES: Continue
    ↓
Create session (JWT + httpOnly cookie)
    ↓
Update lastLogin timestamp
    ↓
Return 200 OK with user data
    ↓
Frontend redirects to /dashboard
```

### 3. Session Management

**Session Storage:**
- Backend: MongoDB (sessions collection)
- Client: httpOnly secure cookie

**Session Duration:**
- Active session: 8 hours
- Remember me: 30 days
- Inactivity timeout: 1 hour

**Session Validation:**
Every API request validates session:
1. Extract JWT from cookie
2. Verify JWT signature
3. Check if token expired
4. Verify user still exists in DB
5. Verify user still active
6. Allow or deny request

---

## Authorization (RBAC)

### Role Hierarchy

```
Admin
├── Full access to all features
├── Can manage users
├── Can approve/reject any article
├── Can view all reports
└── Can access system settings

Team Lead
├── Can create knowledge articles
├── Can review/approve articles
├── Can view team performance
├── Can log activities
└── Can access own profile

Engineer
├── Can create knowledge articles (draft)
├── Cannot approve articles (must be reviewed)
├── Can log activities (own only)
├── Can view dashboard
├── Can search and view articles
└── Can link articles to tickets

Manager
├── Read-only access to dashboards
├── Can view team analytics
├── Can generate reports
├── Can view applications
└── Cannot modify any content
```

### Permission Matrix

| Module | Engineer | Team Lead | Manager | Admin |
|--------|----------|-----------|---------|-------|
| **Dashboard** | View Own | View All | View All | View All |
| **Knowledge Base** | Create (Draft) | Create + Review | View | Full |
| **Tickets** | Link KB | Link KB | View | Full |
| **Tracker** | Own Entries | Team Entries | Reports | Full |
| **Applications** | View | View | View | Manage |
| **Users** | View Profile | View Team | View Team | Manage |
| **Settings** | Own | Own | Own | System |
| **Analytics** | N/A | Team | Team + Exec | Full |

---

## Implementation: NextAuth.js v5

### Configuration

**File:** `src/auth/authOptions.ts`

```typescript
import { type NextAuthOptions } from 'next-auth';
import MicrosoftEntraIDProvider from 'next-auth/providers/microsoft-entra-id';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    // Microsoft Entra ID OAuth
    MicrosoftEntraIDProvider({
      clientId: process.env.NEXTAUTH_MICROSOFT_ID!,
      clientSecret: process.env.NEXTAUTH_MICROSOFT_SECRET!,
      tenant: 'common',
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
    }),

    // Email/Password
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          throw new Error('User not found');
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  // Callbacks
  callbacks: {
    async signIn({ user, account }) {
      await connectDB();
      
      // For OAuth, check if user exists
      if (account?.provider === 'microsoft') {
        let dbUser = await User.findOne({ email: user.email });
        
        if (!dbUser) {
          // Check if domain is allowed
          const allowedDomains = ['yourdomain.com', 'mytaxfiler.com'];
          const domain = user.email?.split('@')[1];
          
          if (!allowedDomains.includes(domain!)) {
            return false;
          }
          
          // Create new user
          dbUser = await User.create({
            email: user.email,
            name: user.name,
            avatar: user.image,
            role: 'Engineer', // Default role
            status: 'Active',
          });
        }
        
        // Update last login
        await User.findByIdAndUpdate(dbUser._id, {
          lastLogin: new Date(),
        });
      }
      
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      
      return session;
    },
  },

  // Pages
  pages: {
    signIn: '/login',
    error: '/login?error=true',
    signOut: '/login',
  },

  // Session
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 24 * 60 * 60, // Update every day
  },

  // Cookies
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
    },
  },

  // Events
  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user?.email}`);
    },
    async signOut() {
      console.log('User signed out');
    },
  },

  // Debug (disable in production)
  debug: process.env.NODE_ENV === 'development',
};
```

---

## Middleware Authentication

**File:** `src/middleware.ts`

```typescript
import { withAuth } from 'next-auth/middleware';
import { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/knowledge',
  '/tickets',
  '/tracker',
  '/applications',
  '/profile',
  '/settings',
  '/api/knowledge',
  '/api/tickets',
  '/api/activities',
  '/api/applications',
];

export const middleware = withAuth(
  function onSuccess(req: NextRequest) {
    // Auth successful, continue
    return;
  },
  {
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: protectedRoutes,
};
```

---

## Role-Based Access Control (RBAC) Middleware

**File:** `src/middleware/rbac.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function withRBAC(
  req: NextRequest,
  requiredRoles: string[]
) {
  const token = await getToken({ req });
  
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  if (!requiredRoles.includes(token.role as string)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  return NextResponse.next();
}
```

**Usage in API Routes:**

```typescript
import { withRBAC } from '@/middleware/rbac';

export async function POST(req: NextRequest) {
  // Only Team Leads and Admins can approve
  const rbacResponse = await withRBAC(req, ['TeamLead', 'Admin']);
  if (rbacResponse) return rbacResponse;
  
  // Handle POST request
}
```

---

## Protected Routes

### Frontend Route Protection

**File:** `src/app/(protected)/layout.tsx`

```typescript
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return <>{children}</>;
}
```

---

## Permission Helpers

**File:** `src/lib/permissions.ts`

```typescript
import { Session } from 'next-auth';

export const hasRole = (
  session: Session | null,
  roles: string[]
): boolean => {
  return session?.user?.role ? roles.includes(session.user.role) : false;
};

export const isAdmin = (session: Session | null): boolean => {
  return hasRole(session, ['Admin']);
};

export const isTeamLead = (session: Session | null): boolean => {
  return hasRole(session, ['TeamLead', 'Admin']);
};

export const isEngineer = (session: Session | null): boolean => {
  return hasRole(session, ['Engineer', 'TeamLead', 'Admin']);
};

export const canCreateArticle = (session: Session | null): boolean => {
  return isEngineer(session);
};

export const canReviewArticle = (session: Session | null): boolean => {
  return isTeamLead(session);
};

export const canDeleteUser = (session: Session | null): boolean => {
  return isAdmin(session);
};
```

---

## Resource-Level Permissions

Sometimes you need to check if a user can perform an action on a specific resource (not just their role).

```typescript
// Can user edit this article?
export const canEditArticle = (
  article: IArticle,
  userId: string,
  userRole: string
): boolean => {
  if (userRole === 'Admin') return true;
  if (article.owner.toString() === userId) return true;
  if (userRole === 'TeamLead' && article.status === 'UnderReview') return true;
  return false;
};

// Can user approve this article?
export const canApproveArticle = (
  article: IArticle,
  userRole: string
): boolean => {
  if (userRole !== 'TeamLead' && userRole !== 'Admin') return false;
  if (article.status !== 'UnderReview') return false;
  return true;
};
```

---

## Security Best Practices

### Password Security
- ✅ Hash passwords with bcrypt (salt rounds: 12)
- ✅ Require minimum 8 characters
- ✅ Enforce strong passwords (uppercase, lowercase, numbers, symbols)
- ✅ Rate limit login attempts (3 strikes = 15 min lockout)
- ✅ Require password change every 90 days

### Session Security
- ✅ Use httpOnly cookies (prevent XSS)
- ✅ Use secure flag (HTTPS only)
- ✅ Use sameSite=lax (CSRF protection)
- ✅ Regenerate session on privilege escalation
- ✅ Invalidate all sessions on logout

### Token Security
- ✅ Short expiration (8 hours for JWT)
- ✅ Verify signature on every request
- ✅ Store secret in environment variables
- ✅ Rotate secrets periodically

### CORS & CSRF
- ✅ CORS: Only allow same-origin or whitelist
- ✅ CSRF: Validate state in OAuth callbacks
- ✅ CSRF: SameSite cookies prevent most attacks

### Audit & Monitoring
- ✅ Log all authentication events
- ✅ Log role changes
- ✅ Log permission denials
- ✅ Alert on suspicious activity

---

## Testing Authentication

### Test Case: User Login

```typescript
import { POST } from '@/app/api/auth/login/route';

test('User can login with valid credentials', async () => {
  const req = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'ValidPassword123!',
    }),
  });
  
  const res = await POST(req);
  expect(res.status).toBe(200);
  
  const data = await res.json();
  expect(data.user.email).toBe('user@example.com');
});
```

---

## Troubleshooting

### Session Not Persisting
- Check if cookies are enabled in browser
- Verify httpOnly, secure, sameSite settings
- Check if NextAuth secret is set

### OAuth Not Working
- Verify client ID and secret
- Check if redirect URI is registered in Microsoft Entra ID
- Verify allowed domains

### Role Not Updating
- Clear session cache
- Verify JWT payload
- Check if role changed in database

---

**Document Status:** ✅ Ready for Development
