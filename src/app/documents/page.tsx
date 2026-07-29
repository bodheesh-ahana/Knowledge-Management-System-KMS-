'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';

export default function DocumentsPage() {
  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-container-max mx-auto w-full flex flex-col gap-lg">
        {/* Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
          <div className="space-y-xs">
            <h2 className="font-h1 text-h1 text-on-surface dark:text-on-secondary">
              Documents
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline">
              Access and manage shared documents and resources
            </p>
          </div>
          <button className="bg-primary text-on-primary px-lg py-md rounded-lg font-label-md text-label-md shadow hover:bg-primary-fixed-variant transition-colors flex items-center gap-sm">
            <span className="material-symbols-outlined text-[18px]">upload</span>
            Upload Document
          </button>
        </section>

        {/* Documents List */}
        <div className="space-y-md">
          {[
            {
              name: 'API Documentation v2.1',
              type: 'PDF',
              size: '2.4 MB',
              author: 'Sarah J.',
              date: 'Nov 15, 2024',
            },
            {
              name: 'Database Schema Diagram',
              type: 'PNG',
              size: '1.8 MB',
              author: 'Marcus T.',
              date: 'Nov 14, 2024',
            },
            {
              name: 'System Architecture',
              type: 'PDF',
              size: '3.2 MB',
              author: 'Elena R.',
              date: 'Nov 10, 2024',
            },
            {
              name: 'Security Best Practices',
              type: 'DOCX',
              size: '1.1 MB',
              author: 'John D.',
              date: 'Nov 8, 2024',
            },
          ].map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-lg bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl hover:border-primary transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-lg flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">
                    {doc.type === 'PDF' ? 'picture_as_pdf' : 'image'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-body-md text-body-md text-on-surface dark:text-on-secondary group-hover:text-primary transition-colors truncate">
                    {doc.name}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline mt-xs">
                    {doc.author} • {doc.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-lg flex-shrink-0">
                <span className="font-label-md text-label-md text-on-surface-variant dark:text-outline">
                  {doc.size}
                </span>
                <button className="text-primary dark:text-primary-fixed-dim hover:bg-surface-container-high rounded p-sm transition-colors">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
