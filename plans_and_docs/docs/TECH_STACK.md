# Technology Stack & Framework Decisions

**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-27  

---

## Frontend Stack

### Core Framework

| Technology | Version | Purpose | Why This Choice |
|-----------|---------|---------|-----------------|
| **Next.js** | 15 | React meta-framework | App Router, API routes, SSR/SSG, Vercel deployment |
| **React** | 19 | UI library | Server components, improved performance |
| **TypeScript** | 5 | Type safety | Catch bugs at compile time, better IDE support |
| **Node.js** | 20+ LTS | Runtime | Stable, good support, widely used |

### UI & Styling

| Technology | Version | Purpose | Why This Choice |
|-----------|---------|---------|-----------------|
| **Tailwind CSS** | 3 | Utility-first CSS | Fast development, consistent design, responsive |
| **shadcn/ui** | Latest | Component library | Headless, customizable, built on Radix UI |
| **Radix UI** | - | Headless components | Accessibility, unstyled, full control |
| **Class Variance Authority** | - | Component variants | Type-safe CSS class management |

### State Management

| Technology | Version | Purpose | Why This Choice |
|-----------|---------|---------|-----------------|
| **React Query (TanStack Query)** | 5 | Server state | Caching, synchronization, background updates |
| **Zustand** | 4 | Client state | Lightweight, easy to use, minimal boilerplate |
| **Context API** | - | Theme/Auth context | Built-in React feature for global state |

### Forms & Validation

| Technology | Version | Purpose | Why This Choice |
|-----------|---------|---------|-----------------|
| **React Hook Form** | 7 | Form state | Performance, minimal re-renders, small bundle |
| **Zod** | 3 | Schema validation | Type-safe, frontend + backend validation |
| **TypeScript** | - | Type validation | Type safety at compile time |

### Utilities

| Technology | Version | Purpose | Why This Choice |
|-----------|---------|---------|-----------------|
| **Fuse.js** | 7 | Client-side search | Fuzzy search, lightweight, no dependencies |
| **date-fns** | 3 | Date handling | Tree-shakeable, modular, modern |
| **clsx** | 2 | Conditional classes | Tiny, performant className management |
| **Recharts** | 2 | Charts & graphs | React components, responsive, rich docs |

---

## Backend Stack

### Core Framework

| Technology | Version | Purpose | Why This Choice |
|-----------|---------|---------|-----------------|
| **Next.js API Routes** | 15 | Backend API | Collocated with frontend, minimal setup |
| **Node.js** | 20+ LTS | Runtime | Async-first, good package ecosystem |

### Authentication

| Technology | Version | Purpose | Why This Choice |
|-----------|---------|---------|-----------------|
| **NextAuth.js** | 5 | Authentication | Built for Next.js, OAuth/OIDC support |
| **Microsoft Entra ID** | - | OAuth provider | Enterprise SSO, our standard |
| **bcrypt** | Latest | Password hashing | Industry standard, slow by design |

### Database

| Technology | Version | Purpose | Why This Choice |
|-----------|---------|---------|-----------------|
| **MongoDB** | 6+ | Document database | Flexible schema, good for MVP, Atlas cloud |
| **Mongoose** | 8 | ODM | Schema validation, middleware, relations |
| **MongoDB Atlas** | - | Cloud host | Auto-backup, auto-scaling, easy monitoring |

### Search

| Technology | Version | Purpose | Why This Choice |
|-----------|---------|---------|-----------------|
| **MongoDB Atlas Search** | - | Full-text search | Built-in, indexed search, FTS scoring |
| **Fuse.js** | 7 | Client search | Fallback, local search without server load |

### Caching

| Technology | Version | Purpose | Why This Choice |
|-----------|---------|---------|-----------------|
| **Redis** | 7+ | Cache store | Fast, in-memory, good for sessions |
| **Vercel KV** | - | Redis hosting | Serverless Redis, no management |

### File Storage

| Technology | Version | Purpose | Why This Choice |
|-----------|---------|---------|-----------------|
| **UploadThing** | Latest | File uploads | Serverless, type-safe, handles resizing |
| **Cloudinary** | Alternative | Cloud storage | Images, videos, transformations |
| **Vercel Blob** | Alternative | Blob storage | Serverless, low latency |

### Monitoring & Logging

| Technology | Version | Purpose | Why This Choice |
|-----------|---------|---------|-----------------|
| **Sentry** | Latest | Error tracking | Captures exceptions, tracks sessions |
| **Vercel Analytics** | - | Performance monitoring | Built-in, real user metrics |
| **Winston** | 3 | Logging | Structured logging, multiple transports |

---

## Development Tools

### Build & Compilation

| Tool | Version | Purpose |
|------|---------|---------|
| **Turbopack** | - | Next.js bundler (faster build) |
| **TypeScript Compiler** | 5 | Type checking |
| **ESLint** | 8 | Code linting |
| **Prettier** | 3 | Code formatting |

### Testing

| Tool | Version | Purpose |
|------|---------|---------|
| **Jest** | 29 | Unit test framework |
| **React Testing Library** | 14 | React component testing |
| **Playwright** | Latest | E2E testing |
| **MSW (Mock Service Worker)** | 2 | API mocking |

