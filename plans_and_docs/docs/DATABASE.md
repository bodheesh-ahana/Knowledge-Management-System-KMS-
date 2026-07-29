# Database Schema & MongoDB Design

**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-27  

---

## Database Overview

**DBMS:** MongoDB 6+  
**Cloud:** MongoDB Atlas  
**Driver:** Mongoose 8+  
**Backups:** Automatic daily, 35-day retention  

---

## Collections & Schemas

### 1. Users Collection

Stores team members with roles, skills, and preferences.

```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  avatar: String (URL),
  role: Enum('Engineer', 'TeamLead', 'Manager', 'Admin'),
  department: String,
  skills: [String], // ['Drake', 'QBD', 'CCH', 'Axcess']
  bio: String,
  status: Enum('Active', 'Inactive', 'OnLeave'),
  
  // Stats
  articlesCreated: Number (default: 0),
  articlesReviewed: Number (default: 0),
  ticketsResolved: Number (default: 0),
  hoursLogged: Number (default: 0),
  knowledgeScore: Number (default: 0), // Calculated from likes
  
  // Preferences
  preferences: {
    theme: Enum('light', 'dark', 'auto'),
    language: String,
    timezone: String,
    emailNotifications: Boolean,
    digestFrequency: Enum('daily', 'weekly', 'off'),
  },
  
  // Security
  lastLogin: Date,
  lastLogout: Date,
  passwordChangedAt: Date,
  twoFactorEnabled: Boolean,
  
  // Tracking
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date (soft delete),
}
```

**Indexes:**
```javascript
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ skills: 1 });
db.users.createIndex({ status: 1 });
db.users.createIndex({ createdAt: -1 });
```

---

### 2. KnowledgeArticles Collection

Core collection for reusable solutions.

```javascript
{
  _id: ObjectId,
  
  // Metadata
  title: String (required, max 200),
  slug: String (unique, auto-generated),
  description: String (short summary),
  
  // Content
  symptoms: String (markdown), // What users experience
  rootCause: String (markdown), // Why it happens
  troubleshootingSteps: [
    {
      stepNumber: Number,
      title: String,
      description: String,
      commands: [String],
      screenshots: [ObjectId], // Reference to Attachments
    }
  ],
  resolution: String (markdown), // Final fix
  prevention: String (markdown), // How to avoid
  knownLimitations: String (markdown),
  
  // Classification
  application: String (required), // Drake, QBD, CCH, etc.
  issueType: Enum('Access', 'Performance', 'Installation', 'Licensing', 'DataCorruption', 'Integration', 'Other'),
  difficulty: Enum('Easy', 'Medium', 'Hard'),
  estimatedResolutionTime: Number, // Minutes
  tags: [String], // For categorization
  
  // Ownership
  owner: ObjectId (required), // Reference to Users
  reviewer: ObjectId, // Team lead who approved
  contributors: [ObjectId], // Other engineers who helped
  
  // Status
  status: Enum('Draft', 'UnderReview', 'Approved', 'Published', 'Archived'),
  publishedAt: Date,
  reviewedAt: Date,
  
  // Relations
  relatedArticles: [ObjectId], // Links to similar KB articles
  relatedTickets: [String], // ManageEngine ticket IDs
  attachments: [ObjectId], // Reference to Attachments
  
  // Engagement
  views: Number (default: 0),
  helpful: Number (default: 0), // Like count
  notHelpful: Number (default: 0),
  
  // Versioning
  version: Number (default: 1),
  previousVersions: [
    {
      version: Number,
      title: String,
      content: String,
      archivedAt: Date,
    }
  ],
  
  // Tracking
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date (soft delete),
  
  // Audit
  createdBy: ObjectId,
  updatedBy: ObjectId,
  changeLog: [
    {
      changedAt: Date,
      changedBy: ObjectId,
      changes: Object, // What was changed
    }
  ],
}
```

