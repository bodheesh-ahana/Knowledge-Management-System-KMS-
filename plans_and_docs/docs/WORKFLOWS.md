# User Workflows & Navigation Flows

**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-27  

---

## Role-Based Workflows

### 1. Engineer Daily Workflow

**Goal:** Resolve ticket efficiently and document for future use

```
Login (Microsoft or Email)
    ↓
Dashboard
    ├─ Option A: Search existing knowledge
    │  ├─ Global search (Ctrl+K) for issue
    │  ├─ Search matches found?
    │  │  ├─ YES → View article → Use solution → Log hours → Close
    │  │  └─ NO  → Continue to Option B
    │  └─
    │
    ├─ Option B: Handle new ticket
    │  ├─ Quick ticket entry
    │  ├─ Paste ManageEngine ticket ID
    │  ├─ System fetches ticket details
    │  ├─ System suggests related KB
    │  ├─ Add root cause and resolution
    │  ├─ Create KB article (or save for later)
    │  ├─ Log work hours
    │  └─ Submit/Save as draft
    │
    └─ Option C: Daily work entry
       ├─ Log time spent today
       ├─ Record activity type
       ├─ Link ticket if applicable
       └─ Submit
```

**Time to Complete:** 10-15 minutes per ticket

---

### 2. Team Lead Review Workflow

**Goal:** Review and approve knowledge articles, manage team performance

```
Login
    ↓
Dashboard (Team Lead view)
    ├─ Pending Reviews
    │  ├─ Articles awaiting approval (count)
    │  ├─ List of pending articles
    │  ├─ Click on article
    │  ├─ Review content, quality, accuracy
    │  ├─ Decision:
    │  │  ├─ Approve → Published immediately
    │  │  ├─ Reject  → Return to author with feedback
    │  │  └─ Request Changes → Return to author with comments
    │  └─
    │
    ├─ Team Performance
    │  ├─ Hours logged (team)
    │  ├─ Articles created (team)
    │  ├─ Tickets resolved (team)
    │  ├─ KPIs dashboard
    │  └─
    │
    └─ My Own Contributions
       ├─ Create/edit articles (like engineer)
       ├─ Daily work entry
       └─ My profile
```

**Time to Complete:** 30 minutes per article review

---

### 3. Manager Analytics Workflow

**Goal:** Monitor team performance and identify bottlenecks

```
Login
    ↓
Executive Dashboard
    ├─ Team Capacity
    │  ├─ Utilization gauge (%)
    │  ├─ Hours logged vs. target
    │  ├─ Individual engineer hours
    │  └─
    │
    ├─ Application Issues
    │  ├─ Top recurring issues (chart)
    │  ├─ Applications by resolution time
    │  ├─ Health status per application
    │  └─
    │
    ├─ Knowledge Growth
    │  ├─ Articles created trend
    │  ├─ Articles reviewed trend
    │  ├─ KB coverage % per application
    │  └─
    │
    ├─ Team Insights
    │  ├─ Top contributor leaderboard
    │  ├─ Average resolution time
    │  ├─ Knowledge reuse rate
    │  └─
    │
    └─ Reports
       ├─ Generate custom report
       ├─ Export to CSV/PDF
       └─ Schedule recurring reports
```

**Time to Complete:** 20 minutes for review

---

### 4. Admin System Management Workflow

**Goal:** Manage users, applications, and system settings

```
Login
    ↓
Admin Dashboard
    ├─ User Management
    │  ├─ View all users
    │  ├─ Manage roles (Engineer → TeamLead)
    │  ├─ Activate/deactivate users
    │  ├─ Reset passwords
    │  └─
    │
    ├─ Application Catalog
    │  ├─ Create new application
    │  ├─ Edit application details
    │  ├─ Assign owners
    │  ├─ Add servers
    │  └─
    │
    ├─ System Settings
    │  ├─ Configure email notifications
    │  ├─ Set system preferences
    │  ├─ Manage backups
    │  ├─ View audit logs
    │  └─
    │
    └─ Analytics
       ├─ System health check
       ├─ Database metrics
       ├─ API performance
       └─ Error tracking
```

---

## Feature-Specific Workflows

