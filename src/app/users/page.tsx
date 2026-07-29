'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getTeamMembers, TeamMemberFromDB } from '@/lib/team';
import { useSession } from 'next-auth/react';

const LEAD_ROLES = new Set(['TeamLead', 'Manager', 'Admin']);

const EMPTY_FORM = {
  name: '',
  role: '',
  email: '',
  status: 'Active',
  joinDate: '—',
};

export default function UsersPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role as string | undefined;
  const canManage = userRole ? LEAD_ROLES.has(userRole) : false;

  const [members, setMembers] = useState<TeamMemberFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getTeamMembers();
      setMembers(list);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add member');
      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-container-max mx-auto w-full flex flex-col gap-lg">
        {/* Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
          <div className="space-y-xs">
            <h2 className="font-h1 text-h1 text-on-surface dark:text-on-secondary">
              Team Members
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline">
              Numera ADM team. Team Lead: Bodheesh V C · Reports to: Sudheendra Gururaj M P
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary text-on-primary px-lg py-md rounded-lg font-label-md text-label-md shadow hover:bg-primary-fixed-variant transition-colors flex items-center gap-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Member
            </button>
          )}
        </section>

        {error && (
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg text-body-sm">
            {error}
          </div>
        )}

        {showForm && (
          <section className="bg-surface dark:bg-surface-container-lowest rounded-xl border border-outline-variant p-lg space-y-md">
            <h3 className="font-h3 text-h3 text-on-surface">Add Team Member</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="input"
                />
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">Role</label>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                  className="input"
                />
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="input"
                />
              </div>
              <div className="md:col-span-3 flex gap-sm">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Add Member'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-surface-container-high text-on-surface px-4 py-2 rounded-lg font-medium hover:bg-surface-container"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto rounded-xl border border-outline-variant dark:border-outline">
          {loading ? (
            <p className="p-lg text-on-surface-variant">Loading members...</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant dark:border-outline bg-surface-container-low dark:bg-surface-container-lowest">
                  <th className="px-lg py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary">
                    Name
                  </th>
                  <th className="px-lg py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary">
                    Role
                  </th>
                  <th className="px-lg py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary">
                    Email
                  </th>
                  <th className="px-lg py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary">
                    Status
                  </th>
                  <th className="px-lg py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary">
                    Joined
                  </th>
                  <th className="px-lg py-md text-left font-label-md text-label-md text-on-surface dark:text-on-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member._id}
                    className="border-b border-outline-variant dark:border-outline hover:bg-surface-container-high dark:hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-md">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-label-md text-label-md">
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-body-md text-body-md text-on-surface dark:text-on-secondary">
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-lg py-md font-body-md text-body-md text-on-surface dark:text-on-secondary">
                      {member.role}
                    </td>
                    <td className="px-lg py-md font-body-md text-body-md text-on-surface-variant dark:text-outline">
                      {member.email}
                    </td>
                    <td className="px-lg py-md">
                      <span className="inline-flex items-center px-sm py-xs rounded-full font-label-md text-label-md bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        {member.status}
                      </span>
                    </td>
                    <td className="px-lg py-md font-body-sm text-body-sm text-on-surface-variant dark:text-outline">
                      {member.joinDate}
                    </td>
                    <td className="px-lg py-md">
                      <button className="text-primary dark:text-primary-fixed-dim hover:underline font-label-md text-label-md flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
