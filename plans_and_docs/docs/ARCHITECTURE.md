# System Architecture Document

**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-27  

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                      │
│  Next.js 15 (React 19) + TypeScript + Tailwind CSS + shadcn/ui │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    HTTPS / REST
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                   API LAYER (Next.js)                           │
│  ├─ Authentication (NextAuth.js)                               │
│  ├─ Knowledge Base API (/api/knowledge)                        │
│  ├─ Ticket API (/api/tickets)                                  │
│  ├─ Tracker API (/api/activities)                              │
│  ├─ Application API (/api/applications)                        │
│  ├─ Search API (/api/search)                                   │
│  └─ User API (/api/users)                                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌────────────────┬┴────────────────┬───────────────┐
         │                │                 │               │
    MongoDB Atlas    File Storage      Caching           Auth
    (Mongoose)       (UploadThing)      (Redis)          (Entra ID)
         │                │                 │               │
         │                │                 │               │
         │    │           │        │      │  │    │         │  │
```

---

## Architectural Layers

### 1. Presentation Layer (Frontend)

**Technology:** Next.js 15 (React 19) + TypeScript + Tailwind CSS + shadcn/ui

**Responsibilities:**
- Render UI components
- Handle user interactions
- Client-side routing
- Client-side form validation
- API communication
- Error handling and display
- Dark mode support

**Structure:**
```
src/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/
│   │   └── login/
│   ├── (protected)/              # Protected routes (requires auth)
│   │   ├── dashboard/
│   │   ├── knowledge/
│   │   ├── tickets/
│   │   ├── tracker/
│   │   ├── applications/
│   │   ├── profile/
│   │   └── settings/
│   ├── api/                      # API routes (moved to api layer)
│   └── layout.tsx
├── components/
│   ├── shared/                   # Reusable components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SearchBox.tsx
│   │   ├── CommandPalette.tsx
│   │   └── ...
│   ├── dashboard/
│   ├── knowledge/
│   ├── tickets/
│   ├── tracker/
│   ├── applications/
│   ├── profile/
│   └── settings/
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useKnowledge.ts
│   ├── useSearch.ts
│   └── ...
├── lib/                          # Utility functions
│   ├── api-client.ts
│   ├── constants.ts
│   ├── utils.ts
│   └── ...
├── store/                        # Zustand state management
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── ...
├── types/                        # TypeScript types
│   └── index.ts
└── styles/
    └── globals.css
```

---

### 2. API Layer (Backend)

**Technology:** Next.js API Routes + Node.js + Express-like middleware

**Structure:**
```
src/pages/api/
├── auth/
│   ├── [...nextauth].ts         # NextAuth.js handler
│   ├── login.ts
│   └── logout.ts
├── knowledge/
│   ├── index.ts                 # GET (list), POST (create)
│   ├── [id].ts                  # GET (detail), PUT (update), DELETE (archive)
│   ├── search.ts                # GET (full-text search)
│   └── validate-duplicate.ts    # POST (check for duplicates)
├── tickets/
│   ├── index.ts                 # GET (list), POST (create)
│   ├── [id].ts                  # GET (detail), PUT (update)
│   └── link-knowledge.ts        # POST (link KB to ticket)
├── activities/
│   ├── index.ts                 # GET (list), POST (create)
│   └── [id].ts                  # GET (detail), PUT (update)
├── applications/
│   ├── index.ts                 # GET (list), POST (create)
│   └── [id].ts                  # GET (detail), PUT (update)
├── search/
│   ├── global.ts                # GET (cross-module search)
│   └── suggestions.ts           # GET (search suggestions)
├── users/
│   ├── index.ts                 # GET (list)
│   ├── [id].ts                  # GET (profile), PUT (update)
│   ├── [id]/contributions.ts    # GET (user stats)
│   └── [id]/profile.ts          # GET (public profile)
├── middleware/
│   ├── auth.ts                  # Authentication middleware
│   ├── rbac.ts                  # Role-based access control
│   └── error-handler.ts         # Error handling
└── utils/
    ├── db.ts                    # Database connection
    ├── validators.ts            # Input validation
    └── helpers.ts               # Helper functions
```

**API Standards:**
- RESTful design
- JSON request/response
- Consistent error handling
- Request validation with Zod
- Rate limiting (100 requests/minute per user)
- CORS enabled for frontend origin
- Logging of all requests
- Audit trail for data modifications

---

### 3. Business Logic Layer

**Technology:** Mongoose models + Custom services

**Responsibilities:**
- Data validation
- Business rule enforcement
- Data transformation
- Cross-entity operations
- AI integrations (future)

**Structure:**
```
src/services/
├── KnowledgeService.ts          # KB article operations
├── TicketService.ts             # Ticket operations
├── ActivityService.ts           # Work tracking
├── ApplicationService.ts        # Application management
├── SearchService.ts             # Search operations
├── UserService.ts               # User operations
└── NotificationService.ts       # Email/notifications
```

---

### 4. Data Access Layer

**Technology:** MongoDB + Mongoose

**Responsibilities:**
- Database operations (CRUD)
- Query optimization
- Indexing
- Transaction handling (if needed)
- Data consistency

**Structure:**
```
src/models/
├── User.ts
├── KnowledgeArticle.ts
├── Ticket.ts
├── Activity.ts
├── Application.ts
├── Comment.ts
├── Attachment.ts
└── SearchHistory.ts
```

---

## Data Flow Diagrams

### Create Knowledge Article Flow

```
User Form
    │
    ▼
