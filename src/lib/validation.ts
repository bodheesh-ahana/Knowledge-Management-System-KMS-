import { z } from 'zod';

export const createArticleSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  description: z.string().max(500).optional(),
  application: z.string().min(1, 'Application is required'),
  symptoms: z.string().min(5, 'Symptoms must be at least 5 characters'),
  rootCause: z.string().min(5, 'Root cause must be at least 5 characters'),
  resolution: z.string().min(5, 'Resolution must be at least 5 characters'),
  prevention: z.string().optional(),
  ticketId: z.string().optional(),
  troubleshootingSteps: z
    .array(
      z.object({
        order: z.number(),
        description: z.string(),
      })
    )
    .optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['Draft', 'UnderReview', 'Approved', 'Published', 'Archived']).optional(),
});

export const createTicketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  application: z.string().min(1, 'Application is required'),
  severity: z.enum(['Critical', 'High', 'Medium', 'Low']),
});

export const createTrackerEntrySchema = z.object({
  date: z.coerce.date(),
  ticketId: z.string().min(1, 'Ticket ID is required'),
  title: z.string().optional(),
  linkedArticle: z.string().optional(),
  teamMembers: z.array(z.string().min(1)).min(1, 'At least one team member is required'),
  role: z.enum(['Owner', 'Contributor']).default('Contributor'),
  workDescription: z.string().min(1, 'Work done is required'),
  hoursWorked: z.number().min(0).max(24),
  workType: z
    .enum([
      'Investigation',
      'Call',
      'Follow-up',
      'Meeting',
      'Documentation',
      'Knowledge Creation',
      'Other',
    ])
    .optional(),
  slaBreach: z.enum(['Yes', 'No', 'N/A']).default('N/A'),
  slaBreachReason: z.string().optional(),
  escalationStatus: z.enum(['Yes', 'No', 'N/A']).default('No'),
  application: z.string().optional(),
  ticketStatus: z.string().optional(),
  ticketsResolved: z.number().min(0).optional(),
  articlesCreated: z.number().min(0).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const createApplicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  status: z.enum(['Planning', 'InProgress', 'OnHold', 'Completed']).optional(),
  members: z.array(z.string()).optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createDocumentSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  docType: z.enum(['pdf', 'image', 'doc', 'spreadsheet', 'link', 'other']),
  application: z.string().optional(),
  externalUrl: z.string().min(1, 'URL or link is required'),
  sizeLabel: z.string().optional(),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Engineer', 'TeamLead', 'Manager', 'Admin']).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['Engineer', 'TeamLead', 'Manager', 'Admin']).optional(),
  active: z.boolean().optional(),
  password: z.string().min(6).optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      inApp: z.boolean().optional(),
    })
    .optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  resourceType: z.enum(['ticket', 'article']),
  resourceId: z.string().min(1, 'Resource ID is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});
