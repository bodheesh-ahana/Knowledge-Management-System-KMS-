'use client';

import { useCallback, useEffect, useMemo, useRef, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import * as XLSX from 'xlsx';
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

interface Application {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
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

const PAGE_SIZE = 50;

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [suggestions, setSuggestions] = useState<ArticleSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id as string | undefined;
  const userRole = (session?.user as any)?.role as string | undefined;
  const canManage = userRole === 'Admin' || userRole === 'TeamLead';
  const [membersOpen, setMembersOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMemberFromDB[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'tracker' | 'summary'>('tracker');
  const [trackerPage, setTrackerPage] = useState(1);
  const [summaryPage, setSummaryPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const membersRef = useRef<HTMLDivElement>(null);

  const trackableMembers = useMemo(
    () => teamMembers.filter((m) => m.name !== 'Sudheendra Gururaj M P'),
    [teamMembers]
  );

  useEffect(() => {
    getTeamMembers().then(setTeamMembers).catch(() => setTeamMembers([]));
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/applications');
        const json = await res.json();
        if (res.ok && json.success) {
          setApplications(json.data.applications || []);
        }
      } catch {
        // Silent fail - applications are optional
      }
    };
    fetchApplications();
  }, []);

  // Re-fetch application list from the DB every time the new entry form opens
  // so newly added apps (like Canopy) appear immediately without a full page reload.
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/applications');
        const json = await res.json();
        if (res.ok && json.success) {
          setApplications(json.data.applications || []);
        }
      } catch {
        // Silent fail - applications are optional
      }
    };
    if (showForm) {
      fetchApplications();
    }
  }, [showForm]);

  // Filters
  const [search, setSearch] = useState('');
  const [ticketFilter, setTicketFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  const [titleFilter, setTitleFilter] = useState('');
  const [sort, setSort] = useState('date-desc');
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
      params.set('limit', '10000');

      const res = await fetch(`/api/tracker?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load tracker entries');
      }
      setEntries(json.data.entries || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load tracker entries');
    } finally {
      setLoading(false);
    }
  }, [search, ticketFilter, memberFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    setTrackerPage(1);
    setSummaryPage(1);
  }, [search, ticketFilter, memberFilter, titleFilter, dateFrom, dateTo]);

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

  // Close the report dropdown on an outside click.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (reportRef.current && !reportRef.current.contains(e.target as Node)) {
        setReportOpen(false);
      }
    };
    if (reportOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [reportOpen]);

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

      const res = editingId
        ? await fetch(`/api/tracker/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/tracker', {
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
      setEditingId(null);
      fetchEntries();
    } catch (err: any) {
      setError(err.message || 'Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (entry: TrackerEntry) => {
    setEditingId(entry._id);
    setForm({
      ticketId: entry.ticketId,
      title: entry.title || '',
      teamMembers: entry.teamMembers || [],
      role: entry.role,
      date: new Date(entry.date).toISOString().slice(0, 10),
      workDescription: entry.workDescription,
      hoursWorked: String(entry.hoursWorked),
      workType: entry.workType || 'Follow-up',
      slaBreach: entry.slaBreach,
      slaBreachReason: entry.slaBreachReason || '',
      escalationStatus: entry.escalationStatus,
      application: entry.application || '',
      linkedArticle: entry.linkedArticle?._id || '',
      ticketStatus: entry.ticketStatus || 'Open',
    });
    setSuggestions([]);
    setShowForm(true);
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tracker entry?')) return;
    try {
      const res = await fetch(`/api/tracker/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete entry');
      }
      fetchEntries();
    } catch (err: any) {
      setError(err.message || 'Failed to delete entry');
    }
  };

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

  const getSortValue = (e: TrackerEntry, key: string) => {
    switch (key) {
      case 'ticketId':
        return e.ticketId;
      case 'title':
        return e.title || '';
      case 'teamMembers':
        return e.teamMembers?.join(', ') || '';
      case 'role':
        return e.role;
      case 'date':
        return new Date(e.date).getTime();
      case 'workDescription':
        return e.workDescription || '';
      case 'hoursWorked':
        return e.hoursWorked || 0;
      case 'slaBreach':
        return e.slaBreach;
      case 'escalationStatus':
        return e.escalationStatus;
      case 'ticketStatus':
        return e.ticketStatus || '';
      case 'addedBy':
        return e.user?.name || '';
      case 'loggedAt':
        return e.createdAt ? new Date(e.createdAt).getTime() : 0;
      case 'knowledgeLinked':
        return e.linkedArticle?.title || 'Unlinked';
      default:
        return '';
    }
  };

  const filteredAndSortedEntries = useMemo(() => {
    const [sortBy, sortOrder] = sort.split('-') as [string, 'asc' | 'desc'];
    let data = entries;
    if (titleFilter.trim()) {
      const term = titleFilter.trim().toLowerCase();
      data = data.filter((e) => e.title?.toLowerCase().includes(term));
    }
    data = [...data].sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      const aVal = getSortValue(a, sortBy);
      const bVal = getSortValue(b, sortBy);
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * order;
      }
      return String(aVal || '').localeCompare(String(bVal || '')) * order;
    });
    return data;
  }, [entries, titleFilter, sort]);

  const totalHours = filteredAndSortedEntries.reduce((sum, e) => sum + (e.hoursWorked || 0), 0);
  const breachCount = filteredAndSortedEntries.filter((e) => e.slaBreach === 'Yes').length;
  const escalationCount = filteredAndSortedEntries.filter((e) => e.escalationStatus === 'Yes').length;

  const ticketGroups = useMemo(() => {
    const groups: Record<string, any> = {};
    for (const e of filteredAndSortedEntries) {
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
  }, [filteredAndSortedEntries]);

  const paginatedEntries = useMemo(
    () => filteredAndSortedEntries.slice((trackerPage - 1) * PAGE_SIZE, trackerPage * PAGE_SIZE),
    [filteredAndSortedEntries, trackerPage]
  );

  const paginatedGroups = useMemo(
    () => ticketGroups.slice((summaryPage - 1) * PAGE_SIZE, summaryPage * PAGE_SIZE),
    [ticketGroups, summaryPage]
  );

  const exportToExcel = () => {
    const data = activeTab === 'tracker' ? entries : ticketGroups;
    const name = activeTab === 'tracker' ? 'Common Tracker' : 'Unique Ticket Summary';
    const cleaned = data.map((row: any) => ({
      ...row,
      linkedArticle: row.linkedArticle?.title || 'Unlinked',
      teamMembers: Array.isArray(row.teamMembers) ? row.teamMembers.join(', ') : row.teamMembers,
      members: Array.isArray(row.members) ? row.members.join(', ') : row.members,
      contributors: row.contributors,
      user: row.user?.name || row.user || '—',
    }));
    const ws = XLSX.utils.json_to_sheet(cleaned);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, name);
    XLSX.writeFile(wb, `tracker-${activeTab}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const downloadReport = () => {
    const trackerData = entries.map((e: any) => ({
      'Ticket ID': e.ticketId,
      Title: e.title || '—',
      'Team Members': e.teamMembers?.join(', '),
      Role: e.role,
      Date: new Date(e.date).toLocaleDateString(),
      'Work Done': e.workDescription,
      Hours: e.hoursWorked,
      'SLA Breach': e.slaBreach,
      Escalation: e.escalationStatus,
      'Ticket Status': e.ticketStatus,
      'Added By': e.user?.name || '—',
      Application: e.application || '—',
      'Knowledge Linked': e.linkedArticle?.title || 'Unlinked',
    }));
    const summaryData = ticketGroups.map((g: any) => ({
      'Ticket ID': g.ticketId,
      Title: g.title || '—',
      Application: g.application || '—',
      Owner: g.owner,
      Contributors: g.contributors || '—',
      'Total Hours': g.hours.toFixed(2),
      Status: g.ticketStatus,
      'Knowledge Linked': g.linkedArticle?.title || 'Unlinked',
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(trackerData), 'Common Tracker');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'Unique Summary');
    XLSX.writeFile(wb, `tracker-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="p-lg w-full space-y-lg">
        {/* Header */}
        <div className="max-w-[1600px] mx-auto flex justify-between items-end pb-sm border-b border-outline-variant/20">
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
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-md">
          <StatCard label="Entries" value={filteredAndSortedEntries.length} />
          <StatCard label="Total Hours" value={totalHours.toFixed(2)} />
          <StatCard label="SLA Breaches" value={breachCount} accent="text-error" />
          <StatCard label="Escalations" value={escalationCount} accent="text-amber-500" />
        </div>

        {/* New Entry Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="max-w-[1600px] mx-auto bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg grid grid-cols-1 md:grid-cols-3 gap-md"
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
              <select
                value={form.application}
                onChange={(e) => setForm({ ...form, application: e.target.value })}
                className="input"
              >
                <option value="">Select Application</option>
                {applications.map((app) => (
                  <option key={app._id} value={app.name}>
                    {app.name}
                  </option>
                ))}
              </select>
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
              <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Save Entry')}
              </Button>
            </div>
          </form>
        )}

        {/* Search / Filters */}
        <div className="max-w-[1600px] mx-auto bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md grid grid-cols-1 md:grid-cols-7 gap-sm">
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
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            placeholder="Filter by Title"
            className="input"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="hours-desc">Hours High-Low</option>
            <option value="hours-asc">Hours Low-High</option>
            <option value="ticketId-asc">Ticket ID A-Z</option>
            <option value="ticketId-desc">Ticket ID Z-A</option>
          </select>
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

        {/* Tabs + Table */}
        <div className="space-y-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-sm">
            <div className="inline-flex bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setActiveTab('tracker')}
                className={`px-4 py-2 text-body-sm font-medium rounded-md transition-colors ${
                  activeTab === 'tracker'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
              }`}
              >
                Common Tracker
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-2 text-body-sm font-medium rounded-md transition-colors ${
                  activeTab === 'summary'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
              }`}
              >
                Unique Ticket Summary
              </button>
            </div>
            <div className="flex items-center gap-sm">
              <button
                type="button"
                onClick={exportToExcel}
                className="px-3 py-2 text-[12px] border border-outline-variant/30 rounded-lg hover:bg-surface-container-high text-on-surface"
              >
                Export to Excel
              </button>
              <div className="relative" ref={reportRef}>
                <button
                  type="button"
                  onClick={() => setReportOpen((s) => !s)}
                  className="px-3 py-2 text-[12px] bg-primary text-on-primary rounded-lg hover:bg-primary/90"
                >
                  Download Report
                </button>
                {reportOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-surface dark:bg-surface-container-lowest border border-outline-variant/40 rounded-lg shadow-lg z-10 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => { downloadReport(); setReportOpen(false); }}
                      className="w-full text-left px-3 py-2 text-[12px] text-on-surface hover:bg-surface-container-high"
                    >
                      Excel
                    </button>
                    <button
                      type="button"
                      onClick={() => { downloadPDF(); setReportOpen(false); }}
                      className="w-full text-left px-3 py-2 text-[12px] text-on-surface hover:bg-surface-container-high"
                    >
                      PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {activeTab === 'tracker' && (
          <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-x-auto">
          <table className="w-full text-body-sm">
            <thead className="bg-surface-container-high/50">
              <tr className="text-left text-on-surface-variant uppercase text-[11px] tracking-wider">
                <SortableHeader label="Ticket ID" sortKey="ticketId" sort={sort} onSort={setSort} />
                <th className="px-4 py-3 align-top">
                  <div className="flex flex-col gap-1 normal-case">
                    <button
                      type="button"
                      onClick={() =>
                        setSort(sort === 'title-asc' ? 'title-desc' : 'title-asc')
                      }
                      className="text-left flex items-center gap-1 hover:text-primary"
                    >
                      <span className="uppercase tracking-wider">Title</span>
                      {sort.startsWith('title') ? (
                        sort === 'title-asc' ? (
                          <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                        ) : (
                          <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                        )
                      ) : (
                        <span className="material-symbols-outlined text-[14px] opacity-50">unfold_more</span>
                      )}
                    </button>
                    <input
                      value={titleFilter}
                      onChange={(e) => setTitleFilter(e.target.value)}
                      placeholder="Search title"
                      className="input text-[11px] py-1 px-2"
                    />
                  </div>
                </th>
                <SortableHeader label="Team Member(s)" sortKey="teamMembers" sort={sort} onSort={setSort} />
                <SortableHeader label="Role" sortKey="role" sort={sort} onSort={setSort} />
                <SortableHeader label="Date" sortKey="date" sort={sort} onSort={setSort} />
                <SortableHeader label="Work Done" sortKey="workDescription" sort={sort} onSort={setSort} />
                <SortableHeader label="Hours" sortKey="hoursWorked" sort={sort} onSort={setSort} />
                <SortableHeader label="SLA Breach" sortKey="slaBreach" sort={sort} onSort={setSort} />
                <SortableHeader label="Escalation" sortKey="escalationStatus" sort={sort} onSort={setSort} />
                <SortableHeader label="Ticket Status" sortKey="ticketStatus" sort={sort} onSort={setSort} />
                <SortableHeader label="Added By" sortKey="addedBy" sort={sort} onSort={setSort} />
                <SortableHeader label="Logged At" sortKey="loggedAt" sort={sort} onSort={setSort} />
                <SortableHeader label="Knowledge Linked" sortKey="knowledgeLinked" sort={sort} onSort={setSort} />
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={14} className="px-4 py-6">
                    <div className="flex flex-col items-center justify-center">
                      <PacmanLoader size={30} speedMultiplier={2} />
                      <p className="text-body-sm text-on-surface-variant mt-4">Loading...</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && paginatedEntries.length === 0 && (
                <tr>
                  <td colSpan={14} className="px-4 py-6 text-center text-on-surface-variant">
                    No tracker entries found. Click &quot;New Entry&quot; to add one.
                  </td>
                </tr>
              )}
              {paginatedEntries.map((entry) => (
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {(canManage || entry.user?._id === currentUserId) && (
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => startEdit(entry)}
                          className="text-primary hover:text-primary/80"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      )}
                      {canManage && (
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => deleteEntry(entry._id)}
                          className="text-error hover:text-error/80"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={trackerPage}
            total={entries.length}
            pageSize={PAGE_SIZE}
            onChange={setTrackerPage}
          />
        </div>
          )}
          {activeTab === 'summary' && (
        // Ticket Summary
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
              ) : paginatedGroups.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-on-surface-variant">
                    No tickets logged yet.
                  </td>
                </tr>
              ) : (
                paginatedGroups.map((group: any) => (
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
          <Pagination
            page={summaryPage}
            total={ticketGroups.length}
            pageSize={PAGE_SIZE}
            onChange={setSummaryPage}
          />
        </div>
          )}
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

function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const start = Math.min((page - 1) * pageSize + 1, total);
  const end = Math.min(page * pageSize, total);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20">
      <p className="text-[12px] text-on-surface-variant">
        Showing {start} - {end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1 text-[12px] border border-outline-variant/30 rounded hover:bg-surface-container-high disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-[12px] text-on-surface-variant">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 text-[12px] border border-outline-variant/30 rounded hover:bg-surface-container-high disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: string;
  sort: string;
  onSort: (sort: string) => void;
}) {
  const active = sort.startsWith(`${sortKey}-`);
  const isAsc = active && sort.endsWith('-asc');
  return (
    <th className="px-4 py-3 align-top">
      <button
        type="button"
        onClick={() =>
          onSort(active ? (isAsc ? `${sortKey}-desc` : `${sortKey}-asc`) : `${sortKey}-asc`)
        }
        className="text-left flex items-center gap-1 hover:text-primary"
      >
        <span className="uppercase tracking-wider">{label}</span>
        {active ? (
          isAsc ? (
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
          ) : (
            <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
          )
        ) : (
          <span className="material-symbols-outlined text-[14px] opacity-50">unfold_more</span>
        )}
      </button>
    </th>
  );
}
