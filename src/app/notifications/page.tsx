'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import PacmanLoader from '@/components/PacmanLoader';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  resourceId?: string;
  read: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  ArticleReviewNeeded: 'auto_stories',
  ArticleCreated: 'auto_stories',
  TicketAssigned: 'confirmation_number',
  TicketCreated: 'confirmation_number',
  TicketResolved: 'check_circle',
  TrackerEntryCreated: 'track_changes',
  CommentMention: 'chat',
  System: 'info',
};

const TYPE_COLORS: Record<string, string> = {
  ArticleReviewNeeded: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
  ArticleCreated: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
  TicketAssigned: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
  TicketCreated: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
  TicketResolved: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400',
  TrackerEntryCreated: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
  CommentMention: 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400',
  System: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
};

function resourceLink(n: Notification) {
  if (!n.resourceId) return '/notifications';
  if (n.type === 'TicketCreated' || n.type === 'TicketAssigned' || n.type === 'TicketResolved') {
    return `/tickets/${n.resourceId}`;
  }
  if (n.type === 'ArticleCreated' || n.type === 'ArticleReviewNeeded' || n.type === 'CommentMention') {
    return `/knowledge/${n.resourceId}`;
  }
  if (n.type === 'TrackerEntryCreated') return '/tracker';
  return '/notifications';
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data.notifications || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setMarking(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
              {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
            </p>
          </div>
          <button
            onClick={markAllRead}
            disabled={marking || unreadCount === 0}
            className="text-primary dark:text-primary-fixed-dim font-label-md text-label-md hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {marking ? 'Marking...' : 'Mark all as read'}
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <PacmanLoader size={30} speedMultiplier={2} />
            <p className="text-body-sm text-on-surface-variant mt-4">Loading notifications...</p>
          </div>
        ) : (
          <div className="space-y-sm">
            {notifications.length === 0 ? (
              <p className="text-body-md text-on-surface-variant">No notifications yet.</p>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif._id}
                  href={resourceLink(notif)}
                  className={`block p-lg rounded-xl border transition-all ${
                    notif.read
                      ? 'bg-surface border-outline-variant dark:border-outline dark:bg-surface-container-lowest hover:border-primary'
                      : 'bg-primary/5 border-primary dark:bg-primary/5 dark:border-primary-fixed-dim hover:border-primary'
                  }`}
                >
                  <div className="flex items-start gap-md">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        TYPE_COLORS[notif.type] || TYPE_COLORS.System
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {TYPE_ICONS[notif.type] || TYPE_ICONS.System}
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
                        {timeAgo(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
