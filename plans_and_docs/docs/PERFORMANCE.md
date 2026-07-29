# Performance Optimization Guide

**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-27  

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| LCP (Largest Contentful Paint) | < 2.5s | N/A |
| FCP (First Contentful Paint) | < 1.8s | N/A |
| CLS (Cumulative Layout Shift) | < 0.1 | N/A |
| Bundle Size (gzipped) | < 300KB | Monitor |
| Time to Interactive | < 3.8s | N/A |
| Database Query | < 200ms | Monitor |
| API Response | < 500ms | Monitor |
| Page Load | < 2s | Monitor |

---

## Frontend Performance

### Code Splitting

**Automatic:**
```typescript
// Next.js automatically splits at page level
// pages/dashboard.tsx - separate bundle
// pages/knowledge/[id].tsx - separate bundle
```

**Manual:**
```typescript
// Dynamic imports for heavy components
const ArticleEditor = dynamic(
  () => import('@/components/ArticleEditor'),
  { loading: () => <Skeleton /> }
);

<ArticleEditor />
```

### Image Optimization

**Use Next.js Image Component:**
```typescript
import Image from 'next/image';

<Image
  src="/article-banner.jpg"
  alt="Article banner"
  width={1200}
  height={600}
  priority // For LCP images (above fold)
  placeholder="blur" // Show blur while loading
  blurDataURL="data:image/..." // Blur placeholder
/>
```

**Benefits:**
- Automatic format conversion (AVIF, WebP)
- Responsive image sizes
- Lazy loading below fold
- CLS prevention (automatic sizing)

### Bundle Analysis

```bash
# Analyze bundle
npm run analyze

# Look for:
# - Large dependencies (> 100KB)
# - Duplicate dependencies
# - Unused code
```

### Tree Shaking

Ensure `package.json` has `sideEffects: false`:

```json
{
  "sideEffects": false,
  "imports": {
    "#utils": {
      "import": "./src/utils/index.ts"
    }
  }
}
```

### Minification

Next.js automatically minifies in production:
```bash
npm run build
# Creates optimized .next folder
```

---

## Frontend Rendering

### Server-Side Rendering (SSR)

Use for:
- Pages needing SEO (blog posts)
- Pages with dynamic content
- Pages with user-specific data

```typescript
// app/knowledge/[id]/page.tsx
export default async function ArticlePage({ params }) {
  const article = await fetchArticle(params.id);
  
  return <ArticleView article={article} />;
}
```

### Static Generation (SSG)

Use for:
- Static content (about page)
- Content that rarely changes

```typescript
// app/applications/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function ApplicationsPage() {
  const apps = await fetchApplications();
  
  return <AppList apps={apps} />;
}
```

### Incremental Static Regeneration (ISR)

```typescript
export const revalidate = 300; // Revalidate every 5 minutes

export default async function ArticlePage({ params }) {
  const article = await fetchArticle(params.id);
  
  return <ArticleView article={article} />;
}
```

### Client-Side Rendering

Use for:
- Dashboard with real-time updates
- Interactive components
- User-specific content

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [articles, setArticles] = useState([]);
  
  useEffect(() => {
    fetchArticles().then(setArticles);
  }, []);
  
  return <ArticleList articles={articles} />;
}
```

---

## Data Fetching Optimization

### React Query (TanStack Query)

Cache server data efficiently:

```typescript
import { useQuery } from '@tanstack/react-query';

