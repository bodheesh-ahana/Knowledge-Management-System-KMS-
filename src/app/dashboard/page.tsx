'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

interface DashboardStats {
  openTickets: number;
  totalArticles: number;
  pendingReviews: number;
  appsSupported: number;
  avgResTime: number;
  kbReuseRate: number;
}

interface TopApp {
  _id: string;
  name: string;
  icon: string;
  color: string;
  ticketCount: number;
  articleCount: number;
  total: number;
}

interface ActivityItem {
  _id: string;
  type: string;
  message: string;
  createdAt: string;
}

interface TicketItem {
  _id: string;
  ticketNumber: string;
  title: string;
  assignee?: { name?: string } | null;
  createdAt: string;
}

interface ArticleItem {
  _id: string;
  title: string;
  application: string;
  views: number;
  createdAt: string;
}

interface MonthlyPoint {
  label: string;
  tickets: number;
  articles: number;
  hours: number;
}

interface DashboardData {
  stats: DashboardStats;
  topApplications: TopApp[];
  recentActivity: ActivityItem[];
  criticalOpenTickets: TicketItem[];
  recentArticles: ArticleItem[];
  monthlyTrend: MonthlyPoint[];
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTimeAgo(iso?: string) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function activityIcon(type: string) {
  if (type.includes('Article')) return 'article';
  if (type.includes('Ticket')) return 'confirmation_number';
  if (type === 'HoursLogged') return 'timer';
  if (type === 'UserLoggedIn') return 'login';
  return 'notifications';
}

function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  icon: string;
}) {
  return (
    <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-md flex flex-col gap-sm">
      <div className="flex justify-between items-start">
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
        <span className={`material-symbols-outlined text-[20px] ${accent}`}>{icon}</span>
      </div>
      <div className="flex items-end gap-2 mt-auto">
        <span className="font-h1 text-h1 font-bold text-on-surface leading-none">{value}</span>
        {sub && (
          <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">{sub}</span>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to load dashboard');
        }
        setData(json.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const exportReport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kms-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxMonthly = data
    ? Math.max(...data.monthlyTrend.flatMap((m) => [m.tickets, m.articles, m.hours])) || 1
    : 1;

  const maxTopApp = data
    ? Math.max(...data.topApplications.map((a) => a.total)) || 1
    : 1;

  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-[1600px] mx-auto w-full flex flex-col gap-lg">
        {/* Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md pb-sm border-b border-outline-variant/20">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface tracking-tight">Executive Dashboard</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={exportReport}
            disabled={!data}
            className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
        </section>

        {loading ? (
          <p className="text-body-sm text-on-surface-variant">Loading dashboard...</p>
        ) : error ? (
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg text-body-sm">
            {error}
          </div>
        ) : !data ? (
          <p className="text-body-sm text-on-surface-variant">No dashboard data available.</p>
        ) : (
          <>
            {/* Stats */}
            <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-md">
              <StatCard
                label="Open Tickets"
                value={data.stats.openTickets}
                accent="text-error"
                icon="confirmation_number"
              />
              <StatCard
                label="KB Articles"
                value={data.stats.totalArticles}
                accent="text-primary"
                icon="menu_book"
              />
              <StatCard
                label="Pending Reviews"
                value={data.stats.pendingReviews}
                accent="text-warning"
                icon="rate_review"
              />
              <StatCard
                label="Apps Supported"
                value={data.stats.appsSupported}
                accent="text-tertiary"
                icon="apps"
              />
              <StatCard
                label="Avg Res. Time"
                value={data.stats.avgResTime}
                sub="hours"
                accent="text-secondary"
                icon="schedule"
              />
              <StatCard
                label="KB Reuse Rate"
                value={`${data.stats.kbReuseRate}%`}
                accent="text-success"
                icon="recycling"
              />
            </section>

            {/* Quick actions */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-md">
              {[
                { href: '/knowledge/create', icon: 'edit_note', label: 'Create Article' },
                { href: '/tracker', icon: 'timer', label: 'Log Work' },
                { href: '/applications', icon: 'apps', label: 'Applications' },
                { href: '/documents', icon: 'folder_open', label: 'Documents' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-md flex flex-col items-center justify-center gap-sm hover:border-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[28px] text-primary">
                    {action.icon}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface">{action.label}</span>
                </Link>
              ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
              {/* Monthly trend */}
              <section className="lg:col-span-2 bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg flex flex-col gap-md">
                <h3 className="font-title-md text-title-md text-on-surface dark:text-on-secondary">
                  Activity Trend (Last 6 Months)
                </h3>
                <div className="space-y-md">
                  {data.monthlyTrend.map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between text-body-sm text-on-surface mb-1">
                        <span className="font-medium">{m.label}</span>
                        <span className="text-on-surface-variant">
                          {m.tickets} tickets · {m.articles} articles · {m.hours}h logged
                        </span>
                      </div>
                      <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-surface-container-highest">
                        <div
                          className="bg-error h-full"
                          style={{ width: `${(m.tickets / maxMonthly) * 100}%` }}
                        />
                        <div
                          className="bg-primary h-full"
                          style={{ width: `${(m.articles / maxMonthly) * 100}%` }}
                        />
                        <div
                          className="bg-secondary h-full"
                          style={{ width: `${(m.hours / maxMonthly) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-md text-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-error" /> Tickets
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-primary" /> Articles
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-secondary" /> Hours
                  </span>
                </div>
              </section>

              {/* Recent activity */}
              <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg flex flex-col gap-md">
                <h3 className="font-title-md text-title-md text-on-surface dark:text-on-secondary flex items-center gap-sm">
                  <span className="material-symbols-outlined text-[20px]">history</span>
                  Recent Activity
                </h3>
                <div className="flex flex-col gap-sm">
                  {data.recentActivity.length === 0 ? (
                    <p className="text-body-sm text-on-surface-variant">No recent activity.</p>
                  ) : (
                    data.recentActivity.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-start gap-sm p-sm rounded-lg hover:bg-surface-container-highest/50"
                      >
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">
                          {activityIcon(item.type)}
                        </span>
                        <div>
                          <p className="text-body-sm text-on-surface leading-snug">{item.message}</p>
                          <p className="text-[11px] text-on-surface-variant">{formatTimeAgo(item.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
              {/* Top applications */}
              <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg flex flex-col gap-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-title-md text-title-md text-on-surface dark:text-on-secondary">
                    Top Applications
                  </h3>
                  <Link href="/applications" className="text-primary font-label-md text-label-md hover:underline">
                    View all
                  </Link>
                </div>
                <div className="flex flex-col gap-md">
                  {data.topApplications.map((app) => (
                    <Link
                      key={app._id}
                      href={`/applications/${app._id}`}
                      className="group"
                    >
                      <div className="flex items-center gap-md mb-1">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${app.color}20` }}
                        >
                          <span
                            className="material-symbols-outlined text-[18px]"
                            style={{ color: app.color }}
                          >
                            {app.icon}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-body-sm text-on-surface mb-1">
                            <span className="font-medium group-hover:text-primary transition-colors">
                              {app.name}
                            </span>
                            <span className="text-on-surface-variant">
                              {app.ticketCount} tk · {app.articleCount} kb
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-surface-container-highest overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(app.total / maxTopApp) * 100}%`,
                                backgroundColor: app.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Critical open tickets */}
              <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg flex flex-col gap-md">
                <h3 className="font-title-md text-title-md text-on-surface dark:text-on-secondary text-error">
                  Critical Open Tickets
                </h3>
                {data.criticalOpenTickets.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant">No critical open tickets.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-on-surface-variant border-b border-outline-variant/40 text-[12px]">
                          <th className="py-2 pr-4 font-medium">Ticket</th>
                          <th className="py-2 pr-4 font-medium">Title</th>
                          <th className="py-2 pr-4 font-medium">Assignee</th>
                          <th className="py-2 font-medium">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.criticalOpenTickets.map((ticket) => (
                          <tr key={ticket._id} className="border-b border-outline-variant/20 last:border-b-0">
                            <td className="py-2 pr-4 font-body-md text-body-md text-on-surface">
                              {ticket.ticketNumber}
                            </td>
                            <td className="py-2 pr-4 text-body-sm text-on-surface line-clamp-1">
                              {ticket.title}
                            </td>
                            <td className="py-2 pr-4 text-body-sm text-on-surface-variant">
                              {ticket.assignee?.name || 'Unassigned'}
                            </td>
                            <td className="py-2 text-body-sm text-on-surface-variant">
                              {formatDate(ticket.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            {/* Recent articles */}
            <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg flex flex-col gap-md">
              <div className="flex items-center justify-between">
                <h3 className="font-title-md text-title-md text-on-surface dark:text-on-secondary">
                  Recent Knowledge Articles
                </h3>
                <Link href="/knowledge" className="text-primary font-label-md text-label-md hover:underline">
                  View all
                </Link>
              </div>
              {data.recentArticles.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">No knowledge articles yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-on-surface-variant border-b border-outline-variant/40 text-[12px]">
                        <th className="py-2 pr-4 font-medium">Title</th>
                        <th className="py-2 pr-4 font-medium">Application</th>
                        <th className="py-2 pr-4 font-medium">Views</th>
                        <th className="py-2 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentArticles.map((article) => (
                        <tr key={article._id} className="border-b border-outline-variant/20 last:border-b-0">
                          <td className="py-2 pr-4">
                            <Link
                              href={`/knowledge/${article._id}`}
                              className="font-body-md text-body-md text-on-surface hover:text-primary line-clamp-1"
                            >
                              {article.title}
                            </Link>
                          </td>
                          <td className="py-2 pr-4 text-body-sm text-on-surface-variant">{article.application}</td>
                          <td className="py-2 pr-4 text-body-sm text-on-surface-variant">{article.views}</td>
                          <td className="py-2 text-body-sm text-on-surface-variant">{formatDate(article.createdAt)}</td>
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
