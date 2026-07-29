'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components';
import Link from 'next/link';

const modules = [
  { title: 'Knowledge Base', description: 'Store, search and reuse resolutions.', icon: 'menu_book', href: '/knowledge' },
  { title: 'Tracker', description: 'Log daily work and hours by ticket.', icon: 'timer', href: '/tracker' },
  { title: 'Team', description: 'View members and manage access.', icon: 'groups', href: '/users' },
  { title: 'Applications', description: 'Catalog apps, docs and SOPs.', icon: 'apps', href: '/applications' },
  { title: 'Documents', description: 'Centralized runbooks and SOPs.', icon: 'folder_open', href: '/documents' },
  { title: 'Analytics', description: 'Trends, activity and performance.', icon: 'analytics', href: '/analytics' },
  { title: 'Ranking', description: 'Team contribution and recognition.', icon: 'trophy', href: '/ranking' },
];

const highlights = [
  { icon: 'shield', label: 'Role-based access', sub: 'Leads, engineers, admins' },
  { icon: 'visibility', label: 'Audit trails', sub: 'Who, what and when' },
  { icon: 'monitoring', label: 'Real-time analytics', sub: 'Trends and rankings' },
];

export default function HomePage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      {/* Top navigation */}
      <header className="border-b border-outline-variant/30 bg-surface-container-low/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[22px]">school</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-lg text-label-lg font-bold text-on-surface leading-none">KMS</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant leading-none">ENTERPRISE SUPPORT</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="px-6">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="font-label-md text-label-md text-on-surface hover:text-primary transition-colors"
                >
                  Sign in
                </Link>
                <Link href="/auth/login">
                  <Button className="px-6">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] bg-primary/8 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -left-24 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left copy */}
              <div className="space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-[12px] font-medium shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  Numera ADM Support Ecosystem
                </div>
                <h1 className="font-h1 text-h1 font-bold text-on-surface leading-tight tracking-tight">
                  Knowledge, tickets and team work — in one place
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Track support tickets, document resolutions, log daily work, manage team access and
                  measure performance across your application support team.
                </p>
                <div className="flex gap-md flex-wrap pt-2">
                  <Link href="/auth/login">
                    <Button className="px-8 py-3 shadow-lg shadow-primary/20">Get Started</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="secondary" className="px-8 py-3">
                      Dashboard
                    </Button>
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-outline-variant/30">
                  {highlights.map((h) => (
                    <div key={h.label} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">{h.icon}</span>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface">{h.label}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{h.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right visual */}
              <div className="hidden lg:flex items-center justify-center relative h-[26rem]">
                <div className="relative w-96 h-96">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl rotate-6" />
                  <div className="absolute inset-0 bg-surface-container-low dark:bg-surface-container border border-outline-variant/40 rounded-3xl shadow-2xl p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
                      <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">support_agent</span>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface">Numera Support</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Active now</p>
                      </div>
                    </div>
                    {[
                      { label: 'Open Tickets', value: '12', accent: 'text-error', icon: 'confirmation_number' },
                      { label: 'KB Articles', value: '48', accent: 'text-primary', icon: 'menu_book' },
                      { label: 'Hours Logged', value: '6.5h', accent: 'text-secondary', icon: 'timer' },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex items-center justify-between p-4 rounded-xl bg-surface dark:bg-surface-container-lowest border border-outline-variant/20"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined text-[20px] ${s.accent}`}>{s.icon}</span>
                          <span className="font-body-md text-body-md text-on-surface">{s.label}</span>
                        </div>
                        <span className="font-h3 text-h3 font-bold text-on-surface">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Module grid */}
        <section className="px-6 py-12 bg-surface-container-low/40">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 space-y-2">
              <h2 className="font-h2 text-h2 font-bold text-on-surface">Everything your support team needs</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                One integrated platform for tickets, knowledge, tracking and team management.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {modules.map((m) => (
                <Link
                  key={m.title}
                  href={m.href}
                  className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] max-w-xs bg-surface dark:bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-md hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">{m.icon}</span>
                  </div>
                  <h3 className="font-h3 text-h3 text-on-surface">{m.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{m.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto bg-surface-container-low dark:bg-surface-container rounded-3xl p-2xl md:p-3xl flex flex-col md:flex-row items-center justify-between gap-8 border border-outline-variant/30 shadow-sm">
            <div className="space-y-2 max-w-2xl">
              <h2 className="font-h2 text-h2 font-bold text-on-surface">
                Built for enterprise support teams
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Role-based access for Team Leads, Engineers and Admins with audit trails, analytics
                and a unified knowledge base.
              </p>
            </div>
            <Link href="/auth/login">
              <Button className="px-8 py-3 shadow-lg shadow-primary/20">Start Using KMS</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant/30 bg-surface-container-low/60 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-[12px] text-on-surface-variant">
          <span>Knowledge Management System — Internal use only · Developed by Bodheesh V C</span>
          <span>© {new Date().getFullYear()} Ahana IT</span>
        </div>
      </footer>
    </div>
  );
}
