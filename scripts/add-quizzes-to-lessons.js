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

// Generic quiz templates
const quizTemplates = {
  introduction: [
    {
      question: 'What is the primary purpose of this application?',
      options: [
        'It has no purpose',
        'Tax preparation and accounting',
        'Social media',
        'Video editing'
      ],
      correctAnswer: 1
    },
    {
      question: 'Which module is typically used for basic setup?',
      options: [
        'Advanced reporting',
        'Company setup and configuration',
        'Payroll only',
        'None of the above'
      ],
      correctAnswer: 1
    },
    {
      question: 'What is the first step when using this application?',
      options: [
        'Create a company file',
        'Delete all data',
        'Skip setup',
        'Contact support'
      ],
      correctAnswer: 0
    },
    {
      question: 'Why is proper setup important?',
      options: [
        'It is not important',
        'Ensures accurate data and reporting',
        'Only for compliance',
        'Management requires it'
      ],
      correctAnswer: 1
    },
    {
      question: 'What should you do before entering transactions?',
      options: [
        'Nothing',
        'Complete company setup and configuration',
        'Delete the company file',
        'Call support'
      ],
      correctAnswer: 1
    }
  ],
  fundamentals: [
    {
      question: 'What is the purpose of the company file?',
      options: [
        'No purpose',
        'Stores all company data and transactions',
        'Only for backup',
        'Decoration'
      ],
      correctAnswer: 1
    },
    {
      question: 'How often should you backup data?',
      options: [
        'Never',
        'Daily or before major changes',
        'Once a year',
        'Only when errors occur'
      ],
      correctAnswer: 1
    },
    {
      question: 'What is the correct way to close the application?',
      options: [
        'Force close with task manager',
        'Use proper exit/quit function',
        'Unplug computer',
        'Leave it running'
      ],
      correctAnswer: 1
    },
    {
      question: 'Why is data verification important?',
      options: [
        'It is not important',
        'Ensures data integrity and prevents corruption',
        'Only for compliance',
        'Wastes time'
      ],
      correctAnswer: 1
    },
    {
      question: 'What should you do if an error occurs?',
      options: [
        'Ignore it',
        'Document the error and follow troubleshooting steps',
        'Delete the company file',
        'Reinstall immediately'
      ],
      correctAnswer: 1
    }
  ],
  reporting: [
    {
      question: 'What is the purpose of reports?',
      options: [
        'No purpose',
        'Provide insights into business performance',
        'Only for tax purposes',
        'Decoration'
      ],
      correctAnswer: 1
    },
    {
      question: 'How often should reports be generated?',
      options: [
        'Never',
        'Regularly as needed for business decisions',
        'Once a year',
        'Only when asked'
      ],
      correctAnswer: 1
    },
    {
      question: 'What is the difference between balance sheet and income statement?',
      options: [
        'No difference',
        'Balance sheet shows assets/liabilities, income statement shows revenue/expenses',
        'They are the same report',
        'Neither is useful'
      ],
      correctAnswer: 1
    },
    {
      question: 'Why is report customization important?',
      options: [
        'It is not important',
        'Tailors reports to specific business needs',
        'Only for aesthetics',
        'Wastes time'
      ],
      correctAnswer: 1
    },
    {
      question: 'What should you do if a report shows incorrect data?',
      options: [
        'Ignore it',
        'Verify data source and correct underlying transactions',
        'Delete the report',
        'Create a new company file'
      ],
      correctAnswer: 1
    }
  ],
  troubleshooting: [
    {
      question: 'What is the first step in troubleshooting?',
      options: [
        'Delete everything',
        'Identify the specific error or symptom',
        'Call support immediately',
        'Reinstall the application'
      ],
      correctAnswer: 1
    },
    {
      question: 'Where should you look for error codes?',
      options: [
        'Nowhere',
        'Error messages, logs, and documentation',
        'Social media',
        'Guess'
      ],
      correctAnswer: 1
    },
    {
      question: 'What is the purpose of diagnostic tools?',
      options: [
        'No purpose',
        'Identify and fix data integrity issues',
        'Only for advanced users',
        'Wastes time'
      ],
      correctAnswer: 1
    },
    {
      question: 'When should you escalate to support?',
      options: [
        'Immediately for every issue',
        'After trying basic troubleshooting steps',
        'Never',
        'Only on Mondays'
      ],
      correctAnswer: 1
    },
    {
      question: 'Why is documentation important in troubleshooting?',
      options: [
        'It is not important',
        'Helps track issues and solutions for future reference',
        'Only for compliance',
        'Wastes time'
      ],
      correctAnswer: 1
    }
  ],
  advanced: [
    {
      question: 'What is the purpose of advanced features?',
      options: [
        'No purpose',
        'Extend functionality for complex business needs',
        'Only for show',
        'Complicate things unnecessarily'
      ],
      correctAnswer: 1
    },
    {
      question: 'When should you use advanced features?',
      options: [
        'Always',
        'When basic features cannot meet business requirements',
        'Never',
        'Only when forced'
      ],
      correctAnswer: 1
    },
    {
      question: 'What is the benefit of automation?',
      options: [
        'No benefit',
        'Reduces manual work and improves efficiency',
        'Only for large companies',
        'Creates more problems'
      ],
      correctAnswer: 1
    },
    {
      question: 'Why is integration important?',
      options: [
        'It is not important',
        'Connects different systems for seamless data flow',
        'Only for IT departments',
        'Complicates things'
      ],
      correctAnswer: 1
    },
    {
      question: 'What should you consider before implementing advanced features?',
      options: [
        'Nothing',
        'Business needs, training requirements, and impact on existing processes',
        'Just implement everything',
        'Cost only'
      ],
      correctAnswer: 1
    }
  ]
};

