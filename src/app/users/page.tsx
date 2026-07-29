'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah J.',
    role: 'Senior Support Engineer',
    email: 'sarah.j@company.com',
    status: 'Active',
    joinDate: 'Jan 15, 2023',
  },
  {
    id: '2',
    name: 'Marcus T.',
    role: 'Database Administrator',
    email: 'marcus.t@company.com',
    status: 'Active',
    joinDate: 'Mar 22, 2023',
  },
  {
    id: '3',
    name: 'Elena R.',
    role: 'UX/UI Designer',
    email: 'elena.r@company.com',
    status: 'Active',
    joinDate: 'Feb 10, 2023',
  },
];

export default function UsersPage() {
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
              Manage team members and permissions
            </p>
          </div>
          <button className="bg-primary text-on-primary px-lg py-md rounded-lg font-label-md text-label-md shadow hover:bg-primary-fixed-variant transition-colors flex items-center gap-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Member
          </button>
        </section>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-xl border border-outline-variant dark:border-outline">
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
              {TEAM_MEMBERS.map((member) => (
                <tr
                  key={member.id}
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
        </div>
      </div>
    </AppLayout>
  );
}
