'use client';

import { useCallback, useEffect, useState, FormEvent } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components';

interface TrackerEntry {
  _id: string;
  teamMembers: string[];
  ticketId: string;
  role: 'Owner' | 'Contributor';
  date: string;
  workDescription: string;
  hoursWorked: number;
  workType?: string;
  slaBreach: 'Yes' | 'No' | 'N/A';
  slaBreachReason?: string;
  escalationStatus: 'Yes' | 'No' | 'N/A';
  application?: string;
}

const WORK_TYPES = [
  'Investigation',
  'Call',
  'Follow-up',
  'Meeting',
  'Documentation',
  'Knowledge Creation',
  'Other',
];

interface FormState {
  ticketId: string;
  teamMembers: string;
  role: 'Owner' | 'Contributor';
  date: string;
  workDescription: string;
  hoursWorked: string;
  workType: string;
  slaBreach: 'Yes' | 'No' | 'N/A';
  slaBreachReason: string;
  escalationStatus: 'Yes' | 'No' | 'N/A';
  application: string;
}

const EMPTY_FORM: FormState = {
  ticketId: '',
  teamMembers: '',
  role: 'Contributor',
  date: new Date().toISOString().slice(0, 10),
  workDescription: '',
  hoursWorked: '',
  workType: 'Follow-up',
  slaBreach: 'No',
  slaBreachReason: '',
  escalationStatus: 'No',
  application: '',
};

