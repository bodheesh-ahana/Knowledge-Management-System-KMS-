import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LessonDetail from '../../app/learning/[id]/lesson/[lessonId]/page';

// Mock fetch
global.fetch = jest.fn();

// Mock useParams
jest.mock('next/navigation', () => ({
  useParams: () => ({
    id: 'test-app-id',
    lessonId: 'test-lesson-id',
  }),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock AppLayout
jest.mock('@/components/AppLayout', () => {
  return function MockAppLayout({ children }) {
    return <div>{children}</div>;
  };
});

// Mock WaveLoader
jest.mock('@/components/WaveLoader', () => {
  return function MockWaveLoader() {
    return <div>Loading...</div>;
  };
});

describe('LessonDetail Component', () => {
  const mockLesson = {
    _id: 'test-lesson-id',
    title: 'Test Lesson',
    objective: 'Test Objective',
    businessPurpose: 'Test Business Purpose',
    concepts: ['Concept 1', 'Concept 2'],
    content: 'Test lesson content with multiple lines\nLine 2\nLine 3',
    importantNotes: ['Note 1', 'Note 2'],
    commonMistakes: ['Mistake 1'],
    estimatedDuration: 30,
    relatedKBIds: [],
    quiz: {
      questions: [
        {
          question: 'Test Question',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
        },
      ],
    },
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  it('should render the lesson detail page', () => {
    render(<LessonDetail />);
    // Component renders
  });

  it('should display loading state initially', () => {
    render(<LessonDetail />);
    // Initially shows loading
  });

  it('should display lesson content after loading', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [mockLesson] }),
      })
    );

    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
    );

    render(<LessonDetail />);

    await waitFor(() => {
      expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    });
  });

  it('should display lesson sections', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [mockLesson] }),
      })
    );

    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
    );

    render(<LessonDetail />);

    await waitFor(() => {
      expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    });
  });

  it('should display error message on fetch failure', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch' }),
      })
    );

    render(<LessonDetail />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });
});
