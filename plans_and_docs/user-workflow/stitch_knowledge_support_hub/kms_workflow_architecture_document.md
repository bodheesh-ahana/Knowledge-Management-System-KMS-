# KMS Workflow Architecture & User Journeys

## 1. Core User Roles & Journeys

### 1.1 Application Support Engineer (Daily Loop)
**Goal:** Resolve tickets and document knowledge with < 2min overhead.

*   **Entry:** Login (SSO/Email)
*   **Flow:**
    1.  **Dashboard:** Check assigned tickets & SLA status.
    2.  **Global Search (Ctrl+K):** Search for symptoms/error codes in KB.
    3.  **Decision: Knowledge Found?**
        *   **YES:** Open **Knowledge Details** → Apply fix → Resolve in ManageEngine.
        *   **NO:** Open **Application Details** → Investigate (Servers/Docs) → Resolve.
    4.  **Quick Ticket Entry:** Paste Ticket ID → Add Root Cause → Link App.
    5.  **Decision: New Knowledge Worthy?**
        *   **YES:** Launch **Create Knowledge** flow (Step 1-6) → Submit for Review.
        *   **NO:** Skip to Work Entry.
    6.  **Daily Work Entry:** Auto-populate Ticket ID & App → Log Hours → Save.
*   **Exit:** Dashboard (Verified stats updated) → Logout.

---

### 1.2 Team Lead (Review & Oversight)
**Goal:** Maintain KB quality and team velocity.

*   **Entry:** Dashboard (Lead View)
*   **Flow:**
    1.  **Pending Reviews:** Open list of drafted articles.
    2.  **Review Knowledge:**
        *   **Action: Approve** → Status: Published → Notify Author.
        *   **Action: Request Changes** → Status: Revision → Add Comments.
        *   **Action: Reject/Merge** → Handle duplicates.
    3.  **Team Tracker:** Review total hours logged vs. tickets closed.
    4.  **Analytics:** Check "Knowledge Reuse Rate" (Is the team actually searching?).
*   **Exit:** Reports Export → Logout.

---

## 2. Object Lifecycles (State Diagrams)

### 2.1 Knowledge Article Lifecycle
`Draft` ↔ `In Review` → `Approved` → `Published` → `Archived`
*(Note: Edits to Published articles create a new Version in Draft state).*

### 2.2 Ticket Reference State
`New Reference` → `Investigation` → `Knowledge Linked` → `Closed/Logged`

### 2.3 Tracker Entry State
`Draft` → `Submitted` → `Reviewed (Lead)` → `Locked (End of Period)`

---

## 3. Permission Matrix

| Module | Support Engineer | Team Lead | Manager | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | Own Stats | Team Stats | Exec View | Full |
| **Knowledge Base** | View/Create | Review/Edit | View Only | Manage |
| **Ticket Repo** | View/Add | Full Access | View Only | Full |
| **Tracker** | Log Own | Review Team | View Reports | Manage |
| **Applications** | View/Details | Edit/Manage | View Only | Full |
| **Analytics** | Individual | Team | Executive | Full |
| **Settings** | Personal | Team Prefs | View | System |

---

## 4. Master Navigation Flow

```text
[Login] 
   │
   ├──▶ [Dashboard] ◀──────┐
   │       │               │
   │       ├─▶ [Global Search (Overlay)] ─▶ [Results] ─▶ [KB/Ticket/App Details]
   │       │
   │       ├─▶ [Knowledge Base] ──▶ [KB Details] ──▶ [Editor]
   │       │
   │       ├─▶ [Tickets] ────────▶ [Ticket Details] ─▶ [Quick Entry]
   │       │
   │       ├─▶ [Internal Tracker] ─▶ [Daily Entry]
   │       │
   │       ├─▶ [Applications] ───▶ [App Details]
   │       │
   │       └─▶ [Settings] / [Profile]
```

---

## 5. Error & Exception Flows

*   **No Search Results:** Suggest "Create New Ticket" or "Ask Team Lead" via internal Slack link.
*   **Duplicate KB Detection:** During `Create Knowledge`, system checks title/tags and prompts: *"Similar article found. Link to existing instead?"*
*   **Unsaved Changes:** Modal trigger if navigating away from Editor or Work Entry without saving.
*   **Session Timeout:** Auto-save current Draft to local storage → Redirect to Login.