# KMS Application

Knowledge Management System for application support teams.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your configuration
# - MongoDB URI
# - NextAuth credentials
# - Entra ID OAuth configuration

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Development

```bash
# Start dev server
npm run dev

# Run tests
npm run test
npm run test:watch

# Lint code
npm run lint

# Build for production
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router (pages + API routes)
│   ├── (routes)/           # Dashboard, knowledge, tracker, tickets, etc.
│   ├── api/                # REST API endpoints
│   ├── auth/               # NextAuth / sign-in pages
│   ├── layout.tsx          # Root layout with Material theme providers
│   └── page.tsx            # Home page
├── components/             # Reusable React components (AppLayout, tables, forms)
├── config/                 # App-wide configuration
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities (auth, db, validation, team, errors)
├── middleware.ts           # Next.js middleware + route protection
├── models/                 # Mongoose schemas and model exports
├── services/               # Business logic services
├── store/                  # Zustand / global stores
├── types/                  # Shared TypeScript interfaces
└── middleware/             # API middleware
```

## Architecture

KMS is a full-stack Next.js application with a MongoDB backend and a role-based UI.

### Domains

- **Team Management** — `TeamMember` directory stored in MongoDB, with Team Access credentials managed separately in `User`.
- **Authentication** — NextAuth session-based auth. Roles: `Engineer`, `TeamLead`, `Manager`, `Admin`.
- **Tracker** — Daily work entries linked to tickets, applications and team members.
- **Knowledge Base** — Articles with approval workflow, owner tracking, views and related tickets.
- **Documents & Applications** — Catalogs used across tickets and tracker entries.
- **Analytics & Search** — Activity, search history, ranking and notification data.

### Role-Based Features

- **Engineers** — add tracker entries and knowledge articles, view documents and team members.
- **TeamLeads / Managers / Admins** — manage team members, user credentials, and access levels.

### Key API Endpoints

| Endpoint | Purpose |
| --- | --- |
| `/api/team-members` | CRUD for the team directory; auto-seeds from `lib/team.ts` on first load |
| `/api/team-access` | Create / update / toggle user logins (lead-only) |
| `/api/tracker` | Daily tracker entries; populates `user` for audit columns |
| `/api/knowledge` | Knowledge articles; populates `owner` and `createdAt` |
| `/api/clear-dev-data?confirm=yes` | Lead-only utility to wipe non-essential dev data while keeping `users`, `teammembers`, `applications` and `documentrecords` |

### Database Collections

- **Preserved** — `users`, `teammembers`, `applications`, `documentrecords`
- **Clearable / development** — `trackerentries`, `knowledgearticles`, `tickets`, `comments`, `activities`, `searchhistories`, `notifications`, `auditlogs`, `projects`

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: MongoDB, Mongoose
- **Authentication**: NextAuth.js, Entra ID
- **State**: React Query, Zustand
- **Testing**: Jest, Playwright
- **Deployment**: Vercel, MongoDB Atlas

## Documentation

See `/docs` folder for:
- PLAN.md - Project plan
- ARCHITECTURE.md - System design
- API_SPECIFICATION.md - API endpoints
- DATABASE.md - Database schema
- DEVELOPMENT_GUIDE.md - Development standards

## License

Internal use only