**Indexes:**
```javascript
db.knowledgeArticles.createIndex({ slug: 1 }, { unique: true });
db.knowledgeArticles.createIndex({ title: 'text', symptoms: 'text', rootCause: 'text' });
db.knowledgeArticles.createIndex({ application: 1, status: 1 });
db.knowledgeArticles.createIndex({ owner: 1, createdAt: -1 });
db.knowledgeArticles.createIndex({ status: 1, publishedAt: -1 });
db.knowledgeArticles.createIndex({ tags: 1 });
db.knowledgeArticles.createIndex({ relatedTickets: 1 });
```

---

### 3. Tickets Collection

Reference to ManageEngine tickets with KB links.

```javascript
{
  _id: ObjectId,
  
  // Ticket Identity
  ticketId: String (unique), // ManageEngine ticket ID (e.g., "#215823")
  title: String,
  description: String,
  
  // Requester
  requesterName: String,
  requesterEmail: String,
  requesterDepartment: String,
  
  // Assignment
  owner: ObjectId, // Reference to Users (support engineer)
  contributors: [ObjectId],
  
  // Classification
  application: String,
  category: String,
  priority: Enum('P1', 'P2', 'P3', 'P4'),
  impact: Enum('Critical', 'High', 'Medium', 'Low'),
  
  // Status
  status: Enum('Open', 'Assigned', 'Working', 'OnHold', 'Resolved', 'Closed'),
  
  // Dates
  createdAt: Date,
  assignedAt: Date,
  resolvedAt: Date,
  closedAt: Date,
  dueBy: Date,
  
  // Resolution
  resolutionSummary: String,
  rootCauseIdentified: String,
  troubleshootingStepsTaken: [String],
  
  // KB Link
  linkedKnowledgeArticles: [ObjectId], // References to KnowledgeArticles
  
  // Attachments
  attachments: [ObjectId], // Screenshots, logs, etc.
  
  // Internal Notes
  internalNotes: [
    {
      author: ObjectId,
      note: String,
      timestamp: Date,
    }
  ],
  
  // Metrics
  timeSpentHours: Number,
  firstResponseTime: Number, // Minutes
  resolutionTime: Number, // Minutes
  
  // ManageEngine Sync
  manageEngineUrl: String, // Link to original ticket
  lastSyncedAt: Date,
  
  // Tracking
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdInKMS: Boolean, // True if created in KMS, false if from ManageEngine
  
  deletedAt: Date (soft delete),
}
```

**Indexes:**
```javascript
db.tickets.createIndex({ ticketId: 1 }, { unique: true });
db.tickets.createIndex({ owner: 1, status: 1 });
db.tickets.createIndex({ application: 1 });
db.tickets.createIndex({ status: 1 });
db.tickets.createIndex({ linkedKnowledgeArticles: 1 });
db.tickets.createIndex({ createdAt: -1 });
```

---

### 4. Activities Collection

Work tracking (replaces Excel tracker).

```javascript
{
  _id: ObjectId,
  
  // Actor
  engineer: ObjectId (required), // Reference to Users
  
  // Activity
  activityType: Enum('Investigation', 'Development', 'Testing', 'Training', 'Meeting', 'Documentation', 'Support'),
  description: String,
  hoursSpent: Number (required, decimal),
  
  // Relation
  ticket: ObjectId, // Optional reference to Tickets
  knowledgeArticle: ObjectId, // Optional reference to KnowledgeArticles
  
  // Date
  activityDate: Date (required),
  
  // Status
  status: Enum('Draft', 'Submitted', 'Reviewed', 'Locked'),
  reviewedBy: ObjectId, // Team lead who reviewed
  reviewedAt: Date,
  
  // Notes
  notes: String,
  tags: [String],
  
  // Tracking
  createdAt: Date,
  updatedAt: Date,
  submittedAt: Date,
  deletedAt: Date (soft delete),
}
```

**Indexes:**
```javascript
db.activities.createIndex({ engineer: 1, activityDate: -1 });
db.activities.createIndex({ ticket: 1 });
db.activities.createIndex({ knowledgeArticle: 1 });
db.activities.createIndex({ activityDate: -1 });
db.activities.createIndex({ status: 1 });
db.activities.createIndex({ activityType: 1 });
```

---

### 5. Applications Collection