### Git & Version Control

| Tool | Version | Purpose |
|------|---------|---------|
| **GitHub** | - | Code repository, CI/CD |
| **Husky** | 8 | Git hooks (pre-commit linting) |
| **lint-staged** | Latest | Run linters on staged files |
| **Conventional Commits** | - | Standard commit format |

### Development Environment

| Tool | Version | Purpose |
|------|---------|---------|
| **VS Code** | Latest | Code editor |
| **MongoDB Compass** | Latest | MongoDB GUI |
| **Postman/Insomnia** | Latest | API testing |
| **Docker** | Latest | Local containerization (optional) |

---

## Deployment & Hosting

### Frontend Hosting

| Service | Purpose | Why This Choice |
|---------|---------|-----------------|
| **Vercel** | Deploy & host | Built for Next.js, auto-scaling, CDN |
| **Cloudflare** | CDN | Global content delivery, caching rules |

### Database Hosting

| Service | Purpose | Why This Choice |
|---------|---------|-----------------|
| **MongoDB Atlas** | Cloud database | Managed MongoDB, auto-backup, scaling |

### Caching

| Service | Purpose | Why This Choice |
|---------|---------|-----------------|
| **Vercel KV** | Redis caching | Serverless Redis, no management |

### CI/CD

| Service | Purpose | Why This Choice |
|---------|---------|-----------------|
| **GitHub Actions** | Automation | Free, integrated with GitHub, flexible |

---

## Package Management

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "^15.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "@radix-ui/react-*": "latest",
    "next-auth": "^5.0.0",
    "mongoose": "^8.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "fuse.js": "^7.0.0",
    "date-fns": "^3.0.0",
    "clsx": "^2.0.0",
    "recharts": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "latest",
    "@types/node": "latest",
    "@types/mongoose": "latest",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "latest",
    "@playwright/test": "latest",
    "husky": "^8.0.0",
    "lint-staged": "latest"
  }
}
```

---

## Environment Variables

### Frontend (.env.local)

```bash
# Application
NEXT_PUBLIC_APP_NAME=KMS
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Microsoft Entra ID
NEXTAUTH_MICROSOFT_ID=xxx
NEXTAUTH_MICROSOFT_SECRET=xxx

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# File Upload
NEXT_PUBLIC_UPLOADTHING_TOKEN=xxx

# Analytics (Sentry)
NEXT_PUBLIC_SENTRY_DSN=xxx
```

### Backend (.env)

```bash
# Application
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/kms-prod

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Microsoft Entra ID
MICROSOFT_CLIENT_ID=xxx
MICROSOFT_CLIENT_SECRET=xxx

# JWT
JWT_SECRET=your-jwt-secret

# File Storage
UPLOADTHING_SECRET=xxx
UPLOADTHING_APP_ID=xxx

# Caching (Redis)
REDIS_URL=redis://localhost:6379

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx

# Monitoring
SENTRY_DSN=xxx
```

---

## Version Control Strategy

### Git Workflow

```
main (production)
  ↓
staging (pre-production testing)
  ↓
develop (integration branch)
  ↓
feature/* (feature development)
bug/* (bug fixes)
chore/* (maintenance)
```

### Commit Convention

```
feat(knowledge): add duplicate detection
^--^  ^--------^  ^-------------------^
│     │          └─ Subject (imperative, no period)
│     └─ Scope (module/feature)
└─ Type (feat, fix, docs, style, refactor, test, chore)
```

### Branch Naming

```
feature/kb-create-article
feature/tracker-daily-entry
bug/search-results-empty
chore/update-dependencies
```

---

## Build & Performance Optimization

### Next.js Configuration

```javascript
// next.config.js
export default {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-*',
      'recharts',
      'date-fns'
    ],
  },

  // Compression
  compress: true,

  // React strict mode
  reactStrictMode: true,

  // Security headers
  headers: [
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },
  ],
};
```

### Tailwind Configuration

```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultConfig'

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      colors: {
        brand: {
          50: '#f0f7ff',
          500: '#2563eb',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config
```

---

## Dependency Management

### Update Strategy
- Minor/patch updates: Auto-merge with CI passing
- Major updates: Review breaking changes, test manually
- Security updates: Immediate patch
- Audit: Run `npm audit` weekly

### Bundle Size Targets
- Main JS bundle: < 300KB (gzipped)
- CSS: < 50KB (gzipped)
- Total: < 400KB (gzipped)

---

## Rationale Summary

**Why Next.js 15?**
- App Router for modern file-based routing
- API Routes eliminate separate backend
- Server Components for better performance
- Built-in image optimization
- Vercel integration

**Why React Query + Zustand?**
- Server state (React Query) + client state (Zustand) separation
- Better than Redux for this use case
- Less boilerplate
- Excellent caching strategy

**Why Mongoose?**
- Schema validation
- Middleware (pre/post hooks)
- Query helpers
- Population (joins)

**Why Tailwind + shadcn/ui?**
- Faster development
- Consistent design
- Easy customization
- Accessibility built-in
- Dark mode support

---

**Document Status:** ✅ Ready for Development
