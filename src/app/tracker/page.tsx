'use client';

import { useCallback, useEffect, useMemo, useRef, useState, FormEvent } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import PacmanLoader from '@/components/PacmanLoader';
import { Button } from '@/components';
import { getTeamMembers, TeamMemberFromDB } from '@/lib/team';

interface TrackerEntry {
  _id: string;
  user?: { _id: string; name: string };
  teamMembers: string[];
  ticketId: string;
  title?: string;
  linkedArticle?: { _id: string; title: string; status: string } | null;
  role: 'Owner' | 'Contributor';
  date: string;
  createdAt?: string;
  workDescription: string;
  hoursWorked: number;
  workType?: string;
  slaBreach: 'Yes' | 'No' | 'N/A';
  slaBreachReason?: string;
  escalationStatus: 'Yes' | 'No' | 'N/A';
  application?: string;
  ticketStatus?: string;
}

interface ArticleSuggestion {
  _id: string;
  title: string;
  application: string;
  status: string;
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

const LEAD = 'Bodheesh V C';

const TICKET_STATUSES = [
  'Open',
  'Assigned',
  'In Progress',
  'On Hold',
  'Awaiting User Response',
  'Awaiting Vendor/OEM',
  'Awaiting Spare',
  'Awaiting Approval',
  'Pending with Customer Management',
  'Under Procurement',
  'Under IT Validation',
  'Under Sales Team Review',
  'Outside Business Hours',
  'Resolved',
  'Closed',
  'Cancelled',
];

interface FormState {
  ticketId: string;
  title: string;
  teamMembers: string[];
  role: 'Owner' | 'Contributor';
  date: string;
  workDescription: string;
  hoursWorked: string;
  workType: string;
  slaBreach: 'Yes' | 'No' | 'N/A';
  slaBreachReason: string;
  escalationStatus: 'Yes' | 'No' | 'N/A';
  application: string;
  linkedArticle: string;
  ticketStatus: string;
}

const EMPTY_FORM: FormState = {
  ticketId: '',
  title: '',
  teamMembers: [],
  role: 'Contributor',
  date: new Date().toISOString().slice(0, 10),
  workDescription: '',
  hoursWorked: '',
  workType: 'Follow-up',
  slaBreach: 'No',
  slaBreachReason: '',
  escalationStatus: 'No',
  application: '',
  linkedArticle: '',
  ticketStatus: 'Open',
};

export default function InternalTrackerPage() {
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [suggestions, setSuggestions] = useState<ArticleSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMemberFromDB[]>([]);
  const membersRef = useRef<HTMLDivElement>(null);

  const trackableMembers = useMemo(
    () => teamMembers.filter((m) => m.name !== 'Sudheendra Gururaj M P'),
    [teamMembers]
  );

  useEffect(() => {
    getTeamMembers().then(setTeamMembers).catch(() => setTeamMembers([]));
  }, []);

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

  // Close the team member dropdown on an outside click.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (membersRef.current && !membersRef.current.contains(e.target as Node)) {
        setMembersOpen(false);
      }
    };
    if (membersOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [membersOpen]);

  // Live-search Knowledge Base as the user types the issue title, so a
  // matching solution can be linked instead of duplicating work.
  useEffect(() => {
    const term = form.title.trim();
    if (term.length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const res = await fetch(`/api/knowledge?search=${encodeURIComponent(term)}&limit=5`);
        const json = await res.json();
        if (res.ok && json.success) {
          setSuggestions(json.data.articles || []);
        }
      } catch {
        // Silent fail - suggestions are a convenience, not critical path
      } finally {
        setSuggestLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [form.title]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ticketId: form.ticketId.trim(),
        title: form.title.trim() || undefined,
        linkedArticle: form.linkedArticle || undefined,
        teamMembers: form.teamMembers,
        role: form.role,
        date: form.date,
        workDescription: form.workDescription.trim(),
        hoursWorked: parseFloat(form.hoursWorked || '0'),
        workType: form.workType,
        slaBreach: form.slaBreach,
        slaBreachReason: form.slaBreachReason.trim() || undefined,
        escalationStatus: form.escalationStatus,
        application: form.application.trim() || undefined,
        ticketStatus: form.ticketStatus,
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
      setSuggestions([]);
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

  const updateTicketStatus = async (ticketId: string, ticketStatus: string) => {
    try {
      const res = await fetch('/api/tracker', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, ticketStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update status');
      }
      // Optimistically update all rows with the same ticket ID in the UI
      setEntries((prev) =>
        prev.map((e) => (e.ticketId === ticketId ? { ...e, ticketStatus } : e))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const ticketGroups = useMemo(() => {
    const groups: Record<string, any> = {};
    for (const e of entries) {
      if (!groups[e.ticketId]) {
        groups[e.ticketId] = {
          ticketId: e.ticketId,
          title: e.title,
          application: e.application,
          allMembers: new Set<string>(),
          owner: undefined,
          hours: 0,
          linkedArticle: e.linkedArticle,
          ticketStatus: e.ticketStatus,
        };
      }
      const g = groups[e.ticketId];
      e.teamMembers?.forEach((m: string) => g.allMembers.add(m));
      g.hours += e.hoursWorked;
      if (!g.title && e.title) g.title = e.title;
      if (!g.application && e.application) g.application = e.application;
      if (!g.linkedArticle && e.linkedArticle) g.linkedArticle = e.linkedArticle;
      if (e.ticketStatus) g.ticketStatus = e.ticketStatus;
      if (e.role === 'Owner' && !g.owner) g.owner = e.teamMembers?.[0];
    }
    return Object.values(groups)
      .map((g: any) => ({
        ...g,
        owner: g.owner || '—',
        members: Array.from(g.allMembers as Set<string>),
        contributors: Array.from(g.allMembers as Set<string>)
          .filter((m) => m !== g.owner)
          .join(', '),
      }))
      .sort((a: any, b: any) => b.hours - a.hours);
  }, [entries]);

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

            <Field label="Issue Title" className="md:col-span-2 relative">
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                    linkedArticle: e.target.value === form.title ? form.linkedArticle : '',
                  })
                }
                placeholder="e.g. QuickBooks to Zoho Books Migration"
                className="input"
              />
              {form.linkedArticle && (
                <p className="text-[11px] text-emerald-600 mt-1">
                  Linked to existing KB article &mdash;{' '}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => setForm({ ...form, linkedArticle: '' })}
                  >
                    unlink
                  </button>
                </p>
              )}
              {!form.linkedArticle && form.title.trim().length >= 3 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-surface border border-outline-variant/40 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  {suggestLoading && (
                    <div className="px-3 py-2 text-[12px] text-on-surface-variant">Searching Knowledge Base...</div>
                  )}
                  {!suggestLoading && suggestions.length === 0 && (
                    <div className="px-3 py-2 text-[12px] text-on-surface-variant">
                      No existing KB article found &mdash; you may need to create one after resolving this.
                    </div>
                  )}
                  {!suggestLoading &&
                    suggestions.map((s) => (
                      <button
                        type="button"
                        key={s._id}
                        onClick={() => setForm({ ...form, linkedArticle: s._id })}
                        className="w-full text-left px-3 py-2 text-[12px] hover:bg-surface-container-high border-b border-outline-variant/20 last:border-b-0"
                      >
                        <span className="font-medium text-primary">{s.title}</span>
                        <span className="text-on-surface-variant"> &middot; {s.application} &middot; {s.status}</span>
                      </button>
                    ))}
                </div>
              )}
            </Field>

            <Field label="Team Member(s) *" className="md:col-span-2">
              <div className="relative" ref={membersRef}>
                <p className="text-body-sm text-on-surface-variant mb-1">
                  Team Lead: <span className="font-medium text-on-surface">{LEAD}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setMembersOpen((s) => !s)}
                  className="input w-full flex items-center justify-between select-none"
                >
                  <span className="text-on-surface">
                    {form.teamMembers.length
                      ? form.teamMembers.join(', ')
                      : 'Select team members'}
                  </span>
                  <span
                    className={`material-symbols-outlined text-[18px] transition-transform ${
                      membersOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {membersOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-surface dark:bg-surface-container-lowest border border-outline-variant/40 rounded-lg shadow-lg max-h-56 overflow-y-auto p-sm space-y-1">
                    {trackableMembers.map((member) => (
                      <label
                        key={member._id}
                        className="flex items-center gap-2 text-body-sm text-on-surface cursor-pointer px-2 py-1 hover:bg-surface-container-high rounded"
                      >
                        <input
                          type="checkbox"
                          checked={form.teamMembers.includes(member.name)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...form.teamMembers, member.name]
                              : form.teamMembers.filter((n) => n !== member.name);
                            setForm({ ...form, teamMembers: next });
                          }}
                          className="rounded border-outline-variant"
                        />
                        <span className="flex-1">{member.name}</span>
                        {member.name === LEAD && (
                          <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            Team Lead
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
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

            <Field label="Ticket Status" className="md:col-span-2">
              <select
                value={form.ticketStatus}
                onChange={(e) => setForm({ ...form, ticketStatus: e.target.value })}
                className="input"
              >
                {TICKET_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
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
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Team Member(s)</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Work Done</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">SLA Breach</th>
                <th className="px-4 py-3">Escalation</th>
                <th className="px-4 py-3">Ticket Status</th>
                <th className="px-4 py-3">Added By</th>
                <th className="px-4 py-3">Logged At</th>
                <th className="px-4 py-3">Knowledge Linked</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={13} className="px-4 py-6">
                    <div className="flex flex-col items-center justify-center">
                      <PacmanLoader size={30} speedMultiplier={2} />
                      <p className="text-body-sm text-on-surface-variant mt-4">Loading...</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && entries.length === 0 && (
                <tr>
                  <td colSpan={13} className="px-4 py-6 text-center text-on-surface-variant">
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
                  <td className="px-4 py-3 max-w-[180px] truncate" title={entry.title}>
                    {entry.title || <span className="text-on-surface-variant italic">&mdash;</span>}
                  </td>
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={entry.ticketStatus || 'Open'}
                        onChange={(e) => updateTicketStatus(entry.ticketId, e.target.value)}
                        className="input text-[12px] py-1 px-2 rounded min-w-[140px]"
                      >
                        {TICKET_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant text-[12px]">
                    {entry.user?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant text-[12px]">
                    {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {entry.linkedArticle ? (
                      <Link
                        href={`/knowledge/${entry.linkedArticle._id}`}
                        className="text-emerald-600 text-[12px] font-medium whitespace-nowrap flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">link</span>
                        {entry.linkedArticle.title}
                      </Link>
                    ) : (
                      <Link
                        href={`/knowledge/create?ticketId=${encodeURIComponent(entry.ticketId || '')}&application=${encodeURIComponent(entry.application || '')}&title=${encodeURIComponent(entry.title || '')}&symptoms=${encodeURIComponent(entry.workDescription || '')}`}
                        className="text-on-surface-variant text-[12px] italic whitespace-nowrap hover:text-primary"
                      >
                        Unlinked &middot; Create KB Article
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ticket Summary */}
        <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-x-auto">
          <div className="px-4 py-3 border-b border-outline-variant/20">
            <h3 className="font-title-md text-title-md text-on-surface dark:text-on-secondary">
              Unique Ticket Effort Roll-up
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              One row per ticket showing the owner, all contributors, and total effort logged.
            </p>
          </div>
          <table className="w-full text-body-sm">
            <thead className="bg-surface-container-high/50">
              <tr className="text-left text-on-surface-variant uppercase text-[11px] tracking-wider">
                <th className="px-4 py-3">Ticket ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Contributors</th>
                <th className="px-4 py-3">Total Hours</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
                <th className="px-4 py-3">Knowledge Linked</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6">
                    <div className="flex flex-col items-center justify-center">
                      <PacmanLoader size={30} speedMultiplier={2} />
                      <p className="text-body-sm text-on-surface-variant mt-4">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : ticketGroups.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-on-surface-variant">
                    No tickets logged yet.
                  </td>
                </tr>
              ) : (
                ticketGroups.map((group: any) => (
                  <tr
                    key={group.ticketId}
                    className="border-t border-outline-variant/20 hover:bg-surface-container-high/30"
                  >
                    <td className="px-4 py-3 font-mono text-primary">{group.ticketId}</td>
                    <td className="px-4 py-3 max-w-[180px] truncate" title={group.title}>
                      {group.title || <span className="text-on-surface-variant italic">&mdash;</span>}
                    </td>
                    <td className="px-4 py-3">{group.application || '—'}</td>
                    <td className="px-4 py-3 font-medium text-on-surface">{group.owner}</td>
                    <td className="px-4 py-3 max-w-xs truncate" title={group.contributors}>
                      {group.contributors || '—'}
                    </td>
                    <td className="px-4 py-3">{group.hours.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={group.ticketStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={group.ticketStatus || 'Open'}
                        onChange={(e) => updateTicketStatus(group.ticketId, e.target.value)}
                        className="input text-[12px] py-1 px-2 rounded"
                      >
                        {TICKET_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {group.linkedArticle ? (
                        <Link
                          href={`/knowledge/${group.linkedArticle._id}`}
                          className="text-emerald-600 text-[12px] font-medium whitespace-nowrap flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">link</span>
                        {group.linkedArticle.title}
                      </Link>
                    ) : (
                      <span className="text-on-surface-variant text-[12px] italic">Unlinked</span>
                    )}
                    </td>
                  </tr>
                ))
              )}
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

function StatusBadge({ status }: { status?: string }) {
  if (!status) {
    return <span className="text-on-surface-variant text-[11px]">—</span>;
  }
  const normalised = status.replace(/\s+/g, '').toLowerCase();
  const cls =
    status === 'Closed'
      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
      : status === 'Resolved'
      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      : normalised === 'inprogress'
      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
      : status === 'Open'
      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      : 'bg-surface-container-high text-on-surface-variant';
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${cls}`}>
      {status}
    </span>
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