Master catalog of supported applications.

```javascript
{
  _id: ObjectId,
  
  // Identity
  name: String (required, unique),
  slug: String (unique),
  description: String,
  vendor: String,
  version: String,
  
  // Classification
  category: String, // ERP, Tax, CRM, etc.
  status: Enum('Active', 'Deprecated', 'Experimental'),
  healthStatus: Enum('Stable', 'Issues', 'Critical'),
  
  // Ownership
  owner: ObjectId (required), // Primary support engineer
  secondaryOwner: ObjectId,
  team: [ObjectId],
  
  // Documentation
  installationGuide: String (markdown),
  configurationGuide: String (markdown),
  troubleshootingGuide: String (markdown),
  
  // Deployment
  servers: [
    {
      serverName: String,
      environment: Enum('Development', 'Staging', 'Production'),
      ipAddress: String,
      versionDeployed: String,
      lastUpdated: Date,
    }
  ],
  
  // Relations
  knowledgeArticles: [ObjectId], // KB articles about this app
  relatedTickets: [ObjectId],
  
  // Contact
  vendorContact: String (email),
  vendorPhone: String,
  internalContact: [ObjectId],
  
  // Files
  attachments: [ObjectId],
  
  // Metrics
  knownIssuesCount: Number (default: 0),
  openTicketsCount: Number (default: 0),
  
  // Tracking
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date (soft delete),
}
```

**Indexes:**
```javascript
db.applications.createIndex({ slug: 1 }, { unique: true });
db.applications.createIndex({ name: 1 });
db.applications.createIndex({ owner: 1 });
db.applications.createIndex({ healthStatus: 1 });
db.applications.createIndex({ status: 1 });
```

---

### 6. Comments Collection

Discussion threads.

```javascript
{
  _id: ObjectId,
  
  // Parent
  parentType: Enum('KnowledgeArticle', 'Ticket'),
  parentId: ObjectId,
  
  // Content
  author: ObjectId (required), // Reference to Users
  text: String (required),
  mentions: [ObjectId], // Users mentioned (@)
  
  // Engagement
  likes: Number (default: 0),
  replies: [ObjectId], // Nested comments
  
  // Metadata
  isEdited: Boolean (default: false),
  editedAt: Date,
  editedBy: ObjectId,
  
  // Tracking
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date (soft delete),
}
```

**Indexes:**
```javascript
db.comments.createIndex({ parentType: 1, parentId: 1, createdAt: -1 });
db.comments.createIndex({ author: 1 });
db.comments.createIndex({ createdAt: -1 });
```

---

### 7. Attachments Collection

File metadata (actual files stored in S3/Cloudinary).

```javascript
{
  _id: ObjectId,
  
  // File Info
  originalFileName: String,
  fileName: String (sanitized),
  fileSize: Number, // Bytes
  mimeType: String, // image/png, application/pdf, etc.
  
  // Storage
  storageProvider: Enum('UploadThing', 'Cloudinary', 'VercelBlob'),
  storageUrl: String, // CDN URL
  storageKey: String, // For deletion
  
  // Relations
  uploadedBy: ObjectId (required),
  usedIn: [
    {
      type: Enum('KnowledgeArticle', 'Ticket', 'Comment'),
      id: ObjectId,
    }
  ],
  
  // Metadata
  uploadedAt: Date,
  downloadCount: Number (default: 0),
  lastDownloadedAt: Date,
  
  // Image specific
  isImage: Boolean,
  imageWidth: Number,
  imageHeight: Number,
  imageFormat: String, // jpg, png, webp
  
  deletedAt: Date (soft delete),
}
```

**Indexes:**
```javascript
db.attachments.createIndex({ uploadedBy: 1 });
db.attachments.createIndex({ uploadedAt: -1 });
db.attachments.createIndex({ usedIn: 1 });
```

---

### 8. SearchHistory Collection

Analytics on search queries.

