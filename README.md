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
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── auth/              # Auth pages
│   ├── dashboard/         # Dashboard pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── middleware.ts          # Next.js middleware
├── models/                # Mongoose models
├── services/              # Business logic services
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
└── middleware/            # API middleware
```

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
