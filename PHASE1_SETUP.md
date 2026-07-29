# KMS Application - Setup Instructions

## Phase 1 Foundation Setup

This is the complete Next.js 15 project structure for Phase 1 of the KMS implementation.

### Project Structure

```
kms-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   ├── auth/          # Authentication routes
│   │   │   ├── knowledge/     # Knowledge base API
│   │   │   └── tickets/       # Ticket API
│   │   ├── auth/              # Auth pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable React components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   ├── middleware.ts          # Next.js middleware
│   ├── middleware/            # API middleware
│   ├── models/                # Mongoose models (10 collections)
│   ├── services/              # Business logic services
│   ├── store/                 # Zustand state management
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.js         # Tailwind config
├── next.config.js             # Next.js config
├── jest.config.js             # Jest test config
├── .eslintrc.json             # ESLint config
├── .prettierrc                 # Prettier config
├── .env.example               # Environment variables template
└── README.md                  # Project README
```

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

### Phase 1 Deliverables

✅ **Database Models (10 Collections)**
- User
- KnowledgeArticle
- Ticket
- Activity
- Application
- TrackerEntry
- Comment
- SearchHistory
- Notification
- AuditLog

✅ **Authentication**
- NextAuth.js configured
- Email/password login
- JWT session management
- Role-based access control (RBAC)

✅ **API Foundation**
- Knowledge base endpoints (GET, POST, PUT, DELETE)
- Ticket endpoints (GET, POST, PUT)
- Error handling middleware
- Validation using Zod

✅ **Shared Components**
- Button (4 variants, 3 sizes)
- Card (with Header, Content, Footer)
- Input (with validation)
- Badge (5 variants)
- Table (with Head, Body, Row, Cell)

✅ **State Management**
- Zustand for global UI state (theme, sidebar)
- React Query for server state caching
- Custom hooks for data fetching

✅ **Pages & Layouts**
- Login page
- Dashboard page
- Dashboard layout (with sidebar)
- Home page
- Protected route middleware

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run lint         # Run ESLint
npm run test:e2e     # Run E2E tests
```

### Environment Variables Required

```
MONGODB_URI=your-mongodb-connection-string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
AZURE_AD_CLIENT_ID=optional
AZURE_AD_CLIENT_SECRET=optional
AZURE_AD_TENANT_ID=optional
```

### API Endpoints (Phase 1)

**Knowledge Base**
- `GET /api/knowledge` - List articles
- `POST /api/knowledge` - Create article
- `GET /api/knowledge/:id` - Get article
- `PUT /api/knowledge/:id` - Update article
- `DELETE /api/knowledge/:id` - Delete article

**Tickets**
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket
- `PUT /api/tickets/:id` - Update ticket

**Authentication**
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get session

### Next Steps (Phase 2)

After Phase 1 is complete:
1. Implement dashboard with role-specific views
2. Build knowledge base full CRUD UI
3. Create ticket management interface
4. Add global search (Cmd+K)
5. Implement applications catalog

### Testing

```bash
# Unit tests
npm run test

# E2E tests (requires Playwright)
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Documentation

See `/docs` folder in parent directory for:
- ARCHITECTURE.md - System design
- API_SPECIFICATION.md - API documentation
- DATABASE.md - Database schema
- DEVELOPMENT_GUIDE.md - Development standards

### Support

- Check DEVELOPMENT_GUIDE.md for coding standards
- Review DATABASE.md for schema details
- See API_SPECIFICATION.md for endpoint documentation

---

**Phase 1 Status:** ✅ Foundation Complete - Ready for Phase 2 Development
