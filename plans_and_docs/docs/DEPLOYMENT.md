# Deployment & Production Setup

**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-27  

---

## Deployment Architecture

```
┌─────────────┐
│  Local Dev  │
│  (3000)     │
└──────┬──────┘
       │
       ↓
┌──────────────────┐
│  Staging Server  │
│  (staging.kms)   │
└──────┬───────────┘
       │ (after approval)
       ↓
┌──────────────────┐
│  Production      │
│  (kms.yourdomain)│
└──────────────────┘
```

---

## Environments

### Development (Local)

**URL:** `http://localhost:3000`  
**Database:** MongoDB local or Atlas dev cluster  
**Cache:** Redis local  
**Auth:** Microsoft Entra ID (sandbox tenant)  

**Setup:**
```bash
npm run dev
```

---

### Staging

**URL:** `https://staging.kms.yourdomain.com`  
**Database:** MongoDB Atlas staging cluster  
**Cache:** Vercel KV staging  
**Auth:** Microsoft Entra ID (production tenant)  

**Purpose:** Test before production, mirror production setup  

---

### Production

**URL:** `https://kms.yourdomain.com`  
**Database:** MongoDB Atlas production cluster (auto-backup daily)  
**Cache:** Vercel KV production  
**Auth:** Microsoft Entra ID  

**Purpose:** Live application for team  

---

## Infrastructure Setup

### 1. MongoDB Atlas

**Cluster Configuration:**
- Cloud Provider: AWS
- Region: us-east-1 (or nearest to your location)
- Instance: M5 (2GB RAM, suitable for MVP)
- Storage: Automatic scaling
- Backups: Automated daily, 35-day retention

**Security:**
- Network Access: Whitelist IP ranges
- Encryption: At rest (default) + in transit (TLS)
- Authentication: Database user + password

**Monitoring:**
- Performance Advisor enabled
- Alert thresholds set for:
  - CPU > 70%
  - Memory > 80%
  - Disk > 85%

---

### 2. Vercel Deployment

**Configuration (vercel.json):**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url",
    "MICROSOFT_CLIENT_ID": "@microsoft_client_id",
    "MICROSOFT_CLIENT_SECRET": "@microsoft_client_secret"
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/:path*"
    }
  ],
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

**Environment Variables (Vercel Dashboard):**
1. Go to Settings → Environment Variables
2. Add for all environments (Development, Preview, Production):
   - MONGODB_URI
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - NEXTAUTH_MICROSOFT_ID
   - NEXTAUTH_MICROSOFT_SECRET
   - Redis credentials (KV)

---

### 3. Redis/Caching

**Option A: Vercel KV (Recommended)**

```typescript
// lib/redis.ts
import { kv } from '@vercel/kv';

export const cache = {
  get: async (key: string) => await kv.get(key),
  set: async (key: string, value: any, ttl?: number) => {
    if (ttl) {
      await kv.setex(key, ttl, value);
    } else {
      await kv.set(key, value);
    }
  },
  del: async (key: string) => await kv.del(key),
};
```

**Option B: Self-Hosted Redis**

```typescript
// lib/redis.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export const cache = {
  get: async (key: string) => await redis.get(key),
  set: async (key: string, value: any, ttl?: number) => {
    if (ttl) {
      await redis.setex(key, ttl, JSON.stringify(value));
    } else {
      await redis.set(key, JSON.stringify(value));
    }
  },
  del: async (key: string) => await redis.del(key),
};
```

---

## Deployment Pipeline

### GitHub to Staging

**Trigger:** Push to `staging` branch

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel (Staging)
        run: vercel deploy --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_STAGING }}
```

### GitHub to Production

**Trigger:** Merge pull request to `main` branch

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel (Production)
        run: vercel deploy --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_PROD }}
```

---

## Database Migrations

### Migration Setup

```typescript
// scripts/migrate.ts
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

const runMigrations = async () => {
  await connectDB();
  
  // Migration: Add new field to users
  console.log('Running migration: Add skills field to users');
  
  await User.updateMany(
    { skills: { $exists: false } },
    { $set: { skills: [] } }
  );
  
  console.log('Migration complete');
};

runMigrations().catch(console.error).finally(() => process.exit(0));
```

