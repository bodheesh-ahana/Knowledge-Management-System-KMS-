'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-container-max mx-auto w-full flex flex-col gap-lg">
        {/* Header */}
        <div className="mb-lg">
          <h1 className="font-h1 text-h1 text-on-surface dark:text-on-secondary font-bold">
            Analytics
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline mt-md">
            Track system performance and user engagement
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
          <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
            <p className="font-label-md text-label-md text-on-surface-variant dark:text-outline">
              Total Requests
            </p>
            <p className="font-h1 text-h1 text-primary font-bold mt-md">125.4K</p>
            <p className="font-body-sm text-body-sm text-green-500 mt-sm">
              ↑ 12% from last week
            </p>
          </div>

          <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
            <p className="font-label-md text-label-md text-on-surface-variant dark:text-outline">
              Active Users
            </p>
            <p className="font-h1 text-h1 text-primary font-bold mt-md">3,245</p>
            <p className="font-body-sm text-body-sm text-green-500 mt-sm">
              ↑ 8% from last week
            </p>
          </div>

          <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
            <p className="font-label-md text-label-md text-on-surface-variant dark:text-outline">
              Avg Response Time
            </p>
            <p className="font-h1 text-h1 text-primary font-bold mt-md">124ms</p>
            <p className="font-body-sm text-body-sm text-red-500 mt-sm">
              ↓ 5% from last week
            </p>
          </div>

          <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
            <p className="font-label-md text-label-md text-on-surface-variant dark:text-outline">
              System Uptime
            </p>
            <p className="font-h1 text-h1 text-primary font-bold mt-md">99.95%</p>
            <p className="font-body-sm text-body-sm text-green-500 mt-sm">
              No incidents
            </p>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
          <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-bold mb-lg">
            Request Volume (Last 7 Days)
          </h3>
          <div className="h-64 bg-surface-container-high dark:bg-[#0b1c30] rounded-lg flex items-end justify-around p-lg gap-sm">
            {[40, 60, 45, 70, 65, 80, 75].map((height, idx) => (
              <div
                key={idx}
                className="flex-1 bg-primary rounded-t hover:opacity-80 transition-opacity"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        {/* Top Pages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
            <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-bold mb-lg">
              Top Pages
            </h3>
            <div className="space-y-md">
              {[
                { page: 'Dashboard', views: 12432, bounce: '32%' },
                { page: 'Knowledge Base', views: 9821, bounce: '28%' },
                { page: 'Tickets', views: 8934, bounce: '35%' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between pb-md border-b border-outline-variant dark:border-outline last:border-0">
                  <div>
                    <p className="font-body-md text-body-md text-on-surface dark:text-on-secondary">
                      {item.page}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline mt-xs">
                      {item.views.toLocaleString()} views
                    </p>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface dark:text-on-secondary">
                    {item.bounce}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
            <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-bold mb-lg">
              User Activity
            </h3>
            <div className="space-y-md">
              {[
                { action: 'Articles Created', count: 156 },
                { action: 'Tickets Resolved', count: 328 },
                { action: 'Articles Viewed', count: 5234 },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between pb-md border-b border-outline-variant dark:border-outline last:border-0">
                  <p className="font-body-md text-body-md text-on-surface dark:text-on-secondary">
                    {item.action}
                  </p>
                  <p className="font-h3 text-h3 text-primary font-bold">
                    {item.count.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