```javascript
{
  _id: ObjectId,
  
  // Search
  query: String,
  results: [
    {
      type: Enum('KnowledgeArticle', 'Ticket', 'Application', 'User'),
      id: ObjectId,
      title: String,
      score: Number, // Relevance score
    }
  ],
  resultCount: Number,
  
  // Context
  user: ObjectId (required),
  
  // Outcome
  clicked: Boolean, // Did user click a result?
  clickedType: Enum('KnowledgeArticle', 'Ticket', 'Application', 'User'),
  clickedId: ObjectId,
  
  // Metadata
  timestamp: Date,
}
```

**Indexes:**
```javascript
db.searchHistory.createIndex({ user: 1, timestamp: -1 });
db.searchHistory.createIndex({ query: 1 });
db.searchHistory.createIndex({ timestamp: -1 });
```

---

### 9. Notifications Collection

User notifications.

```javascript
{
  _id: ObjectId,
  
  // Recipient
  user: ObjectId (required),
  
  // Content
  type: Enum('ArticleApproved', 'ArticleRejected', 'CommentReply', 'ArticleUpdated', 'TicketAssigned'),
  title: String,
  message: String,
  
  // Action
  actionUrl: String,
  relatedId: ObjectId,
  
  // Status
  read: Boolean (default: false),
  readAt: Date,
  
  // Tracking
  createdAt: Date,
  expiresAt: Date, // TTL index for auto-deletion
}
```

**Indexes:**
```javascript
db.notifications.createIndex({ user: 1, read: 1, createdAt: -1 });
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL
```

---

### 10. AuditLogs Collection

Track all changes for compliance.

```javascript
{
  _id: ObjectId,
  
  // Actor
  user: ObjectId,
  userEmail: String,
  
  // Action
  action: String, // 'create', 'update', 'delete', 'approve', 'reject'
  resourceType: Enum('KnowledgeArticle', 'Ticket', 'User', 'Application'),
  resourceId: ObjectId,
  
  // Changes
  changes: Object, // { fieldName: { old: value, new: value } }
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  
  // Tracking
  timestamp: Date,
}
```

**Indexes:**
```javascript
db.auditLogs.createIndex({ user: 1, timestamp: -1 });
db.auditLogs.createIndex({ resourceType: 1, resourceId: 1 });
db.auditLogs.createIndex({ timestamp: -1 });
```

---

## Data Relationships

### Knowledge Article Relationships

```
KnowledgeArticle
├── owner (User)
├── reviewer (User)
├── contributors (User[])
├── relatedArticles (KnowledgeArticle[])
├── relatedTickets (Ticket[])
└── attachments (Attachment[])
```

### Ticket Relationships

```
Ticket
├── owner (User)
├── contributors (User[])
├── linkedKnowledgeArticles (KnowledgeArticle[])
└── attachments (Attachment[])
```

### User Relationships

```
User
├── articlesCreated (KnowledgeArticle[])
├── articlesReviewed (KnowledgeArticle[])
├── ticketsOwned (Ticket[])
├── applicationsOwned (Application[])
├── activities (Activity[])
└── comments (Comment[])
```

---

## Migration Scripts

### Create Collections

```javascript
// Create TTL index for notifications (auto-delete after 30 days)
db.notifications.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// Create text index for search
db.knowledgeArticles.createIndex({
  title: 'text',
  symptoms: 'text',
  rootCause: 'text',
  troubleshootingSteps: 'text',
});

// Create compound indexes for common queries
db.activities.createIndex({
  engineer: 1,
  activityDate: -1,
  status: 1,
});
```

---

## Backup & Recovery

### Backup Strategy
- Automated daily snapshots via MongoDB Atlas
- 35-day retention
- Point-in-time recovery capability
- Test restore monthly

### Disaster Recovery RTO/RPO
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): <1 hour (daily snapshots)

---

## Data Integrity

### Constraints
- Unique: User email, Application slug, Knowledge slug, Ticket ID
- Required: User email/role, KB title/application/owner, Ticket ID, Activity engineer/date
- Max length: Article title (200), Email (254)
- Enum validation on all status fields

### Validation
- Server-side validation (Mongoose schemas)
- Application-level validation (Zod)
- Business rule enforcement in services

---

**Document Status:** ✅ Ready for Development
