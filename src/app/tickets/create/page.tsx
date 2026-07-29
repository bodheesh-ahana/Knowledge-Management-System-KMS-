'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

export default function QuickTicketEntryPage() {
  const [impact, setImpact] = useState('High');
  const [category, setCategory] = useState('');
  const [system, setSystem] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Quick ticket submitted:', { impact, category, system });
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto p-md md:p-xl flex justify-center">
        <div className="w-full max-w-[720px]">
          <div className="mb-xl">
            <div className="flex items-center gap-sm text-on-surface-variant mb-md">
              <Link
                href="/tickets"
                className="hover:text-primary transition-colors flex items-center"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span className="ml-xs text-body-sm">Back to Tickets</span>
              </Link>
            </div>
            <h1 className="font-h1 text-h1 text-on-surface mb-sm">Quick Ticket Entry</h1>
            <p className="text-on-surface-variant text-body-lg">Log a new issue efficiently.</p>
          </div>

          <div className="bg-surface border border-outline-variant rounded-xl p-lg md:p-xl shadow-sm">
            <div className="mb-xl">
              <div className="flex justify-between text-label-md text-on-surface-variant mb-xs">
                <span>Step 1 of 3: Classification</span>
                <span className="font-medium text-primary">33%</span>
              </div>
              <div className="w-full h-[4px] bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary progress-bar w-1/3 rounded-full" />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-lg">
                <label className="block font-label-md text-on-surface mb-sm">Impact Level</label>
                <div className="flex flex-wrap gap-sm">
                  {['Low', 'Medium', 'High', 'Critical'].map((level) => {
                    const active = impact === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setImpact(level)}
                        className={`px-md py-xs rounded-full border text-body-sm font-medium flex items-center gap-xs transition-colors ${
                          active
                            ? 'border-primary text-primary bg-primary-fixed'
                            : 'border-outline-variant text-on-surface bg-surface hover:bg-surface-container'
                        }`}
                      >
                        {active && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-lg">
                <label htmlFor="category" className="block font-label-md text-on-surface mb-sm">
                  Issue Category
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full bg-surface border border-outline-variant rounded-lg px-md py-[10px] text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  >
                    <option value="" disabled>
                      Select category...
                    </option>
                    <option value="hardware">Hardware Malfunction</option>
                    <option value="software">Software Bug / Crash</option>
                    <option value="access">Access / Permissions</option>
                    <option value="network">Network Connectivity</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-md pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="mb-xl">
                <label htmlFor="system" className="block font-label-md text-on-surface mb-sm">
                  Affected System / Application
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  </span>
                  <input
                    id="system"
                    type="text"
                    value={system}
                    onChange={(e) => setSystem(e.target.value)}
                    placeholder="Start typing system name..."
                    className="w-full bg-surface border border-outline-variant rounded-lg pl-[40px] pr-md py-[10px] text-body-md text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                <div className="mt-xs text-label-md text-on-surface-variant">
                  e.g. ERP System, Internal Wiki, VPN Client
                </div>
              </div>

              <div className="flex items-center justify-end gap-md pt-lg border-t border-outline-variant">
                <Link
                  href="/tickets"
                  className="px-md h-[40px] rounded-lg text-on-surface font-medium hover:bg-surface-container transition-colors text-body-sm flex items-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-lg h-[40px] rounded-lg bg-primary text-on-primary font-medium hover:bg-primary-container transition-colors flex items-center gap-xs text-body-sm"
                >
                  Next Step
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
