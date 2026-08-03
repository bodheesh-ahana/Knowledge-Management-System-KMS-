'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import PacmanLoader from '@/components/PacmanLoader';

interface LearningLesson {
  _id: string;
  title: string;
  objective: string;
  businessPurpose: string;
  concepts: string[];
  content: string;
  importantNotes: string[];
  commonMistakes: string[];
  relatedKBIds: Array<{
    _id: string;
    title: string;
    status: string;
  }>;
  practicalExercise?: {
    title: string;
    instructions: string[];
    requiresScreenshot: boolean;
  };
  quiz?: {
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
  };
  estimatedDuration: number;
}

interface LearningProgress {
  status: 'not_started' | 'in_progress' | 'completed';
  quizScore?: number;
  exerciseSubmitted?: boolean;
  exerciseScreenshot?: string;
  notes?: string;
  timeSpent: number;
}

export default function LessonDetail() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const lessonId = params.lessonId as string;
  
  const [lesson, setLesson] = useState<LearningLesson | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<boolean[]>([]);
  
  // Exercise state
  const [showExercise, setShowExercise] = useState(false);
  const [exerciseNotes, setExerciseNotes] = useState('');
  const [exerciseSubmitted, setExerciseSubmitted] = useState(false);
  
  // Notes state
  const [userNotes, setUserNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  
  // Timer
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Section completion state
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['content']));
  
  // Reading progress
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    loadLessonData();
    startTimer();
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [applicationId, lessonId]);

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 60000); // Update every minute
    setTimerInterval(interval);
  };

  const loadLessonData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch lesson details
      const lessonRes = await fetch(`/api/learning/lessons?lessonId=${lessonId}`);
      if (!lessonRes.ok) throw new Error('Failed to fetch lesson');
      const lessonData = await lessonRes.json();
      if (lessonData.data.length === 0) throw new Error('Lesson not found');
      setLesson(lessonData.data[0]);

      // Fetch progress
      const progressRes = await fetch(`/api/learning/progress?lessonId=${lessonId}`);
      let progressData = null;
      if (progressRes.ok) {
        progressData = await progressRes.json();
        if (progressData.data.length > 0) {
          setProgress(progressData.data[0]);
          setUserNotes(progressData.data[0].notes || '');
          setExerciseSubmitted(progressData.data[0].exerciseSubmitted || false);
          if (progressData.data[0].quizScore !== undefined) {
            setQuizScore(progressData.data[0].quizScore);
            setQuizSubmitted(true);
          }
        }
      }

      // Mark as in progress if not started
      if (progressRes.ok && progressData && progressData.data.length === 0) {
        await updateProgress('in_progress');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (status: 'not_started' | 'in_progress' | 'completed', additionalData?: any) => {
    try {
      const response = await fetch('/api/learning/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          moduleId: lesson?.moduleId || '',
          lessonId,
          status,
          timeSpent,
          ...additionalData,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setProgress(data.data);
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleQuizSubmit = () => {
    if (!lesson?.quiz) return;
    
    let correct = 0;
    const feedback: boolean[] = [];
    lesson.quiz.questions.forEach((q, index) => {
      const isCorrect = quizAnswers[index] === q.correctAnswer;
      feedback.push(isCorrect);
      if (isCorrect) correct++;
    });
    
    const score = Math.round((correct / lesson.quiz.questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    setQuizFeedback(feedback);
    
    updateProgress(progress?.status === 'completed' ? 'completed' : 'in_progress', { quizScore: score });
  };

  const handleExerciseSubmit = async () => {
    setExerciseSubmitted(true);
    await updateProgress(progress?.status === 'completed' ? 'completed' : 'in_progress', {
      exerciseSubmitted: true,
      exerciseScreenshot: '', // Would handle file upload in real implementation
    });
  };

  const handleNotesSave = async () => {
    setSavingNotes(true);
    await updateProgress(progress?.status || 'in_progress', { notes: userNotes });
    setSavingNotes(false);
  };

  const handleMarkComplete = async () => {
    // Require quiz completion with minimum 80% score
    if (lesson?.quiz && (!quizSubmitted || (quizScore && quizScore < 80))) {
      alert('You must complete the quiz with at least 80% score to mark this lesson as complete.');
      if (!showQuiz) setShowQuiz(true);
      return;
    }
    
    // Require exercise completion if present
    if (lesson?.practicalExercise && !exerciseSubmitted) {
      alert('You must complete the practical exercise to mark this lesson as complete.');
      if (!showExercise) setShowExercise(true);
      return;
    }
    
    await updateProgress('completed');
    router.push(`/learning/${applicationId}`);
  };
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };
  
  const markSectionComplete = (sectionId: string) => {
    setCompletedSections(prev => new Set([...prev, sectionId]));
  };
  
  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
    setReadingProgress(Math.min(progress, 100));
  };
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <PacmanLoader size={30} speedMultiplier={2} />
          <p className="text-body-sm text-on-surface-variant mt-4">Loading lesson...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !lesson) {
    return (
      <AppLayout>
        <div className="p-lg md:p-xl max-w-container-max mx-auto">
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg text-body-sm">
            {error || 'Lesson not found'}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-surface-container">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>
      
      <div className="p-lg md:p-xl max-w-container-max mx-auto pt-6">
        {/* Header */}
        <div className="mb-xl">
          <Link href={`/learning/${applicationId}`} className="text-primary text-sm flex items-center gap-xs mb-md hover:underline">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to {lesson.title.split(' ')[0]}
          </Link>
          
          <div className="flex items-start justify-between gap-lg">
            <div className="flex-1">
              <h1 className="font-display-lg text-display-lg text-on-surface dark:text-on-secondary mb-sm">
                {lesson.title}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-md">
                {lesson.objective}
              </p>
              
              <div className="flex items-center gap-md text-sm text-on-surface-variant flex-wrap">
                <span className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-lg">schedule</span>
                  {lesson.estimatedDuration} min
                </span>
                <span className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-lg">timer</span>
                  Time spent: {formatTime(timeSpent)}
                </span>
                <span className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-lg">auto_stories</span>
                  {Math.round(readingProgress)}% read
                </span>
                {progress?.status === 'completed' && (
                  <span className="px-2 py-1 bg-success-container text-on-success-container text-xs rounded-full">
                    Completed
                  </span>
                )}
              </div>
            </div>
            
            {progress?.status !== 'completed' && (
              <button
                onClick={handleMarkComplete}
                className="px-lg py-md bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors flex items-center gap-xs"
              >
                <span className="material-symbols-outlined">check</span>
                Mark Complete
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-xl">
            {/* Business Purpose */}
            {lesson.businessPurpose && (
              <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('business')}
                  className="w-full px-lg py-md flex items-center justify-between hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
                >
                  <h2 className="font-title-md text-title-md text-on-surface dark:text-on-secondary flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">business</span>
                    Business Purpose
                  </h2>
                  <div className="flex items-center gap-sm">
                    {completedSections.has('business') && (
                      <span className="material-symbols-outlined text-success text-lg">check_circle</span>
                    )}
                    <span className="material-symbols-outlined text-on-surface-variant">
                      {expandedSections.has('business') ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </button>
                {expandedSections.has('business') && (
                  <div className="px-lg pb-lg border-t border-outline-variant dark:border-outline">
                    <div className="pt-md">
                      <p className="font-body-md text-body-md text-on-surface-variant mb-md">
                        {lesson.businessPurpose}
                      </p>
                      <button
                        onClick={() => markSectionComplete('business')}
                        className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                          completedSections.has('business')
                            ? 'bg-success-container text-on-success-container'
                            : 'bg-primary-container text-on-primary-container hover:bg-primary'
                        }`}
                      >
                        {completedSections.has('business') ? 'Completed' : 'Mark as Read'}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Concepts */}
            {lesson.concepts.length > 0 && (
              <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('concepts')}
                  className="w-full px-lg py-md flex items-center justify-between hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
                >
                  <h2 className="font-title-md text-title-md text-on-surface dark:text-on-secondary flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">lightbulb</span>
                    Key Concepts ({lesson.concepts.length})
                  </h2>
                  <div className="flex items-center gap-sm">
                    {completedSections.has('concepts') && (
                      <span className="material-symbols-outlined text-success text-lg">check_circle</span>
                    )}
                    <span className="material-symbols-outlined text-on-surface-variant">
                      {expandedSections.has('concepts') ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </button>
                {expandedSections.has('concepts') && (
                  <div className="px-lg pb-lg border-t border-outline-variant dark:border-outline">
                    <div className="pt-md space-y-sm">
                      {lesson.concepts.map((concept, index) => (
                        <div key={index} className="flex items-start gap-sm p-sm rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors">
                          <span className="material-symbols-outlined text-primary text-lg mt-xs">check_circle</span>
                          <span className="font-body-md text-body-md text-on-surface-variant">{concept}</span>
                        </div>
                      ))}
                      <button
                        onClick={() => markSectionComplete('concepts')}
                        className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                          completedSections.has('concepts')
                            ? 'bg-success-container text-on-success-container'
                            : 'bg-primary-container text-on-primary-container hover:bg-primary'
                        }`}
                      >
                        {completedSections.has('concepts') ? 'Completed' : 'Mark as Read'}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Content */}
            <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('content')}
                className="w-full px-lg py-md flex items-center justify-between hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
              >
                <h2 className="font-title-md text-title-md text-on-surface dark:text-on-secondary flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">menu_book</span>
                  Lesson Content
                </h2>
                <div className="flex items-center gap-sm">
                  {completedSections.has('content') && (
                    <span className="material-symbols-outlined text-success text-lg">check_circle</span>
                  )}
                  <span className="material-symbols-outlined text-on-surface-variant">
                    {expandedSections.has('content') ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
              </button>
              {expandedSections.has('content') && (
                <div className="px-lg pb-lg border-t border-outline-variant dark:border-outline">
                  <div className="pt-md">
                    <div className="font-body-md text-body-md text-on-surface-variant space-y-md prose dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap font-body-md text-body-md text-on-surface-variant leading-relaxed">
                        {lesson.content}
                      </pre>
                    </div>
                    <button
                      onClick={() => markSectionComplete('content')}
                      className={`mt-md text-sm px-3 py-1 rounded-lg transition-colors ${
                        completedSections.has('content')
                          ? 'bg-success-container text-on-success-container'
                          : 'bg-primary-container text-on-primary-container hover:bg-primary'
                      }`}
                    >
                      {completedSections.has('content') ? 'Completed' : 'Mark as Read'}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Important Notes */}
            {lesson.importantNotes.length > 0 && (
              <section className="bg-tertiary-container dark:bg-tertiary-container border border-tertiary dark:border-tertiary rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('notes')}
                  className="w-full px-lg py-md flex items-center justify-between hover:bg-tertiary-container-high dark:hover:bg-tertiary-container-highest transition-colors"
                >
                  <h2 className="font-title-md text-title-md text-on-tertiary-container dark:text-on-tertiary-container flex items-center gap-sm">
                    <span className="material-symbols-outlined">priority_high</span>
                    Important Notes ({lesson.importantNotes.length})
                  </h2>
                  <div className="flex items-center gap-sm">
                    {completedSections.has('notes') && (
                      <span className="material-symbols-outlined text-success text-lg">check_circle</span>
                    )}
                    <span className="material-symbols-outlined text-on-tertiary-container dark:text-on-tertiary-container">
                      {expandedSections.has('notes') ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </button>
                {expandedSections.has('notes') && (
                  <div className="px-lg pb-lg border-t border-tertiary dark:border-tertiary">
                    <div className="pt-md space-y-sm">
                      {lesson.importantNotes.map((note, index) => (
                        <div key={index} className="flex items-start gap-sm">
                          <span className="material-symbols-outlined text-lg mt-xs">arrow_right</span>
                          <span className="font-body-md text-body-md text-on-tertiary-container dark:text-on-tertiary-container">
                            {note}
                          </span>
                        </div>
                      ))}
                      <button
                        onClick={() => markSectionComplete('notes')}
                        className={`mt-md text-sm px-3 py-1 rounded-lg transition-colors ${
                          completedSections.has('notes')
                            ? 'bg-success-container text-on-success-container'
                            : 'bg-primary-container text-on-primary-container hover:bg-primary'
                        }`}
                      >
                        {completedSections.has('notes') ? 'Completed' : 'Mark as Read'}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Common Mistakes */}
            {lesson.commonMistakes.length > 0 && (
              <section className="bg-error-container dark:bg-error-container border border-error dark:border-error rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('mistakes')}
                  className="w-full px-lg py-md flex items-center justify-between hover:bg-error-container-high dark:hover:bg-error-container-highest transition-colors"
                >
                  <h2 className="font-title-md text-title-md text-on-error-container dark:text-on-error-container flex items-center gap-sm">
                    <span className="material-symbols-outlined">warning</span>
                    Common Mistakes ({lesson.commonMistakes.length})
                  </h2>
                  <div className="flex items-center gap-sm">
                    {completedSections.has('mistakes') && (
                      <span className="material-symbols-outlined text-success text-lg">check_circle</span>
                    )}
                    <span className="material-symbols-outlined text-on-error-container dark:text-on-error-container">
                      {expandedSections.has('mistakes') ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </button>
                {expandedSections.has('mistakes') && (
                  <div className="px-lg pb-lg border-t border-error dark:border-error">
                    <div className="pt-md space-y-sm">
                      {lesson.commonMistakes.map((mistake, index) => (
                        <div key={index} className="flex items-start gap-sm">
                          <span className="material-symbols-outlined text-lg mt-xs">close</span>
                          <span className="font-body-md text-body-md text-on-error-container dark:text-on-error-container">
                            {mistake}
                          </span>
                        </div>
                      ))}
                      <button
                        onClick={() => markSectionComplete('mistakes')}
                        className={`mt-md text-sm px-3 py-1 rounded-lg transition-colors ${
                          completedSections.has('mistakes')
                            ? 'bg-success-container text-on-success-container'
                            : 'bg-primary-container text-on-primary-container hover:bg-primary'
                        }`}
                      >
                        {completedSections.has('mistakes') ? 'Completed' : 'Mark as Read'}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Related Knowledge Articles */}
            {lesson.relatedKBIds.length > 0 && (
              <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
                <h2 className="font-title-md text-title-md text-on-surface dark:text-on-secondary mb-md flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">article</span>
                  Related Knowledge Articles
                </h2>
                <div className="space-y-sm">
                  {lesson.relatedKBIds.map((kb) => (
                    <Link
                      key={kb._id}
                      href={`/knowledge/${kb._id}`}
                      className="block p-md bg-surface-container-low dark:bg-surface-container-high rounded-lg hover:border-primary border border-transparent transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-body-md text-body-md text-on-surface dark:text-on-secondary">
                          {kb.title}
                        </span>
                        <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
                      </div>
                      <div className="mt-xs">
                        <span className="text-xs px-2 py-1 bg-surface-container-highest rounded-full">
                          {kb.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-xl">
            {/* Personal Notes */}
            <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
              <h2 className="font-title-md text-title-md text-on-surface dark:text-on-secondary mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                Your Notes
              </h2>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Add your personal notes here..."
                className="w-full h-32 p-md bg-surface-container-low dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg text-on-surface dark:text-on-secondary placeholder-outline resize-none"
              />
              <button
                onClick={handleNotesSave}
                disabled={savingNotes}
                className="mt-sm w-full py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </section>

            {/* Practical Exercise */}
            {lesson.practicalExercise && (
              <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
                <h2 className="font-title-md text-title-md text-on-surface dark:text-on-secondary mb-md flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">assignment</span>
                  Practical Exercise
                </h2>
                
                {!showExercise ? (
                  <button
                    onClick={() => setShowExercise(true)}
                    className="w-full py-sm bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-lg hover:bg-secondary-container-high transition-colors"
                  >
                    Start Exercise
                  </button>
                ) : (
                  <div className="space-y-md">
                    <h3 className="font-body-md text-body-md font-medium text-on-surface">
                      {lesson.practicalExercise.title}
                    </h3>
                    <ol className="space-y-sm">
                      {lesson.practicalExercise.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start gap-sm">
                          <span className="font-medium text-primary">{index + 1}.</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            {instruction}
                          </span>
                        </li>
                      ))}
                    </ol>
                    
                    {lesson.practicalExercise.requiresScreenshot && (
                      <div className="p-md bg-surface-container-low dark:bg-surface-container-high rounded-lg">
                        <p className="text-sm text-on-surface-variant flex items-center gap-xs">
                          <span className="material-symbols-outlined text-lg">screenshot</span>
                          Please take a screenshot of your work
                        </p>
                      </div>
                    )}
                    
                    <textarea
                      value={exerciseNotes}
                      onChange={(e) => setExerciseNotes(e.target.value)}
                      placeholder="Add any notes about your exercise..."
                      className="w-full h-20 p-md bg-surface-container-low dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg text-on-surface dark:text-on-secondary placeholder-outline resize-none text-sm"
                    />
                    
                    {!exerciseSubmitted ? (
                      <button
                        onClick={handleExerciseSubmit}
                        className="w-full py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors"
                      >
                        Submit Exercise
                      </button>
                    ) : (
                      <div className="p-md bg-success-container text-on-success-container rounded-lg text-sm flex items-center gap-xs">
                        <span className="material-symbols-outlined">check_circle</span>
                        Exercise submitted
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Quiz */}
            {lesson.quiz && (
              <section className="bg-surface dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl p-lg">
                <h2 className="font-title-md text-title-md text-on-surface dark:text-on-secondary mb-md flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">quiz</span>
                  Quiz
                </h2>
                
                {!showQuiz ? (
                  <button
                    onClick={() => setShowQuiz(true)}
                    className="w-full py-sm bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-lg hover:bg-secondary-container-high transition-colors"
                  >
                    Start Quiz ({lesson.quiz.questions.length} questions)
                  </button>
                ) : (
                  <div className="space-y-md">
                    {lesson.quiz.questions.map((question, qIndex) => (
                      <div key={qIndex} className="space-y-sm">
                        <p className="font-body-md text-body-md text-on-surface">
                          {qIndex + 1}. {question.question}
                        </p>
                        <div className="space-y-xs">
                          {question.options.map((option, oIndex) => (
                            <label
                              key={oIndex}
                              className={`flex items-center gap-sm p-sm rounded-lg border cursor-pointer transition-colors ${
                                quizSubmitted
                                  ? quizFeedback[qIndex]
                                    ? oIndex === question.correctAnswer
                                      ? 'border-success bg-success-container'
                                      : 'border-outline-variant dark:border-outline opacity-50'
                                    : oIndex === quizAnswers[qIndex]
                                      ? 'border-error bg-error-container'
                                      : 'border-outline-variant dark:border-outline opacity-50'
                                  : quizAnswers[qIndex] === oIndex
                                    ? 'border-primary bg-primary-container'
                                    : 'border-outline-variant dark:border-outline hover:border-outline'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${qIndex}`}
                                value={oIndex}
                                checked={quizAnswers[qIndex] === oIndex}
                                onChange={() => {
                                  const newAnswers = [...quizAnswers];
                                  newAnswers[qIndex] = oIndex;
                                  setQuizAnswers(newAnswers);
                                }}
                                disabled={quizSubmitted}
                              />
                              <span className="font-body-sm text-body-sm text-on-surface-variant">
                                {option}
                              </span>
                              {quizSubmitted && oIndex === question.correctAnswer && (
                                <span className="material-symbols-outlined text-success ml-auto">check_circle</span>
                              )}
                              {quizSubmitted && quizAnswers[qIndex] === oIndex && !quizFeedback[qIndex] && (
                                <span className="material-symbols-outlined text-error ml-auto">cancel</span>
                              )}
                            </label>
                          ))}
                        </div>
                        {quizSubmitted && !quizFeedback[qIndex] && (
                          <p className="text-sm text-error flex items-center gap-xs">
                            <span className="material-symbols-outlined text-lg">info</span>
                            Correct answer: {question.options[question.correctAnswer]}
                          </p>
                        )}
                      </div>
                    ))}
                    
                    {!quizSubmitted ? (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={quizAnswers.length !== lesson.quiz.questions.length}
                        className="w-full py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50"
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <div className={`p-md rounded-lg ${
                        quizScore && quizScore >= 80
                          ? 'bg-success-container text-on-success-container'
                          : 'bg-error-container text-on-error-container'
                      }`}>
                        <div className="flex items-center justify-between mb-sm">
                          <span className="flex items-center gap-xs">
                            <span className="material-symbols-outlined">
                              {quizScore && quizScore >= 80 ? 'check_circle' : 'error'}
                            </span>
                            Quiz completed
                          </span>
                          <span className="font-medium">{quizScore}%</span>
                        </div>
                        {quizScore && quizScore < 80 && (
                          <p className="text-sm mt-sm">
                            You need at least 80% to complete this lesson. Please review the content and try again.
                          </p>
                        )}
                        {quizScore && quizScore >= 80 && (
                          <p className="text-sm mt-sm">
                            Great job! You've passed the quiz.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
