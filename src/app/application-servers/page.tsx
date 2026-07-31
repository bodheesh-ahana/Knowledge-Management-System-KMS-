'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

interface ServerNode {
  id: string;
  name: string;
  children?: ServerNode[];
  applications?: string[];
}

const serverHierarchy: ServerNode = {
  id: 'root',
  name: 'Application Servers (Numera)',
  children: [
    {
      id: 'NRD01',
      name: 'NRD01',
      children: [
        { id: 'NRD01-A', name: 'A' },
        { id: 'NRD01-B', name: 'B' },
        { id: 'NRD01-C', name: 'C', children: [{ id: 'NRD01-C-Drake', name: 'Drake' }] },
      ],
    },
    {
      id: 'NRD02',
      name: 'NRD02',
      children: [
        { id: 'NRD02-A', name: 'A' },
        { id: 'NRD02-B', name: 'B' },
        { id: 'NRD02-C', name: 'C', children: [{ id: 'NRD02-C-Drake', name: 'Drake' }] },
      ],
    },
    {
      id: 'NRD03',
      name: 'NRD03',
      children: [
        { id: 'NRD03-A', name: 'A' },
        { id: 'NRD03-B', name: 'B' },
        { id: 'NRD03-C', name: 'C', children: [{ id: 'NRD03-C-Lacerte', name: 'Lacerte' }] },
      ],
    },
    {
      id: 'NRD04',
      name: 'NRD04',
      children: [
        { id: 'NRD04-A', name: 'A' },
        {
          id: 'NRD04-B',
          name: 'B',
          children: [{ id: 'NRD04-B-Apps', name: 'Lacerte + QuickBooks' }],
        },
      ],
    },
    {
      id: 'NRD05',
      name: 'NRD05',
      children: [
        { id: 'NRD05-A', name: 'A' },
        { id: 'NRD05-B', name: 'B' },
        { id: 'NRD05-C', name: 'C' },
        { id: 'NRD05-D', name: 'D', children: [{ id: 'NRD05-D-QuickBooks', name: 'QuickBooks' }] },
      ],
    },
    {
      id: 'NRD06',
      name: 'NRD06',
      children: [
        { id: 'NRD06-A', name: 'A' },
        { id: 'NRD06-B', name: 'B' },
        { id: 'NRD06-C', name: 'C', children: [{ id: 'NRD06-C-UltraTax', name: 'UltraTax' }] },
      ],
    },
    {
      id: 'NRD07',
      name: 'NRD07',
      children: [{ id: 'NRD07-UltraTax', name: 'UltraTax' }],
    },
    {
      id: 'NRD08',
      name: 'NRD08',
      children: [{ id: 'NRD08-CCH', name: 'CCH ProSystem' }],
    },
  ],
};

const serverToAppMapping = [
  { server: 'NRD01', application: 'Drake' },
  { server: 'NRD02', application: 'Drake' },
  { server: 'NRD03', application: 'Lacerte' },
  { server: 'NRD04', application: 'Lacerte + QuickBooks' },
  { server: 'NRD05', application: 'QuickBooks' },
  { server: 'NRD06', application: 'UltraTax' },
  { server: 'NRD07', application: 'UltraTax' },
  { server: 'NRD08', application: 'CCH ProSystem' },
];

