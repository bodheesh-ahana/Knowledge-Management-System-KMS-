'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PacmanLoader from '@/components/PacmanLoader';

interface VIPUser {
  _id: string;
  name: string;
  company: string;
  priority: 'P1' | 'P2' | 'P3';
  email: string;
  jobTitle: string;
  emailComm: boolean;
  phoneComm: boolean;
  gchatComm: boolean;
  notes?: string;
  createdAt: string;
}

type ViewMode = 'cards' | 'list' | 'table';

const VIP_MASTER_DATA: VIPUser[] = [
  { _id: 'vip-1', name: 'Sandeep Shroff', company: 'Numera VIP Client', priority: 'P1', email: 'sshroff@numerafinance.com & sshroff@mystartupcfo.com', jobTitle: 'CEO', emailComm: true, phoneComm: false, gchatComm: false, notes: 'Email only', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-2', name: 'Philippus Cilliers', company: 'Numera VIP Client', priority: 'P1', email: 'philip@cillierscpa.com', jobTitle: 'President', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-3', name: 'Shriya Garg', company: 'Numera VIP Client', priority: 'P1', email: 'sgarg@numerafinance.com & sgarg@mystartupcfo.com', jobTitle: 'Chief Operating Officer', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-4', name: 'Vincent Vo', company: 'Numera VIP Client', priority: 'P1', email: 'vvo@mystartupcfo.com', jobTitle: 'Chief Financial Officer', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-5', name: 'Madhusudhan Mendu', company: 'Numera VIP Client', priority: 'P1', email: 'mmendu@numerafinance.com', jobTitle: 'CIO', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-6', name: 'Mike Jerman', company: 'Numera VIP Client', priority: 'P1', email: 'mikejerman@hollywellpartners.com', jobTitle: 'Chief Knowledge Officer', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-7', name: 'Jyotsna Thota', company: 'Numera VIP Client', priority: 'P1', email: 'jthota@mystartupcfo.com', jobTitle: 'Assistant Vice President, Operations', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-8', name: 'Bill Shenkin', company: 'Numera VIP Client', priority: 'P1', email: 'bshenkin@numerafinance.com & bshenkin@cefo.net', jobTitle: 'Partner', emailComm: true, phoneComm: false, gchatComm: false, notes: 'Email only', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-9', name: 'Gabriel Buldra', company: 'Numera VIP Client', priority: 'P1', email: 'gabe@jamesvincentgroup.com', jobTitle: 'Partner', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-10', name: 'Jean Peierre Puchulu', company: 'Numera VIP Client', priority: 'P1', email: 'jpp@bostonstartupcfo.com', jobTitle: 'Partner', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-11', name: 'Nicholas Meester', company: 'Numera VIP Client', priority: 'P1', email: 'nmeester@nuancefinancial.com', jobTitle: 'Partner', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-12', name: 'Traci Cilliers', company: 'Numera VIP Client', priority: 'P1', email: 'traci@cillierscpa.com', jobTitle: 'Partner', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-13', name: 'Benjamin Archer', company: 'Numera VIP Client', priority: 'P1', email: 'ben@jamesvincentgroup.com', jobTitle: 'Partner', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-14', name: 'Shilpa Sharma', company: 'Numera VIP Client', priority: 'P1', email: 'ssharma@numerafinance.com', jobTitle: 'Director, Operations', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-15', name: 'Scott Aber', company: 'Numera VIP Client', priority: 'P1', email: 'scott@abercpa.com', jobTitle: 'Director', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-16', name: 'Taylor Lund', company: 'Numera VIP Client', priority: 'P1', email: 'tlund@numerafinance.com', jobTitle: 'Director', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-17', name: 'Jorge Romero', company: 'Numera VIP Client', priority: 'P1', email: 'jorge@abercpa.com', jobTitle: 'Senior Manager', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-18', name: 'Sara Maher', company: 'Numera VIP Client', priority: 'P1', email: 'ssiemers@nuancefinancial.com', jobTitle: 'Manager', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'vip-19', name: 'Raul Chatterjee', company: 'Numera VIP Client', priority: 'P1', email: 'rchatterjee@numerafinance.com & rchatterjee@mystartupcfo.com', jobTitle: '', emailComm: true, phoneComm: false, gchatComm: true, notes: 'Email or G-Chat', createdAt: '2024-01-01T00:00:00.000Z' },
];

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
    if (searchQuery.trim() === '') {
      setFilteredUsers(vipUsers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = vipUsers.filter(
        (vip) =>
          vip.name.toLowerCase().includes(query) ||
          vip.company.toLowerCase().includes(query) ||
          (vip.notes && vip.notes.toLowerCase().includes(query)) ||
          vip.email.toLowerCase().includes(query) ||
          vip.jobTitle.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, vipUsers]);

  const loadVIPUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      setVipUsers(VIP_MASTER_DATA);
      setFilteredUsers(VIP_MASTER_DATA);
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

  const renderCommBadge = (label: string, allowed: boolean) => (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {label}: {allowed ? 'Yes' : 'No'}
    </span>
  );

  const renderCommIcon = (allowed: boolean) => (
    <span
      className={`px-2 py-1 rounded text-xs font-bold ${
        allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {allowed ? 'Yes' : 'No'}
    </span>
  );

  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {filteredUsers.map((vip) => (
        <div
          key={vip._id}
          className="bg-surface dark:bg-surface-container-high rounded-lg p-4 border border-outline-variant dark:border-outline hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPriorityColor(vip.priority)}`}>
              {vip.priority}
            </span>
            <span className="material-symbols-outlined text-primary text-2xl">workspace_premium</span>
          </div>

          <h3 className="font-h3 text-h3 font-bold text-on-surface mb-1">
            {vip.name}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-1">
            {vip.jobTitle || '—'} · {vip.company}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-3 break-words">
            {vip.email}
          </p>

          <div className="pt-3 border-t border-outline-variant dark:border-outline/20 flex flex-wrap gap-2">
            {renderCommBadge('Email', vip.emailComm)}
            {renderCommBadge('Phone', vip.phoneComm)}
            {renderCommBadge('G-Chat', vip.gchatComm)}
          </div>
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-h3 text-h3 font-bold text-on-surface">{vip.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getPriorityColor(vip.priority)}`}>
                {vip.priority}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">{vip.jobTitle || '—'} · {vip.company}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 break-words">{vip.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {renderCommBadge('Email', vip.emailComm)}
              {renderCommBadge('Phone', vip.phoneComm)}
              {renderCommBadge('G-Chat', vip.gchatComm)}
            </div>
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
            <th className="text-left p-4 font-label-md text-label-md text-on-surface">Email</th>
            <th className="text-left p-4 font-label-md text-label-md text-on-surface">Job Title</th>
            <th className="text-center p-4 font-label-md text-label-md text-on-surface">Email</th>
            <th className="text-center p-4 font-label-md text-label-md text-on-surface">Phone</th>
            <th className="text-center p-4 font-label-md text-label-md text-on-surface">G-Chat</th>
            <th className="text-left p-4 font-label-md text-label-md text-on-surface">Priority</th>
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
              <td className="p-4 font-body-sm text-body-sm text-on-surface-variant whitespace-pre-wrap">{vip.email}</td>
              <td className="p-4 font-body-md text-body-md text-on-surface-variant">{vip.jobTitle || '—'}</td>
              <td className="p-4 text-center">{renderCommIcon(vip.emailComm)}</td>
              <td className="p-4 text-center">{renderCommIcon(vip.phoneComm)}</td>
              <td className="p-4 text-center">{renderCommIcon(vip.gchatComm)}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(vip.priority)}`}>
                  {vip.priority}
                </span>
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
        <div className="mb-6">
          <h1 className="font-h1 text-h1 font-bold text-on-surface mb-2">
            VIP Users
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Critical customers requiring immediate P1 priority for all tickets
          </p>
        </div>

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

        <div className="bg-tertiary-container text-on-tertiary-container p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-2xl">contact_mail</span>
            <div>
              <h3 className="font-h3 text-h3 font-bold mb-1">VIP Communication SOP — Strictly Follow</h3>
              <ul className="font-body-md text-body-md list-disc list-inside space-y-1">
                <li>Always refer to the master directory below before contacting a VIP user.</li>
                <li>Use only the channels marked <strong>Yes</strong> (Email / Phone / G-Chat) for each individual.</li>
                <li>Email is the default communication method unless explicitly permitted otherwise.</li>
                <li>Do not call or send unsolicited G-Chat messages to users marked <strong>No</strong> for those channels.</li>
                <li>Document all VIP communications in the associated ticket for audit and escalation tracking.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low dark:bg-surface-container-lowest rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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

            <div className="text-sm text-on-surface-variant">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low dark:bg-surface-container-lowest rounded-lg overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
              <p>No VIP users found matching &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            <>
              {viewMode === 'cards' && renderCardsView()}
              {viewMode === 'list' && renderListView()}
              {viewMode === 'table' && renderTableView()}
            </>
          )}
        </div>

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
