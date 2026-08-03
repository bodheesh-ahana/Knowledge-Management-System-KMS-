'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import PacmanLoader from '@/components/PacmanLoader';

interface LearningApplication {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  color: string;
}

interface LearningModule {
  _id: string;
  name: string;
  description: string;
  order: number;
  lessons: LearningLesson[];
}

interface LearningLesson {
  _id: string;
  title: string;
  objective: string;
  estimatedDuration: number;
  order: number;
  status?: 'not_started' | 'in_progress' | 'completed';
}

export default function LearningApplicationDetail() {
  const params = useParams();
  const applicationId = params.id as string;
  
  const [application, setApplication] = useState<LearningApplication | null>(null);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadApplicationData();
  }, [applicationId]);

  const loadApplicationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch application details
      const appRes = await fetch(`/api/learning/applications`);
      if (!appRes.ok) throw new Error('Failed to fetch application');
      const appsData = await appRes.json();
      const app = appsData.data.find((a: any) => a._id === applicationId);
      if (!app) throw new Error('Application not found');
      setApplication(app);

      // Fetch modules
      const modulesRes = await fetch(`/api/learning/modules?applicationId=${applicationId}`);
      if (!modulesRes.ok) throw new Error('Failed to fetch modules');
      const modulesData = await modulesRes.json();
      
      // Fetch lessons for each module
      const modulesWithLessons = await Promise.all(
        modulesData.data.map(async (module: any) => {
          const lessonsRes = await fetch(`/api/learning/lessons?moduleId=${module._id}`);
          const lessonsData = lessonsRes.ok ? await lessonsRes.json() : { data: [] };
          
          // Fetch progress for each lesson
          const lessonsWithProgress = await Promise.all(
            lessonsData.data.map(async (lesson: any) => {
              const progressRes = await fetch(`/api/learning/progress?lessonId=${lesson._id}`);
              if (progressRes.ok) {
                const progressData = await progressRes.json();
                const progress = progressData.data[0];
                return {
                  ...lesson,
                  status: progress?.status || 'not_started',
                };
              }
              return { ...lesson, status: 'not_started' as const };
            })
          );
          
          return {
            ...module,
            lessons: lessonsWithProgress.sort((a: any, b: any) => a.order - b.order),
          };
        })
      );
      
      setModules(modulesWithLessons.sort((a, b) => a.order - b.order));
      
      // Expand first module by default
      if (modulesWithLessons.length > 0) {
        setExpandedModules(new Set([modulesWithLessons[0]._id]));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const getModuleProgress = (module: LearningModule) => {
    if (module.lessons.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = module.lessons.filter((l) => l.status === 'completed').length;
    return {
      completed,
      total: module.lessons.length,
      percentage: Math.round((completed / module.lessons.length) * 100),
    };
  };

  const getLessonStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <span className="material-symbols-outlined text-success text-xl">check_circle</span>;
      case 'in_progress':
        return <span className="material-symbols-outlined text-primary text-xl">radio_button_checked</span>;
      default:
        return <span className="material-symbols-outlined text-on-surface-variant text-xl">radio_button_unchecked</span>;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <PacmanLoader size={30} speedMultiplier={2} />
          <p className="text-body-sm text-on-surface-variant mt-4">Loading application...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !application) {
    return (
      <AppLayout>
        <div className="p-lg md:p-xl max-w-container-max mx-auto">
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg text-body-sm">
            {error || 'Application not found'}
          </div>
        </div>
      </AppLayout>
    );
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalCompleted = modules.reduce((sum, m) => sum + m.lessons.filter((l) => l.status === 'completed').length, 0);
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <AppLayout>
      <div className="p-lg md:p-xl max-w-container-max mx-auto">
        {/* Header */}
        <div className="mb-xl">
          <Link href="/learning" className="text-primary text-sm flex items-center gap-xs mb-md hover:underline">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Learning Center
          </Link>
          
          <div className="flex items-start gap-lg">
            {application.icon && (
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: application.color }}
              >
                <span className="material-symbols-outlined text-3xl">{application.icon}</span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="font-display-lg text-display-lg text-on-surface dark:text-on-secondary mb-sm">
                {application.name}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-md">
                {application.description}
              </p>
              
              {/* Overall Progress */}
              <div className="max-w-md">
                <div className="flex justify-between text-sm mb-xs">
                  <span className="text-on-surface-variant">
                    {totalCompleted} of {totalLessons} lessons completed
                  </span>
                  <span className="font-medium text-on-surface">{overallProgress}%</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules */}
        {modules.length === 0 ? (
          <div className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-xl text-center">
            <p className="text-body-md text-on-surface-variant">
              No modules available for this application yet.
            </p>
          </div>
        ) : (
          <div className="space-y-md">
            {modules.map((module) => {
              const progress = getModuleProgress(module);
              const isExpanded = expandedModules.has(module._id);
              
              return (
                <div
                  key={module._id}
                  className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl overflow-hidden"
                >
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(module._id)}
                    className="w-full p-lg flex items-center justify-between hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
                  >
                    <div className="flex items-center gap-md flex-1">
                      <span className="material-symbols-outlined text-on-surface-variant">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-title-md text-title-md text-on-surface dark:text-on-secondary">
                          {module.name}
                        </h3>
                        <p className="text-sm text-on-surface-variant mt-xs">
                          {module.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-md">
                      {progress.total > 0 && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-on-surface">
                            {progress.percentage}%
                          </div>
                          <div className="text-xs text-on-surface-variant">
                            {progress.completed}/{progress.total}
                          </div>
                        </div>
                      )}
                      <span className="text-xs text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-full">
                        {module.lessons.length} lessons
                      </span>
                    </div>
                  </button>

                  {/* Lessons */}
                  {isExpanded && (
                    <div className="border-t border-outline-variant/40 divide-y divide-outline-variant/40">
                      {module.lessons.length === 0 ? (
                        <div className="p-lg text-center text-on-surface-variant text-sm">
                          No lessons in this module yet.
                        </div>
                      ) : (
                        module.lessons.map((lesson) => (
                          <Link
                            key={lesson._id}
                            href={`/learning/${applicationId}/lesson/${lesson._id}`}
                            className="p-lg flex items-center gap-md hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
                          >
                            {getLessonStatusIcon(lesson.status)}
                            <div className="flex-1">
                              <h4 className="font-body-md text-body-md text-on-surface dark:text-on-secondary">
                                {lesson.title}
                              </h4>
                              <p className="text-sm text-on-surface-variant mt-xs line-clamp-1">
                                {lesson.objective}
                              </p>
                            </div>
                            <div className="flex items-center gap-md text-sm text-on-surface-variant">
                              <span className="flex items-center gap-xs">
                                <span className="material-symbols-outlined text-lg">schedule</span>
                                {lesson.estimatedDuration}m
                              </span>
                              <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
