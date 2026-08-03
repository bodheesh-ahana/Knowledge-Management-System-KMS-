'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PacmanLoader from '@/components/PacmanLoader';

interface RankedEngineer {
  rank: number;
  name: string;
  hours: number;
  entries: number;
  ticketsHandled: number;
  ownerTickets: number;
  resolvedTickets: number;
  articlesCreated: number;
  score: number;
}

interface RankingData {
  allTime: RankedEngineer[];
  monthly: RankedEngineer[];
  lastUpdated: string;
}

const MEDAL_ICONS = ['military_tech', 'workspace_premium', 'workspace_premium'];
const MEDAL_COLORS = ['text-amber-500', 'text-slate-400', 'text-amber-700'];

export default function RankingPage() {
  const [data, setData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/ranking');
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to load ranking');
        }
        setData(json.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load ranking');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <PacmanLoader size={30} speedMultiplier={2} />
          <p className="text-body-sm text-on-surface-variant mt-4">Loading ranking...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="p-lg max-w-container-max mx-auto text-center text-error">
          {error || 'No ranking data available'}
        </div>
      </AppLayout>
    );
  }

  const monthlyWinner = data.monthly[0];

  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-container-max mx-auto w-full flex flex-col gap-lg">
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="font-h1 text-h1 text-on-surface dark:text-on-secondary font-bold">
            Engineer Rankings
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline mt-md">
            Performance-based rankings to recognise the best performers each month.
          </p>
        </div>

        {/* Monthly Winner */}
        {monthlyWinner && (
          <div className="bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-lg md:p-xl flex flex-col md:flex-row items-center gap-lg">
            <div className="w-20 h-20 rounded-full bg-amber-500 text-on-amber flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[40px]">workspace_premium</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="font-label-md text-label-md text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                Monthly Best Performer
              </p>
              <h2 className="font-h2 text-h2 text-on-surface dark:text-on-secondary font-bold mt-1">
                {monthlyWinner.name}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                {monthlyWinner.score} points · {monthlyWinner.resolvedTickets} resolved ·{' '}
                {monthlyWinner.hours.toFixed(2)} hours · {monthlyWinner.ownerTickets} owned
              </p>
            </div>
            <div className="text-center">
              <p className="font-body-sm text-body-sm text-amber-700 dark:text-amber-300">
                Gift winner for the month
              </p>
            </div>
          </div>
        )}

        {/* Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md items-end">
          {data.allTime.slice(0, 3).map((eng, idx) => (
            <div
              key={eng.name}
              className={`bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-2xl p-lg text-center flex flex-col items-center gap-sm ${
                idx === 0 ? 'md:order-2 md:pb-2xl' : idx === 1 ? 'md:order-1' : 'md:order-3'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[40px] ${MEDAL_COLORS[idx]}`}
              >
                {MEDAL_ICONS[idx]}
              </span>
              <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-bold">
                #{eng.rank} {eng.name}
              </h3>
              <p className="font-h2 text-h2 text-primary font-bold">{eng.score}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {eng.hours.toFixed(2)} hrs · {eng.resolvedTickets} resolved ·{' '}
                {eng.ticketsHandled} tickets · {eng.ownerTickets} owner
              </p>
            </div>
          ))}
        </div>

        {/* Rankings Table */}
        <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg overflow-x-auto">
          <div className="flex justify-between items-end mb-lg">
            <h3 className="font-h3 text-h3 text-on-surface dark:text-on-secondary font-bold">
              All-Time Rankings
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </p>
          </div>
          <table className="w-full text-body-sm">
            <thead className="bg-surface-container-high/50">
              <tr className="text-left text-on-surface-variant uppercase text-[11px] tracking-wider">
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Engineer</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Entries</th>
                <th className="px-4 py-3">Tickets Handled</th>
                <th className="px-4 py-3">Resolved</th>
                <th className="px-4 py-3">Articles</th>
                <th className="px-4 py-3">Owner Count</th>
              </tr>
            </thead>
            <tbody>
              {data.allTime.map((eng) => (
                <tr
                  key={eng.name}
                  className="border-t border-outline-variant/20 hover:bg-surface-container-high/30"
                >
                  <td className="px-4 py-3 font-bold text-on-surface">#{eng.rank}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">{eng.name}</td>
                  <td className="px-4 py-3 font-bold text-primary">{eng.score}</td>
                  <td className="px-4 py-3">{eng.hours.toFixed(2)}</td>
                  <td className="px-4 py-3">{eng.entries}</td>
                  <td className="px-4 py-3">{eng.ticketsHandled}</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">{eng.resolvedTickets}</td>
                  <td className="px-4 py-3">{eng.articlesCreated}</td>
                  <td className="px-4 py-3">{eng.ownerTickets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Score Formula */}
        <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md">
          <h4 className="font-title-sm text-title-sm text-on-surface mb-2">Scoring Formula</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Score = (resolved tickets × 12) + (articles created × 20) + (owner tickets × 5) + (tickets handled × 2) + (entries × 1.5) − (hours × 0.5).<br />
            Knowledge articles are weighted highest because they help the whole team learn and reuse solutions.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
