'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AppLayout from '@/components/AppLayout';

interface ProfileStats {
  knowledgeArticles: {
    total: number;
    recent: any[];
  };
  tickets: {
    resolved: number;
    recent: any[];
  };
  tracker: {
    totalEntries: number;
    totalHours: number;
    recent: any[];
  };
  activity: Array<{
    _id: string;
    count: number;
    hours: number;
  }>;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/profile/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile stats:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchStats();
    }
  }, [session]);

  const user = session?.user as any;

  // Generate activity map for the last 12 months
  const generateActivityMap = () => {
    const weeks: any[][] = [];
    const monthLabels: string[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 12);
    // Start from Sunday for clean weekly columns
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    // Create a map of activity data
    const activityMap = new Map(
      stats?.activity.map((item) => [item._id, item.count]) || []
    );

    let previousMonth = '';

    // Generate 53 weeks to ensure full last 12 months
    for (let week = 0; week < 53; week++) {
      const weekDays = [];
      const currentWeekDate = new Date(startDate);
      currentWeekDate.setDate(startDate.getDate() + week * 7);
      const currentMonth = currentWeekDate.toLocaleDateString('en-US', { month: 'short' });

      // Add month label when the month changes
      if (currentMonth !== previousMonth) {
        monthLabels.push(currentMonth);
        previousMonth = currentMonth;
      } else {
        monthLabels.push('');
      }

      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);

        const dateStr = currentDate.toISOString().split('T')[0];
        const count = activityMap.get(dateStr) || 0;

        let level = 0;
        if (count > 0) level = 1;
        if (count >= 2) level = 2;
        if (count >= 4) level = 3;
        if (count >= 6) level = 4;

        weekDays.push({ date: dateStr, level, count });
      }
      weeks.push(weekDays);
    }

    return { weeks, monthLabels };
  };

  const { weeks: activityWeeks = [], monthLabels = [] } = stats ? generateActivityMap() : { weeks: [], monthLabels: [] };

  const getContribClass = (level: number) => {
    const classes = [
      'bg-surface-container-low border border-outline-variant',
      'bg-primary/20 border border-primary/30',
      'bg-primary/40 border border-primary/50',
      'bg-primary/60 border border-primary/70',
      'bg-primary border border-primary',
    ];
    return classes[level] || classes[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto p-md md:p-lg bg-surface">
        <div className="max-w-container-max mx-auto w-full max-w-[1024px] space-y-xl pb-2xl">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-lg items-start md:items-center bg-surface-container-lowest border border-outline-variant rounded-xl p-lg relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed-dim rounded-full blur-3xl opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary text-on-primary flex items-center justify-center text-4xl md:text-5xl font-bold border-4 border-surface shadow-sm z-10 relative">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute bottom-1 right-1 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center border-2 border-surface z-20" title="Online">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  check_circle
                </span>
              </div>
            </div>

            <div className="flex-1 z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-h1 text-h1 text-on-surface mb-1">
                    {user?.name || 'User'}
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant flex items-center gap-2">
                    {user?.role || 'Engineer'}
                    <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Grid Layout for Metrics & Skills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {/* Metrics Column (Takes 2 columns on desktop) */}
            <div className="md:col-span-2 space-y-lg">
              {/* Key Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                {/* Metric 1 - Knowledge Articles */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between hover:border-primary-fixed-dim transition-colors">
                  <div className="flex items-center gap-2 text-on-surface-variant mb-4">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
                      auto_stories
                    </span>
                    <h3 className="font-label-md text-label-md">Knowledge Articles</h3>
                  </div>
                  <div>
                    {loading ? (
                      <p className="font-h1 text-h1 text-on-surface-variant">...</p>
                    ) : (
                      <>
                        <p className="font-h1 text-h1 text-on-surface">
                          {stats?.knowledgeArticles.total || 0}
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            description
                          </span>
                          Created by you
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Metric 2 - Tickets Resolved */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between hover:border-primary-fixed-dim transition-colors">
                  <div className="flex items-center gap-2 text-on-surface-variant mb-4">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
                      confirmation_number
                    </span>
                    <h3 className="font-label-md text-label-md">Tickets Resolved</h3>
                  </div>
                  <div>
                    {loading ? (
                      <p className="font-h1 text-h1 text-on-surface-variant">...</p>
                    ) : (
                      <>
                        <p className="font-h1 text-h1 text-on-surface">
                          {stats?.tickets.resolved || 0}
                        </p>
                        <p className="font-body-sm text-body-sm text-primary flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            check_circle
                          </span>
                          Completed
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Metric 3 - Hours Logged */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between hover:border-primary-fixed-dim transition-colors">
                  <div className="flex items-center gap-2 text-on-surface-variant mb-4">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
                      timer
                    </span>
                    <h3 className="font-label-md text-label-md">Hours Logged</h3>
                  </div>
                  <div>
                    {loading ? (
                      <p className="font-h1 text-h1 text-on-surface-variant">...</p>
                    ) : (
                      <>
                        <p className="font-h1 text-h1 text-on-surface">
                          {stats?.tracker.totalHours || 0}
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            event_note
                          </span>
                          {stats?.tracker.totalEntries || 0} entries
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity Map */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-h3 text-h3 text-on-surface">Activity Map</h2>
                  <div className="flex items-center gap-4 font-body-sm text-body-sm text-on-surface-variant">
                    <span>Less</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-sm bg-surface-container-low border border-outline-variant"></div>
                      <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/30"></div>
                      <div className="w-3 h-3 rounded-sm bg-primary/40 border border-primary/50"></div>
                      <div className="w-3 h-3 rounded-sm bg-primary/60 border border-primary/70"></div>
                      <div className="w-3 h-3 rounded-sm bg-primary border border-primary"></div>
                    </div>
                    <span>More</span>
                  </div>
                </div>
                
                {/* Activity Grid */}
                <div className="overflow-x-auto">
                  {loading ? (
                    <p className="text-on-surface-variant text-center py-8">Loading activity...</p>
                  ) : (
                    <div className="flex min-w-max pb-2">
                      {/* Day of week labels */}
                      <div className="flex flex-col gap-1 pt-5 pr-2">
                        <span className="text-[10px] text-on-surface-variant h-3 leading-none">Mon</span>
                        <span className="text-[10px] text-on-surface-variant h-3 leading-none"></span>
                        <span className="text-[10px] text-on-surface-variant h-3 leading-none">Wed</span>
                        <span className="text-[10px] text-on-surface-variant h-3 leading-none"></span>
                        <span className="text-[10px] text-on-surface-variant h-3 leading-none">Fri</span>
                      </div>
                      <div className="flex flex-col">
                        {/* Month labels */}
                        <div className="flex h-4 mb-1">
                          {monthLabels.map((label, idx) => (
                            <div key={idx} className="w-4 text-[10px] text-on-surface-variant leading-none text-left">
                              {label}
                            </div>
                          ))}
                        </div>
                        {/* Contribution cells */}
                        <div className="flex gap-1">
                          {activityWeeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-1">
                              {week.map((day, dayIdx) => (
                                <div
                                  key={dayIdx}
                                  className={`w-3 h-3 rounded-sm ${getContribClass(day.level)}`}
                                  title={`${day.date}: ${day.count} ${day.count === 1 ? 'entry' : 'entries'}`}
                                ></div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity Column */}
            <div className="space-y-lg">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
                <h2 className="font-h3 text-h3 text-on-surface mb-6">Recent Activity</h2>
                
                {loading ? (
                  <p className="text-on-surface-variant text-center py-4">Loading...</p>
                ) : (
                  <div className="space-y-4">
                    {/* Recent Knowledge Articles */}
                    {stats?.knowledgeArticles.recent && stats.knowledgeArticles.recent.length > 0 && (
                      <div>
                        <h3 className="font-label-md text-label-md text-on-surface-variant mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            auto_stories
                          </span>
                          Knowledge Articles
                        </h3>
                        <div className="space-y-2">
                          {stats.knowledgeArticles.recent.slice(0, 3).map((article: any) => (
                            <div
                              key={article._id}
                              className="p-2 rounded bg-surface-container-low border border-outline-variant/50"
                            >
                              <p className="font-body-sm text-body-sm text-on-surface truncate">
                                {article.title}
                              </p>
                              <p className="font-body-xs text-on-surface-variant">
                                {formatDate(article.createdAt)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Tickets */}
                    {stats?.tickets.recent && stats.tickets.recent.length > 0 && (
                      <div>
                        <h3 className="font-label-md text-label-md text-on-surface-variant mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            confirmation_number
                          </span>
                          Recent Tickets
                        </h3>
                        <div className="space-y-2">
                          {stats.tickets.recent.slice(0, 3).map((ticket: any) => (
                            <div
                              key={ticket._id}
                              className="p-2 rounded bg-surface-container-low border border-outline-variant/50"
                            >
                              <p className="font-body-sm text-body-sm text-on-surface truncate">
                                {ticket.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  ticket.status === 'Resolved' ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                                }`}>
                                  {ticket.status}
                                </span>
                                <span className="font-body-xs text-on-surface-variant">
                                  {formatDate(ticket.updatedAt)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Tracker Entries */}
                    {stats?.tracker.recent && stats.tracker.recent.length > 0 && (
                      <div>
                        <h3 className="font-label-md text-label-md text-on-surface-variant mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            track_changes
                          </span>
                          Recent Time Logs
                        </h3>
                        <div className="space-y-2">
                          {stats.tracker.recent.slice(0, 3).map((entry: any) => (
                            <div
                              key={entry._id}
                              className="p-2 rounded bg-surface-container-low border border-outline-variant/50"
                            >
                              <p className="font-body-sm text-body-sm text-on-surface">
                                {entry.application || 'Unknown App'}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="font-body-xs text-on-surface-variant">
                                  {entry.hoursWorked || 0}h
                                </span>
                                <span className="font-body-xs text-on-surface-variant">
                                  {formatDate(entry.date)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!stats?.knowledgeArticles.recent?.length && 
                     !stats?.tickets.recent?.length && 
                     !stats?.tracker.recent?.length && (
                      <p className="text-on-surface-variant text-center py-8 text-body-sm">
                        No recent activity
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
