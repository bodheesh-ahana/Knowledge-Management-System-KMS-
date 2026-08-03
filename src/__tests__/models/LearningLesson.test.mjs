import '../setup/mongodb';
import LearningLesson from '../../models/LearningLesson';
import LearningModule from '../../models/LearningModule';
import LearningApplication from '../../models/LearningApplication';

describe('LearningLesson Model', () => {
  let application;
  let module;

  beforeEach(async () => {
    application = await LearningApplication.create({
      name: 'Test Application',
      description: 'Test Description',
      icon: 'school',
      color: '#000000',
      order: 1,
      isActive: true,
    });

    module = await LearningModule.create({
      applicationId: application._id,
      name: 'Test Module',
      description: 'Test Module Description',
      order: 1,
      isActive: true,
    });
  });

  it('should create a valid lesson', async () => {
    const validLesson = {
      moduleId: module._id,
      title: 'Test Lesson',
      objective: 'Test Objective',
      content: 'Test Content',
      estimatedDuration: 30,
      order: 1,
      isActive: true,
    };

    const lesson = await LearningLesson.create(validLesson);

    expect(lesson.title).toBe(validLesson.title);
    expect(lesson.objective).toBe(validLesson.objective);
    expect(lesson.content).toBe(validLesson.content);
    expect(lesson.estimatedDuration).toBe(validLesson.estimatedDuration);
  });

  it('should fail without required fields', async () => {
    const invalidLesson = {
      moduleId: module._id,
      title: 'Test Lesson',
    };

    await expect(LearningLesson.create(invalidLesson)).rejects.toThrow();
  });

  it('should create lesson with quiz', async () => {
    const lessonWithQuiz = {
      moduleId: module._id,
      title: 'Test Lesson with Quiz',
      objective: 'Test Objective',
      content: 'Test Content',
      estimatedDuration: 30,
      order: 1,
      isActive: true,
      quiz: {
        questions: [
          {
            question: 'Test Question',
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            correctAnswer: 0,
          },
        ],
      },
    };

    const lesson = await LearningLesson.create(lessonWithQuiz);

    expect(lesson.quiz.questions).toHaveLength(1);
    expect(lesson.quiz.questions[0].question).toBe('Test Question');
  });

  it('should create lesson with concepts array', async () => {
    const lessonWithConcepts = {
      moduleId: module._id,
      title: 'Test Lesson',
      objective: 'Test Objective',
      content: 'Test Content',
      concepts: ['Concept 1', 'Concept 2', 'Concept 3'],
      estimatedDuration: 30,
      order: 1,
      isActive: true,
    };

    const lesson = await LearningLesson.create(lessonWithConcepts);

    expect(lesson.concepts).toHaveLength(3);
    expect(lesson.concepts[0]).toBe('Concept 1');
  });

  it('should create lesson with important notes', async () => {
    const lessonWithNotes = {
      moduleId: module._id,
      title: 'Test Lesson',
      objective: 'Test Objective',
      content: 'Test Content',
      importantNotes: ['Note 1', 'Note 2'],
      commonMistakes: ['Mistake 1'],
      estimatedDuration: 30,
      order: 1,
      isActive: true,
    };

    const lesson = await LearningLesson.create(lessonWithNotes);

    expect(lesson.importantNotes).toHaveLength(2);
    expect(lesson.commonMistakes).toHaveLength(1);
  });

  it('should have default values', async () => {
    const lesson = await LearningLesson.create({
      moduleId: module._id,
      title: 'Test Lesson',
      objective: 'Test Objective',
      content: 'Test Content',
    });

    expect(lesson.order).toBe(0);
    expect(lesson.estimatedDuration).toBe(30);
    expect(lesson.isActive).toBe(true);
    expect(lesson.concepts).toEqual([]);
    expect(lesson.importantNotes).toEqual([]);
    expect(lesson.commonMistakes).toEqual([]);
  });
});