const applicationCounts = serverToAppMapping.reduce((acc, { application }) => {
  acc[application] = (acc[application] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const supportedApplications = [
  { name: 'Drake', icon: 'description', color: 'bg-blue-500', servers: 2, description: 'Tax preparation software' },
  { name: 'Lacerte', icon: 'account_balance', color: 'bg-purple-500', servers: 2, description: 'Professional tax software' },
  { name: 'QuickBooks', icon: 'receipt_long', color: 'bg-green-500', servers: 2, description: 'Accounting software' },
  { name: 'UltraTax', icon: 'calculate', color: 'bg-orange-500', servers: 2, description: 'Tax compliance software' },
  { name: 'CCH ProSystem', icon: 'analytics', color: 'bg-red-500', servers: 1, description: 'Tax and accounting software' },
  { name: 'Transaction Pro', icon: 'sync_alt', color: 'bg-yellow-500', servers: 0, description: 'Transaction management software' },
];

function HierarchyNode({ node, level = 0 }: { node: ServerNode; level?: number }) {
  const isLeaf = !node.children || node.children.length === 0;
  const isApp = node.name.includes('Drake') || node.name.includes('Lacerte') || 
                node.name.includes('QuickBooks') || node.name.includes('UltraTax') || 
                node.name.includes('CCH');

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        {/* Vertical lines for hierarchy */}
        {level > 0 && (
          <div className="flex items-center">
            <div className="w-6 border-l-2 border-t-2 border-outline-variant/40 h-8" />
            <div className="w-2" />
          </div>
        )}
        
        {/* Node */}
        <div
          className={`flex items-center gap-2 py-2 px-4 rounded-lg border-2 ${
            isApp
              ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-600'
              : isLeaf
              ? 'bg-surface-container-high dark:bg-surface-container-highest border-outline-variant'
              : 'bg-primary/10 dark:bg-primary/20 border-primary'
          }`}
        >
          {node.children && node.children.length > 0 && (
            <span className="material-symbols-outlined text-[18px] text-primary">
              folder
            </span>
          )}
          {isApp && (
            <span className="material-symbols-outlined text-[18px] text-emerald-600">
              apps
            </span>
          )}
          {!node.children && !isApp && (
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              dns
            </span>
          )}
          <span
            className={`font-body-md ${
              isApp
                ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                : level === 0
                ? 'font-title-md text-on-surface dark:text-on-secondary font-semibold'
                : 'text-on-surface dark:text-on-surface'
            }`}
          >
            {node.name}
          </span>
        </div>
      </div>
      
      {/* Children */}
      {node.children && (
        <div className="flex flex-col ml-4 border-l-2 border-outline-variant/30 pl-4">
          {node.children.map((child) => (
            <HierarchyNode 
              key={child.id} 
              node={child} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeNode({ node, level = 0 }: { node: ServerNode; level?: number }) {
  const isLeaf = !node.children || node.children.length === 0;
  const isApp = node.name.includes('Drake') || node.name.includes('Lacerte') || 
                node.name.includes('QuickBooks') || node.name.includes('UltraTax') || 
                node.name.includes('CCH');

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg ${
          isApp
            ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700'
            : isLeaf
            ? 'bg-surface-container-high dark:bg-surface-container-highest'
            : 'bg-primary/10 dark:bg-primary/20 border border-primary/30'
        }`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {node.children && node.children.length > 0 && (
          <span className="material-symbols-outlined text-[18px] text-primary">
            folder_open
          </span>
        )}
        {isApp && (
          <span className="material-symbols-outlined text-[18px] text-emerald-600">
            apps
          </span>
        )}
        {!node.children && !isApp && (
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
            dns
          </span>
        )}
        <span
          className={`font-body-md ${
            isApp
              ? 'text-emerald-700 dark:text-emerald-400 font-medium'
              : level === 0
              ? 'font-title-md text-on-surface dark:text-on-secondary font-semibold'
              : 'text-on-surface dark:text-on-surface'
          }`}
        >
          {node.name}
        </span>
      </div>
      {node.children &&
        node.children.map((child) => (
          <TreeNode key={child.id} node={child} level={level + 1} />
        ))}
    </div>
  );
}

function ServerCard({ server, application }: { server: string; application: string }) {
  const isApp = application.includes('Drake') || application.includes('Lacerte') || 
                application.includes('QuickBooks') || application.includes('UltraTax') || 
                application.includes('CCH');

  return (
    <div className="bg-surface-container-high dark:bg-surface-container-highest rounded-xl p-md border border-outline-variant hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px] text-primary">dns</span>
          <span className="font-title-md text-on-surface font-semibold">{server}</span>
        </div>
        <span className="inline-flex items-center gap-1 text-emerald-600 text-body-sm">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          Active
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-emerald-600">apps</span>
        <span className="font-body-md text-on-surface-variant">{application}</span>
      </div>
    </div>
  );
}

export default function ApplicationServersPage() {
  const [view, setView] = useState<'hierarchy' | 'tree' | 'cards' | 'image'>('image');

  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-container-max mx-auto w-full flex flex-col gap-lg">
        <section className="space-y-xs">
          <h2 className="font-h1 text-h1 text-on-surface dark:text-on-secondary">
            Application Servers
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline">
            Server hierarchy and application mapping for Numera infrastructure.
          </p>
        </section>

        {/* Supported Applications Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-2 border-primary/30 dark:border-primary/50 rounded-2xl p-lg">
          <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-semibold mb-md">
            Supported Applications
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
            We support the following tax and accounting applications across our infrastructure:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-md">
            {supportedApplications.map((app) => (
              <div
                key={app.name}
                className="bg-surface dark:bg-surface-container-lowest rounded-xl p-md border border-outline-variant hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col items-center text-center gap-sm">
                  <div className={`w-16 h-16 rounded-full ${app.color} flex items-center justify-center text-on-primary shadow-md`}>
                    <span className="material-symbols-outlined text-[32px]">{app.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-title-md text-on-surface font-semibold">{app.name}</h4>
                    <p className="text-body-sm text-on-surface-variant mt-1">{app.description}</p>
                    <div className="flex items-center justify-center gap-1 mt-2 text-primary">
                      <span className="material-symbols-outlined text-[16px]">dns</span>
                      <span className="text-body-sm font-medium">{app.servers} server{app.servers > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* View Toggle */}
        <section className="flex items-center gap-sm">
          <button
            onClick={() => setView('image')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md transition-colors ${
              view === 'image'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high dark:bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">image</span>
            Diagram View
          </button>
          <button
            onClick={() => setView('hierarchy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md transition-colors ${
              view === 'hierarchy'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high dark:bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">account_tree</span>
            Hierarchy Chart
          </button>
          <button
            onClick={() => setView('tree')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md transition-colors ${
              view === 'tree'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high dark:bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">list</span>
            Tree View
          </button>
          <button
            onClick={() => setView('cards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md transition-colors ${
              view === 'cards'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high dark:bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
            Card View
          </button>
        </section>

        {/* Server Hierarchy Chart */}
        {view === 'hierarchy' && (
          <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
            <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-semibold mb-md">
              Server Hierarchy Chart
            </h3>
            <div className="bg-surface-container-high/30 dark:bg-surface-container-highest/30 rounded-lg p-lg overflow-x-auto">
              <div className="min-w-max">
                <HierarchyNode node={serverHierarchy} />
              </div>
            </div>
          </section>
        )}

        {/* Tree View */}
        {view === 'tree' && (
          <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
            <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-semibold mb-md">
              Server Tree View
            </h3>
            <div className="bg-surface-container-high/50 dark:bg-surface-container-highest/50 rounded-lg p-md">
              <TreeNode node={serverHierarchy} />
            </div>
          </section>
        )}

        {/* Card View */}
        {view === 'cards' && (
          <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
            <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-semibold mb-md">
              Server Card View
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
              {serverToAppMapping.map(({ server, application }) => (
                <ServerCard key={server} server={server} application={application} />
              ))}
            </div>
          </section>
        )}

        {/* Image/Diagram View */}
        {view === 'image' && (
          <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
            <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-semibold mb-md">
              Server Architecture Diagrams
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
              <div className="bg-surface-container-high/30 dark:bg-surface-container-highest/30 rounded-lg p-md">
                <img
                  src="/images/WhatsApp Image 2026-07-31 at 3.28.58 PM.jpeg"
                  alt="Server Architecture Diagram 1"
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="bg-surface-container-high/30 dark:bg-surface-container-highest/30 rounded-lg p-md">
                <img
                  src="/images/WhatsApp Image 2026-07-31 at 3.28.58 PM (1).jpeg"
                  alt="Server Architecture Diagram 2"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </section>
        )}

        {/* Server-to-Application Mapping */}
        <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
          <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-semibold mb-md">
            Server-to-Application Mapping
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-on-surface-variant border-b border-outline-variant/40 text-[12px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Server</th>
                  <th className="py-3 px-4 font-medium">Application</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {serverToAppMapping.map(({ server, application }) => (
                  <tr key={server} className="border-b border-outline-variant/20 hover:bg-surface-container-high/30">
                    <td className="py-3 px-4 font-body-md text-on-surface font-medium">{server}</td>
                    <td className="py-3 px-4 text-body-sm text-on-surface-variant">{application}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-body-sm">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Application Distribution */}
        <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
          <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-semibold mb-md">
            Application Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {Object.entries(applicationCounts).map(([app, count]) => (
              <div
                key={app}
                className="bg-surface-container-high dark:bg-surface-container-highest rounded-lg p-md flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[24px] text-primary">
                    apps
                  </span>
                  <span className="font-body-md text-on-surface">{app}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-h3 text-h3 text-primary">{count}</span>
                  <span className="text-body-sm text-on-surface-variant">server(s)</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Summary */}
        <section className="bg-primary/5 dark:bg-primary/10 border border-primary/30 dark:border-primary/50 rounded-xl p-lg">
          <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-semibold mb-sm">
            Infrastructure Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <div className="text-center">
              <div className="font-h2 text-h2 text-primary">{serverToAppMapping.length}</div>
              <div className="text-body-sm text-on-surface-variant">Total Servers</div>
            </div>
            <div className="text-center">
              <div className="font-h2 text-h2 text-primary">{Object.keys(applicationCounts).length}</div>
              <div className="text-body-sm text-on-surface-variant">Applications</div>
            </div>
            <div className="text-center">
              <div className="font-h2 text-h2 text-primary">
                {Object.values(applicationCounts).reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-body-sm text-on-surface-variant">Total Deployments</div>
            </div>
            <div className="text-center">
              <div className="font-h2 text-h2 text-emerald-600">High</div>
              <div className="text-body-sm text-on-surface-variant">Redundancy</div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