export default function InternalTrackerPage() {
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  // Filters
  const [search, setSearch] = useState('');
  const [ticketFilter, setTicketFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (ticketFilter) params.set('ticketId', ticketFilter);
      if (memberFilter) params.set('teamMember', memberFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      params.set('limit', '100');

      const res = await fetch(`/api/tracker?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load tracker entries');
      }
      setEntries(json.data.entries || []);
      setTotal(json.data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load tracker entries');
    } finally {
      setLoading(false);
    }
  }, [search, ticketFilter, memberFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ticketId: form.ticketId.trim(),
        teamMembers: form.teamMembers
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
        role: form.role,
        date: form.date,
        workDescription: form.workDescription.trim(),
        hoursWorked: parseFloat(form.hoursWorked || '0'),
        workType: form.workType,
        slaBreach: form.slaBreach,
        slaBreachReason: form.slaBreachReason.trim() || undefined,
        escalationStatus: form.escalationStatus,
        application: form.application.trim() || undefined,
      };

      const res = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save entry');
      }

      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchEntries();
    } catch (err: any) {
      setError(err.message || 'Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  };

  const totalHours = entries.reduce((sum, e) => sum + (e.hoursWorked || 0), 0);
  const breachCount = entries.filter((e) => e.slaBreach === 'Yes').length;
  const escalationCount = entries.filter((e) => e.escalationStatus === 'Yes').length;

  return (
    <AppLayout>
      <div className="p-lg max-w-[1600px] mx-auto space-y-lg">
        {/* Header */}
        <div className="flex justify-between items-end pb-sm border-b border-outline-variant/20">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface tracking-tight">Internal Tracker</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Replace the Excel tracker &mdash; log ticket work and search it instantly.
            </p>
          </div>
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancel' : '+ New Entry'}
          </Button>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg text-body-sm">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <StatCard label="Entries" value={total} />
          <StatCard label="Total Hours" value={totalHours.toFixed(2)} />
          <StatCard label="SLA Breaches" value={breachCount} accent="text-error" />
          <StatCard label="Escalations" value={escalationCount} accent="text-amber-500" />
        </div>

        {/* New Entry Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg grid grid-cols-1 md:grid-cols-3 gap-md"
          >
            <Field label="Ticket ID *">
              <input
                required
                value={form.ticketId}
                onChange={(e) => setForm({ ...form, ticketId: e.target.value })}
                placeholder="e.g. 216740 or 216740(#2380)"
                className="input"
              />
            </Field>

            <Field label="Team Member(s) *">
              <input
                required
                value={form.teamMembers}
                onChange={(e) => setForm({ ...form, teamMembers: e.target.value })}
                placeholder="Comma separated e.g. Rajarshi, Bindushree"
                className="input"
              />
            </Field>

            <Field label="Role">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                className="input"
              >
                <option value="Owner">Owner</option>
                <option value="Contributor">Contributor</option>
              </select>
            </Field>

            <Field label="Date *">
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input"
              />
            </Field>

            <Field label="Hours Spent *">
              <input
                required
                type="number"
                step="0.25"
                min="0"
                max="24"
                value={form.hoursWorked}
                onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })}
                className="input"
              />
            </Field>

            <Field label="Work Type">
              <select
                value={form.workType}
                onChange={(e) => setForm({ ...form, workType: e.target.value })}
                className="input"
              >
                {WORK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Application">
              <input
                value={form.application}
                onChange={(e) => setForm({ ...form, application: e.target.value })}
                placeholder="e.g. Drake, QuickBooks"
                className="input"
              />
            </Field>

            <Field label="SLA Breach">
              <select
                value={form.slaBreach}
                onChange={(e) => setForm({ ...form, slaBreach: e.target.value as any })}
                className="input"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="N/A">N/A</option>
              </select>
            </Field>

            <Field label="Escalation Status">
              <select
                value={form.escalationStatus}
                onChange={(e) => setForm({ ...form, escalationStatus: e.target.value as any })}
                className="input"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="N/A">N/A</option>
              </select>
            </Field>

            {form.slaBreach === 'Yes' && (
              <Field label="SLA Breach Reason" className="md:col-span-2">
                <input
                  value={form.slaBreachReason}
                  onChange={(e) => setForm({ ...form, slaBreachReason: e.target.value })}
                  placeholder="e.g. User Availability"
                  className="input"
                />
              </Field>
            )}

            <Field label="Work Done *" className="md:col-span-3">
              <textarea
                required
                rows={3}
                value={form.workDescription}
                onChange={(e) => setForm({ ...form, workDescription: e.target.value })}
                placeholder="Describe the work done on this ticket..."
                className="input"
              />
            </Field>

            <div className="md:col-span-3 flex justify-end gap-sm">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Entry'}
              </Button>
            </div>
          </form>
        )}

        {/* Search / Filters */}
        <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md grid grid-cols-1 md:grid-cols-5 gap-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search work done, app, ticket..."
            className="input"
          />
          <input
            value={ticketFilter}
            onChange={(e) => setTicketFilter(e.target.value)}
            placeholder="Filter by Ticket ID"
            className="input"
          />
          <input
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            placeholder="Filter by Team Member"
            className="input"
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input"
          />
        </div>

        {/* Table */}
        <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-x-auto">
          <table className="w-full text-body-sm">
            <thead className="bg-surface-container-high/50">
              <tr className="text-left text-on-surface-variant uppercase text-[11px] tracking-wider">
                <th className="px-4 py-3">Ticket ID</th>
                <th className="px-4 py-3">Team Member(s)</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Work Done</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">SLA Breach</th>
                <th className="px-4 py-3">Escalation</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-on-surface-variant">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && entries.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-on-surface-variant">
                    No tracker entries found. Click &quot;New Entry&quot; to add one.
                  </td>
                </tr>
              )}
              {entries.map((entry) => (
                <tr
                  key={entry._id}
                  className="border-t border-outline-variant/20 hover:bg-surface-container-high/30"
                >
                  <td className="px-4 py-3 font-mono text-primary">{entry.ticketId}</td>
                  <td className="px-4 py-3">{entry.teamMembers?.join(', ')}</td>
                  <td className="px-4 py-3">{entry.role}</td>
                  <td className="px-4 py-3">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate" title={entry.workDescription}>
                    {entry.workDescription}
                  </td>
                  <td className="px-4 py-3">{entry.hoursWorked}</td>
                  <td className="px-4 py-3">
                    <Badge
                      value={entry.slaBreach}
                      positiveIsBad
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge value={entry.escalationStatus} positiveIsBad />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
        {label}
      </label>
      {children}
    </div>
  );
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
    <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md">
      <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`font-h2 text-h2 font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function Badge({ value, positiveIsBad }: { value: string; positiveIsBad?: boolean }) {
  const isYes = value === 'Yes';
  const isBad = positiveIsBad ? isYes : !isYes;
  const cls = isBad
    ? 'bg-error-container text-on-error-container'
    : value === 'N/A'
    ? 'bg-surface-container-high text-on-surface-variant'
    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';

  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${cls}`}>{value}</span>
  );
}
