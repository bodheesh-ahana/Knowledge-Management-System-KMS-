'use client';

import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';

interface ManualTicketItem {
  _id: string;
  serialNumber: number;
  ticketId: string;
  month: string;
  resolvedByOurTeam: string;
  reassignedToOtherTeams: string;
  escalatedToOEM: string;
  slaBreach: string;
  reason: string;
  createdDate: string | null;
  resolvedDate: string | null;
  averageResolutionTime: string;
}

export default function ManualTicketsPage() {
  const [tickets, setTickets] = useState<ManualTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('All');
  const [sortBy, setSortBy] = useState('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filterOptions, setFilterOptions] = useState<{
    months: string[];
  }>({ months: [] });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (month !== 'All') params.set('month', month);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('page', String(page));
      params.set('limit', String(pageSize));

      const res = await fetch(`/api/manual-tickets?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load tickets');
      }
      setTickets(json.data.tickets || []);
      setTotal(json.data.pagination?.total || 0);
      setTotalPages(json.data.pagination?.pages || 1);
      setFilterOptions(json.data.filters || { months: [] });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, month, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, month, sortBy, sortOrder, pageSize]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getBadgeClass = (value: string) => {
    const normalized = value?.toLowerCase().trim();
    if (normalized === 'yes' || normalized === 'no') {
      return normalized === 'yes'
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
        : 'bg-error-container text-on-error-container';
    }
    return 'bg-surface-container-high text-on-surface-variant';
  };

  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-container-max mx-auto w-full flex flex-col gap-lg">
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
          <div className="space-y-xs">
            <h2 className="font-h1 text-h1 text-on-surface dark:text-on-secondary">
              Manual Ticket History
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline">
              Manual ticket tracking from team reports. {total} total tickets.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket ID or reason..."
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-high dark:bg-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-high dark:bg-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="All">All Months</option>
                {filterOptions.months.map((m) => (
                  <option key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-high dark:bg-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="createdDate">Created Date</option>
                <option value="resolvedDate">Resolved Date</option>
                <option value="ticketId">Ticket ID</option>
                <option value="month">Month</option>
              </select>
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                Sort Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-high dark:bg-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg text-body-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p className="text-body-sm text-on-surface-variant">Loading tickets...</p>
        )}

        {/* Tickets Table */}
        {!loading && !error && (
          <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-on-surface-variant border-b border-outline-variant/40 text-[12px] uppercase tracking-wider bg-surface-container-high/50 dark:bg-surface-container-highest/50">
                    <th className="py-3 px-4 font-medium">Sl No</th>
                    <th className="py-3 px-4 font-medium">Ticket ID</th>
                    <th className="py-3 px-4 font-medium">Month</th>
                    <th className="py-3 px-4 font-medium">Resolved by Our Team</th>
                    <th className="py-3 px-4 font-medium">Reassigned</th>
                    <th className="py-3 px-4 font-medium">Escalated to OEM</th>
                    <th className="py-3 px-4 font-medium">SLA Breach</th>
                    <th className="py-3 px-4 font-medium">Reason</th>
                    <th className="py-3 px-4 font-medium">Created Date</th>
                    <th className="py-3 px-4 font-medium">Resolved Date</th>
                    <th className="py-3 px-4 font-medium">Resolution Time</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket._id} className="border-b border-outline-variant/20 hover:bg-surface-container-high/30">
                      <td className="py-3 px-4 text-body-sm text-on-surface-variant">{ticket.serialNumber}</td>
                      <td className="py-3 px-4 font-body-md text-on-surface font-medium">{ticket.ticketId}</td>
                      <td className="py-3 px-4 text-body-sm text-on-surface-variant capitalize">{ticket.month}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getBadgeClass(ticket.resolvedByOurTeam)}`}>
                          {ticket.resolvedByOurTeam || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getBadgeClass(ticket.reassignedToOtherTeams)}`}>
                          {ticket.reassignedToOtherTeams || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-body-sm text-on-surface-variant">{ticket.escalatedToOEM || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getBadgeClass(ticket.slaBreach)}`}>
                          {ticket.slaBreach || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-body-sm text-on-surface-variant max-w-xs truncate" title={ticket.reason}>
                        {ticket.reason || '-'}
                      </td>
                      <td className="py-3 px-4 text-body-sm text-on-surface-variant">{formatDate(ticket.createdDate)}</td>
                      <td className="py-3 px-4 text-body-sm text-on-surface-variant">{formatDate(ticket.resolvedDate)}</td>
                      <td className="py-3 px-4 text-body-sm text-on-surface-variant">{ticket.averageResolutionTime || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/40 bg-surface-container-high/30 dark:bg-surface-container-highest/30">
              <div className="text-body-sm text-on-surface-variant">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} tickets
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-outline-variant bg-surface hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed text-on-surface"
                >
                  Previous
                </button>
                <span className="text-body-sm text-on-surface">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border border-outline-variant bg-surface hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed text-on-surface"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
