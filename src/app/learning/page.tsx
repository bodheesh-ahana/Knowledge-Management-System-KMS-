'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import PacmanLoader from '@/components/PacmanLoader';

interface LearningApplication {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  color: string;
  order: number;
}

interface ProgressSummary {
  applicationId: string;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
}

export default function LearningCenter() {
  const [applications, setApplications] = useState<LearningApplication[]>([]);
  const [progressSummaries, setProgressSummaries] = useState<Map<string, ProgressSummary>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch applications
      const appsRes = await fetch('/api/learning/applications');
      if (!appsRes.ok) throw new Error('Failed to fetch applications');
      const appsData = await appsRes.json();
      setApplications(appsData.data);

      // Fetch progress for each application
      const progressMap = new Map<string, ProgressSummary>();
      for (const app of appsData.data) {
        const progressRes = await fetch(`/api/learning/progress?applicationId=${app._id}`);
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          const totalLessons = await getTotalLessonsForApplication(app._id);
          const completedLessons = progressData.data.filter((p: any) => p.status === 'completed').length;
          const inProgressLessons = progressData.data.filter((p: any) => p.status === 'in_progress').length;
          
          progressMap.set(app._id, {
            applicationId: app._id,
            totalLessons,
            completedLessons,
            inProgressLessons,
          });
        }
      }
      setProgressSummaries(progressMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load learning center');
    } finally {
      setLoading(false);
    }
  };

  const getTotalLessonsForApplication = async (applicationId: string): Promise<number> => {
    try {
      const modulesRes = await fetch(`/api/learning/modules?applicationId=${applicationId}`);
      if (!modulesRes.ok) return 0;
      const modulesData = await modulesRes.json();
      
      let totalLessons = 0;
      for (const module of modulesData.data) {
        const lessonsRes = await fetch(`/api/learning/lessons?moduleId=${module._id}`);
        if (lessonsRes.ok) {
          const lessonsData = await lessonsRes.json();
          totalLessons += lessonsData.data.length;
        }
      }
      return totalLessons;
    } catch {
      return 0;
    }
  };

  const getProgressPercentage = (applicationId: string): number => {
    const summary = progressSummaries.get(applicationId);
    if (!summary || summary.totalLessons === 0) return 0;
    return Math.round((summary.completedLessons / summary.totalLessons) * 100);
  };

  const getStatusBadge = (applicationId: string) => {
    const summary = progressSummaries.get(applicationId);
    if (!summary) return null;
    
    if (summary.completedLessons === summary.totalLessons && summary.totalLessons > 0) {
      return <span className="px-2 py-1 bg-success-container text-on-success-container text-xs rounded-full">Completed</span>;
    }
    if (summary.inProgressLessons > 0) {
      return <span className="px-2 py-1 bg-primary-container text-on-primary-container text-xs rounded-full">In Progress</span>;
    }
    return <span className="px-2 py-1 bg-surface-container-highest text-on-surface-variant text-xs rounded-full">Not Started</span>;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <PacmanLoader size={30} speedMultiplier={2} />
          <p className="text-body-sm text-on-surface-variant mt-4">Loading learning center...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-lg md:p-xl max-w-container-max mx-auto">
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg text-body-sm">
            {error}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-container-max mx-auto">
        {/* Header */}
        <div className="mb-xl">
          <h1 className="font-display-lg text-display-lg text-on-surface dark:text-on-secondary mb-sm">
            Learning Center
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Master application support through structured training programs
          </p>
        </div>

        {/* Applications Grid */}
        {applications.length === 0 ? (
          <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-xl text-center">
            <p className="text-body-md text-on-surface-variant">
              No learning programs available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {applications.map((app) => {
              const progressPercent = getProgressPercentage(app._id);
              const summary = progressSummaries.get(app._id);
              
              return (
                <Link
                  key={app._id}
                  href={`/learning/${app._id}`}
                  className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg flex flex-col gap-md hover:border-primary transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-md">
                      {app.icon && (
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: app.color }}
                        >
                          <span className="material-symbols-outlined text-2xl">{app.icon}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-title-md text-title-md text-on-surface dark:text-on-secondary group-hover:text-primary transition-colors">
                          {app.name}
                        </h3>
                        {getStatusBadge(app._id)}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    {app.description}
                  </p>

                  {/* Progress Bar */}
                  {summary && summary.totalLessons > 0 && (
                    <div className="space-y-xs">
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">
                          {summary.completedLessons} of {summary.totalLessons} lessons
                        </span>
                        <span className="font-medium text-on-surface">{progressPercent}%</span>
                      </div>
                      <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-sm border-t border-outline-variant/40">
                    <span className="text-xs text-on-surface-variant">
                      {summary?.totalLessons || 0} lessons
                    </span>
                    <span className="text-primary text-sm font-medium flex items-center gap-xs">
                      Start Learning
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
