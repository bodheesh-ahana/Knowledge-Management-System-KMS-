# Testing Strategy & QA Guide

**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-27  

---

## Testing Overview

Testing hierarchy (pyramid):

```
        /\
       /  \   E2E Tests
      /────\
     /      \
    /────────\  Integration Tests
   /          \
  /────────────\
 /              \  Unit Tests
/________________\
```

**Target Coverage:** 80%+ code coverage

---

## Unit Testing

### Framework: Jest + React Testing Library

### Setup

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### Utilities Testing

**File:** `src/lib/utils.test.ts`

```typescript
import { formatDate, calculateDays } from '@/lib/utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2025-01-03');
    expect(formatDate(date)).toBe('Jan 3, 2025');
  });

  it('handles invalid dates', () => {
    expect(formatDate(new Date('invalid'))).toBe('Invalid date');
  });
});

describe('calculateDays', () => {
  it('calculates days correctly', () => {
    const date1 = new Date('2025-01-01');
    const date2 = new Date('2025-01-08');
    expect(calculateDays(date1, date2)).toBe(7);
  });
});
```

### Component Testing

**File:** `src/components/ArticleCard.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ArticleCard } from '@/components/ArticleCard';

describe('ArticleCard', () => {
  const defaultProps = {
    id: '1',
    title: 'Test Article',
    owner: 'John Doe',
    onEdit: jest.fn(),
  };

  it('renders article title', () => {
    render(<ArticleCard {...defaultProps} />);
    expect(screen.getByText('Test Article')).toBeInTheDocument();
  });

  it('renders owner name', () => {
    render(<ArticleCard {...defaultProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    render(<ArticleCard {...defaultProps} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(defaultProps.onEdit).toHaveBeenCalledWith('1');
  });

  it('disables button when disabled prop is true', () => {
    render(<ArticleCard {...defaultProps} disabled />);
    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();
  });
});
```

### Hook Testing

**File:** `src/hooks/useArticles.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useArticles } from '@/hooks/useArticles';

describe('useArticles', () => {
  it('fetches articles on mount', async () => {
    const { result } = renderHook(() => useArticles());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.articles).toBeDefined();
    expect(Array.isArray(result.current.articles)).toBe(true);
  });

  it('handles errors', async () => {
    // Mock fetch to reject
    global.fetch = jest.fn(() => Promise.reject(new Error('Failed')));

    const { result } = renderHook(() => useArticles());

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });
});
```

---

## Integration Testing

### API Testing

**File:** `src/app/api/knowledge/route.test.ts`

```typescript
import { POST, GET } from '@/app/api/knowledge/route';
import { connectDB } from '@/lib/mongodb';

// Mock database
jest.mock('@/lib/mongodb');

describe('Knowledge API', () => {
  beforeAll(() => {
    // Setup test database
  });

  afterEach(async () => {
    // Cleanup
  });

  describe('POST /api/knowledge', () => {
    it('creates new article', async () => {
      const req = new Request('http://localhost:3000/api/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          title: 'Test Article',
          application: 'Drake',
          symptoms: 'Test symptoms',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Test Article');
    });

    it('validates required fields', async () => {
      const req = new Request('http://localhost:3000/api/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          // Missing required fields
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('enforces RBAC', async () => {
      // Test with non-engineer role
      const req = new Request('http://localhost:3000/api/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer non-engineer-token',
        },
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/knowledge', () => {
    it('returns list of articles', async () => {
      const req = new Request('http://localhost:3000/api/knowledge?page=1', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('applies filters', async () => {
      const req = new Request(
        'http://localhost:3000/api/knowledge?application=Drake&status=Published',
        { method: 'GET' }
      );

      const res = await GET(req);
      const data = await res.json();

      expect(data.data.every(a => a.application === 'Drake')).toBe(true);
      expect(data.data.every(a => a.status === 'Published')).toBe(true);
    });
  });
});
```

### Workflow Testing

Test complete user workflows:

```typescript
describe('Create Article Workflow', () => {
  it('completes from start to finish', async () => {
    // 1. Login
    const loginRes = await login('user@example.com', 'password');
    const token = loginRes.token;

    // 2. Create article
    const createRes = await createArticle(token, {
      title: 'Drake Icons',
      application: 'Drake',
      symptoms: 'Icons not showing',
    });
    const articleId = createRes.data.id;

    // 3. Verify created
    const getRes = await getArticle(token, articleId);
    expect(getRes.data.status).toBe('Draft');

    // 4. Submit for review
    const submitRes = await submitArticle(token, articleId);
    expect(submitRes.data.status).toBe('UnderReview');

    // 5. Team lead approves
    const approveRes = await approveArticle(teamLeadToken, articleId);
    expect(approveRes.data.status).toBe('Published');

    // 6. Article searchable
    const searchRes = await search(token, 'Drake Icons');
    expect(searchRes.data.find(a => a.id === articleId)).toBeDefined();
  });
});
```

---

## End-to-End (E2E) Testing

### Framework: Playwright

### Setup

```bash
npm install --save-dev @playwright/test
```

### Test Configuration

**File:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
```

### E2E Tests

**File:** `tests/e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('User can login with email and password', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    
    await page.waitForNavigation();
    await expect(page).toHaveURL('/dashboard');
    
    // Verify logged in
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('User logout clears session', async ({ page }) => {
    // Login first
    await loginAs(page, 'user@example.com', 'password123');
    
    // Logout
    await page.click('[data-test="user-menu"]');
    await page.click('text=Logout');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Knowledge Base Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginAs(page, 'user@example.com', 'password123');
  });

  test('Engineer can create and publish article', async ({ page }) => {
    // Navigate to create
    await page.click('text=Create Article');
    
    // Fill form
    await page.fill('input[placeholder="Title"]', 'Drake Icons Not Showing');
    await page.selectOption('select[name="application"]', 'Drake');
    await page.fill('textarea[placeholder="Symptoms"]', 'Drake icons missing');
    
    // Save as draft
    await page.click('button:has-text("Save Draft")');
    await expect(page.locator('text=Draft saved')).toBeVisible();
    
    // Submit for review
    await page.click('button:has-text("Submit for Review")');
    await expect(page.locator('text=Submitted for review')).toBeVisible();
  });

  test('Search finds created articles', async ({ page }) => {
    // Open search
    await page.keyboard.press('Control+K');
    
    // Search
    await page.fill('input[placeholder="Search..."]', 'Drake');
    
    // Wait for results
    await page.waitForSelector('[data-test="search-result"]');
    
    // Verify result
    const results = await page.locator('[data-test="search-result"]').count();
    expect(results).toBeGreaterThan(0);
  });
});
```

### Run E2E Tests

```bash
# Run all tests
npm run test:e2e

# Run specific test
npm run test:e2e -- tests/e2e/auth.spec.ts

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run with debug
npm run test:e2e -- --debug
```

---

## Test Data Management

### Fixtures

**File:** `tests/fixtures.ts`

```typescript
export const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
};

export const testArticle = {
  title: 'Test Article',
  application: 'Drake',
  symptoms: 'Test symptoms',
  rootCause: 'Test root cause',
  resolution: 'Test resolution',
};

export const createTestUser = async () => {
  // Create user in database
};

export const createTestArticle = async (userId) => {
  // Create article for user
};
```

---

## Performance Testing

### Bundle Size Analysis

```bash
npm run analyze
```

### Lighthouse Testing

```bash
npm run lighthouse
```

### Performance Benchmarks

Target metrics:

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FCP (First Contentful Paint) | < 1.8s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTL (Time to Interactive) | < 3.8s |
| Bundle Size | < 300KB (gzipped) |

---

## Accessibility Testing

### Automated Testing

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('page is accessible', async ({ page }) => {
  await page.goto('/dashboard');
  
  await injectAxe(page);
  await checkA11y(page);
});
```

### Manual Testing

- [ ] Keyboard navigation (Tab, Shift+Tab)
- [ ] Screen reader (NVDA, JAWS)
- [ ] Color contrast verification
- [ ] Focus management

---

## Test Coverage

### Run Coverage Report

```bash
npm run test:coverage
```

### Coverage Targets

| Category | Target |
|----------|--------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Bug Reporting

### Bug Report Template

```markdown
# Bug Report: [Title]

## Description
Clear description of the issue

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
Attach screenshots

## Environment
- Browser: Chrome 120
- OS: Windows 11
- Version: 1.0.0

## Severity
- [ ] Critical (app broken)
- [ ] High (major functionality broken)
- [ ] Medium (minor functionality broken)
- [ ] Low (cosmetic issue)
```

---

**Document Status:** ✅ Ready for Development