### Workflow: Create Knowledge Article from Ticket

```
Engineer resolves ticket in ManageEngine
    ↓
Open KMS dashboard
    ↓
Click "Quick Ticket Entry" or Dashboard button
    ↓
Paste ManageEngine ticket ID (#215823)
    ↓
System fetches ticket details
    ├─ Ticket number
    ├─ Title
    ├─ Description
    ├─ Application (auto-detected)
    └─ Requester name
    ↓
Form pre-populated with ticket info
    ↓
Add troubleshooting steps (auto-drafted by AI)
    ↓
Add resolution
    ↓
Add prevention
    ↓
System suggests related KB articles
    ↓
Review suggestions
    ├─ If match exists → Link instead of create
    └─ If no match → Continue
    ↓
Attach screenshots/files
    ↓
Review article
    ├─ Click "Preview"
    ├─ Check formatting
    └─ Back to edit if needed
    ↓
Publish article
    ├─ Article goes to "Draft" (for engineer)
    ├─ Notification sent to Team Lead
    ├─ Team Lead reviews
    └─ Team Lead approves/rejects
    ↓
If approved: Article published
    ├─ Available in knowledge base
    ├─ Searchable immediately
    └─ Link auto-added to original ticket
    ↓
Log work hours
    ├─ Activity type: "Documentation"
    ├─ Hours spent
    └─ Link KB article
    ↓
Submit
```

**Total Time:** 10-15 minutes

---

### Workflow: Search and Reuse Solution

```
New ticket arrives (same issue as before)
    ↓
Engineer opens KMS
    ↓
Global Search (Ctrl+K)
    ↓
Type issue name: "Drake icons not displaying"
    ↓
Results appear (grouped)
    ├─ Knowledge Articles (5 results)
    ├─ Tickets (3 results)
    ├─ Applications (1 result)
    └─ Users (0 results)
    ↓
Click on matching KB article
    ↓
View full article
    ├─ Read symptoms
    ├─ Review troubleshooting steps
    ├─ See related tickets
    └─ See owner contact info
    ↓
Follow troubleshooting steps
    ├─ Step 1: Check mapped drive
    ├─ Step 2: Verify folder mapping
    ├─ Step 3: Reconnect if needed
    └─ etc.
    ↓
Issue resolved
    ↓
Log hours
    ├─ Activity type: "Investigation"
    ├─ Hours: 0.5
    ├─ Link ticket
    ├─ Link KB article (auto-linked)
    └─ Submit
    ↓
Mark original ticket as resolved
    ↓
Close ticket
    ↓
Dashboard updated
    ├─ KB reuse count +1
    ├─ Hours logged +0.5
    ├─ Tickets resolved +1
    └─ Article views +1
```

**Total Time:** 5-10 minutes (vs. 30+ if reinventing solution)

---

### Workflow: Team Lead Reviews Articles

```
Team Lead logs in
    ↓
Dashboard shows "Pending Reviews: 3"
    ↓
Click "Pending Reviews"
    ↓
List of 3 pending articles
    ├─ "Drake Icons Not Displaying" (created 2 hours ago)
    ├─ "QBD File Corruption Fix" (created 1 day ago)
    └─ "CCH Login Failed" (created 3 days ago)
    ↓
Click on first article
    ↓
Read full article
    ├─ Title: "Drake Icons Not Displaying"
    ├─ Author: "John Doe (Engineer)"
    ├─ Content quality check
    ├─ Accuracy verification
    ├─ Completeness review
    └─ Formatting check
    ↓
Decision
    ├─ Option 1: Approve
    │  ├─ Article immediately published
    │  ├─ Notification sent to author
    │  ├─ Article searchable
    │  └─ Status changed to "Published"
    │
    ├─ Option 2: Reject
    │  ├─ Article moved back to "Draft"
    │  ├─ Author notified with feedback
    │  └─ Author can edit and resubmit
    │
    └─ Option 3: Request Changes
       ├─ Article stays in "Review"
       ├─ Author sees feedback comments
       ├─ Author edits
       └─ Resubmits for re-review
    ↓
Move to next pending article
    ↓
Repeat until all reviewed
```

**Time per Article:** 5-10 minutes

---

