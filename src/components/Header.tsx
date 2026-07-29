'use client';

import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline flex justify-between items-center px-lg transition-colors duration-150 shadow-sm">
      {/* Search Bar */}
      <div className="flex items-center flex-1 max-w-md relative group">
        <span className="material-symbols-outlined absolute left-3 text-on-surface-variant opacity-70 group-focus-within:text-primary transition-colors text-[20px]">
          search
        </span>
        <input
          className="w-full bg-surface-container-highest dark:bg-[#1f222c] border border-outline-variant/30 rounded-lg pl-10 pr-4 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          placeholder="Search knowledge base, tickets..."
          type="text"
        />
        <div className="absolute right-3 px-1.5 py-0.5 rounded border border-outline-variant/50 text-[10px] font-mono text-on-surface-variant bg-surface opacity-80">
          Cmd+K
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-sm ml-auto">
        {/* Notifications */}
        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>

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
              <Link
                href="/settings"
                className="block px-4 py-2 hover:bg-surface-container-high text-on-surface font-body-md"
                onClick={() => setShowUserMenu(false)}
              >
                <span className="material-symbols-outlined mr-2 align-middle text-[18px]">
                  settings
                </span>
                Settings
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
