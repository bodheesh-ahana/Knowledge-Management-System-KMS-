'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PacmanLoader from '@/components/PacmanLoader';

interface VIPUser {
  _id: string;
  name: string;
  company: string;
  priority: 'P1' | 'P2' | 'P3';
  notes?: string;
  createdAt: string;
}

type ViewMode = 'cards' | 'list' | 'table';

export default function VIPUsersPage() {
  const [vipUsers, setVipUsers] = useState<VIPUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<VIPUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  useEffect(() => {
    loadVIPUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === '') {
      setFilteredUsers(vipUsers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = vipUsers.filter(
        (vip) =>
          vip.name.toLowerCase().includes(query) ||
          vip.company.toLowerCase().includes(query) ||
          (vip.notes && vip.notes.toLowerCase().includes(query))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, vipUsers]);

  const loadVIPUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/vip-users');
      if (!res.ok) throw new Error('Failed to fetch VIP users');
      const data = await res.json();
      
      if (data.success) {
        setVipUsers(data.data);
        setFilteredUsers(data.data);
      } else {
        throw new Error(data.error || 'Failed to load VIP users');
      }
    } catch (err) {
      setError('Failed to load VIP users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1':
        return 'bg-error-container text-on-error-container';
      case 'P2':
        return 'bg-warning-container text-on-warning-container';
      case 'P3':
        return 'bg-tertiary-container text-on-tertiary-container';
      default:
        return 'bg-surface-container-high text-on-surface';
    }
  };

  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {filteredUsers.map((vip) => (
        <div
          key={vip._id}
          className="bg-surface dark:bg-surface-container-high rounded-lg p-4 border border-outline-variant dark:border-outline hover:shadow-md transition-shadow"
        >
          {/* Priority Badge */}
          <div className="flex justify-between items-start mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPriorityColor(vip.priority)}`}>
              {vip.priority}
            </span>
            <span className="material-symbols-outlined text-primary text-2xl">workspace_premium</span>
          </div>

          {/* User Info */}
          <h3 className="font-h3 text-h3 font-bold text-on-surface mb-1">
            {vip.name}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-3">
            {vip.company}
          </p>

          {/* Company */}
          <div className="pt-3 border-t border-outline-variant dark:border-outline/20">
            <div className="flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-lg text-primary">business</span>
              <span className="font-medium text-on-surface">{vip.company}</span>
            </div>
          </div>

          {/* Notes */}
          {vip.notes && (
            <div className="mt-3 p-2 bg-surface-container-high dark:bg-surface-container rounded text-sm text-on-surface-variant">
              {vip.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="divide-y divide-outline-variant dark:divide-outline/20">
      {filteredUsers.map((vip) => (
        <div
          key={vip._id}
          className="flex items-center gap-4 p-4 hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-primary text-2xl">workspace_premium</span>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-h3 text-h3 font-bold text-on-surface">{vip.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getPriorityColor(vip.priority)}`}>
                {vip.priority}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">{vip.company}</p>
            {vip.notes && (
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{vip.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-surface-container-high dark:bg-surface-container">
          <tr>
            <th className="text-left p-4 font-label-md text-label-md text-on-surface">Name</th>
            <th className="text-left p-4 font-label-md text-label-md text-on-surface">Company</th>
            <th className="text-left p-4 font-label-md text-label-md text-on-surface">Priority</th>
            <th className="text-left p-4 font-label-md text-label-md text-on-surface">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant dark:divide-outline/20">
          {filteredUsers.map((vip) => (
            <tr key={vip._id} className="hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">workspace_premium</span>
                  <span className="font-body-md text-body-md text-on-surface">{vip.name}</span>
                </div>
              </td>
              <td className="p-4 font-body-md text-body-md text-on-surface-variant">{vip.company}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(vip.priority)}`}>
                  {vip.priority}
                </span>
              </td>
              <td className="p-4 font-body-sm text-body-sm text-on-surface-variant max-w-xs truncate">
                {vip.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <PacmanLoader size={30} speedMultiplier={2} />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="bg-error-container text-on-error-container p-4 rounded-lg">
            {error}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-h1 text-h1 font-bold text-on-surface mb-2">
            VIP Users
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Critical customers requiring immediate P1 priority for all tickets
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-2xl">warning</span>
            <div>
              <h3 className="font-h3 text-h3 font-bold mb-1">Critical Reminder</h3>
              <p className="font-body-md text-body-md">
                ALL tickets from VIP users are automatically P1 (Critical) with 15-minute response and 4-hour resolution SLAs.
                Any SLA breach triggers automatic escalation to management and account managers.
              </p>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-surface-container-low dark:bg-surface-container-lowest rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Search VIP users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-surface dark:bg-surface-container-high rounded-lg p-1">
                            <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'table'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
                title="Table View"
              >
                <span className="material-symbols-outlined">table_rows</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
                title="Cards View"
              >
                <span className="material-symbols-outlined">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
                title="List View"
              >
                <span className="material-symbols-outlined">view_list</span>
              </button>

            </div>

            {/* Count */}
            <div className="text-sm text-on-surface-variant">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
            </div>
          </div>
        </div>

        {/* VIP Users List */}
        <div className="bg-surface-container-low dark:bg-surface-container-lowest rounded-lg overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
              <p>No VIP users found matching "{searchQuery}"</p>
            </div>
          ) : (
            <>
              {viewMode === 'cards' && renderCardsView()}
              {viewMode === 'list' && renderListView()}
              {viewMode === 'table' && renderTableView()}
            </>
          )}
        </div>

        {/* SLA Summary */}
        <div className="mt-6 bg-primary-container text-on-primary-container p-4 rounded-lg">
          <h3 className="font-h3 text-h3 font-bold mb-3">VIP SLA Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl">schedule</span>
              <div>
                <p className="font-label-md text-label-md font-bold">Response Time</p>
                <p className="font-body-md text-body-md">15 minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl">timer</span>
              <div>
                <p className="font-label-md text-label-md font-bold">Resolution Time</p>
                <p className="font-body-md text-body-md">4 hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl">update</span>
              <div>
                <p className="font-label-md text-label-md font-bold">Update Frequency</p>
                <p className="font-body-md text-body-md">Every 30 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
