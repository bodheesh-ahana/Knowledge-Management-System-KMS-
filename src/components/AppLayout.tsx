'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="flex-1 flex flex-col min-w-0 ml-0 md:ml-sidebar-width">
        <Header onMenuToggle={() => setMobileOpen((o) => !o)} />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
