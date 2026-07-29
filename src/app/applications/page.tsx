'use client';

import { useEffect, useMemo, useState, FormEvent } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

interface AppItem {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  articleCount: number;
  ticketCount: number;
}

const EMPTY_FORM = { name: '', description: '', icon: 'apps', color: '#0ea5e9' };

export default function ApplicationsListPage() {
  const [applications, setApplications] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/applications');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load applications');
      }
      setApplications(json.data.applications || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return applications;
    const term = search.toLowerCase();
    return applications.filter(
      (app) =>
        app.name.toLowerCase().includes(term) ||
        (app.description || '').toLowerCase().includes(term)
    );
  }, [applications, search]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create application');
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchApplications();
    } catch (err: any) {
      setError(err.message || 'Failed to create application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-container-max mx-auto w-full flex flex-col gap-lg">
        {/* Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
          <div className="space-y-xs">
            <h2 className="font-h1 text-h1 text-on-surface dark:text-on-secondary">
              Application Catalogue
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline">
              Applications we provide support for.
            </p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-primary text-on-primary px-lg py-md rounded-lg font-label-md text-label-md shadow hover:bg-primary-fixed-variant transition-colors flex items-center gap-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              {showForm ? 'close' : 'add'}
            </span>
            {showForm ? 'Cancel' : 'Add Application'}
          </button>
        </section>

        {error && (
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg text-body-sm">
            {error}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg grid grid-cols-1 md:grid-cols-4 gap-md"
          >
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Application name"
              className="input md:col-span-2"
            />
            <input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="Material icon name (e.g. calculate)"
              className="input"
            />
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="h-[42px] w-full rounded-lg border border-outline-variant/40 cursor-pointer"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description"
              rows={2}
              className="input md:col-span-4"
            />
            <div className="md:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md shadow hover:bg-primary-fixed-variant transition-colors disabled:opacity-60"
              >
                {submitting ? 'Saving...' : 'Save Application'}
              </button>
            </div>
          </form>
        )}

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search applications..."
          className="input max-w-sm"
        />

        {/* Grid */}
        {loading ? (
          <p className="text-body-sm text-on-surface-variant">Loading applications...</p>
        ) : filtered.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">No applications found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
            {filtered.map((app) => (
              <Link
                key={app._id}
                href={`/applications/${app._id}`}
                className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg flex flex-col gap-md hover:border-primary transition-all group"
              >
                <div className="flex items-center gap-md">
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${app.color}20` }}
                  >
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ color: app.color }}
                    >
                      {app.icon || 'apps'}
                    </span>
                  </div>
                  <h3 className="font-body-lg text-body-lg text-on-surface dark:text-on-secondary group-hover:text-primary transition-colors">
                    {app.name}
                  </h3>
                </div>
                {app.description && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline line-clamp-2">
                    {app.description}
                  </p>
                )}
                <div className="flex items-center gap-lg mt-auto pt-sm border-t border-outline-variant/20 text-[12px] text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">menu_book</span>
                    {app.articleCount} article{app.articleCount === 1 ? '' : 's'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                    {app.ticketCount} ticket{app.ticketCount === 1 ? '' : 's'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .input {
          height: 42px;
          padding: 0 12px;
          border-radius: 8px;
          background: var(--surface, #fff);
          border: 1px solid rgba(0, 0, 0, 0.12);
          font-size: 14px;
          width: 100%;
        }
        textarea.input {
          height: auto;
          padding-top: 10px;
        }
      `}</style>
    </AppLayout>
  );
}
