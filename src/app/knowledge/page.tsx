'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components';

interface Article {
  _id: string;
  title: string;
  description?: string;
  application: string;
  symptoms: string;
  status: 'Draft' | 'UnderReview' | 'Approved' | 'Published' | 'Archived';
  tags: string[];
  views: number;
  owner?: { name?: string; email?: string };
  updatedAt: string;
}

const STATUS_OPTIONS = ['All', 'Draft', 'UnderReview', 'Approved', 'Published', 'Archived'];

export default function KnowledgeBaseListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [application, setApplication] = useState('');
  const [status, setStatus] = useState('All');

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (application) params.set('application', application);
      if (status && status !== 'All') params.set('status', status);
      params.set('limit', '50');

      const res = await fetch(`/api/knowledge?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load knowledge articles');
      }
      setArticles(json.data.articles || []);
      setTotal(json.data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load knowledge articles');
    } finally {
      setLoading(false);
    }
  }, [search, application, status]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const applications = Array.from(new Set(articles.map((a) => a.application).filter(Boolean)));

  return (
    <AppLayout>
      <div className="p-lg max-w-[1600px] mx-auto space-y-lg">
        <div className="flex justify-between items-end pb-sm border-b border-outline-variant/20">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface tracking-tight">Knowledge Base</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Search resolved issues instantly instead of asking the team.
            </p>
          </div>
          <Link href="/knowledge/create">
            <Button>+ New Article</Button>
          </Link>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg text-body-sm">
            {error}
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md grid grid-cols-1 md:grid-cols-4 gap-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issue, symptom, application, tag..."
            className="input md:col-span-2"
          />
          <select
            value={application}
            onChange={(e) => setApplication(e.target.value)}
            className="input"
          >
            <option value="">All Applications</option>
            {applications.map((app) => (
              <option key={app} value={app}>
                {app}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <p className="text-body-sm text-on-surface-variant">{total} article(s) found</p>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
          {loading && (
            <div className="col-span-full text-center py-10 text-on-surface-variant">Loading...</div>
          )}
          {!loading && articles.length === 0 && (
            <div className="col-span-full text-center py-10 text-on-surface-variant">
              No articles found. Click &quot;New Article&quot; to document your first issue.
            </div>
          )}
          {articles.map((article) => (
            <Link
              key={article._id}
              href={`/knowledge/${article._id}`}
              className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md hover:border-primary/50 hover:shadow-md transition-all flex flex-col gap-sm"
            >
              <div className="flex items-center justify-between gap-sm">
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-secondary-container text-on-secondary-container">
                  {article.application}
                </span>
                <StatusBadge status={article.status} />
              </div>
              <h3 className="font-h3 text-h3 text-on-surface line-clamp-2">{article.title}</h3>
              <p className="text-body-sm text-on-surface-variant line-clamp-2">{article.symptoms}</p>
              <div className="flex items-center justify-between mt-auto pt-sm text-[11px] text-on-surface-variant border-t border-outline-variant/20">
                <span>{article.owner?.name || 'Unknown'}</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  {article.views ?? 0}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          background: var(--tw-color-surface, #fff);
          border: 1px solid rgba(115, 118, 134, 0.3);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
        }
        .input:focus {
          outline: none;
          border-color: #004ac6;
        }
      `}</style>
    </AppLayout>
  );
}

function StatusBadge({ status }: { status: Article['status'] }) {
  const map: Record<string, string> = {
    Draft: 'bg-surface-container-high text-on-surface-variant',
    UnderReview: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    Approved: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    Published: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    Archived: 'bg-surface-container-high text-on-surface-variant',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${map[status] || ''}`}>
      {status}
    </span>
  );
}
