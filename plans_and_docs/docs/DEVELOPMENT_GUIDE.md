# Development Guide & Coding Standards

**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-27  

---

## Project Setup

### Prerequisites
- Node.js 20+ LTS
- npm or yarn
- MongoDB Atlas account
- GitHub account
- VS Code (recommended)

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/yourorgan/kms.git
cd kms

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local

# 4. Configure .env.local
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# 5. Run migrations (if any)
npm run migrate

# 6. Start development server
npm run dev

# 7. Open browser
# http://localhost:3000
```

---

## Code Style & Standards

### TypeScript

**Strict Mode:** Enabled (tsconfig.json)

```typescript
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitAny": true
  }
}
```

**File Extensions:**
- React components: `.tsx`
- Utilities: `.ts`
- Tests: `.test.ts` or `.spec.ts`

**Type Definitions:**

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  role: 'Engineer' | 'TeamLead' | 'Manager' | 'Admin';
}

// ❌ Bad
interface User {
  id: any;
  email: string;
  role: string;
}
```

---

### Naming Conventions

**Components (PascalCase):**
```typescript
// ✅ Good
export const UserProfile: React.FC = () => {};
export const ArticleCard: React.FC<Props> = () => {};

// ❌ Bad
export const userProfile = () => {};
export const article_card = () => {};
```

**Utilities & Hooks (camelCase):**
```typescript
// ✅ Good
export const formatDate = (date: Date): string => {};
export const useArticles = () => {};

// ❌ Bad
export const FormatDate = (date: Date): string => {};
export const UseArticles = () => {};
```

**Constants (SCREAMING_SNAKE_CASE):**
```typescript
// ✅ Good
export const MAX_TITLE_LENGTH = 200;
export const DEFAULT_PAGE_SIZE = 20;
export const API_BASE_URL = 'https://api.example.com';

// ❌ Bad
export const max_title_length = 200;
export const defaultPageSize = 20;
```

**Database Models (PascalCase, singular):**
```typescript
// ✅ Good
const User = model('User', userSchema);
const Article = model('Article', articleSchema);

// ❌ Bad
const user = model('user', userSchema);
const articles = model('articles', articleSchema);
```

---

### File Organization

**Directory Structure:**

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (protected)/
│   │   ├── dashboard/page.tsx
│   │   ├── knowledge/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── create/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── knowledge/
│   │   │   ├── route.ts (GET, POST)
│   │   │   └── [id]/route.ts (GET, PUT, DELETE)
│   │   ├── middleware.ts
│   │   └── error-handler.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── shared/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── dashboard/
│   │   ├── DashboardHeader.tsx
│   │   ├── StatsCard.tsx
│   │   └── ...
│   ├── knowledge/
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleEditor.tsx
│   │   └── ...
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useArticles.ts
│   ├── useSearch.ts
│   └── ...
├── lib/
│   ├── api-client.ts
│   ├── constants.ts
│   ├── utils.ts
│   ├── validators.ts
│   ├── permissions.ts
│   └── ...
├── models/
│   ├── User.ts
│   ├── KnowledgeArticle.ts
│   ├── Ticket.ts
│   ├── Activity.ts
│   └── ...
├── services/
│   ├── KnowledgeService.ts
│   ├── TicketService.ts
│   ├── SearchService.ts
│   └── ...
├── store/
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── ...
├── types/
│   └── index.ts
├── middleware/
│   ├── auth.ts
│   ├── rbac.ts
│   └── error-handler.ts
├── styles/
│   └── globals.css
├── auth.config.ts
└── env.ts
```

---

### React Components

**Functional Components:**

```typescript
// ✅ Good
interface ArticleCardProps {
  id: string;
  title: string;
  owner: string;
  onEdit: (id: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  id,
  title,
  owner,
  onEdit,
}) => {
  return (
    <div className="p-4 border rounded">
      <h3>{title}</h3>
      <p>{owner}</p>
      <button onClick={() => onEdit(id)}>Edit</button>
    </div>
  );
};

// ❌ Bad
export const ArticleCard = (props: any) => {
  const { id, title, owner, onEdit } = props;
  // No types, no proper structure
};
```

**Hooks:**

```typescript
// ✅ Good
export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await fetch('/api/knowledge').then(r => r.json());
        setArticles(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return { articles, loading, error };
};
```

---

### Formatting

**Prettier Configuration (.prettierrc):**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

**ESLint Configuration (.eslintrc.json):**

```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "@next/next/no-html-link-for-pages": "off"
  }
}
```

**Auto-format on save (VS Code):**

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

### Comments & Documentation

**Inline Comments:**

```typescript
// ✅ Good
// Check if article is already published
if (article.status === 'Published') {
  return true;
}