### Workflow: Engineer Onboarding with KMS

```
New Engineer joins
    ↓
Day 1: Orientation
    ├─ Account created
    ├─ Email sent with login
    ├─ Dashboard walkthrough
    └─ Search tutorial
    ↓
Day 2-3: Learning
    ├─ Search for common issues
    │  ├─ "Drake setup"
    │  ├─ "QBD password reset"
    │  ├─ "CCH installation"
    │  └─ "Common errors"
    │
    ├─ Read KB articles for each app
    ├─ Understand troubleshooting steps
    └─ Save favorites (optional)
    ↓
Day 4: First ticket
    ├─ Gets assigned ticket from ManageEngine
    ├─ Searches KMS for similar issues
    ├─ Finds related KB article
    ├─ Follows troubleshooting steps
    ├─ Resolves ticket in 30 minutes
    │  (vs. 3+ hours without KB)
    └─ Logs hours and closes
    ↓
Week 1: Productive
    ├─ Engineer becoming self-sufficient
    ├─ Resolution time improving
    ├─ KB reuse rate high
    └─ Minimal escalations needed
    ↓
Month 1: Contributor
    ├─ Engineer creates first KB article
    ├─ Shares newly learned solutions
    ├─ Helps teammates find solutions
    └─ Contributing to knowledge base
```

---

## Navigation Hierarchy

```
┌─────────────────────────────────┐
│ Dashboard (Entry Point)          │
├─────────────────────────────────┤
│ Quick Actions                    │
├─────────────────────────────────┤
│ Primary Navigation (Sidebar)     │
├────────────┬────────────────────┤
│ Navigation │ Main Content       │
│            │                    │
│ • Dashboard├─ Dashboard         │
│ • Knowledge├─ Knowledge List    │
│ • Tickets  ├─ Article Details   │
│ • Tracker  ├─ Create Article    │
│ • Apps     │                    │
│ • Search   │ Tickets            │
│ • Profile  ├─ Ticket List       │
│ • Settings ├─ Ticket Details    │
│            │                    │
│            │ Tracker            │
│            ├─ Dashboard         │
│            ├─ Daily Entry       │
│            │                    │
│            │ Applications       │
│            ├─ App List          │
│            ├─ App Details       │
│            │                    │
│            │ Search             │
│            ├─ Results           │
│            │                    │
│            │ Profile            │
│            ├─ My Profile        │
│            │                    │
│            │ Settings           │
│            ├─ Preferences       │
│            ├─ Security          │
│            └─ Notifications     │
└────────────┴────────────────────┘
```

**Max Clicks to Any Feature:** 3 clicks

---

## Navigation Rules

1. **Breadcrumb:** Show full navigation path
   - Dashboard > Knowledge Base > Article Title > Edit

2. **Back Button:** Always available on detail pages
   - Clicking back returns to list with same filters

3. **Home Logo:** Always returns to dashboard
   - Except already on dashboard (no action)

4. **Search:** Always available (Ctrl+K or search icon)
   - From any page, opens search overlay

5. **User Menu:** Top-right corner
   - Profile, Settings, Logout

---

## Navigation Shortcuts (Keyboard)

| Shortcut | Action |
|----------|--------|
| Ctrl+K | Open global search |
| Ctrl+N | New knowledge article |
| Ctrl+D | Go to dashboard |
| Alt+T | Go to tracker |
| Alt+A | Go to applications |
| ? | Show all shortcuts |
| Esc | Close modal/search |
| / | Focus search box |

---

## State Management

### Frontend State

```
Global State (Zustand)
├─ authStore
│  ├─ user (current user)
│  ├─ role (current role)
│  └─ isAuthenticated
│
├─ uiStore
│  ├─ darkMode (boolean)
│  ├─ sidebarOpen (boolean)
│  ├─ notifications (array)
│  └─ theme preferences
│
└─ appStore
   ├─ currentApplication (selected app)
   └─ filters (search filters)

Server State (React Query)
├─ articles (knowledge base)
├─ tickets (ticket list)
├─ activities (tracker entries)
├─ applications (app list)
├─ users (user profiles)
└─ search results
```

---

**Document Status:** ✅ Ready for Development
