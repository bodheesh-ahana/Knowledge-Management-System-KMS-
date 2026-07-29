# Internal Application Support Knowledge Management System (KMS)

**Version:** v1.0

## Project Vision

Develop an internal web application that centralizes application support knowledge, ticket history, troubleshooting procedures, engineer effort tracking, and application documentation.

The platform reduces dependency on individual engineers by converting every resolved issue into searchable organizational knowledge.

**Core problem being solved:** Knowledge is inside engineers' heads. If a senior engineer is unavailable, nobody knows how to resolve recurring issues. This is a Knowledge Base problem (like ServiceNow Knowledge, Confluence, Freshservice KB), not a ticketing problem.

The application is **not** intended to replace ManageEngine. It complements it by providing:

- Knowledge Repository
- Internal Resolution Database
- Team Effort Tracking (replaces the Excel tracker)
- Application Documentation
- Searchable Troubleshooting
- Analytics
- AI Assisted Knowledge Creation (Future)

## Core Principle

Every ticket should generate reusable knowledge.

```
Ticket Closed → Engineer adds internal notes → Knowledge Article generated → Searchable forever
```

Don't store only Ticket IDs — create **Issue Templates / Knowledge Articles** that many tickets can point to (e.g. `KA-0042: Drake Icons Missing` linked to tickets 215823, 217166, 212881).

## Technology Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod, TanStack Query
- **Backend:** Next.js API Routes
- **Database:** MongoDB (Mongoose)
- **Auth:** NextAuth/Auth.js, RBAC (Admin, Team Lead, Engineer, Read Only)
- **Storage:** Azure Blob Storage (prod) / Local Storage (dev)
- **Future integrations:** ManageEngine API, Microsoft Teams, Outlook, OpenAI, Azure AD

## Application Modules

1. **Dashboard** — Open Tickets, Closed Today, Pending Knowledge Articles, Knowledge Articles Created, Applications Supported, Engineers Online, Avg Resolution Time, Knowledge Reuse Count, charts (Top Applications, Most Frequent Issues, Tickets by Engineer, Knowledge Growth, Daily Tickets), Recent Activity Feed, Quick Search.
2. **Knowledge Base** — Title, Application, Category, Symptoms, Root Cause, Troubleshooting steps, Resolution, Prevention, Owner, Reviewer, Tags, Related Tickets, Status (Draft/Under Review/Approved/Archived), Version Control.
3. **Ticket Repository** — Ticket ID, ManageEngine Link, Requester, Owner, Contributors, Application, Category, Priority, Status, Created/Closed dates, Summary, Knowledge Article link, Resolution Time, SLA, Ticket Timeline.
4. **Internal Tracker** (replaces Excel) — Engineer(s), Ticket ID, Role (Owner/Contributor), Date, Work Description, Hours Spent, Work Type, SLA Breach Status, SLA Breach Reason, Escalation Status. Auto-calculates Engineer Hours, Productive Hours, Documentation Time, Knowledge Contribution.
5. **Applications** — Per-application page: Description, Owner, Servers, Installation Guide, Known Issues, KB Articles, Common Errors, FAQs, Version History, Documents, Contacts, Attachments.
6. **Search Engine** — Google-like instant search across Title, Issue, Symptoms, Resolution, Application, Tags, Owner, Ticket, Server, Commands, Logs, Attachments. Smart filters: Application, Priority, Engineer, Date, Category, Tags, Status.
7. **Documents** — PDF, SOP, KT, Runbooks, Architecture, Videos, Meeting Notes, Server Documents.
8. **Team Management** — Users, Skills, Applications Known, Experience, Knowledge Score, Articles Written, Engineer Profile (Resolved Tickets, Articles Created, Hours Logged, Applications Supported, Reviewer Rating).
9. **Analytics** — Top Issues, Top Applications, Most Active Engineers, Knowledge Growth, Repeated Issues, Avg Resolution Time, Knowledge Reuse, Most Viewed Articles.
10. **Notifications** — Knowledge Review Pending, Article Approved, Ticket Linked, Comment Added, Mentioned.

## UI Design Principles

**Golden Rule:** Maximum 3 minutes to document one issue. The engineer should never feel they are doing duplicate work.

