'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import PacmanLoader from '@/components/PacmanLoader';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DashboardStats {
  entries: number;
  hours: number;
  uniqueTickets: number;
  activeTickets: number;
  closedTickets: number;
  subTasks: number;
  avgHoursPerTicket: number;
  avgHoursPerActiveDay: number;
  hoursLast7Days: number;
  entriesLast7Days: number;
  slaBreaches: number;
  escalations: number;
  teamMembers: number;
  linkedEntries: number;
  linkedTickets: number;
  kbLinkRate: number;
  totalArticles: number;
  publishedArticles: number;
  articleViews: number;
  articlesFromTickets: number;
}

interface DashboardData {
  window: { from: string | null; to: string | null; activeDays: number };
  stats: DashboardStats;
  dailyTrend: { date: string; label: string; hours: number; entries: number }[];
  monthlyTrend: { label: string; entries: number; hours: number; tickets: number; articles: number }[];
  statusBreakdown: { status: string; tickets: number }[];
  applications: { name: string; hours: number; entries: number; tickets: number; articles: number }[];
  teamWorkload: { name: string; hours: number; entries: number; tickets: number; ownerTickets: number }[];
  workTypeBreakdown: { type: string; hours: number; entries: number }[];
  recentEntries: {
    _id: string;
    ticketId: string;
    taskId: string | null;
    title: string;
    application: string;
    members: string[];
    hours: number;
    status: string;
    date: string;
  }[];
  recentArticles: {
    _id: string;
    title: string;
    application: string;
    views: number;
    status: string;
    ticketId: string | null;
    createdAt: string;
  }[];
  recentActivity: { _id: string; type: string; message: string; createdAt: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  Closed: '#10b981',
  Resolved: '#22c55e',
  Open: '#ef4444',
  'In Progress': '#3b82f6',
  Assigned: '#6366f1',
  'On Hold': '#f59e0b',
  'Awaiting User Response': '#a855f7',
  'Awaiting Vendor/OEM': '#ec4899',
  'Under IT Validation': '#14b8a6',
  Cancelled: '#94a3b8',
};

const statusColor = (status: string) => STATUS_COLORS[status] || '#64748b';

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
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  icon: string;
  href?: string;
}) {
  const card = (
    <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-md flex flex-col gap-sm h-full hover:border-primary transition-colors">
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
  return href ? (
    <Link href={href} className="block h-full">
      {card}
    </Link>
  ) : (
    card
  );
}

function Panel({
  title,
  icon,
  action,
  children,
  className = '',
}: {
  title: string;
  icon?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg flex flex-col gap-md ${className}`}
    >
      <div className="flex items-center justify-between gap-sm">
        <h3 className="font-title-md text-title-md text-on-surface dark:text-on-secondary flex items-center gap-sm">
          {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
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

  const maxDailyHours = data ? Math.max(...data.dailyTrend.map((d) => d.hours), 1) : 1;
  const maxMonthly = data
    ? Math.max(...data.monthlyTrend.flatMap((m) => [m.entries, m.tickets, m.articles]), 1)
    : 1;
  const maxAppHours = data ? Math.max(...data.applications.map((a) => a.hours), 1) : 1;
  const maxMemberHours = data ? Math.max(...data.teamWorkload.map((m) => m.hours), 1) : 1;

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
            {data?.window.from && (
              <p className="text-body-sm text-on-surface-variant mt-1">
                Live from the daily tracker and knowledge base &mdash; work logged{' '}
                {formatDate(data.window.from)} to {formatDate(data.window.to || undefined)} across{' '}
                {data.window.activeDays} active days.
              </p>
            )}
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
          <div className="flex flex-col items-center justify-center py-20">
            <PacmanLoader size={30} speedMultiplier={2} />
            <p className="text-body-sm text-on-surface-variant mt-4">Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg text-body-sm">
            {error}
          </div>
        ) : !data ? (
          <p className="text-body-sm text-on-surface-variant">No dashboard data available.</p>
        ) : (
          <>
            {/* Stats straight from the tracker + knowledge base */}
            <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-md">
              <StatCard
                label="Tickets Worked"
                value={data.stats.uniqueTickets}
                sub={`${data.stats.subTasks} sub-tasks`}
                accent="text-primary"
                icon="confirmation_number"
                href="/tracker"
              />
              <StatCard
                label="Hours Logged"
                value={data.stats.hours}
                sub={`${data.stats.entries} entries`}
                accent="text-primary"
                icon="timer"
                href="/tracker"
              />
              <StatCard
                label="Still Active"
                value={data.stats.activeTickets}
                sub={`${data.stats.closedTickets} closed`}
                accent="text-error"
                icon="pending_actions"
                href="/tracker"
              />
              <StatCard
                label="KB Articles"
                value={data.stats.totalArticles}
                sub={`${data.stats.articleViews} views`}
                accent="text-primary"
                icon="menu_book"
                href="/knowledge"
              />
              <StatCard
                label="Last 7 Days"
                value={data.stats.hoursLast7Days}
                sub={`h · ${data.stats.entriesLast7Days} entries`}
                accent="text-secondary"
                icon="trending_up"
              />
              <StatCard
                label="KB Linked"
                value={`${data.stats.kbLinkRate}%`}
                sub={`${data.stats.linkedTickets} of ${data.stats.uniqueTickets} tickets`}
                accent="text-secondary"
                icon="link"
              />
            </section>

            {/* Secondary metrics */}
            <section className="grid grid-cols-2 md:grid-cols-5 gap-md">
              {[
                { label: 'Avg Hours / Ticket', value: data.stats.avgHoursPerTicket },
                { label: 'Avg Hours / Active Day', value: data.stats.avgHoursPerActiveDay },
                { label: 'Engineers Logging Work', value: data.stats.teamMembers },
                { label: 'SLA Breaches', value: data.stats.slaBreaches },
                { label: 'Escalations', value: data.stats.escalations },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-md py-sm"
                >
                  <p className="text-[11px] uppercase tracking-wider text-on-surface-variant">
                    {m.label}
                  </p>
                  <p className="font-title-md text-title-md font-semibold text-on-surface dark:text-on-secondary">
                    {m.value}
                  </p>
                </div>
              ))}
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
              {/* Daily hours logged */}
              <Panel title="Hours Logged (Last 30 Days)" className="lg:col-span-2">
                <div className="flex items-end gap-1 h-40">
                  {data.dailyTrend.map((d) => (
                    <div
                      key={d.date}
                      className="flex-1 flex flex-col items-center justify-end h-full"
                      title={`${d.label}: ${d.hours}h · ${d.entries} ${
                        d.entries === 1 ? 'entry' : 'entries'
                      }`}
                    >
                      <div
                        className="w-full rounded-t bg-primary hover:bg-secondary transition-colors min-h-[2px]"
                        style={{ height: `${Math.max((d.hours / maxDailyHours) * 100, 1)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[11px] text-on-surface-variant">
                  <span>{data.dailyTrend[0]?.label}</span>
                  <span>{data.dailyTrend[Math.floor(data.dailyTrend.length / 2)]?.label}</span>
                  <span>{data.dailyTrend[data.dailyTrend.length - 1]?.label}</span>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Peak day {maxDailyHours}h. Hover a bar for that day&apos;s hours and entries.
                </p>
              </Panel>

              {/* Recent activity */}
              <Panel title="Recent Activity" icon="history">
                <div className="flex flex-col gap-sm">
                  {data.recentActivity.length === 0 ? (
                    <p className="text-body-sm text-on-surface-variant">No recent activity.</p>
                  ) : (
                    data.recentActivity.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-start gap-sm p-sm rounded-lg hover:bg-surface-container-highest"
                      >
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">
                          {activityIcon(item.type)}
                        </span>
                        <div>
                          <p className="text-body-sm text-on-surface leading-snug">{item.message}</p>
                          <p className="text-[11px] text-on-surface-variant">
                            {formatTimeAgo(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
              {/* Monthly trend */}
              <Panel title="Monthly Trend (Last 6 Months)">
                <div className="space-y-md">
                  {data.monthlyTrend.map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between text-body-sm text-on-surface mb-1">
                        <span className="font-medium">{m.label}</span>
                        <span className="text-on-surface-variant">
                          {m.entries} entries · {m.tickets} tickets · {m.articles} articles ·{' '}
                          {m.hours}h
                        </span>
                      </div>
                      <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-surface-container-highest">
                        <div
                          className="bg-primary h-full"
                          style={{ width: `${(m.entries / maxMonthly) * 100}%` }}
                        />
                        <div
                          className="bg-error h-full"
                          style={{ width: `${(m.tickets / maxMonthly) * 100}%` }}
                        />
                        <div
                          className="bg-tertiary h-full"
                          style={{ width: `${(m.articles / maxMonthly) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-md text-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-primary" /> Tracker entries
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-error" /> Unique tickets
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-tertiary" /> Articles created
                  </span>
                </div>
              </Panel>

              {/* Ticket status mix */}
              <Panel
                title="Ticket Status (Unique Tickets)"
                action={
                  <Link href="/tracker" className="text-primary font-label-md text-label-md hover:underline">
                    Open tracker
                  </Link>
                }
              >
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.statusBreakdown.map((s) => ({
                          name: s.status,
                          value: s.tickets,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        // Only the larger slices get an inline label, otherwise
                        // the small ones overlap into an unreadable cluster.
                        label={({ name, value, percent }) =>
                          percent >= 0.08 ? `${name}: ${value}` : ''
                        }
                        outerRadius={80}
                        dataKey="value"
                      >
                        {data.statusBreakdown.map((s) => (
                          <Cell key={s.status} fill={statusColor(s.status)} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-x-md gap-y-1">
                  {data.statusBreakdown.map((s) => (
                    <div key={s.status} className="flex items-center justify-between text-body-sm">
                      <span className="flex items-center gap-2 text-on-surface-variant">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: statusColor(s.status) }}
                        />
                        {s.status}
                      </span>
                      <span className="font-medium text-on-surface dark:text-on-secondary">
                        {s.tickets}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
              {/* Applications by logged effort */}
              <Panel
                title="Applications by Effort"
                action={
                  <Link href="/applications" className="text-primary font-label-md text-label-md hover:underline">
                    View all
                  </Link>
                }
              >
                <div className="flex flex-col gap-md">
                  {data.applications.map((app) => (
                    <div key={app.name}>
                      <div className="flex justify-between text-body-sm text-on-surface mb-1">
                        <span className="font-medium">{app.name}</span>
                        <span className="text-on-surface-variant">
                          {app.hours}h · {app.tickets} tickets · {app.articles} kb
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-container-highest overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(app.hours / maxAppHours) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Team workload */}
              <Panel title="Team Workload (Tracker)">
                {data.teamWorkload.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant">No work logged yet.</p>
                ) : (
                  <div className="flex flex-col gap-md">
                    {data.teamWorkload.map((m) => (
                      <div key={m.name}>
                        <div className="flex justify-between text-body-sm text-on-surface mb-1">
                          <span className="font-medium">{m.name}</span>
                          <span className="text-on-surface-variant">
                            {m.hours}h · {m.entries} entries · {m.tickets} tickets
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-surface-container-highest overflow-hidden">
                          <div
                            className="h-full rounded-full bg-secondary"
                            style={{ width: `${(m.hours / maxMemberHours) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-on-surface-variant">
                  Hours on shared entries are split evenly between the members on the entry.
                </p>
              </Panel>
            </div>

            {/* Latest tracker entries */}
            <Panel
              title="Latest Work Logged"
              icon="timer"
              action={
                <Link href="/tracker" className="text-primary font-label-md text-label-md hover:underline">
                  View tracker
                </Link>
              }
            >
              {data.recentEntries.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">No tracker entries yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-on-surface-variant border-b border-outline-variant/40 text-[12px]">
                        <th className="py-2 pr-4 font-medium">Ticket</th>
                        <th className="py-2 pr-4 font-medium">Task</th>
                        <th className="py-2 pr-4 font-medium">Title</th>
                        <th className="py-2 pr-4 font-medium">Application</th>
                        <th className="py-2 pr-4 font-medium">Members</th>
                        <th className="py-2 pr-4 font-medium">Hours</th>
                        <th className="py-2 pr-4 font-medium">Status</th>
                        <th className="py-2 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentEntries.map((e) => (
                        <tr key={e._id} className="border-b border-outline-variant/20 last:border-b-0">
                          <td className="py-2 pr-4 font-mono text-body-sm text-primary">{e.ticketId}</td>
                          <td className="py-2 pr-4 font-mono text-body-sm text-on-surface-variant">
                            {e.taskId || '—'}
                          </td>
                          <td className="py-2 pr-4 text-body-sm text-on-surface max-w-[260px] truncate" title={e.title}>
                            {e.title}
                          </td>
                          <td className="py-2 pr-4 text-body-sm text-on-surface-variant">{e.application}</td>
                          <td className="py-2 pr-4 text-body-sm text-on-surface-variant max-w-[200px] truncate">
                            {e.members.join(', ') || '—'}
                          </td>
                          <td className="py-2 pr-4 text-body-sm text-on-surface-variant">{e.hours}</td>
                          <td className="py-2 pr-4 text-body-sm">
                            <span
                              className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                              style={{
                                backgroundColor: `${statusColor(e.status)}20`,
                                color: statusColor(e.status),
                              }}
                            >
                              {e.status}
                            </span>
                          </td>
                          <td className="py-2 text-body-sm text-on-surface-variant">{formatDate(e.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
              {/* Recent articles */}
              <Panel
                title="Recent Knowledge Articles"
                className="lg:col-span-2"
                action={
                  <Link href="/knowledge" className="text-primary font-label-md text-label-md hover:underline">
                    View all
                  </Link>
                }
              >
                {data.recentArticles.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant">No knowledge articles yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-on-surface-variant border-b border-outline-variant/40 text-[12px]">
                          <th className="py-2 pr-4 font-medium">Title</th>
                          <th className="py-2 pr-4 font-medium">Application</th>
                          <th className="py-2 pr-4 font-medium">Ticket</th>
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
                            <td className="py-2 pr-4 text-body-sm text-on-surface-variant">
                              {article.application}
                            </td>
                            <td className="py-2 pr-4 font-mono text-body-sm text-on-surface-variant">
                              {article.ticketId || '—'}
                            </td>
                            <td className="py-2 pr-4 text-body-sm text-on-surface-variant">{article.views}</td>
                            <td className="py-2 text-body-sm text-on-surface-variant">
                              {formatDate(article.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>

              {/* Work type mix */}
              <Panel title="Work Type Mix">
                {data.workTypeBreakdown.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant">No work logged yet.</p>
                ) : (
                  <div className="flex flex-col gap-sm">
                    {data.workTypeBreakdown.map((w) => (
                      <div key={w.type} className="flex justify-between text-body-sm">
                        <span className="text-on-surface">{w.type}</span>
                        <span className="text-on-surface-variant">
                          {w.hours}h · {w.entries} entries
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-auto pt-sm border-t border-outline-variant/30 text-body-sm text-on-surface-variant">
                  <p>
                    {data.stats.publishedArticles} of {data.stats.totalArticles} articles published
                  </p>
                  <p>{data.stats.articlesFromTickets} articles traced back to a ticket</p>
                </div>
              </Panel>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
