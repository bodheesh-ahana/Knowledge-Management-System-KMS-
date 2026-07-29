'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import AppLayout from '@/components/AppLayout';
import { getTeamMembers, TeamMemberFromDB } from '@/lib/team';

const LEAD_ROLES = new Set(['TeamLead', 'Manager', 'Admin']);

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'Engineer',
};

export default function TeamAccessPage() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role as string | undefined;
  const isLead = userRole ? LEAD_ROLES.has(userRole) : false;

  const [users, setUsers] = useState<User[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const members = useMemo(
    () =>
      teamMembers.map((m) => {
        const u = users.find((u) => u.email.toLowerCase() === m.email.toLowerCase());
        return {
          team: m,
          user: u,
        };
      }),
    [users, teamMembers]
  );

  const fetchUsers = async () => {
    try {
      setError(null);
      const res = await fetch('/api/users');
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load users');
      setUsers(json.data.users || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadTeamMembers = async () => {
    try {
      setError(null);
      const list = await getTeamMembers();
      setTeamMembers(list);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(true);
      Promise.all([fetchUsers(), loadTeamMembers()]).finally(() => setLoading(false));
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <AppLayout>
        <div className="p-lg">Loading...</div>
      </AppLayout>
    );
  }

  if (!isLead) {
    return (
      <AppLayout>
        <div className="p-lg md:p-xl">
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg">
            You do not have permission to view this page.
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      if (editingId) {
        const body: any = { id: editingId };
        if (form.name) body.name = form.name;
        if (form.role) body.role = form.role;
        if (form.password) body.password = form.password;

        const res = await fetch('/api/team-access', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update user');
      } else {
        const res = await fetch('/api/team-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create user');
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user._id);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
  };

  const handleCreateForMember = (member: TeamMemberFromDB) => {
    setEditingId(null);
    setForm({
      name: member.name,
      email: member.email,
      password: '',
      role: 'Engineer',
    });
  };

  const toggleActive = async (user: User) => {
    try {
      setError(null);
      const res = await fetch('/api/team-access', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user._id, active: !user.active }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update user');
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, active: !u.active } : u))
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-container-max mx-auto w-full flex flex-col gap-lg">
        <section>
          <h2 className="font-h1 text-h1 text-on-surface dark:text-on-secondary">Team Access</h2>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline">
            Manage individual login credentials for each team member.
          </p>
        </section>

        {error && (
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg">
            {error}
          </div>
        )}

        <section className="bg-surface dark:bg-surface-container-lowest rounded-xl border border-outline-variant p-lg space-y-md">
          <h3 className="font-h3 text-h3 text-on-surface">
            {editingId ? 'Edit Member' : 'Create Member'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-md">
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
              <label className="font-label-md text-label-md text-on-surface-variant">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                readOnly={!!editingId}
                className="input"
              />
            </div>
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">
                {editingId ? 'New Password (optional)' : 'Password'}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editingId}
                className="input"
              />
            </div>
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="input"
              >
                <option value="Engineer">Engineer</option>
                <option value="TeamLead">Team Lead</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-sm">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-60"
              >
                {saving ? 'Saving...' : editingId ? 'Update Member' : 'Create Member'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-surface-container-high text-on-surface px-4 py-2 rounded-lg font-medium hover:bg-surface-container"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="bg-surface dark:bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          {loading ? (
            <p className="p-lg text-on-surface-variant">Loading members...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    <th className="px-4 py-3 text-left font-label-md text-label-md text-on-surface">Name</th>
                    <th className="px-4 py-3 text-left font-label-md text-label-md text-on-surface">Email</th>
                    <th className="px-4 py-3 text-left font-label-md text-label-md text-on-surface">Team Role</th>
                    <th className="px-4 py-3 text-left font-label-md text-label-md text-on-surface">App Role</th>
                    <th className="px-4 py-3 text-left font-label-md text-label-md text-on-surface">Login</th>
                    <th className="px-4 py-3 text-left font-label-md text-label-md text-on-surface">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr
                      key={m.team.id}
                      className="border-b border-outline-variant/20 hover:bg-surface-container-high/30"
                    >
                      <td className="px-4 py-3 text-on-surface">{m.team.name}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{m.team.email}</td>
                      <td className="px-4 py-3 text-on-surface">{m.team.role}</td>
                      <td className="px-4 py-3 text-on-surface">{m.user?.role || '—'}</td>
                      <td className="px-4 py-3">
                        {m.user ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              m.user.active
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}
                          >
                            {m.user.active ? 'Active' : 'Revoked'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container-high text-on-surface-variant">
                            No login
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {m.user ? (
                            <>
                              <button
                                onClick={() => handleEdit(m.user!)}
                                className="text-primary hover:underline text-[12px]"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => toggleActive(m.user!)}
                                className="text-primary hover:underline text-[12px]"
                              >
                                {m.user.active ? 'Revoke' : 'Grant'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleCreateForMember(m.team)}
                              className="text-primary hover:underline text-[12px]"
                            >
                              Create login
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
