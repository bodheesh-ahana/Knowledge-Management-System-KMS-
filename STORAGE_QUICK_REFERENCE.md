# 🚀 KMS Storage Strategy - Quick Reference

## Running Right Now
```
🟢 Server: http://localhost:3001
📁 Files: c:\Bodheesh vc\KMS\kms-app\
🗄️  Database: MongoDB (configure in .env.local)
```

---

## Three Tiers of Storage

### 1. MongoDB 🗄️
**What:** User data, articles, tickets, etc.  
**Where:** MongoDB Atlas (cloud)  
**Setup:**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster/kms
```

### 2. Local File Storage 📁
**What:** Uploaded images & documents  
**Where:** `public/uploads/` folder  
**Upload API:**
```bash
POST /api/upload/image
Content-Type: multipart/form-data
```

### 3. Browser LocalStorage 💾
**What:** UI theme, sidebar, draft articles  
**Where:** Browser (client-side)  
**No setup needed** - automatically managed

---

## Upload an Image

### Using cURL
```bash
curl -X POST http://localhost:3001/api/upload/image \
  -F "file=@image.jpg"
```

### Using React Hook
```typescript
import { useFileUpload } from '@/hooks/useFileUpload';

const { upload, isLoading } = useFileUpload();

// In your component
const result = await upload(file);
console.log(result.url); // /uploads/123-abc.jpg
```

### Response
```json
{
  "success": true,
  "filename": "1689123456-xyz.jpg",
  "url": "/uploads/1689123456-xyz.jpg",
  "size": 152341
}
```

---

## File Limits
| Property | Value |
|----------|-------|
| Max Size | 5 MB |
| Types | JPEG, PNG, GIF, WebP |
| Storage | `public/uploads/` |
| URLs | `/uploads/{file}` |

---

## Configuration Files

### New Files Created
```
✅ src/lib/storage/fileHandler.ts    → Upload logic
✅ src/app/api/upload/image/route.ts → Upload endpoint
✅ src/hooks/useFileUpload.ts        → React hook
✅ src/config/storage.ts             → Config constants
✅ STORAGE_SETUP.md                  → Full documentation
```

### Updated Files
```
✅ src/models/KnowledgeArticle.ts    → Image support
✅ src/types/index.ts                → IAttachment type
✅ .env.example                      → Storage config
✅ .gitignore                        → Ignore uploads/
```

---

## Data Flow

```
File Upload
    ↓
Validation (type, size)
    ↓
Save to public/uploads/ (unique name)
    ↓
Return URL → /uploads/123-abc.jpg
    ↓
Store URL in MongoDB
    ↓
Display in UI
```

---

## MongoDB Collections (10 Total)

```
1. Users              → Accounts & roles
2. KnowledgeArticles → Articles (NOW with images!)
3. Tickets           → Support tickets
4. Activities        → Audit trail
5. Applications      → App catalog
6. TrackerEntries    → Work logging
7. Comments          → Discussions
8. SearchHistory     → Search logs (30 day TTL)
9. Notifications     → Alerts (30 day TTL)
10. AuditLogs        → Compliance (permanent)
```

---

## What's Stored Where

| Data | Storage | Retention |
|------|---------|-----------|
| Articles | MongoDB | Permanent |
| Images | Local FS | Manual cleanup |
| Tickets | MongoDB | Permanent |
| UI Preferences | LocalStorage | Permanent |
| Search History | MongoDB | 30 days (TTL) |
| Notifications | MongoDB | 30 days (TTL) |
| User Data | MongoDB | Permanent |

---

## Testing the Setup

### Test 1: Check Server
```
Browser: http://localhost:3001
Should see KMS landing page ✅
```

### Test 2: Check Health
```bash
curl http://localhost:3001/api/health
Response: {"status":"ok","message":"Server is running"}
```

### Test 3: Test Upload
```bash
curl -X POST http://localhost:3001/api/upload/image \
  -F "file=@test.jpg"
Response: {"success":true,"url":"/uploads/..."}
```

---

## .env.local Setup

```env
# Database (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kms

# Auth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=generate-a-random-string

# Storage (optional - has defaults)
STORAGE_TYPE=local
MAX_UPLOAD_SIZE=5242880
```

---

## File Organization

```
kms-app/
├── public/uploads/         ← Images stored here (ignored in git)
├── src/
│   ├── lib/storage/        ← NEW: File upload handlers
│   ├── app/api/upload/     ← NEW: Upload endpoint
│   ├── hooks/
│   │   └── useFileUpload.ts ← NEW: Upload React hook
│   ├── models/             ← Updated with image support
│   ├── types/              ← Updated IAttachment
│   └── ...
├── .env.local              ← Your config (don't commit)
└── STORAGE_SETUP.md        ← Full documentation
```

---

## Future: Migration to Cloud

When you want to use Cloudinary or S3:

```env
# Just change these:
STORAGE_TYPE=cloudinary  # or 's3'
CLOUDINARY_API_KEY=...
# Or S3_BUCKET, S3_REGION, etc.
```

**No database changes needed!** URLs just change from:
- `/uploads/123.jpg` → `https://res.cloudinary.com/.../123.jpg`

---

## Key Features

✅ **Automatic Filename Generation** - Prevents collisions  
✅ **Validation** - File type & size checked  
✅ **Error Handling** - Clear error messages  
✅ **React Hook** - Easy to use in components  
✅ **Metadata** - Track upload time & size  
✅ **Cleanup** - Utilities to delete old files  
✅ **Git Safe** - Uploads ignored by git  
✅ **Scalable** - Easy to migrate to cloud  

---

## Quick Command Reference

```bash
# Start dev server (already running on 3001)
npm run dev

# Check running
curl http://localhost:3001

# Test upload
curl -X POST http://localhost:3001/api/upload/image -F "file=@image.jpg"

# Stop server
# Press Ctrl+C in terminal
```

---

## Related Documentation

📖 **STORAGE_SETUP.md** - Complete storage guide (25+ sections)  
📖 **STORAGE_IMPLEMENTATION.md** - What was implemented  
📖 **QUICK_START.md** - Getting started guide  
📖 **00_START_HERE.md** - Project overview  

---

## Status

| Component | Status |
|-----------|--------|
| Application | 🟢 Running on port 3001 |
| MongoDB | 🟡 Ready (configure in .env.local) |
| File Upload API | 🟢 Ready |
| React Hook | 🟢 Ready |
| Database Models | 🟢 Updated |
| Documentation | 🟢 Complete |
| TypeScript Types | 🟢 Updated |
| Environment Config | 🟢 Ready |

---

**Everything is configured and ready to use!**

Next: Configure MongoDB URI in `.env.local` and start building Phase 2 UI.