**Run migration:**
```bash
npm run migrate
```

---

## Backup & Disaster Recovery

### Backup Strategy

**Automated Backups:**
- MongoDB Atlas: Daily snapshots, 35-day retention
- Application files: Vercel automatically versions
- Environment variables: Stored in Vercel dashboard

**Manual Backup:**
```bash
# Download backup from MongoDB Atlas Dashboard
# Settings → Data Services → Backup & Restore → Download Snapshot
```

### Recovery Process

1. **Database Recovery:**
   - MongoDB Atlas → Backup & Restore → Restore Snapshot
   - Select target cluster and backup date
   - Restore to same cluster (overwrites) or different cluster

2. **Application Recovery:**
   - Vercel automatically keeps previous deployments
   - Revert to previous deployment from Vercel dashboard

3. **RTO/RPO:**
   - RTO (Recovery Time): 1 hour
   - RPO (Recovery Point): 24 hours

---

## Monitoring & Observability

### Error Tracking (Sentry)

**Setup:**

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

**Alerts:**
- Error rate > 5%
- New error type detected
- Repeated errors from same user

### Performance Monitoring (Vercel Analytics)

**Built-in metrics:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)

**Targets:**
- LCP: < 2.5 seconds
- FCP: < 1.8 seconds
- CLS: < 0.1

### Health Checks

```typescript
// pages/api/health.ts
export default async function handler(
  req: NextRequest,
  res: NextResponse
) {
  try {
    // Check database
    const dbCheck = await User.countDocuments();
    
    // Check Redis
    const cacheCheck = await cache.get('health-check');
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      cache: 'connected',
      timestamp: new Date(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}
```

**Monitor:** Uptime monitor checks `/api/health` every 5 minutes

---

## Security Checklist

**Before Production:**

- [ ] All environment variables set (never committed)
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] CSRF tokens implemented
- [ ] XSS protection enabled
- [ ] SQL injection prevention (MongoDB Injection)
- [ ] Authentication tested
- [ ] RBAC tested
- [ ] Audit logging enabled
- [ ] Sensitive data encrypted
- [ ] Backups working
- [ ] SSL certificate valid
- [ ] Security headers set

**HTTP Security Headers:**

```typescript
// next.config.js
export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};
```

---

## Scaling & Performance

### Current Capacity

- **Users:** 100+
- **Articles:** 1,000+
- **Monthly Views:** 10,000+
- **Concurrent Users:** 50+

### Scaling Strategy

**When to scale:**
- Response time > 2 seconds
- Error rate > 1%
- Database CPU > 80%

**Horizontal Scaling:**
- Vercel: Automatic (add more serverless instances)
- MongoDB: Upgrade cluster tier or shard

**Vertical Scaling:**
- Increase server RAM/CPU
- Increase MongoDB instance size
- Enable database caching

---

## Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing
- [ ] Code reviewed
- [ ] No console errors/warnings
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Backups taken
- [ ] Status page updated

**Post-Deployment:**
- [ ] Health check passing
- [ ] No errors in Sentry
- [ ] Performance metrics acceptable
- [ ] User feedback collected
- [ ] Rollback plan ready

---

## Rollback Process

**If deployment fails:**

1. **Immediate Actions:**
   - Alert team
   - Revert to previous deployment (Vercel: one-click)
   - Check for data corruption

2. **Investigation:**
   - Review error logs (Sentry)
   - Check database integrity
   - Identify root cause

3. **Fix & Redeploy:**
   - Fix issue
   - Test thoroughly
   - Redeploy with monitoring

---

## Cost Optimization

**Current Costs (Estimated):**
- Vercel: $20/month (starter)
- MongoDB Atlas: $57/month (M5 instance)
- Vercel KV: $5/month
- Email service: $5/month
- Domain: $15/year
- **Total: ~$87/month**

**Cost Reduction:**
- Archive old data (reduces DB size)
- Optimize images (reduce bandwidth)
- Cache aggressively
- Use edge functions where possible

---

**Document Status:** ✅ Ready for Development
