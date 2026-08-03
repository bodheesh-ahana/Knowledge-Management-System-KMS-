'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import PacmanLoader from '@/components/PacmanLoader';

interface ArticleItem {
  _id: string;
  title: string;
  status: string;
  views: number;
  createdAt: string;
}

interface TicketItem {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  severity: string;
  assignee?: { name?: string; email?: string } | null;
  createdAt: string;
}

interface Stats {
  totalArticles: number;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  publishedArticles: number;
  draftArticles: number;
}

interface AppDetail {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  articles: ArticleItem[];
  tickets: TicketItem[];
  stats: Stats;
}

function StatCard({
  label,
  value,
  accent = 'text-on-surface',
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md flex flex-col items-center justify-center">
      <p className="font-label-md text-label-md text-on-surface-variant">{label}</p>
      <p className={`font-h2 text-h2 ${accent}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ value, kind }: { value: string; kind: 'article' | 'ticket' }) {
  const base = 'px-2 py-0.5 rounded text-[11px] font-medium';
  const lowered = value.toLowerCase();

  let cls = 'bg-surface-container-highest text-on-surface-variant';

  if (kind === 'article') {
    if (lowered === 'published') cls = 'bg-tertiary-container text-on-tertiary-container';
    if (lowered === 'draft') cls = 'bg-secondary-container text-on-secondary-container';
    if (lowered === 'archived') cls = 'bg-error-container text-on-error-container';
  } else {
    if (lowered === 'open') cls = 'bg-error-container text-on-error-container';
    if (lowered === 'inprogress' || lowered === 'in progress') cls = 'bg-warning-container text-on-warning-container';
    if (lowered === 'resolved') cls = 'bg-tertiary-container text-on-tertiary-container';
    if (lowered === 'closed') cls = 'bg-surface-container-highest text-on-surface-variant';
  }

  return <span className={`${base} ${cls}`}>{value}</span>;
}

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || '';

  const [application, setApplication] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/applications/${id}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to load application');
        }
        setApplication(json.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load application');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-container-max mx-auto w-full flex flex-col gap-lg">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <PacmanLoader size={30} speedMultiplier={2} />
            <p className="text-body-sm text-on-surface-variant mt-4">Loading application...</p>
          </div>
        ) : error ? (
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg text-body-sm">
            {error}
          </div>
        ) : !application ? (
          <div className="text-body-md text-on-surface-variant">Application not found.</div>
        ) : (
          <>
            {/* Header */}
            <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
              <div className="flex items-center gap-md">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${application.color}20` }}
                >
                  <span
                    className="material-symbols-outlined text-[28px]"
                    style={{ color: application.color }}
                  >
                    {application.icon || 'apps'}
                  </span>
                </div>
                <div>
                  <h2 className="font-h1 text-h1 text-on-surface dark:text-on-secondary">
                    {application.name}
                  </h2>
                  {application.description && (
                    <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline">
                      {application.description}
                    </p>
                  )}
                </div>
              </div>
              <Link
                href="/applications"
                className="text-primary font-label-md text-label-md hover:underline flex items-center gap-sm"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Catalogue
              </Link>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <StatCard label="Total Articles" value={application.stats.totalArticles} accent="text-primary" />
              <StatCard label="Total Tickets" value={application.stats.totalTickets} accent="text-primary" />
              <StatCard label="Published Articles" value={application.stats.publishedArticles} accent="text-tertiary" />
              <StatCard label="Draft Articles" value={application.stats.draftArticles} accent="text-secondary" />
              <StatCard label="Open Tickets" value={application.stats.openTickets} accent="text-error" />
              <StatCard label="In Progress" value={application.stats.inProgressTickets} accent="text-warning" />
              <StatCard label="Resolved" value={application.stats.resolvedTickets} accent="text-tertiary" />
              <StatCard label="Closed" value={application.stats.closedTickets} />
            </section>

            {/* Recent Articles */}
            <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg flex flex-col gap-md">
              <div className="flex items-center justify-between">
                <h3 className="font-title-md text-title-md text-on-surface dark:text-on-secondary">
                  Recent Knowledge Articles
                </h3>
                <Link
                  href="/knowledge"
                  className="text-primary font-label-md text-label-md hover:underline"
                >
                  View all
                </Link>
              </div>

              {application.articles.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">No knowledge articles for this application yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-on-surface-variant border-b border-outline-variant/40 text-[12px]">
                        <th className="py-2 pr-4 font-medium">Title</th>
                        <th className="py-2 pr-4 font-medium">Status</th>
                        <th className="py-2 pr-4 font-medium">Views</th>
                        <th className="py-2 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {application.articles.map((article) => (
                        <tr
                          key={article._id}
                          className="border-b border-outline-variant/20 last:border-b-0"
                        >
                          <td className="py-3 pr-4">
                            <Link
                              href={`/knowledge/${article._id}`}
                              className="font-body-md text-body-md text-on-surface hover:text-primary"
                            >
                              {article.title || 'Untitled Article'}
                            </Link>
                          </td>
                          <td className="py-3 pr-4">
                            <StatusBadge value={article.status} kind="article" />
                          </td>
                          <td className="py-3 pr-4 text-body-sm text-on-surface-variant">{article.views}</td>
                          <td className="py-3 text-body-sm text-on-surface-variant">{formatDate(article.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Recent Tickets */}
            <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg flex flex-col gap-md">
              <h3 className="font-title-md text-title-md text-on-surface dark:text-on-secondary">
                Recent Tickets
              </h3>

              {application.tickets.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">No tickets for this application yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-on-surface-variant border-b border-outline-variant/40 text-[12px]">
                        <th className="py-2 pr-4 font-medium">Ticket</th>
                        <th className="py-2 pr-4 font-medium">Title</th>
                        <th className="py-2 pr-4 font-medium">Status</th>
                        <th className="py-2 pr-4 font-medium">Severity</th>
                        <th className="py-2 pr-4 font-medium">Assignee</th>
                        <th className="py-2 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {application.tickets.map((ticket) => (
                        <tr
                          key={ticket._id}
                          className="border-b border-outline-variant/20 last:border-b-0"
                        >
                          <td className="py-3 pr-4 font-body-md text-body-md text-on-surface">
                            {ticket.ticketNumber}
                          </td>
                          <td className="py-3 pr-4 font-body-md text-body-md text-on-surface">
                            {ticket.title || '—'}
                          </td>
                          <td className="py-3 pr-4">
                            <StatusBadge value={ticket.status} kind="ticket" />
                          </td>
                          <td className="py-3 pr-4 text-body-sm text-on-surface-variant">{ticket.severity}</td>
                          <td className="py-3 pr-4 text-body-sm text-on-surface-variant">
                            {ticket.assignee?.name || 'Unassigned'}
                          </td>
                          <td className="py-3 text-body-sm text-on-surface-variant">{formatDate(ticket.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