export function useArticles(page: number) {
  return useQuery({
    queryKey: ['articles', page],
    queryFn: () => fetchArticles({ page }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

// Usage
const { data, isLoading } = useArticles(1);
```

### Backend Caching

Cache API responses:

```typescript
// cache results in Redis
export async function getArticles(page: number) {
  const cacheKey = `articles:page:${page}`;
  
  // Check cache
  const cached = await cache.get(cacheKey);
  if (cached) return cached;
  
  // Fetch from DB
  const articles = await Article.find()
    .skip((page - 1) * 20)
    .limit(20);
  
  // Store in cache (5 min TTL)
  await cache.set(cacheKey, articles, 300);
  
  return articles;
}
```

### Database Query Optimization

**Indexes:**
```javascript
// Create indexes for frequently queried fields
db.knowledgeArticles.createIndex({ title: 'text', symptoms: 'text' });
db.knowledgeArticles.createIndex({ application: 1, status: 1 });
db.knowledgeArticles.createIndex({ owner: 1, createdAt: -1 });
```

**Pagination:**
```typescript
// Always paginate large result sets
export async function getArticles(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  
  const [articles, total] = await Promise.all([
    Article.find().skip(skip).limit(limit),
    Article.countDocuments(),
  ]);
  
  return {
    articles,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
```

**Lean Queries:**
```typescript
// Use lean() for read-only queries (faster)
const articles = await Article.find().lean();
```

---

## Network Optimization

### CDN & Static Assets

Static assets served from Vercel CDN:
- Images
- CSS files
- JavaScript bundles
- Fonts

All cached globally with instant invalidation on deploy.

### Compression

Enable gzip compression in Next.js:
```typescript
// next.config.js
export default {
  compress: true, // Default in production
};
```

### HTTP/2 & HTTP/3

Vercel automatically uses:
- HTTP/2 for multiplexing
- HTTP/3 (QUIC) where supported

### Request Batching

Combine multiple API calls:

```typescript
// Bad: 3 separate requests
const articles = await fetchArticles();
const tickets = await fetchTickets();
const activities = await fetchActivities();

// Good: 1 request
const data = await fetchDashboard();
```

---

## Frontend Metrics Monitoring

### Core Web Vitals

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Custom Metrics

```typescript
// Report custom metrics
export function reportWebVitals(metric) {
  console.log(metric);
  
  // Send to analytics
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metric),
  });
}
```

---

## Database Performance

### Connection Pooling

Mongoose automatically handles connection pooling:

```typescript
// Configured in mongoose.connect()
const connection = await mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 5,
});
```

### Query Profiling

```javascript
// Enable slow query logging
db.setProfilingLevel(1, { slowms: 100 }); // Log queries > 100ms
db.system.profile.find().sort({ ts: -1 }).limit(10).pretty();
```

### Aggregation Pipeline

Use for complex queries:

```typescript
// Efficient aggregation
const stats = await Article.aggregate([
  { $match: { status: 'Published' } },
  {
    $group: {
      _id: '$application',
      count: { $sum: 1 },
      avgViews: { $avg: '$views' },
    },
  },
  { $sort: { count: -1 } },
]);
```

---

## API Performance

### Response Compression

```typescript
// app/api/route.ts
export async function GET(req: Request) {
  const data = await fetchData();
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Encoding': 'gzip', // Automatic in Vercel
    },
  });
}
```

### Pagination for Large Results

```typescript
// Always paginate
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  
  const data = await Article.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  
  return Response.json({ data, page, limit });
}
```

### Field Selection

```typescript
// Only fetch needed fields
const articles = await Article.find()
  .select('title application owner status')
  .lean();
```

---

## Caching Strategy

### Browser Caching

```typescript
// next.config.js
export default {
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};
```

### Redis Caching

```typescript
// Cache frequently accessed data
export async function getCachedArticles(page: number) {
  const key = `articles:${page}`;
  
  // Try cache first
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  // Fetch and cache
  const articles = await fetchArticles(page);
  await redis.setex(key, 300, JSON.stringify(articles)); // 5 min TTL
  
  return articles;
}
```

### Cache Invalidation

```typescript
// Invalidate on updates
export async function updateArticle(id: string, data: any) {
  await Article.findByIdAndUpdate(id, data);
  
  // Invalidate cache
  await redis.del(`article:${id}`);
  await redis.del('articles:*'); // Clear all article caches
}
```

---

## Performance Monitoring

### Set Up Monitoring

```typescript
// Vercel Analytics (automatic)
// - Core Web Vitals
// - Page performance
// - User experience metrics

// Sentry (error tracking)
// - Real User Monitoring (RUM)
// - Performance transactions
```

### Set Alerts

| Metric | Threshold | Action |
|--------|-----------|--------|
| LCP | > 2.5s | Alert |
| API Response | > 500ms | Alert |
| Error Rate | > 1% | Alert |
| Database Query | > 200ms | Alert |

---

## Performance Checklist

- [ ] Images optimized (Next.js Image)
- [ ] Code splitting enabled
- [ ] Bundle analyzed (< 300KB gzipped)
- [ ] Caching strategy implemented
- [ ] Database indexes created
- [ ] API pagination implemented
- [ ] Redis caching enabled
- [ ] Compression enabled
- [ ] Monitoring set up
- [ ] Alerts configured
- [ ] Performance tested
- [ ] Load testing done

---

**Document Status:** ✅ Ready for Development
