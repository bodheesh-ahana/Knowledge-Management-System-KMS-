'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';

interface Summary {
  totalTickets: number;
  totalArticles: number;
  totalTrackerEntries: number;
  openTickets: number;
  resolvedTickets: number;
  inProgressTickets: number;
  slaBreaches: number;
  escalations: number;
  totalHours: number;
}

interface SlaBreachItem {
  _id: string;
  requestId: string;
  subject: string;
  requester: string;
  assignedTo: string;
  status: string;
  priority?: string;
  createdDate?: string | null;
  dueByDate?: string | null;
}

interface AnalyticsData {
  summary: Summary;
  ticketsByApplication: { _id: string; count: number }[];
  hoursByApplication: { _id: string; hours: number }[];
  dailyHoursTrend: { date: string; hours: number }[];
  monthlyTicketsTrend: { month: string; count: number }[];
  statusCounts: { _id: string; count: number }[];
  engineerEfficiency: {
    name: string;
    hours: number;
    entries: number;
    ticketsHandled: number;
    ownerTickets: number;
    articlesCreated: number;
  }[];
  slaBreachList: SlaBreachItem[];
  slaBreachMonthlyTrend: { _id: string; count: number }[];
}

const APRIL_MONTH = 4;

function formatShortDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short' });
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to load analytics');
        }
        setData(json.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-lg max-w-container-max mx-auto text-center text-on-surface-variant">
          Loading analytics...
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="p-lg max-w-container-max mx-auto text-center text-error">
          {error || 'No analytics data available'}
        </div>
      </AppLayout>
    );
  }

  const { summary } = data;

  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-container-max mx-auto w-full flex flex-col gap-lg">
        {/* Header */}
        <div>
          <h1 className="font-h1 text-h1 text-on-surface dark:text-on-secondary font-bold">
            Analytics
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline mt-md">
            Track application load, engineer efficiency, and ticket trends with real data.
          </p>
        </div>

        {/* SLA Breach Performance - highlighted hero section */}
        <div className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 via-surface to-surface dark:from-emerald-900/20 dark:via-surface-container-lowest dark:to-surface-container-lowest shadow-lg p-lg md:p-xl flex flex-col gap-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-white shadow-md">
                <span className="material-symbols-outlined text-[26px]">verified</span>
              </span>
              <div>
                <h2 className="font-h2 text-h2 font-bold text-on-surface dark:text-on-secondary">
                  SLA Breach Performance
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Application Support ownership impact since April 2026
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 self-start sm:self-auto px-4 py-2 rounded-full bg-emerald-500 text-white font-label-md text-label-md shadow-md">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
              Efficiency Win
            </span>
          </div>

          <div className="bg-white/70 dark:bg-black/20 border border-emerald-300/60 dark:border-emerald-700/60 rounded-xl p-lg flex flex-col sm:flex-row items-center gap-lg">
            <div className="flex items-center gap-md">
              <span className="font-h1 text-h1 font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">
                {data.slaBreachList.filter((b) => {
                  if (!b.createdDate) return false;
                  const d = new Date(b.createdDate);
                  return d.getFullYear() < 2026 || (d.getFullYear() === 2026 && d.getMonth() + 1 < APRIL_MONTH);
                }).length}
              </span>
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant leading-tight max-w-[80px]">
                breaches before handover
              </span>
            </div>
            <span className="material-symbols-outlined text-emerald-500 text-[32px] hidden sm:block">
              arrow_forward
            </span>
            <div className="flex items-center gap-md">
              <span className="font-h1 text-h1 font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">
                1
              </span>
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant leading-tight max-w-[80px]">
                breach since April
              </span>
            </div>
            <p className="font-body-md text-body-md text-emerald-900 dark:text-emerald-200 sm:border-l sm:border-emerald-300 dark:sm:border-emerald-700 sm:pl-lg flex-1">
              Application Support started owning this application in <strong>April 2026</strong>.
              Since then, only <strong>1 SLA breach</strong> has occurred (Jul 2026) — a sharp drop,
              reflecting improved response efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
              <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-bold mb-lg">
                SLA Breaches per Month
              </h3>
              <VerticalBar
                data={data.slaBreachMonthlyTrend.map((i) => {
                  const [year, month] = i._id.split('-').map(Number);
                  const isPostHandover =
                    year > 2026 || (year === 2026 && month >= APRIL_MONTH);
                  return {
                    label: monthLabel(i._id),
                    value: i.count,
                    fullLabel: i._id,
                    color: isPostHandover ? 'bg-emerald-500' : 'bg-error',
                  };
                })}
                color="bg-error"
                height="h-80"
              />
              <div className="flex items-center gap-lg mt-md text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-error inline-block" /> Before April (handover)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> April onward
                </span>
              </div>
            </div>

            <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg overflow-hidden flex flex-col">
              <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-bold mb-md">
                SLA Breach Log ({data.slaBreachList.length})
              </h3>
              <div className="overflow-auto max-h-96">
                <table className="w-full text-body-sm">
                  <thead className="bg-surface-container-high/50 sticky top-0">
                    <tr className="text-left text-on-surface-variant uppercase text-[11px] tracking-wider">
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Assigned To</th>
                      <th className="px-3 py-2">Priority</th>
                      <th className="px-3 py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slaBreachList.map((b) => (
                      <tr
                        key={b._id}
                        className="border-t border-outline-variant/20 hover:bg-surface-container-high/30"
                      >
                        <td className="px-3 py-2 text-on-surface-variant whitespace-nowrap">
                          {b.requestId}
                        </td>
                        <td className="px-3 py-2 text-on-surface max-w-[260px]">
                          <span className="line-clamp-1" title={b.subject}>
                            {b.subject}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-on-surface-variant whitespace-nowrap">
                          {b.assignedTo || '—'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-error/10 text-error">
                            {b.priority || '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-on-surface-variant whitespace-nowrap">
                          {formatShortDate(b.createdDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <StatCard label="Total Tickets" value={summary.totalTickets} />
          <StatCard label="Open Tickets" value={summary.openTickets} />
          <StatCard label="Resolved Tickets" value={summary.resolvedTickets} />
          <StatCard label="In Progress" value={summary.inProgressTickets} />
          <StatCard label="Total Articles" value={summary.totalArticles} />
          <StatCard label="Tracker Entries" value={summary.totalTrackerEntries} />
          <StatCard label="Total Hours" value={summary.totalHours.toFixed(2)} />
          <StatCard label="SLA Breaches" value={summary.slaBreaches} accent="text-error" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <ChartCard title="Tickets by Request Type">
            <HorizontalBar
              data={data.ticketsByApplication.map((i) => ({ label: i._id, value: i.count }))}
              color="bg-primary"
            />
          </ChartCard>

          <ChartCard title="Effort by Application (Hours)">
            <HorizontalBar
              data={data.hoursByApplication.map((i) => ({ label: i._id, value: i.hours }))}
              color="bg-emerald-500"
            />
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <ChartCard title="Ticket Status Distribution">
            <VerticalBar
              data={data.statusCounts.map((i) => ({ label: i._id || 'N/A', value: i.count }))}
              color="bg-secondary"
            />
          </ChartCard>

          <ChartCard title="Daily Hours Logged (Last 7 Days)">
            <VerticalBar
              data={data.dailyHoursTrend.map((i) => ({
                label: new Date(i.date).toLocaleDateString(undefined, { weekday: 'short' }),
                value: i.hours,
                fullLabel: i.date,
              }))}
              color="bg-primary"
            />
          </ChartCard>
        </div>

        {/* Monthly Ticket Trend */}
        <ChartCard title="Tickets Created per Month (April 2026 - Present)">
          <VerticalBar
            data={data.monthlyTicketsTrend.map((i) => ({
              label: i.month.slice(-2),
              value: i.count,
              fullLabel: i.month,
            }))}
            color="bg-amber-500"
          />
        </ChartCard>

        {/* Engineer Efficiency */}
        <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg overflow-x-auto">
          <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-bold mb-lg">
            Engineer Efficiency
          </h3>
          <table className="w-full text-body-sm">
            <thead className="bg-surface-container-high/50">
              <tr className="text-left text-on-surface-variant uppercase text-[11px] tracking-wider">
                <th className="px-4 py-3">Engineer</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Entries</th>
                <th className="px-4 py-3">Tickets Handled</th>
                <th className="px-4 py-3">Articles Created</th>
                <th className="px-4 py-3">Owner Count</th>
                <th className="px-4 py-3">Effort Bar</th>
              </tr>
            </thead>
            <tbody>
              {data.engineerEfficiency.map((e) => (
                <tr
                  key={e.name}
                  className="border-t border-outline-variant/20 hover:bg-surface-container-high/30"
                >
                  <td className="px-4 py-3 font-medium text-on-surface">{e.name}</td>
                  <td className="px-4 py-3">{e.hours.toFixed(2)}</td>
                  <td className="px-4 py-3">{e.entries}</td>
                  <td className="px-4 py-3">{e.ticketsHandled}</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">{e.articlesCreated}</td>
                  <td className="px-4 py-3">{e.ownerTickets}</td>
                  <td className="px-4 py-3 w-1/3">
                    <MiniBar value={e.hours} max={data.engineerEfficiency[0]?.hours || 1} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({
  label,
  value,
  accent = 'text-primary',
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-md">
      <p className="font-label-md text-label-md text-on-surface-variant dark:text-outline">
        {label}
      </p>
      <p className={`font-h2 text-h2 font-bold mt-sm ${accent}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
      <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-bold mb-lg">
        {title}
      </h3>
      {children}
    </div>
  );
}

function HorizontalBar({
  data,
  color,
}: {
  data: { label: string; value: number }[];
  color: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const top = data.slice(0, 10);
  return (
    <div className="space-y-3">
      {top.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex justify-between text-body-sm text-on-surface">
            <span className="truncate" title={item.label}>
              {item.label}
            </span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className={`h-full ${color} rounded-full`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function VerticalBar({
  data,
  color,
  height = 'h-64',
}: {
  data: { label: string; value: number; fullLabel?: string; color?: string }[];
  color: string;
  height?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={`${height} flex items-end justify-around gap-2`}>
      {data.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
          <div className="text-xs font-semibold text-on-surface-variant mb-1">{item.value}</div>
          <div
            className={`w-full ${item.color || color} rounded-t transition-all hover:opacity-80`}
            style={{ height: `${(item.value / max) * 100}%` }}
            title={`${item.fullLabel || item.label}: ${item.value}`}
          />
          <div className="text-xs text-on-surface-variant mt-2 text-center leading-none" title={item.fullLabel}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const width = max ? (value / max) * 100 : 0;
  return (
    <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