async function addQuizzesToLessons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get CCH Axcess and QuickBooks applications
    const cchAxcess = await LearningApplication.findOne({ name: 'CCH Axcess' });
    const quickBooks = await LearningApplication.findOne({ name: 'QuickBooks' });

    if (!cchAxcess && !quickBooks) {
      console.log('No CCH Axcess or QuickBooks applications found');
      await mongoose.disconnect();
      return;
    }

    let totalUpdated = 0;

    // Process CCH Axcess
    if (cchAxcess) {
      console.log('\nProcessing CCH Axcess...');
      const cchModules = await LearningModule.find({ applicationId: cchAxcess._id });
      console.log(`Found ${cchModules.length} modules`);

      for (const module of cchModules) {
        const lessons = await LearningLesson.find({ moduleId: module._id });
        console.log(`  Module: ${module.name} - ${lessons.length} lessons`);

        for (const lesson of lessons) {
          if (!lesson.quiz || lesson.quiz.questions.length === 0) {
            // Select appropriate quiz template based on lesson title
            let quizTemplate = quizTemplates.fundamentals;
            const title = lesson.title.toLowerCase();

            if (title.includes('introduction') || title.includes('getting started')) {
              quizTemplate = quizTemplates.introduction;
            } else if (title.includes('report')) {
              quizTemplate = quizTemplates.reporting;
            } else if (title.includes('troubleshoot') || title.includes('error') || title.includes('issue')) {
              quizTemplate = quizTemplates.troubleshooting;
            } else if (title.includes('advanced') || title.includes('integration') || title.includes('automation')) {
              quizTemplate = quizTemplates.advanced;
            }

            await LearningLesson.findByIdAndUpdate(lesson._id, {
              quiz: {
                questions: quizTemplate
              }
            });
            console.log(`    ✓ Updated quiz for: ${lesson.title}`);
            totalUpdated++;
          }
        }
      }
    }

    // Process QuickBooks
    if (quickBooks) {
      console.log('\nProcessing QuickBooks...');
      const qbModules = await LearningModule.find({ applicationId: quickBooks._id });
      console.log(`Found ${qbModules.length} modules`);

      for (const module of qbModules) {
        const lessons = await LearningLesson.find({ moduleId: module._id });
        console.log(`  Module: ${module.name} - ${lessons.length} lessons`);

        for (const lesson of lessons) {
          if (!lesson.quiz || lesson.quiz.questions.length === 0) {
            // Select appropriate quiz template based on lesson title
            let quizTemplate = quizTemplates.fundamentals;
            const title = lesson.title.toLowerCase();

            if (title.includes('introduction') || title.includes('getting started')) {
              quizTemplate = quizTemplates.introduction;
            } else if (title.includes('report')) {
              quizTemplate = quizTemplates.reporting;
            } else if (title.includes('troubleshoot') || title.includes('error') || title.includes('issue')) {
              quizTemplate = quizTemplates.troubleshooting;
            } else if (title.includes('advanced') || title.includes('integration') || title.includes('automation')) {
              quizTemplate = quizTemplates.advanced;
            }

            await LearningLesson.findByIdAndUpdate(lesson._id, {
              quiz: {
                questions: quizTemplate
              }
            });
            console.log(`    ✓ Updated quiz for: ${lesson.title}`);
            totalUpdated++;
          }
        }
      }
    }

    console.log(`\n✅ Total lessons updated with quizzes: ${totalUpdated}`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

addQuizzesToLessons();