// ❌ Bad
// Check status
if (article.status === 'Published') {
  return true;
}
```

**Function Documentation:**

```typescript
/**
 * Fetch knowledge articles with optional filtering
 * 
 * @param {FetchArticlesOptions} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {string} options.search - Search query
 * @param {string} options.application - Filter by application
 * 
 * @returns {Promise<ArticlesResponse>} Articles and pagination info
 * 
 * @example
 * const articles = await fetchArticles({
 *   page: 1,
 *   search: 'Drake',
 *   application: 'Drake'
 * });
 */
export const fetchArticles = async (
  options: FetchArticlesOptions
): Promise<ArticlesResponse> => {
  // Implementation
};
```

---

### Error Handling

**Try-Catch Pattern:**

```typescript
// ✅ Good
try {
  const article = await fetchArticle(id);
  setArticle(article);
} catch (error) {
  if (error instanceof NotFoundError) {
    showToast('Article not found', 'error');
  } else if (error instanceof AuthenticationError) {
    redirectToLogin();
  } else {
    console.error('Unexpected error:', error);
    showToast('Something went wrong', 'error');
  }
}

// ❌ Bad
try {
  const article = await fetchArticle(id);
  setArticle(article);
} catch (error) {
  console.log(error); // No proper error handling
}
```

**API Error Responses:**

```typescript
// ✅ Good
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message || 'Request failed');
}

// ❌ Bad
if (!response.ok) {
  throw new Error('Error');
}
```

---

### Testing

**Unit Tests:**

```typescript
// articles.test.ts
import { render, screen } from '@testing-library/react';
import { ArticleCard } from '@/components/ArticleCard';

describe('ArticleCard', () => {
  it('renders article title', () => {
    render(
      <ArticleCard
        id="1"
        title="Test Article"
        owner="John"
        onEdit={() => {}}
      />
    );
    
    expect(screen.getByText('Test Article')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    render(
      <ArticleCard
        id="1"
        title="Test"
        owner="John"
        onEdit={onEdit}
      />
    );
    
    screen.getByText('Edit').click();
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});
```

---

### Imports Organization

**Order:**

```typescript
// 1. External imports
import React from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// 2. Internal component imports
import { Button } from '@/components/shared/Button';
import { ArticleCard } from '@/components/ArticleCard';

// 3. Hook imports
import { useArticles } from '@/hooks/useArticles';

// 4. Type imports
import type { Article, User } from '@/types';

// 5. Utility imports
import { formatDate } from '@/lib/utils';
import { ARTICLE_STATUSES } from '@/lib/constants';

// 6. Styles
import styles from './ArticleList.module.css';
```

---

## Git Workflow

### Branch Strategy

```
main (production)
  ↓
staging (pre-production)
  ↓
develop (integration)
  ↓
feature/* (feature development)
bug/* (bug fixes)
chore/* (maintenance)
```

### Commit Messages

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example:**
```
feat(knowledge): add duplicate article detection

Added AI-powered duplicate detection when creating new articles.
Uses TF-IDF similarity scoring to find existing articles with
similar titles and symptoms.

Closes #42
```

**Types:**
- `feat` – New feature
- `fix` – Bug fix
- `docs` – Documentation
- `style` – Formatting (no logic change)
- `refactor` – Code restructuring
- `test` – Add/modify tests
- `chore` – Dependencies, configs

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/main.yml
name: CI/CD

on:
  push:
    branches: [develop, staging, main]
  pull_request:
    branches: [develop, staging, main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Test
        run: npm run test
      
      - name: Build
        run: npm run build

  deploy:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: npm run deploy
```

---

## Performance Optimization

### Bundle Size Analysis

```bash
npm run build
npm run analyze
```

### Code Splitting

```typescript
// ✅ Good - Dynamic import
const ArticleEditor = dynamic(() => import('@/components/ArticleEditor'), {
  loading: () => <Skeleton />,
});

// Use
<ArticleEditor />
```

### Image Optimization

```typescript
// ✅ Good
import Image from 'next/image';

<Image
  src="/article-banner.jpg"
  alt="Article banner"
  width={1200}
  height={600}
  priority // For LCP image
/>

// ❌ Bad
<img src="/article-banner.jpg" alt="Article banner" />
```

---

## Debugging

### VS Code Debug Configuration

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## Documentation Standards

### Code Comments

```typescript
// Single line comment for simple explanation
const MAX_RETRIES = 3;

/**
 * Multi-line JSDoc for functions
 * @param param - description
 * @returns description
 */
function example(param: string): string {
  return param;
}
```

### README Updates

- Update when adding new features
- Include setup instructions
- Add contribution guidelines

---

## Performance Checklist

- [ ] TypeScript strict mode enabled
- [ ] ESLint and Prettier configured
- [ ] Pre-commit hooks (Husky) configured
- [ ] Environment variables in .env.local (never in code)
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Tests written for critical functions
- [ ] Bundle size monitored
- [ ] Images optimized
- [ ] API calls debounced/throttled

---

**Document Status:** ✅ Ready for Development
