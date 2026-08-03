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

async function checkLessonIDs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Academy application
    const academy = await LearningApplication.findOne({ name: 'Application Support Academy' });
    
    // Find all modules
    const modules = await LearningModule.find({ 
      applicationId: academy._id,
      isActive: true 
    }).sort({ order: 1 });
    
    console.log('\n=== All Lessons with their IDs ===');
    for (const module of modules) {
      console.log(`\nModule: ${module.name} (Order: ${module.order})`);
      const lessons = await LearningLesson.find({ 
        moduleId: module._id,
        isActive: true 
      }).sort({ order: 1 });
      
      if (lessons.length === 0) {
        console.log('  No lessons');
      } else {
        lessons.forEach(lesson => {
          console.log(`  Lesson ID: ${lesson._id}`);
          console.log(`  Title: ${lesson.title}`);
          console.log(`  Order: ${lesson.order}`);
          console.log(`  Content length: ${lesson.content.length}`);
          console.log('');
        });
      }
    }

    // Specifically check for "Advanced Diagnostics" lesson
    const advDiag = await LearningLesson.findOne({ 
      title: { $regex: 'Advanced Diagnostics', $options: 'i' }
    });
    
    console.log('\n=== Advanced Diagnostics Lesson ===');
    if (advDiag) {
      console.log('Found:', advDiag.title);
      console.log('ID:', advDiag._id);
      console.log('Module ID:', advDiag.moduleId);
      
      // Find which module it belongs to
      const parentModule = await LearningModule.findById(advDiag.moduleId);
      console.log('Parent Module:', parentModule ? parentModule.name : 'Not found');
    } else {
      console.log('Not found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkLessonIDs();
