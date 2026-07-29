'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components';

interface Step {
  order: number;
  description: string;
}

interface Article {
  _id: string;
  title: string;
  description?: string;
  application: string;
  symptoms: string;
  rootCause: string;
  resolution: string;
  prevention?: string;
  troubleshootingSteps: Step[];
  status: 'Draft' | 'UnderReview' | 'Approved' | 'Published' | 'Archived';
  tags: string[];
  views: number;
  owner?: { name?: string; email?: string; _id?: string };
  updatedAt: string;
  createdAt: string;
}

export default function KnowledgeArticleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchArticle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/knowledge/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load article');
      }
      setArticle(json.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchArticle();
  }, [id, fetchArticle]);

  const handleDelete = async () => {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete article');
      }
      router.push('/knowledge');
    } catch (err: any) {
      setError(err.message || 'Failed to delete article');
      setDeleting(false);
    }
  };

  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/knowledge/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Published' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to publish article');
      }
      setArticle(json.data);
    } catch (err: any) {
      setError(err.message || 'Failed to publish article');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-lg text-center text-on-surface-variant">Loading...</div>
      </AppLayout>
    );
  }

  if (error || !article) {
    return (
      <AppLayout>
        <div className="p-lg space-y-md">
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg text-body-sm">
            {error || 'Article not found'}
          </div>
          <Link href="/knowledge" className="text-primary text-body-sm">
            &larr; Back to Knowledge Base
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-lg max-w-[900px] mx-auto space-y-lg">
        <nav className="flex items-center gap-xs text-on-surface-variant font-body-sm text-body-sm">
          <Link href="/knowledge" className="hover:text-primary transition-colors">
            Knowledge Base
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface">{article.application}</span>
        </nav>

        <div className="flex justify-between items-start gap-md">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-md mt-sm text-on-surface-variant font-body-sm text-body-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">person</span>
                {article.owner?.name || 'Unknown'}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                Updated {new Date(article.updatedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                {article.views ?? 0} views
              </span>
              <StatusBadge status={article.status} />
            </div>
          </div>
          <div className="flex gap-sm shrink-0">
            {article.status !== 'Published' && (
              <Button onClick={handlePublish}>Publish</Button>
            )}
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-xs">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[11px] bg-surface-container-high text-on-surface-variant"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-lg">
          {article.description && <Section title="Description">{article.description}</Section>}

          <Section title="Symptoms">{article.symptoms}</Section>

          <Section title="Root Cause">{article.rootCause}</Section>

          {article.troubleshootingSteps?.length > 0 && (
            <Section title="Troubleshooting Steps">
              <ol className="list-decimal list-inside space-y-1">
                {article.troubleshootingSteps
                  .sort((a, b) => a.order - b.order)
                  .map((step) => (
                    <li key={step.order}>{step.description}</li>
                  ))}
              </ol>
            </Section>
          )}

          <Section title="Resolution">{article.resolution}</Section>

          {article.prevention && <Section title="Prevention">{article.prevention}</Section>}
        </div>
      </div>
    </AppLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-h3 text-h3 text-on-surface mb-sm border-b border-outline-variant pb-xs">
        {title}
      </h3>
      <div className="text-on-surface-variant font-body-md text-body-md whitespace-pre-wrap">
        {children}
      </div>
    </section>
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
