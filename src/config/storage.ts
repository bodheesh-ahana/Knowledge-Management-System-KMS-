/**
 * Data Storage Configuration
 * 
 * This project uses a two-tier storage strategy:
 * 1. MongoDB - For all structured data (articles, tickets, users, etc.)
 * 2. Local Filesystem - For media files (images, documents)
 *    - Location: public/uploads/
 *    - Later can migrate to Cloudinary, S3, or other cloud storage
 * 3. Browser LocalStorage - For client-side state (UI preferences, drafts)
 */

export const STORAGE_CONFIG = {
  // Local file storage
  uploads: {
    directory: 'public/uploads',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    baseUrl: '/uploads',
  },

  // MongoDB collections
  mongodb: {
    databases: {
      users: 'Users - User accounts with roles',
      knowledgeArticles: 'Knowledge Articles - Full knowledge base',
      tickets: 'Tickets - Support tickets',
      activities: 'Activity logs - User action audit trail',
      applications: 'Applications - App catalog',
      trackerEntries: 'Daily work entries - Time tracking',
      comments: 'Comments - Discussions on articles/tickets',
      searchHistory: 'Search history - User searches (TTL: 30 days)',
      notifications: 'Notifications - User alerts (TTL: 30 days)',
      auditLogs: 'Audit logs - Compliance (permanent retention)',
    },
  },

  // Browser LocalStorage
  localStorage: {
    keys: {
      authToken: 'kms_auth_token',
      user: 'kms_user',
      theme: 'kms_theme', // 'light' | 'dark'
      sidebarOpen: 'kms_sidebar_open',
      recentSearches: 'kms_recent_searches',
      draftArticles: 'kms_draft_articles',
      draftTickets: 'kms_draft_tickets',
    },
    ttl: {
      authToken: 8 * 60 * 60 * 1000, // 8 hours
      recentSearches: 30 * 24 * 60 * 60 * 1000, // 30 days
      draftArticles: 7 * 24 * 60 * 60 * 1000, // 7 days
      draftTickets: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },
};

/**
 * Migration Notes for Future:
 * 
 * When migrating to cloud storage (e.g., Cloudinary, S3):
 * 1. Remove public/uploads folder from .gitignore
 * 2. Update src/lib/storage/fileHandler.ts with cloud provider SDK
 * 3. Update API route src/app/api/upload/image/route.ts
 * 4. Update STORAGE_CONFIG.uploads.baseUrl to cloud CDN URL
 * 5. Create migration script to upload existing files to cloud
 * 6. No database changes needed - just update URLs stored in MongoDB
 * 
 * Example for Cloudinary:
 * - Install: npm install next-cloudinary
 * - Update fileHandler.ts to use CldUploadWidget or API
 * - URLs will change from /uploads/xxx to cloudinary CDN URLs
 */

export default STORAGE_CONFIG;
