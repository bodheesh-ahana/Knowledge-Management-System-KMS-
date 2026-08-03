require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define schemas inline
const LearningApplicationSchema = new mongoose.Schema({
  name: String,
  description: String,
  icon: String,
  color: String,
  order: Number,
  isActive: Boolean,
});

const LearningModuleSchema = new mongoose.Schema({
  applicationId: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  order: Number,
  isActive: Boolean,
});

const LearningLessonSchema = new mongoose.Schema({
  moduleId: mongoose.Schema.Types.ObjectId,
  title: String,
  objective: String,
  businessPurpose: String,
  concepts: [String],
  content: String,
  importantNotes: [String],
  commonMistakes: [String],
  estimatedDuration: Number,
  order: Number,
  isActive: Boolean,
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
    }],
  },
});

// Create models
const LearningApplication = mongoose.model('LearningApplication', LearningApplicationSchema);
const LearningModule = mongoose.model('LearningModule', LearningModuleSchema);
const LearningLesson = mongoose.model('LearningLesson', LearningLessonSchema);

async function checkQuickBooksLesson() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Academy application
    const academy = await LearningApplication.findOne({ name: 'Application Support Academy' });
    console.log('Academy ID:', academy._id);

    // Find Module 12
    const module = await LearningModule.findOne({ 
      applicationId: academy._id,
      order: 12 
    });
    console.log('Module 12:', module ? module.name : 'Not found');
    console.log('Module ID:', module ? module._id : 'N/A');

    // Find lessons in this module
    const lessons = await LearningLesson.find({ moduleId: module._id });
    console.log('Number of lessons in Module 12:', lessons.length);
    
    if (lessons.length > 0) {
      console.log('Lesson title:', lessons[0].title);
      console.log('Lesson ID:', lessons[0]._id);
      console.log('Content length:', lessons[0].content.length);
      console.log('First 200 chars of content:', lessons[0].content.substring(0, 200));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkQuickBooksLesson();