- **Quick Create Screen:** Ticket ID, Application, Issue Title, Root Cause, Resolution, Owner, Save. Everything else optional.
- **Progressive Form:** Basic Info → Save → Later edit Symptoms/Steps/Attachments/Lessons Learned.
- **Templates:** Selecting an application (e.g. Drake) auto-shows known fields/checkboxes instead of free typing.
- **Auto Suggestions:** Typing "QBD Corrupted" suggests known troubleshooting steps.
- **Smart Auto Fill:** Typing an application auto-fills Category, Known Server, Known Tags.
- **Duplicate Detection:** Before creating an article, search for similar issues and offer to reuse an existing article.
- **Smart Resolution Capture (recommended):** Engineer pastes the raw ManageEngine resolution/conversation text; the app auto-extracts Issue, Root Cause, Troubleshooting Steps, Resolution, Tags, Application, Keywords. Engineer only reviews and clicks Save. Reduces documentation time from 5–10 minutes to under 1 minute.

## Article Creation Workflow

```
Ticket Closed → Open App → Paste Ticket ID → Select Application → Enter Root Cause
→ Select Troubleshooting Steps → Add Resolution → Save   (Target: < 2 minutes)
```

## UX Features

Dark/Light Mode, Keyboard Shortcuts, Global Search, Auto Save, Recent Entries, Pinned Applications, Favorites, Drafts, Offline Draft, Mobile Responsive, Attachments (Images/Videos/PDF/Logs/ZIP/Screenshots), in-article Comments, Review Workflow (Engineer creates → Reviewer approves → Published).

## AI Features (Phase 2/3)

- **AI Extraction:** Upload/paste ticket text → AI extracts Issue, Symptoms, Root Cause, Resolution, Tags → generates Knowledge Article draft.
- **AI Search:** Natural language query ("Drake login") → possible cause, suggested solution, similar tickets.
- **AI Chat:** "How do I resolve QBD corruption?" → returns Knowledge Article + Related Tickets + Troubleshooting.

## Database Collections

Users, Applications, Tickets, Knowledge Articles, Tracker, Attachments, Comments, Notifications, Tags, Roles, Activity Logs, Audit Logs, Templates, Saved Filters, Favorites.

### Key Collection Fields

**Users:** `_id, name, email, role, team, skills, applicationsKnown`
**Applications:** `_id, name, vendor, version, server, owner`
**Tickets:** `_id, ticketNumber, title, description, application, owner, contributors, status, priority, createdDate, closedDate, knowledgeArticle, manageEngineURL`
**Knowledge Articles:** `_id, title, issueType, symptoms, rootCause, troubleshooting[], resolution, prevention, applications[], relatedTickets[], owner, approvedBy, attachments, tags, views, likes, updatedAt`
**Tracker (Activities):** `ticket, engineer(s), role (Owner/Contributor), hours, workDone, workType, date, slaBreach, slaBreachReason, escalationStatus` — this directly replaces the Excel tracker columns: *Sl.No, Team Member, Ticket ID, Role, Date, Work Done, Time Spent (hours), SLA Breach status, SLA Breach Reason, Escalation Status*.
**Comments:** `ticket, user, message, date`
**Attachments:** `ticket, filename, url, uploadedBy`

## User Roles

- **Admin** — approve articles, manage users
- **Application Lead** — approve KB
- **Engineer** — create articles, update tickets
- **Reviewer** — approve solutions
- **Read Only** — search only

## Security

RBAC, Audit Logs, Version History, Soft Delete, Encrypted Credentials, Daily Backup.

## Deployment

- **Development:** Next.js + MongoDB Local
- **Testing:** Azure VM
- **Production:** Azure App Service + MongoDB Atlas + Azure Blob Storage + Custom Domain + HTTPS

## Future Roadmap

**Phase 1:** Knowledge Base, Tracker, Search, Dashboard, Applications, Users
**Phase 2:** ManageEngine Integration, Teams Notifications, Email Notifications, Approval Workflow
**Phase 3:** AI Knowledge Assistant, Voice Search, Ticket Auto-Classification, Knowledge Recommendation, AI Generated Articles

## Future ManageEngine Integration

- Pull ticket details via ManageEngine API (ticket ID, requester, status, priority)
- Let engineers enrich tickets internally with troubleshooting notes/knowledge articles
- Sync closure summaries back to ManageEngine if required
- Auto-link recurring tickets to existing knowledge articles

This avoids duplicate data entry while keeping internal knowledge independent of ManageEngine permissions.
