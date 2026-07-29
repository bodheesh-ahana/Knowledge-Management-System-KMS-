# Data Storage Strategy - KMS

## Overview

The KMS application uses a **three-tier storage strategy** optimized for development and easily migratable to production:

1. **MongoDB** - Structured data (all business data)
2. **Local Filesystem** - Media files (images, documents)
3. **Browser LocalStorage** - Client-side state (UI preferences, drafts)

---

## 1. MongoDB Storage

### Purpose
Store all structured application data with relationships and indexes optimized for queries.

### Collections (10 total)
```
Users              → User accounts and roles
KnowledgeArticles  → Full knowledge base articles
Tickets            → Support tickets
Activities         → Activity audit trail
Applications       → Application catalog
TrackerEntries     → Daily work entries
Comments           → Discussions on articles/tickets
SearchHistory      → User search logs (TTL: 30 days)
Notifications      → User alerts (TTL: 30 days)
AuditLogs          → Compliance logs (permanent)
```

### Connection
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kms?retryWrites=true&w=majority
```

### Data Retention
- **SearchHistory**: 30 days (TTL index auto-deletes)
- **Notifications**: 30 days (TTL index auto-deletes)
- **AuditLogs**: Permanent (no TTL)
- **User Data**: Until manually deleted
- **Articles/Tickets**: Until manually deleted

---

## 2. Local File Storage

### Purpose
Store media files (images, documents) with local filesystem management.

### Directory Structure
```
public/uploads/           ← All user uploaded files
├── .gitkeep             ← Ensures folder is tracked
├── 1689123456-abc123.jpg ← Naming: {timestamp}-{random}.{ext}
├── 1689123457-def456.pdf
└── ... (other uploads)
```

### Configuration
```env
# .env.local
STORAGE_TYPE=local                              # Type of storage (local, cloudinary, s3, etc.)
MAX_UPLOAD_SIZE=5242880                         # 5MB max file size
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,...   # Allowed image MIME types
```

### Supported File Types

**Images** (recommended)
- `image/jpeg` (.jpg, .jpeg)
- `image/png` (.png)
- `image/gif` (.gif)
- `image/webp` (.webp)

**Documents** (future)
- `application/pdf` (.pdf)
- `application/msword` (.doc)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (.docx)
- `application/vnd.ms-excel` (.xls)
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (.xlsx)

### File Upload API

#### Endpoint
```
POST /api/upload/image
Content-Type: multipart/form-data
```

#### Request
```bash
curl -X POST http://localhost:3000/api/upload/image \
  -F "file=@/path/to/image.jpg"
```

#### Response (Success)
```json
{
  "success": true,
  "filename": "1689123456-abc123.jpg",
  "url": "/uploads/1689123456-abc123.jpg",
  "size": 152341
}
```

#### Response (Error)
```json
{
  "success": false,
  "error": "Invalid file type. Allowed types: image/jpeg, image/png, image/gif, image/webp"
}
```

### File Naming Convention
- Format: `{timestamp}-{random}.{extension}`
- Example: `1689123456-abc123def456.jpg`
- Benefits: Unique, sortable by date, prevents collisions

### Storage Limits
- **Max file size**: 5MB (configurable in code)
- **Allowed types**: Images only (initially)
- **Storage space**: Unlimited (depends on server disk)

### File Management
```typescript
import { saveImageFile, deleteImageFile, getFileSize, listUploadedFiles } from '@/lib/storage';

// Save file
const result = await saveImageFile(buffer, 'image.jpg', 'image/jpeg');
console.log(result.url); // /uploads/1689123456-xyz.jpg

// Delete file
await deleteImageFile('1689123456-xyz.jpg');

// List files
const files = await listUploadedFiles();
```

### Git Management
```
# .gitignore
public/uploads/           # Ignore all uploads
!public/uploads/.gitkeep  # But keep the folder tracked
```

---

## 3. Browser LocalStorage

### Purpose
Store client-side state that doesn't need server persistence.

### Data Stored

| Key | Purpose | TTL |
|-----|---------|-----|
| `kms_auth_token` | JWT token | 8 hours |
| `kms_user` | Current user object | Session |
| `kms_theme` | UI theme (light/dark) | Permanent |
| `kms_sidebar_open` | Sidebar state | Permanent |
| `kms_recent_searches` | Recent search queries | 30 days |
| `kms_draft_articles` | Draft article content | 7 days |
| `kms_draft_tickets` | Draft ticket content | 7 days |

### Usage Example
```typescript
// Store theme preference
localStorage.setItem('kms_theme', 'dark');

// Store draft
const draft = { title: 'My Article', content: '...' };
localStorage.setItem('kms_draft_articles', JSON.stringify(draft));

// Retrieve draft
const savedDraft = JSON.parse(localStorage.getItem('kms_draft_articles') || '{}');
```

---

## Data Storage Flow Diagram

```
User Action
    ↓
    ├─→ Form Input (Form Data)
    │       ↓
    │   LocalStorage (Draft)
    │       ↓
    │   [Save]
    │       ↓
    │   ┌─────────────────────────┐
    │   │ If Image Attachment:    │
    │   │ ↓                       │
    │   │ Upload to /uploads/     │ ← Filesystem
    │   │ (Get URL back)          │
    │   └─────────────────────────┘
    │       ↓
    │   [Submit]
    │       ↓
    │   API Route
    │       ↓
    │   MongoDB (Data + Image URLs)
    │       ↓
    │   API Response
    │       ↓
    └─→ Frontend (Display)
        ↓
        LocalStorage (Clear Draft)
