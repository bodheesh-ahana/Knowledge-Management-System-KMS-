# KMS Phase 1 - Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Navigate to Project
```bash
cd c:\Bodheesh\ vc\KMS\kms-app\
```

### Step 2: Install Dependencies
```bash
npm install
```
**Expected:** ~2 minutes, ~500 packages installed

### Step 3: Configure Environment
```bash
cp .env.example .env.local
```

**Edit `.env.local` with your settings:**
```env
# MongoDB (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kms?retryWrites=true&w=majority

# NextAuth (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-string-here

# Optional: Entra ID OAuth
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=
```

### Step 4: Start Development Server
```bash
npm run dev
```

**Expected output:**
```
> next dev

  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.1s
```

### Step 5: Open in Browser
Visit **http://localhost:3000**

---

## 🧪 Verify Everything Works

### Test 1: Home Page
- URL: http://localhost:3000
- Should see landing page with "Knowledge Management System"

### Test 2: Health Check
```bash
curl http://localhost:3000/api/health
```
**Expected response:**
```json
{"status":"ok","message":"Server is running"}
```

### Test 3: Dashboard
- URL: http://localhost:3000/dashboard
- Should redirect to login (authentication working)

---

## 📁 Project Structure Quick Tour

### Core Folders

```
src/app/                    ← Pages and API routes
src/components/             ← Reusable React components  
src/models/                 ← 10 MongoDB collections
src/services/               ← Business logic
src/hooks/                  ← React Query hooks
src/lib/                    ← Utilities and helpers
```

### Most Important Files

```
.env.local                  ← Your configuration (NEVER commit)
package.json                ← Dependencies and scripts
src/types/index.ts          ← All TypeScript types
src/models/index.ts         ← All database models
```

---

## 💻 Common Developer Tasks

### View a Component
```bash
# Open in editor
code src/components/Button.tsx
```

### Test a Component
```bash
npm run test -- Button
```

### Build for Production
```bash
npm run build
npm start
```

### Format Code
```bash
npm run lint
```

### View Database Schema
```bash
# See all models
code src/models/
```

---

## 🔌 API Quick Test

### Create a Knowledge Article (using curl)

```bash
curl -X POST http://localhost:3000/api/knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to fix Drake QBD error",
    "application": "Drake",
    "symptoms": "QBD file corruption error",
    "rootCause": "Incorrect file permissions",
    "resolution": "Reset file permissions to default",
    "description": "Test article"
  }'
```

### Get All Articles
```bash
curl http://localhost:3000/api/knowledge
```

### Get Health Status
```bash
curl http://localhost:3000/api/health
```

---

## 🚨 Troubleshooting

### Issue: Port 3000 Already in Use
```bash
# Use different port
PORT=3001 npm run dev
```

### Issue: MongoDB Connection Error
**Check:**
1. MongoDB URI is correct in `.env.local`
2. IP address is whitelisted in MongoDB Atlas
3. Database user has correct permissions

### Issue: Dependencies Won't Install
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript Errors
```bash
# Rebuild TypeScript
npx tsc --noEmit
```

---

## 📚 Available Scripts

```bash
npm run dev              # Start development (port 3000)
npm run build            # Build for production
npm start                # Run production build
npm run lint             # Check code quality
npm run test             # Run unit tests
npm run test:watch       # Tests in watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests
```

---

## 🎯 Next: Phase 2 Preview

After Phase 1 is comfortable, Phase 2 will add:

1. **Dashboard UIs** - Interactive dashboards for each role
2. **Knowledge Base UI** - Full CRUD interface
3. **Ticket Management** - Ticket interface
4. **Global Search** - Cmd+K command palette
5. **Real Data** - Connect to actual application data

---

## 📖 Learn More

```
Project Structure    → See PHASE1_SETUP.md
API Documentation   → See /docs/API_SPECIFICATION.md
Database Schema     → See /docs/DATABASE.md
Development Guide   → See /docs/DEVELOPMENT_GUIDE.md
Architecture        → See /docs/ARCHITECTURE.md
```

---

## 🆘 Need Help?

1. **Check Logs** - Console output has error messages
2. **Read Documentation** - See `/docs` folder
3. **Check Examples** - Look at existing API routes
4. **Test with curl** - Verify API endpoints work
5. **Use VS Code Debugger** - Set breakpoints and debug

---

## ✅ Success Checklist

After setup, verify:

- [ ] `npm install` completed without errors
- [ ] `.env.local` file created with your settings
- [ ] `npm run dev` starts without errors
- [ ] Browser shows http://localhost:3000 landing page
- [ ] `/api/health` endpoint returns success
- [ ] Dashboard page accessible (though login required)

**If all checkmarks are done: You're ready for Phase 2! 🎉**

---

**Quick Start Complete!**

Now you can:
- ✅ Develop new features
- ✅ Test API endpoints  
- ✅ Build UI components
- ✅ Debug with full tooling

Happy coding! 🚀
