'use client';

import React, { useCallback, useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PacmanLoader from '@/components/PacmanLoader';

interface TicketLogItem {
  _id: string;
  account: string;
  requestId: string;
  status: string;
  requestType: string;
  category: string;
  technician: string;
  subject: string;
  requester: string;
  createdTime?: string | null;
  respondedDate?: string | null;
  responseDueByTime?: string | null;
  resolvedTime?: string | null;
  slaResolutionTime?: string;
  slaResponseTime?: string;
}

const STATUS_COLORS: Record<string, string> = {
  Closed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  Resolved: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  'Awaiting User Response': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  'Awaiting Vendor/OEM': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
};

function statusBadgeClass(status: string) {
  return (
    STATUS_COLORS[status] ||
    'bg-surface-container-high text-on-surface-variant dark:bg-surface-container-lowest'
  );
}

const CATEGORY_STYLES: Record<string, { icon: string; color: string }> = {
  Incident: { icon: 'report', color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30' },
  'Service Request': {
    icon: 'design_services',
    color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  },
  Onboarding: {
    icon: 'person_add',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
  },
  Offboarding: {
    icon: 'person_remove',
    color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
  },
  'Request For Information': {
    icon: 'info',
    color: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30',
  },
  Alert: {
    icon: 'notifications_active',
    color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
  },
  Other: {
    icon: 'category',
    color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50',
  },
};

function categoryStyle(category: string) {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.Other;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  const delta = 2;
  const pages: (number | '...')[] = [];
  const range: number[] = [];

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }

  pages.push(1);
  if (range.length > 0 && range[0] > 2) pages.push('...');
  pages.push(...range);
  if (range.length > 0 && range[range.length - 1] < total - 1) pages.push('...');
  if (total > 1) pages.push(total);

  return pages;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TicketLogPage() {
  const [tickets, setTickets] = useState<TicketLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [requestType, setRequestType] = useState('All');
  const [category, setCategory] = useState('All');
  const [technician, setTechnician] = useState('All');
  const [month, setMonth] = useState('All');
  const [sortBy, setSortBy] = useState('createdTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filterOptions, setFilterOptions] = useState<{
    statuses: string[];
    requestTypes: string[];
    categories: string[];
    technicians: string[];
    months: { value: string; label: string; count: number }[];
  }>({ statuses: [], requestTypes: [], categories: [], technicians: [], months: [] });

  const [summary, setSummary] = useState<{
    grandTotal: number;
    monthlySum: number;
    byCategory: { category: string; count: number }[];
  }>({ grandTotal: 0, monthlySum: 0, byCategory: [] });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status !== 'All') params.set('status', status);
      if (requestType !== 'All') params.set('requestType', requestType);
      if (category !== 'All') params.set('category', category);
      if (technician !== 'All') params.set('technician', technician);
      if (month !== 'All') params.set('month', month);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('page', String(page));
      params.set('limit', String(pageSize));

      const res = await fetch(`/api/ticket-log?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load tickets');
      }
      setTickets(json.data.tickets || []);
      setTotal(json.data.pagination?.total || 0);
      setTotalPages(json.data.pagination?.pages || 1);
      setFilterOptions(
        json.data.filters || { statuses: [], requestTypes: [], categories: [], technicians: [], months: [] }
      );
      setSummary(json.data.summary || { grandTotal: 0, byCategory: [] });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status, requestType, category, technician, month, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, status, requestType, category, technician, month, sortBy, sortOrder, pageSize]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-container-max mx-auto w-full flex flex-col gap-lg">
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
          <div className="space-y-xs">
            <h2 className="font-h1 text-h1 text-on-surface dark:text-on-secondary">
              Ticket Log
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline">
              Historical support tickets imported from reports. {total} total tickets.
            </p>
          </div>
        </section>

        {/* Discrepancy Alert */}
        {summary.grandTotal !== summary.monthlySum && (
          <div className="bg-warning-container text-on-warning-container px-md py-sm rounded-lg text-body-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            <span>
              Total tickets ({summary.grandTotal}) doesn't match monthly sum ({summary.monthlySum}). 
              Difference: {summary.grandTotal - summary.monthlySum}
            </span>
          </div>
        )}

        {/* Category summary */}
        <section className="flex flex-wrap gap-sm">
          <button
            type="button"
            onClick={() => setCategory('All')}
            className={`group flex items-center gap-3 min-w-[150px] flex-1 basis-[150px] rounded-xl border p-md text-left shadow-sm transition-all hover:shadow-md ${
              category === 'All'
                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                : 'border-outline-variant bg-surface dark:bg-surface-container-lowest hover:bg-surface-container-high'
            }`}
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/15 text-primary">
              <span className="material-symbols-outlined text-[20px]">all_inbox</span>
            </span>
            <span className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                All Tickets
              </span>
              <span className="font-h3 text-h3 text-on-surface leading-tight">
                {summary.grandTotal}
              </span>
            </span>
          </button>

          {summary.byCategory
            .filter(({ category: c }) => c !== 'Alert')
            .map(({ category: c, count }) => {
              const style = categoryStyle(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`group flex items-center gap-3 min-w-[150px] flex-1 basis-[150px] rounded-xl border p-md text-left shadow-sm transition-all hover:shadow-md ${
                    category === c
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-outline-variant bg-surface dark:bg-surface-container-lowest hover:bg-surface-container-high'
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${style.color}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{style.icon}</span>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                      {c}
                    </span>
                    <span className="font-h3 text-h3 text-on-surface leading-tight">{count}</span>
                  </span>
                </button>
              );
            })}
        </section>

        {/* Filters */}
        <section className="bg-surface dark:bg-surface-container-lowest rounded-xl border border-outline-variant p-md flex flex-wrap gap-sm items-center">
          <input
            type="text"
            placeholder="Search subject, requester, technician, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[220px] input"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input w-auto"
          >
            <option value="All">All Statuses</option>
            {filterOptions.statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            className="input w-auto"
          >
            <option value="All">All Types</option>
            {filterOptions.requestTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input w-auto"
          >
            <option value="All">All Categories</option>
            {filterOptions.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={technician}
            onChange={(e) => setTechnician(e.target.value)}
            className="input w-auto"
          >
            <option value="All">All Technicians</option>
            {filterOptions.technicians.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input w-auto"
          >
            <option value="All">All Months</option>
            {filterOptions.months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label} ({m.count})
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-auto"
          >
            <option value="createdTime">Sort: Created Time</option>
            <option value="resolvedTime">Sort: Resolved Time</option>
            <option value="status">Sort: Status</option>
            <option value="requestType">Sort: Type</option>
            <option value="technician">Sort: Technician</option>
            <option value="subject">Sort: Subject</option>
          </select>

          <button
            type="button"
            onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
            className="px-3 py-2 rounded-lg text-body-sm font-medium bg-surface-container-high text-on-surface hover:bg-surface-container flex items-center gap-1"
            title="Toggle sort order"
          >
            <span className="material-symbols-outlined text-[18px]">
              {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
            </span>
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </section>

        {error && (
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg text-body-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-outline-variant dark:border-outline">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <PacmanLoader size={30} speedMultiplier={2} />
              <p className="text-body-sm text-on-surface-variant mt-4">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <p className="p-lg text-on-surface-variant">No tickets found.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant dark:border-outline bg-surface-container-low dark:bg-surface-container-lowest">
                  <th className="px-md py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary w-16">
                    SL No
                  </th>
                  <th className="px-md py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary">
                    Request ID
                  </th>
                  <th className="px-md py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary">
                    Subject
                  </th>
                  <th className="px-md py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary">
                    Requester
                  </th>
                  <th className="px-md py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary">
                    Technician
                  </th>
                  <th className="px-md py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary">
                    Type
                  </th>
                  <th className="px-md py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary">
                    Category
                  </th>
                  <th className="px-md py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary">
                    Status
                  </th>
                  <th className="px-md py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary">
                    Created
                  </th>
                  <th className="px-md py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary">
                    Resolved
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, index) => (
                  <tr
                    key={t._id}
                    className="border-b border-outline-variant dark:border-outline hover:bg-surface-container-high dark:hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-md py-md font-body-sm text-body-sm text-on-surface-variant dark:text-outline whitespace-nowrap">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-md py-md font-body-sm text-body-sm text-on-surface-variant dark:text-outline whitespace-nowrap">
                      {t.requestId}
                    </td>
                    <td className="px-md py-md font-body-md text-body-md text-on-surface dark:text-on-secondary max-w-[320px]">
                      <span className="line-clamp-2">{t.subject}</span>
                    </td>
                    <td className="px-md py-md font-body-sm text-body-sm text-on-surface-variant dark:text-outline whitespace-nowrap">
                      {t.requester || '—'}
                    </td>
                    <td className="px-md py-md font-body-sm text-body-sm text-on-surface-variant dark:text-outline whitespace-nowrap">
                      {t.technician || '—'}
                    </td>
                    <td className="px-md py-md font-body-sm text-body-sm text-on-surface-variant dark:text-outline whitespace-nowrap">
                      {t.requestType || '—'}
                    </td>
                    <td className="px-md py-md whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-sm py-xs rounded-full font-label-md text-label-md ${categoryStyle(t.category).color}`}
                      >
                        {t.category || 'Other'}
                      </span>
                    </td>
                    <td className="px-md py-md whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-sm py-xs rounded-full font-label-md text-label-md ${statusBadgeClass(
                          t.status
                        )}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-md py-md font-body-sm text-body-sm text-on-surface-variant dark:text-outline whitespace-nowrap">
                      {formatDate(t.createdTime)}
                    </td>
                    <td className="px-md py-md font-body-sm text-body-sm text-on-surface-variant dark:text-outline whitespace-nowrap">
                      {formatDate(t.resolvedTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-sm bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md">
          <div className="flex items-center gap-sm text-body-sm text-on-surface-variant">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="input w-auto py-1"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
            </select>
            <span>entries per page</span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {getPageNumbers(page, totalPages).map((p, i) =>
                p === '...' ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-2 text-body-sm text-on-surface-variant"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`min-w-[36px] px-2 py-2 rounded-lg text-body-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          <span className="text-body-sm text-on-surface-variant">
            Page {page} of {totalPages}
          </span>
        </div>
      </div>
    </AppLayout>
  );
}
