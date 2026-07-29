'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';

interface Notification {
  id: string;
  type: 'article' | 'ticket' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'ticket',
    title: 'Ticket TKT-042 Updated',
    message: 'Login page CSS issue has been marked as resolved',
    time: '5 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'article',
    title: 'New Knowledge Article',
    message: 'Sarah J. published "Database Optimization Best Practices"',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'system',
    title: 'System Maintenance Scheduled',
    message: 'Maintenance window scheduled for Dec 20 from 2-4 AM EST',
    time: '1 day ago',
    read: true,
  },
];

export default function NotificationsPage() {
  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="mb-2xl flex items-center justify-between">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface dark:text-on-secondary font-bold">
              Notifications
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline mt-md">
              {NOTIFICATIONS.filter((n) => !n.read).length} unread notifications
            </p>
          </div>
          <button className="text-primary dark:text-primary-fixed-dim font-label-md text-label-md hover:underline">
            Mark all as read
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-sm">
          {NOTIFICATIONS.map((notif) => (
            <div
              key={notif.id}
              className={`p-lg rounded-xl border transition-all cursor-pointer ${
                notif.read
                  ? 'bg-surface border-outline-variant dark:border-outline dark:bg-surface-container-lowest hover:border-primary'
                  : 'bg-primary/10 border-primary dark:bg-primary/5 dark:border-primary-fixed-dim'
              }`}
            >
              <div className="flex items-start gap-md">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notif.type === 'ticket'
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : notif.type === 'article'
                        ? 'bg-green-100 dark:bg-green-900'
                        : 'bg-orange-100 dark:bg-orange-900'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined ${
                      notif.type === 'ticket'
                        ? 'text-blue-600 dark:text-blue-400'
                        : notif.type === 'article'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {notif.type === 'ticket'
                      ? 'confirmation_number'
                      : notif.type === 'article'
                        ? 'auto_stories'
                        : 'info'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-bold">
                    {notif.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline mt-xs">
                    {notif.message}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline/60 mt-sm">
                    {notif.time}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
