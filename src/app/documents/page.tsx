'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PacmanLoader from '@/components/PacmanLoader';
import { usePermissions } from '@/hooks/usePermissions';

interface OfficialDocument {
  name: string;
  filename: string;
  extension: string;
  size: string;
  modifiedAt: string;
  applications: string[];
  url: string;
}

const NATIVE_VIEW_EXTENSIONS = new Set(['PDF', 'PNG', 'JPG', 'JPEG']);
const OFFICE_VIEW_EXTENSIONS = new Set(['DOCX', 'DOC', 'XLSX', 'XLS', 'PPTX', 'PPT']);

const EXTENSION_ICONS: Record<string, string> = {
  PDF: 'picture_as_pdf',
  DOCX: 'description',
  DOC: 'description',
  XLSX: 'table_view',
  XLS: 'table_view',
  PNG: 'image',
  JPG: 'image',
  JPEG: 'image',
};

export default function DocumentsPage() {
  const { canDownloadDocuments } = usePermissions();
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [supportedApplications, setSupportedApplications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [appFilter, setAppFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/official-documents');
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to load documents');
        }
        setDocuments(json.data.documents || []);
        setSupportedApplications(json.data.supportedApplications || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getViewUrl = (doc: OfficialDocument) => {
    if (NATIVE_VIEW_EXTENSIONS.has(doc.extension)) {
      return doc.url;
    }
    if (OFFICE_VIEW_EXTENSIONS.has(doc.extension) && typeof window !== 'undefined') {
      const absoluteUrl = `${window.location.origin}${doc.url}`;
      // Office Online viewer requires a publicly reachable URL; on
      // localhost this will show an error page from the viewer service
      // rather than the file itself, but works correctly once deployed.
      return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(absoluteUrl)}`;
    }
    return doc.url;
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesApp = appFilter === 'All' || doc.applications.includes(appFilter);
      const matchesSearch =
        !search || doc.name.toLowerCase().includes(search.toLowerCase());
      return matchesApp && matchesSearch;
    });
  }, [documents, appFilter, search]);

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
              Official Standard Operating Procedures &amp; reference documentation for supported
              applications: {supportedApplications.join(', ')}
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="flex flex-col sm:flex-row gap-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="flex-1 h-[38px] px-3 rounded-lg bg-surface border border-outline-variant text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            className="h-[38px] px-3 rounded-lg bg-surface border border-outline-variant text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="All">All Applications</option>
            {supportedApplications.map((app) => (
              <option key={app} value={app}>
                {app}
              </option>
            ))}
            <option value="General">General</option>
          </select>
        </section>

        {error && (
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg text-body-sm">
            {error}
          </div>
        )}

        {/* Documents List */}
        <div className="space-y-md">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <PacmanLoader size={30} speedMultiplier={2} />
              <p className="text-body-sm text-on-surface-variant mt-4">Loading documents...</p>
            </div>
          )}
          {!loading && filteredDocuments.length === 0 && (
            <p className="text-body-sm text-on-surface-variant">No documents found.</p>
          )}
          {filteredDocuments.map((doc) => (
            <div
              key={doc.filename}
              className="flex items-center justify-between p-lg bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl hover:border-primary transition-all group"
            >
              <div className="flex items-center gap-lg flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">
                    {EXTENSION_ICONS[doc.extension] || 'draft'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-body-md text-body-md text-on-surface dark:text-on-secondary group-hover:text-primary transition-colors truncate">
                    {doc.name}
                  </h3>
                  <div className="flex items-center gap-xs mt-xs flex-wrap">
                    {doc.applications.map((app) => (
                      <span
                        key={app}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant"
                      >
                        {app}
                      </span>
                    ))}
                    <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline">
                      {new Date(doc.modifiedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-lg flex-shrink-0">
                <span className="font-label-md text-label-md text-on-surface-variant dark:text-outline">
                  {doc.size}
                </span>
                <a
                  href={getViewUrl(doc)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary dark:text-primary-fixed-dim hover:bg-surface-container-high rounded p-sm transition-colors"
                  title="View"
                >
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </a>
                {canDownloadDocuments && (
                  <a
                    href={doc.url}
                    download={doc.filename}
                    className="text-primary dark:text-primary-fixed-dim hover:bg-surface-container-high rounded p-sm transition-colors"
                    title="Download"
                  >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