```

---

## Migration Guide: Local → Cloud Storage

When ready to migrate from local storage to cloud storage (Cloudinary, AWS S3, etc.):

### Step 1: Choose Provider
Options:
- **Cloudinary** - Best for images, free tier, easy integration
- **AWS S3** - Scalable, pay-as-you-go
- **Azure Blob Storage** - Enterprise, integration with Entra ID
- **Google Cloud Storage** - Similar to S3

### Step 2: Update FileHandler
```typescript
// src/lib/storage/fileHandler.ts

// Replace local file saving with cloud provider SDK
export async function saveImageFile(...) {
  // Instead of writing to filesystem:
  // const filepath = path.join(UPLOAD_DIR, filename);
  // await fs.writeFile(filepath, buffer);
  
  // Use cloud provider API:
  const uploadResponse = await cloudinary.uploader.upload(buffer);
  return {
    success: true,
    filename: uploadResponse.public_id,
    url: uploadResponse.secure_url, // CDN URL
  };
}
```

### Step 3: Update Environment
```env
# Replace local storage config with cloud provider
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-secret
```

### Step 4: No Database Changes Needed
- MongoDB still stores the URLs
- Just the URLs change: `/uploads/xyz.jpg` → `https://res.cloudinary.com/.../xyz.jpg`
- No schema migration required!

### Step 5: Migration Script (Optional)
If migrating existing uploads:
```typescript
// scripts/migrate-to-cloudinary.ts
import { listUploadedFiles } from '@/lib/storage';
import fs from 'fs/promises';
import path from 'path';

async function migrate() {
  const files = await listUploadedFiles();
  
  for (const file of files) {
    const buffer = await fs.readFile(path.join(UPLOAD_DIR, file));
    const result = await uploadToCloudinary(buffer, file);
    console.log(`Migrated: ${file} → ${result.url}`);
  }
}
```

---

## Database Schema - Attachments

### Before (Simple)
```typescript
attachments: [String]  // Just URLs: ["/uploads/123.jpg", "..."]
```

### After (Structured)
```typescript
attachments: [
  {
    filename: string,      // "1689123456-xyz.jpg"
    url: string,           // "/uploads/1689123456-xyz.jpg"
    type: string,          // "image" | "document" | "video"
    size: number,          // File size in bytes
    uploadedAt: Date       // When uploaded
  }
]
```

### Benefits
- Better tracking and management
- Easy to implement cleanup (delete old files)
- Can calculate storage usage
- Supports different file types
- Future-proof for cloud migration

---

## Best Practices

### ✅ Do
- ✅ Validate file type and size on server
- ✅ Generate unique filenames to prevent collisions
- ✅ Store metadata (size, upload time, type) in MongoDB
- ✅ Clean up unused files periodically
- ✅ Version your storage schema
- ✅ Keep file URLs in MongoDB (not files themselves)

### ❌ Don't
- ❌ Store files directly in MongoDB (use GridFS if needed)
- ❌ Trust client-side file type validation alone
- ❌ Use user-provided filenames directly
- ❌ Store large binary data without a CDN
- ❌ Commit uploaded files to git

---

## Troubleshooting

### Issue: Upload folder doesn't exist
```bash
# Create manually
mkdir -p public/uploads
```

### Issue: Permission denied writing to uploads
```bash
# Fix permissions
chmod 755 public/uploads
```

### Issue: Large file upload fails
```env
# Increase in .env.local
MAX_UPLOAD_SIZE=52428800  # 50MB instead of 5MB

# Also update Next.js config if needed
# next.config.js: serverRuntimeConfig.uploadMaxSize
```

### Issue: Files not accessible
- Check `/public/uploads/` exists
- Check file permissions are readable
- Verify relative path is correct
- Check server is serving static files from `/public`

---

## Performance Considerations

### Image Optimization
```typescript
// Future: Add image resizing for thumbnails
import sharp from 'sharp';

const thumbnail = await sharp(buffer)
  .resize(200, 200)
  .jpeg({ quality: 80 })
  .toBuffer();
```

### Caching Strategy
```typescript
// HTTP headers for static files
Cache-Control: public, max-age=31536000  // 1 year
ETag: {hash}                             // For cache busting
```

### Database Indexing
```typescript
// Faster queries for attachments
db.knowledgeArticles.createIndex({ "attachments.uploadedAt": -1 });
db.knowledgeArticles.createIndex({ "attachments.type": 1 });
```

---

## FAQ

**Q: Can I store images in MongoDB?**
A: Yes, but not recommended. Use GridFS for large files, or just store URLs.

**Q: How do I backup uploads?**
A: Copy the `public/uploads/` folder regularly. With cloud storage, provider handles backups.

**Q: How do I delete orphaned files?**
A: Query MongoDB, find attachment URLs, compare with filesystem, delete missing.

**Q: Can I change storage providers later?**
A: Yes! Just update URLs in MongoDB and change the fileHandler.ts implementation.

**Q: Is local storage secure?**
A: For development, yes. For production, use CDN/cloud storage for DDoS protection and bandwidth.

---

## Summary

| Storage | Purpose | Retention | Migration |
|---------|---------|-----------|-----------|
| MongoDB | Structured data | Permanent | N/A |
| Local FS | Media files | Manual cleanup | → Cloudinary/S3 |
| LocalStorage | UI state | TTL varies | Browser-managed |

**Current Setup**: Perfect for development.  
**Production Ready**: Upgrade to cloud storage + CDN when needed.

