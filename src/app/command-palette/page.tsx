'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

const SUGGESTED = [
  { icon: 'vpn_key', label: 'VPN Access', href: '/applications/1' },
  { icon: 'cloud_sync', label: 'Cloud Portal', href: '/applications/2' },
  { icon: 'group', label: 'Directory', href: '/users' },
  { icon: 'analytics', label: 'Reports', href: '/analytics' },
];

const ARTICLES = [
  {
    title: 'Resolving VPN Connection Timeouts',
    tag: 'Troubleshooting',
    category: 'IT Support',
    sub: 'Network',
    active: true,
  },
  {
    title: 'Employee Onboarding Checklist Q3',
    tag: 'HR Docs',
    category: 'Human Resources',
    sub: 'Policies',
    active: false,
  },
];

const TICKETS = [
  {
    id: 'TKT-8902',
    title: 'Access request for Production Database',
    time: 'Opened 2 hours ago by Sarah Jenkins',
    priority: 'High Priority',
    priorityClass: 'bg-error-container text-on-error-container border-error-container',
  },
  {
    id: 'TKT-8895',
    title: 'Update Slack integration webhook',
    time: 'Opened yesterday by DevOps Bot',
    priority: 'Open',
    priorityClass: 'bg-surface-container-highest text-on-surface-variant border-outline-variant',
  },
];

export default function CommandPalettePage() {
  const [query, setQuery] = useState('');

  return (
    <AppLayout>
      <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-start justify-center pt-[102px] sm:pt-[153px] px-md pb-md">
        <div className="w-full max-w-3xl bg-surface-container-lowest border border-outline rounded-xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
          {/* Search Header */}
          <div className="flex items-center px-lg py-md border-b border-outline-variant gap-md bg-surface-container-lowest">
            <span className="material-symbols-outlined text-primary text-[28px]">search</span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-h3 text-h3 text-on-surface placeholder:text-outline-variant focus:ring-0 p-0"
              placeholder="Search tickets, knowledge, applications..."
              type="text"
            />
            <div className="flex items-center gap-xs">
              <kbd className="font-mono text-mono text-outline bg-surface-container px-2 py-1 rounded border border-outline-variant">
                Esc
              </kbd>
            </div>
          </div>

          <div className="flex-1 max-h-[614px] overflow-y-auto p-sm">
            {/* Suggested Apps */}
            <div className="mb-lg">
              <h3 className="font-label-md text-label-md text-on-surface-variant px-md py-sm uppercase tracking-wider">
                Suggested Applications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm px-sm">
                {SUGGESTED.map((app) => (
                  <Link
                    key={app.label}
                    href={app.href}
                    className="flex flex-col items-center justify-center p-md bg-surface-container hover:bg-surface-container-high border border-transparent hover:border-outline-variant rounded-lg cursor-pointer transition-colors text-center group"
                  >
                    <span className="material-symbols-outlined text-tertiary-container group-hover:text-primary mb-sm text-[24px]">
                      {app.icon}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface">{app.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Knowledge Articles */}
            <div className="mb-lg">
              <h3 className="font-label-md text-label-md text-on-surface-variant px-md py-sm uppercase tracking-wider">
                Knowledge Base
              </h3>
              <div className="flex flex-col gap-xs">
                {ARTICLES.map((article) => (
                  <Link
                    key={article.title}
                    href="/knowledge/1"
                    className={`flex items-center px-md py-sm rounded-lg border-l-2 cursor-pointer group transition-colors ${
                      article.active
                        ? 'bg-secondary-container border-primary'
                        : 'hover:bg-surface-container border-transparent'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded mr-md ${
                        article.active
                          ? 'bg-primary-container/20'
                          : 'bg-surface-container-high group-hover:bg-primary-container/20'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          article.active
                            ? 'text-primary'
                            : 'text-tertiary-container group-hover:text-primary'
                        }`}
                      >
                        {article.active ? 'auto_stories' : 'description'}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center gap-sm">
                        <span
                          className={`font-body-md text-body-md ${
                            article.active
                              ? 'text-on-secondary-container font-medium'
                              : 'text-on-surface'
                          }`}
                        >
                          {article.title}
                        </span>
                        <span className="px-2 py-[2px] rounded-full bg-surface-container text-outline text-[10px] font-label-md uppercase tracking-wider border border-outline-variant">
                          {article.tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-xs mt-1">
                        <span className="font-label-md text-label-md text-on-surface-variant">
                          {article.category}
                        </span>
                        <span className="material-symbols-outlined text-[12px] text-outline">
                          chevron_right
                        </span>
                        <span className="font-label-md text-label-md text-on-surface-variant">
                          {article.sub}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`hidden group-hover:flex items-center gap-xs ${
                        article.active ? 'text-primary' : 'text-outline'
                      }`}
                    >
                      {article.active && (
                        <span className="font-label-md text-label-md text-primary">Select</span>
                      )}
                      <span className="material-symbols-outlined text-[16px]">keyboard_return</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tickets */}
            <div className="mb-xs">
              <h3 className="font-label-md text-label-md text-on-surface-variant px-md py-sm uppercase tracking-wider">
                Active Tickets
              </h3>
              <div className="flex flex-col gap-xs">
                {TICKETS.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="flex items-center px-md py-sm hover:bg-surface-container rounded-lg border-l-2 border-transparent cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-surface-container-high mr-md group-hover:bg-primary-container/20 transition-colors">
                      <span className="material-symbols-outlined text-tertiary-container group-hover:text-primary text-[20px]">
                        confirmation_number
                      </span>
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-sm">
                          <span className="font-mono text-mono text-outline">{ticket.id}</span>
                          <span className="font-body-md text-body-md text-on-surface">
                            {ticket.title}
                          </span>
                        </div>
                        <span className="font-label-md text-label-md text-outline mt-1">
                          {ticket.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-md">
                        <span
                          className={`px-2 py-1 rounded border font-label-md text-label-md ${ticket.priorityClass}`}
                        >
                          {ticket.priority}
                        </span>
                        <div className="hidden group-hover:flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[16px] text-outline">
                            keyboard_return
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-lg py-sm bg-surface-container-low border-t border-outline-variant">
            <div className="flex items-center gap-lg">
              <div className="flex items-center gap-xs">
                <kbd className="font-mono text-mono text-outline bg-surface-container px-1 rounded border border-outline-variant flex items-center justify-center w-5 h-5">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                </kbd>
                <kbd className="font-mono text-mono text-outline bg-surface-container px-1 rounded border border-outline-variant flex items-center justify-center w-5 h-5">
                  <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                </kbd>
                <span className="font-label-md text-label-md text-outline ml-xs">Navigate</span>
              </div>
              <div className="flex items-center gap-xs">
                <kbd className="font-mono text-mono text-outline bg-surface-container px-2 py-1 rounded border border-outline-variant flex items-center justify-center h-5">
                  Enter
                </kbd>
                <span className="font-label-md text-label-md text-outline ml-xs">Select</span>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <span className="font-label-md text-label-md text-outline">KMS Command</span>
              <span className="material-symbols-outlined text-outline text-[16px]">
                keyboard_command_key
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
