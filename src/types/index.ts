// User roles
export type UserRole = 'Engineer' | 'TeamLead' | 'Manager' | 'Admin';

export interface ITeamMember {
  _id: string;
  name: string;
  role: string;
  email: string;
  status: 'Active' | 'Inactive';
  joinDate?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface IUserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export interface IUser {
  _id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  active: boolean;
  preferences?: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

// Knowledge Article types
export type ArticleStatus = 'Draft' | 'UnderReview' | 'Approved' | 'Published' | 'Archived';

export interface ITroubleshootingStep {
  order: number;
  description: string;
}

export interface IAttachment {
  filename: string;
  url: string;
  type: 'image' | 'document' | 'video';
  size: number;
  uploadedAt: Date;
}

export interface IKnowledgeArticle {
  _id: string;
  title: string;
  description: string;
  application: string;
  symptoms: string;
  rootCause: string;
  resolution: string;
  prevention?: string;
  troubleshootingSteps: ITroubleshootingStep[];
  owner: string; // User ID
  reviewer?: string; // User ID
  contributors: string[]; // User IDs
  status: ArticleStatus;
  views: number;
  helpful: number;
  unhelpful: number;
  relatedArticles: string[]; // Article IDs
  relatedTickets: string[]; // Ticket IDs
  ticketId?: string; // ManageEngine ticket ID for cross-reference
  tags: string[];
  featuredImage?: string; // URL to featured image stored locally
  attachments: IAttachment[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticleInput {
  title: string;
  description: string;
  application: string;
  symptoms: string;
  rootCause: string;
  resolution: string;
  troubleshootingSteps?: ITroubleshootingStep[];
}

// Ticket types
export type TicketStatus =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'On Hold'
  | 'Awaiting User Response'
  | 'Awaiting Vendor/OEM'
  | 'Awaiting Spare'
  | 'Awaiting Approval'
  | 'Pending with Customer Management'
  | 'Under Procurement'
  | 'Under IT Validation'
  | 'Under Sales Team Review'
  | 'Outside Business Hours'
  | 'Resolved'
  | 'Closed'
  | 'Cancelled';
export type TicketSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ITicket {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  application: string;
  status: TicketStatus;
  severity: TicketSeverity;
  assignee: string; // User ID
  reporter: string; // User ID
  linkedKnowledgeArticles: string[]; // Article IDs
  workTimeLogged: number; // minutes
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  application: string;
  severity: TicketSeverity;
}

// Activity types
export type ActivityType =
  | 'ArticleCreated'
  | 'ArticleUpdated'
  | 'ArticlePublished'
  | 'ArticleArchived'
  | 'TicketCreated'
  | 'TicketResolved'
  | 'HoursLogged'
  | 'StatusUpdated'
  | 'UserLoggedIn';

export interface IActivity {
  _id: string;
  user: string; // User ID
  type: ActivityType;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  createdAt: Date;
}

// Application types
export interface IApplication {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tracker (Daily Work Entry) types
export interface ITrackerEntry {
  _id: string;
  user: string; // User ID (owner of the entry / logged-in engineer)
  teamMembers: string[]; // Team member name(s), e.g. ["Rajarshi Dasgupta", "Bindushree A C"]
  ticketId: string; // ManageEngine ticket ID, may include suffix e.g. "204811(#1612)"
  title?: string; // Issue title/summary, used to auto-match Knowledge Base articles
  linkedArticle?: string; // KnowledgeArticle ID if this entry's issue has a documented solution
  role: 'Owner' | 'Contributor';
  date: Date;
  workDescription: string; // "Work Done"
  hoursWorked: number; // "Time Spent in hours"
  workType?: 'Investigation' | 'Call' | 'Follow-up' | 'Meeting' | 'Documentation' | 'Knowledge Creation' | 'Other';
  slaBreach: 'Yes' | 'No' | 'N/A';
  slaBreachReason?: string;
  escalationStatus: 'Yes' | 'No' | 'N/A';
  application?: string;
  ticketsResolved: number;
  articlesCreated: number;
  ticketStatus?: string; // ManageEngine/team ticket status
  status: 'Draft' | 'Submitted';
  createdAt: Date;
  updatedAt: Date;
}

// Comment types
export interface IComment {
  _id: string;
  author: string; // User ID
  content: string;
  resourceType: string;
  resourceId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Search history
export interface ISearchHistory {
  _id: string;
  user: string; // User ID
  query: string;
  resultCount: number;
  createdAt: Date;
  expiresAt: Date; // TTL index
}

// Notification types
export type NotificationType =
  | 'ArticleReviewNeeded'
  | 'TicketAssigned'
  | 'CommentMention'
  | 'ArticleCreated'
  | 'TicketCreated'
  | 'TrackerEntryCreated'
  | 'TicketResolved'
  | 'System';

export interface INotification {
  _id: string;
  user: string; // User ID
  type: NotificationType;
  title: string;
  message: string;
  resourceId: string;
  read: boolean;
  createdAt: Date;
  expiresAt: Date; // TTL index
}

// Audit log types
export interface IAuditLog {
  _id: string;
  user: string; // User ID
  action: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, any>;
  ipAddress: string;
  createdAt: Date;
}

// Project (Internal Tracker) types
export type ProjectStatus = 'Planning' | 'InProgress' | 'OnHold' | 'Completed';

export interface IProject {
  _id: string;
  name: string;
  description?: string;
  progress: number;
  status: ProjectStatus;
  members: string[]; // User IDs
  owner: string; // User ID
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  progress?: number;
  status?: ProjectStatus;
  members?: string[];
  dueDate?: Date;
}

// Document (metadata-only, no file upload) types
export type DocumentType = 'pdf' | 'image' | 'doc' | 'spreadsheet' | 'link' | 'other';

export interface IDocumentRecord {
  _id: string;
  title: string;
  description?: string;
  docType: DocumentType;
  application?: string;
  externalUrl: string;
  sizeLabel?: string;
  uploadedBy: string; // User ID
  starred: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentInput {
  title: string;
  description?: string;
  docType: DocumentType;
  application?: string;
  externalUrl: string;
  sizeLabel?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