Client Validation (React Hook Form + Zod)
    │ (valid)
    ▼
POST /api/knowledge
    │
    ▼
Authentication Middleware
    │ (authenticated)
    ▼
Authorization Middleware (RBAC)
    │ (engineer role)
    ▼
Input Validation (Zod)
    │ (valid)
    ▼
Duplicate Detection
    │ (if not duplicate)
    ▼
KnowledgeService.create()
    │
    ├─ Generate slug
    ├─ Set timestamps
    ├─ Set owner to current user
    └─ Insert into MongoDB
    │
    ▼
Upload Attachments (if any)
    │
    ▼
Index for search (MongoDB Atlas Search)
    │
    ▼
201 Created Response
    │
    ▼
Update Frontend Cache (React Query)
    │
    ▼
Toast notification
    │
    ▼
Redirect to article page
```

### Search Flow

```
User Types in Search Box
    │
    ▼ (every keystroke with debounce)
GET /api/search/global?q=<query>
    │
    ▼
Authentication Middleware
    │
    ▼
Fuse.js or MongoDB Atlas Search
    │
    ├─ Search KB articles (title, symptoms, tags)
    ├─ Search tickets (ID, title, requester)
    ├─ Search applications (name)
    └─ Search users (name, skills)
    │
    ▼
Rate limit applied
    │
    ▼
Results grouped
    │
    ▼
Cache results (Redis - 5 min TTL)
    │
    ▼
Return JSON
    │
    ▼
Display results with icons and snippets
    │
    ▼
User can navigate with arrow keys
    │
    ▼
User clicks result or presses Enter
    │
    ▼
Redirect to item page
```

### Ticket Resolution Flow

```
Ticket Assigned in ManageEngine
    │
    ▼ (Engineer opens ticket)
Quick Ticket Entry Form
    │
    ├─ Paste ticket ID
    ├─ System fetches from ManageEngine API (or manual entry)
    └─ Populate application, requester, description
    │
    ▼
Global Search Triggered
    │
    ├─ Search for similar issues
    └─ Suggest linked KB articles
    │
    ▼ (if exists)
Link to Existing KB
    │
    ├─ Ticket.knowledgeArticles.push(kbId)
    └─ Save ticket
    │
    ▼ (if not exists)
Create New KB Article
    │
    ├─ Populate with ticket details
    ├─ AI suggests troubleshooting steps (future)
    └─ Engineer completes article
    │
    ▼
Log Work Hours
    │
    POST /api/activities
    │
    ├─ Engineer
    ├─ Hours worked
    ├─ Activity type
    ├─ Ticket ID
    ├─ KB article ID
    └─ Date
    │
    ▼
Mark Ticket as Resolved
    │
    ├─ Update ticket status
    ├─ Add closure summary
    └─ Close ticket
    │
    ▼
Dashboard Updated
    │
    ├─ Knowledge count +1
    ├─ Hours logged +
    ├─ Tickets resolved +1
    └─ Activity feed updated
```

---

## Security Architecture

### Authentication Flow

```
User visits app
    │
    ▼
Middleware checks session
    │ (no session)
    ▼
Redirect to /login
    │
    ▼
User clicks "Sign in with Microsoft"
    │
    ▼
Redirect to Microsoft Entra ID
    │
    ▼
User authenticates with Microsoft
    │
    ▼
Microsoft redirects back with auth code
    │
    ▼
NextAuth exchanges code for tokens
    │
    ▼
Fetch user profile from Microsoft
    │
    ▼
Create or update user in MongoDB
    │
    ▼ (check if user in allowed domain)
    │
    ▼
Set session cookie (httpOnly, secure, sameSite=strict)
    │
    ▼
Redirect to dashboard
```

### Authorization (RBAC) Flow

```
API Request arrives
    │
    ▼
Authenticate User (verify session/JWT)
    │ (if invalid)
    └─ Return 401 Unauthorized
    │
    ▼ (if valid)
Check User Role
    │
    ├─ Engineer?
    ├─ Team Lead?
    ├─ Manager?
    └─ Admin?
    │
    ▼
Check Resource-Level Permissions
    │
    ├─ Owner of this resource?
    ├─ Approved by role?
    └─ In same team?
    │ (if denied)
    └─ Return 403 Forbidden
    │
    ▼ (if allowed)
