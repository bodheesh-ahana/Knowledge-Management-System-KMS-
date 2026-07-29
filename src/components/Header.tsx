'use client';

import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  meta?: string;
}

const TYPE_LABELS: Record<string, string> = {
  article: 'Knowledge Base',
  ticket: 'Tickets',
  tracker: 'Tracker',
  document: 'Documents',
  application: 'Applications',
  user: 'Team',
};

const TYPE_ICONS: Record<string, string> = {
  article: 'auto_stories',
  ticket: 'confirmation_number',
  tracker: 'track_changes',
  document: 'description',
  application: 'apps',
  user: 'person',
};

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  // Cmd+K / Ctrl+K focus shortcut.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Debounced search.
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success) {
          setResults(json.data.results || []);
          setShowResults(true);
        }
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Close results on outside click.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    if (showResults) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showResults]);

  // Fetch notifications on mount and poll every 30s.
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/notifications?unread=true');
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data.notifications || []);
          setUnreadCount(json.data.unreadCount || 0);
        }
      } catch {
        // ignore notification load errors
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const handleResultClick = (url: string) => {
    setShowResults(false);
    setQuery('');
    setResults([]);
    router.push(url);
  };

  const category = (type: string) => TYPE_LABELS[type] || type;
  const icon = (type: string) => TYPE_ICONS[type] || 'label';

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline flex justify-between items-center px-lg transition-colors duration-150 shadow-sm">
      {/* Search Bar */}
      <div ref={searchRef} className="flex items-center flex-1 max-w-md relative group">
        <span className="material-symbols-outlined absolute left-3 text-on-surface-variant opacity-70 group-focus-within:text-primary transition-colors text-[20px]">
          search
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowResults(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowResults(false);
          }}
          className="w-full bg-surface-container-highest dark:bg-[#1f222c] border border-outline-variant/30 rounded-lg pl-10 pr-4 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          placeholder="Search knowledge base, tickets, tracker, docs..."
          type="text"
        />
        <div className="absolute right-3 px-1.5 py-0.5 rounded border border-outline-variant/50 text-[10px] font-mono text-on-surface-variant bg-surface opacity-80">
          Cmd+K
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-surface dark:bg-surface-dim border border-outline-variant dark:border-outline rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
            {loading && (
              <div className="px-4 py-3 text-body-sm text-on-surface-variant">
                Searching...
              </div>
            )}
            {!loading && results.length === 0 && (
              <div className="px-4 py-3 text-body-sm text-on-surface-variant">
                No results for &quot;{query}&quot;
              </div>
            )}
            {!loading &&
              results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result.url)}
                  className="w-full text-left px-4 py-3 hover:bg-surface-container-high flex items-start gap-3 border-b border-outline-variant/20 last:border-0"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant mt-0.5">
                    {icon(result.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-body-md text-on-surface truncate">
                      {result.title}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                      {result.description || result.meta}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-medium text-on-surface-variant whitespace-nowrap">
                    {category(result.type)}
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-sm ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-error text-on-error text-[10px] rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-surface dark:bg-surface-dim border border-outline-variant rounded-lg shadow-lg z-50 p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <h4 className="font-label-md text-label-md text-on-surface font-medium">
                  Notifications
                </h4>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-2 py-3 text-body-sm text-on-surface-variant">
                    No notifications
                  </p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <Link
                      key={n._id}
                      href={n.resourceId ? `/${n.type === 'TicketAssigned' ? 'tickets' : 'knowledge'}/${n.resourceId}` : '/notifications'}
                      className={`block px-2 py-2 rounded hover:bg-surface-container-high ${n.read ? '' : 'bg-primary/5'}`}
                      onClick={() => setShowNotifications(false)}
                    >
                      <p className="text-body-sm text-on-surface font-medium truncate">
                        {n.title || 'Notification'}
                      </p>
                      <p className="text-[11px] text-on-surface-variant truncate">
                        {n.message}
                      </p>
                    </Link>
                  ))
                )}
              </div>
              <div className="border-t border-outline-variant mt-1 pt-1">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="block px-2 py-1.5 text-center text-body-sm text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <div className="w-px h-6 bg-outline-variant/30 mx-2"></div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 ml-1 p-1 pr-2 rounded-full border border-outline-variant/30 hover:border-outline transition-colors bg-surface-container-low"
          >
            <img
              className="w-6 h-6 rounded-full object-cover bg-outline"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUHCfDxd5xK2pPP4YSuc8JUFWHAZTtuWKqEljxLC-lRERATfjgg46Dwtse_kX4WRg7B3gqBN-UNn8Jxq1o3CvUH9w1raMUCbI4yf3xflaFZEM_tecI8xZBIMSeaFyZQv2ZFXjhn_bcr6JR4ahng6mTljMi5iAWI8oEygQILEIlUzV3HJExBz8ZgyK_X9ay4DoXkldRt1UHepiZcVOf4BolLL7gwclZc2n8Nnn0pdxidG-_BOwPrywpW8tJQyQMNA5bOcaOVgnUzM7w"
              alt="User avatar"
            />
            <span className="font-label-md text-label-md text-on-surface">
              {session?.user?.name || 'User'}
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              expand_more
            </span>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-surface-dim border border-outline-variant rounded-lg shadow-lg z-50">
              <Link
                href="/profile"
                className="block px-4 py-2 hover:bg-surface-container-high text-on-surface font-body-md"
                onClick={() => setShowUserMenu(false)}
              >
                <span className="material-symbols-outlined mr-2 align-middle text-[18px]">
                  person
                </span>
                Profile
              </Link>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 hover:bg-surface-container-high text-on-surface font-body-md border-t border-outline-variant"
              >
                <span className="material-symbols-outlined mr-2 align-middle text-[18px]">
                  logout
                </span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
