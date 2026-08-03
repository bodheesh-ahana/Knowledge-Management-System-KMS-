require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define schemas inline
const LearningApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: String,
  color: { type: String, default: '#3b82f6' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const LearningModuleSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningApplication', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const LearningLessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningModule', required: true },
  title: { type: String, required: true },
  objective: { type: String, required: true },
  businessPurpose: String,
  concepts: [String],
  content: { type: String, required: true },
  importantNotes: [String],
  commonMistakes: [String],
  relatedKBIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeArticle' }],
  practicalExercise: {
    title: String,
    instructions: [String],
    requiresScreenshot: { type: Boolean, default: false },
  },
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
    }],
  },
  order: { type: Number, default: 0 },
  estimatedDuration: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Create models
const LearningApplication = mongoose.model('LearningApplication', LearningApplicationSchema);
const LearningModule = mongoose.model('LearningModule', LearningModuleSchema);
const LearningLesson = mongoose.model('LearningLesson', LearningLessonSchema);

async function verifyAndFixQuizzes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const academy = await LearningApplication.findOne({ name: 'Application Support Academy' });
    if (!academy) {
      console.log('Application Support Academy not found');
      await mongoose.disconnect();
      return;
    }

    console.log('\n=== Verifying Academy Lessons ===\n');
    const modules = await LearningModule.find({ applicationId: academy._id });
    
    let totalLessons = 0;
    let lessonsWithQuizzes = 0;
    let lessonsWithoutQuizzes = 0;

    for (const module of modules) {
      const lessons = await LearningLesson.find({ moduleId: module._id });
      console.log(`\nModule: ${module.name}`);
      console.log(`  Total lessons: ${lessons.length}`);
      
      for (const lesson of lessons) {
        totalLessons++;
        const hasQuiz = lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0;
        
        if (hasQuiz) {
          lessonsWithQuizzes++;
          console.log(`  ✓ ${lesson.title} - ${lesson.quiz.questions.length} questions`);
        } else {
          lessonsWithoutQuizzes++;
          console.log(`  ✗ ${lesson.title} - NO QUIZ`);
        }
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total lessons: ${totalLessons}`);
    console.log(`With quizzes: ${lessonsWithQuizzes}`);
    console.log(`Without quizzes: ${lessonsWithoutQuizzes}`);

    if (lessonsWithoutQuizzes > 0) {
      console.log('\n⚠️  Some lessons are missing quizzes!');
    } else {
      console.log('\n✅ All lessons have quizzes!');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

verifyAndFixQuizzes();
