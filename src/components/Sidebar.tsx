'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { icon: 'auto_stories', label: 'Knowledge Base', href: '/knowledge' },
    { icon: 'confirmation_number', label: 'Tickets', href: '/tickets' },
    { icon: 'apps', label: 'Applications', href: '/applications' },
    { icon: 'track_changes', label: 'Tracker', href: '/tracker' },
    { icon: 'analytics', label: 'Analytics', href: '/analytics' },
    { icon: 'description', label: 'Documents', href: '/documents' },
  ];

  const pinnedItems = [
    { icon: 'widgets', label: 'Applications', href: '/applications' },
    { icon: 'star', label: 'Favourites', href: '/knowledge?filter=favorites' },
    { icon: 'drafts', label: 'Drafts', href: '/knowledge?filter=drafts' },
  ];

  const bottomItems = [
    { icon: 'notifications', label: 'Notifications', href: '/notifications' },
    { icon: 'group', label: 'Users', href: '/users' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 h-screen w-sidebar-width bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant dark:border-outline flex flex-col py-lg px-md transition-all duration-200 ease-in-out z-50">
        {/* Logo */}
        <div className="flex items-center gap-sm mb-2xl px-sm">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
          </div>
          <div>
            <h2 className="font-h2 text-h2 font-bold text-primary dark:text-primary-fixed-dim leading-none tracking-tight">
              KMS
            </h2>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase mt-1">
              Enterprise Support
            </p>
          </div>
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto">
          <ul className="flex flex-col gap-xs space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-md px-sm py-2 rounded transition-all duration-200 ease-in-out font-label-md text-label-md ${
                    isActive(item.href)
                      ? 'bg-secondary-container dark:bg-secondary-container text-on-secondary-container dark:text-on-secondary-container border-l-2 border-primary'
                      : 'text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Pinned Section */}
          <div className="mt-xl pt-lg border-t border-outline-variant dark:border-outline/20">
            <p className="px-sm font-label-md text-label-md text-on-surface-variant opacity-70 mb-sm">
              PINNED
            </p>
            <ul className="flex flex-col gap-xs space-y-1">
              {pinnedItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-md px-sm py-2 rounded text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-on-surface-variant transition-all duration-200 ease-in-out font-label-md text-label-md"
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pt-lg border-t border-outline-variant dark:border-outline/20 flex flex-col gap-sm">
          <button className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-2 px-4 rounded-lg font-label-md text-label-md shadow hover:bg-primary-fixed-variant transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Quick Add
          </button>
          <ul className="flex flex-col gap-xs space-y-1 mt-sm">
            {bottomItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-md px-sm py-2 rounded text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-on-surface-variant transition-all duration-200 ease-in-out font-label-md text-label-md"
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
