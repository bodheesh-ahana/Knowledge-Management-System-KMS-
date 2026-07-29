'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

interface SearchResult {
  id: string;
  type: 'article' | 'ticket' | 'application' | 'user';
  title: string;
  description: string;
  context: string;
  url: string;
}

const SEARCH_RESULTS: SearchResult[] = [
  {
    id: '1',
    type: 'article',
    title: 'Authentication Flow & Token Lifecycle',
    description:
      'Detailed architectural overview of OAuth2 implementation and JWT handling for internal microservices.',
    context: 'Knowledge Base • Security',
    url: '/knowledge/1',
  },
  {
    id: '2',
    type: 'ticket',
    title: 'TKT-042: Login page CSS not loading in dark mode',
    description: 'The login form styling appears broken when dark mode is enabled.',
    context: 'Tickets • High Priority • In Progress',
    url: '/tickets/1',
  },
  {
    id: '3',
    type: 'article',
    title: 'Implementing CORS Policies',
    description: 'Best practices for setting up CORS headers for secure cross-origin requests.',
    context: 'Knowledge Base • API',
    url: '/knowledge/2',
  },
  {
    id: '4',
    type: 'application',
    title: 'Core API Service',
    description: 'Main REST API for enterprise applications with OAuth2 authentication.',
    context: 'Applications • Active',
    url: '/applications/1',
  },
  {
    id: '5',
    type: 'user',
    title: 'Sarah J.',
    description: 'Senior Support Engineer - Owner of Core API Service',
    context: 'Team Members',
    url: '/users',
  },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('authentication');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return 'auto_stories';
      case 'ticket':
        return 'confirmation_number';
      case 'application':
        return 'apps';
      case 'user':
        return 'person';
      default:
        return 'search';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400';
      case 'ticket':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400';
      case 'application':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
      case 'user':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-4xl mx-auto w-full">
        {/* Header with Search */}
        <div className="mb-2xl">
          <h1 className="font-h1 text-h1 text-on-surface dark:text-on-secondary font-bold mb-lg">
            Search Results
          </h1>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-lg py-md rounded-lg border-2 border-primary bg-surface dark:bg-surface-container-lowest text-on-surface dark:text-on-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search articles, tickets, applications, users..."
            />
            <button className="absolute right-lg top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex gap-sm flex-wrap mb-2xl">
          {['All', 'Articles', 'Tickets', 'Applications', 'Users'].map((filter) => (
            <button
              key={filter}
              className={`px-md py-sm rounded-full font-label-md text-label-md transition-colors ${
                filter === 'All'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high dark:bg-surface-container-low text-on-surface dark:text-on-secondary hover:bg-primary/20'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline mb-lg">
          Found {SEARCH_RESULTS.length} results for &ldquo;{searchQuery}&rdquo;
        </p>

        {/* Search Results */}
        <div className="space-y-md">
          {SEARCH_RESULTS.map((result) => (
            <Link
              key={result.id}
              href={result.url}
              className="block p-lg bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-lg">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(result.type)}`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {getTypeIcon(result.type)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary group-hover:text-primary transition-colors">
                    {result.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline mt-sm line-clamp-2">
                    {result.description}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline/60 mt-md">
                    {result.context}
                  </p>
                </div>

                <div className="flex-shrink-0 text-primary dark:text-primary-fixed-dim">
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results Fallback */}
        {SEARCH_RESULTS.length === 0 && (
          <div className="text-center py-2xl">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant dark:text-outline block mb-lg">
              search_off
            </span>
            <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-bold mb-md">
              No results found
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
