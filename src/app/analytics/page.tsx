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
          <ChartCard title="Tickets by Application">
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
        <ChartCard title="Tickets Created per Month (Last 6 Months)">
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
}: {
  data: { label: string; value: number; fullLabel?: string }[];
  color: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="h-64 flex items-end justify-around gap-2">
      {data.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
          <div className="text-[10px] text-on-surface-variant mb-1">{item.value}</div>
          <div
            className={`w-full ${color} rounded-t transition-all hover:opacity-80`}
            style={{ height: `${(item.value / max) * 100}%` }}
            title={`${item.fullLabel || item.label}: ${item.value}`}
          />
          <div className="text-[10px] text-on-surface-variant mt-2 text-center leading-none" title={item.fullLabel}>
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