Proceed with request
```

### Data Protection

- ✅ TLS/SSL for all data in transit (HTTPS)
- ✅ Encryption at rest for sensitive fields (passwords, API keys)
- ✅ Database backups encrypted
- ✅ Environment variables for secrets (never in code)
- ✅ Input sanitization to prevent XSS
- ✅ Parameterized queries to prevent injection
- ✅ Rate limiting to prevent brute force
- ✅ CSRF tokens for state-changing operations
- ✅ Audit logs for compliance

---

## Caching Strategy

### Frontend Caching (React Query)

```
User makes request
    │
    ▼
React Query checks cache
    │ (cache hit & fresh)
    ├─ Return cached data immediately
    │ (cache stale)
    ├─ Return stale data
    ├─ Fetch fresh data in background
    │ (cache miss)
    ├─ Fetch data from server
    │
    ▼
Data stored in cache
    │
    ├─ Stale time: 5 minutes
    ├─ GC time: 10 minutes
    └─ Max size: configurable
```

### Backend Caching (Redis)

```
API Request
    │
    ▼
Check Redis cache
    │ (cache hit)
    ├─ Return cached response (ttl: 5 min)
    │ (cache miss)
    ├─ Query database
    ├─ Store in Redis
    └─ Return response
    │
    ▼
Cache invalidation on writes
    │
    ├─ POST /api/knowledge → invalidate KB cache + search cache
    ├─ PUT /api/knowledge/:id → invalidate this article + search cache
    └─ DELETE /api/knowledge/:id → invalidate KB cache + search cache
```

---

## Scalability Architecture

### Horizontal Scaling

**Frontend:**
- Static generation where possible (Next.js SSG)
- CDN for static assets (Vercel, Cloudflare)
- Client-side rendering for interactive components
- Lazy loading for large lists

**Backend:**
- Stateless API (can run multiple instances)
- Load balancer (Vercel handles automatically)
- Database connection pooling
- Queue for background jobs (future)

**Database:**
- MongoDB Atlas auto-scaling
- Indexes on frequently queried fields
- Sharding strategy (if data grows beyond 100GB)
- Read replicas for heavy read operations

### Data Optimization

**Pagination:**
- List endpoints paginate: 20 items/page default, max 100
- Cursor-based pagination for better performance

**Lazy Loading:**
- Load KB article details on demand
- Load comments on scroll
- Load attachment content on click

**Indexing:**
```javascript
KnowledgeArticle.index({ title: 'text', symptoms: 'text' });
KnowledgeArticle.index({ application: 1, status: 1 });
KnowledgeArticle.index({ owner: 1, createdAt: -1 });
Ticket.index({ ticketId: 1 });
Activity.index({ engineer: 1, createdAt: -1 });
```

---

## Deployment Architecture

```
Developer Push
    │
    ▼
GitHub Commit
    │
    ▼
GitHub Actions CI/CD
    │
    ├─ Run Tests
    ├─ Run Linter (ESLint)
    ├─ Run Type Check (TypeScript)
    ├─ Build Application
    └─ Build Docker Image (optional)
    │
    ▼ (if passed)
Deploy to Vercel
    │
    ├─ Deploy frontend
    ├─ Deploy API routes
    ├─ Run migrations (if DB schema changed)
    └─ Update environment variables
    │
    ▼
Smoke Tests
    │
    ├─ Test login
    ├─ Test dashboard
    ├─ Test search
    └─ Check API health
    │
    ▼ (if passed)
Release to Production
    │
    ▼
Monitor application
    │
    ├─ Error logging (Sentry)
    ├─ Performance monitoring (Vercel Analytics)
    ├─ Log aggregation (Vercel Logs)
    └─ Alert on errors
```

---

## Infrastructure Requirements

### Development Environment
- Node.js 20+ (LTS)
- MongoDB local instance or MongoDB Atlas cluster
- Redis (local or Atlas cache)
- Environment variables (.env.local)

### Staging Environment
- Vercel staging deployment
- MongoDB Atlas staging database
- Redis for caching
- Test data with sample articles/tickets

### Production Environment
- Vercel production deployment
- MongoDB Atlas production database (auto-backup enabled)
- Redis for caching
- CDN for static assets
- Uptime monitoring
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)

---

## High Availability & Disaster Recovery

### Backup Strategy
- MongoDB automatic backups (daily)
- Backup retention: 35 days
- One-click restore capability
- Test restore quarterly

### Monitoring & Alerts
- Health check endpoint: `GET /api/health`
- Alert on:
  - API response time > 5 seconds
  - Error rate > 5%
  - Database connection loss
  - Out of memory
  - Disk space low

### Incident Response
- On-call rotation (team lead)
- Incident severity levels (Critical/High/Medium/Low)
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): <1 hour

---

**Document Status:** ✅ Ready for Development
