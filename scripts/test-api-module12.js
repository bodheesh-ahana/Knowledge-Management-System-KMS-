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

async function testModule12API() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Academy application
    const academy = await LearningApplication.findOne({ name: 'Application Support Academy' });
    console.log('\n=== Academy Application ===');
    console.log('ID:', academy._id);
    console.log('Name:', academy.name);

    // Find all modules for Academy
    const modules = await LearningModule.find({ 
      applicationId: academy._id,
      isActive: true 
    }).sort({ order: 1 });
    
    console.log('\n=== All Academy Modules ===');
    modules.forEach(mod => {
      console.log(`Order ${mod.order}: ${mod.name} (ID: ${mod._id})`);
    });

    // Find Module 12 specifically
    const module12 = await LearningModule.findOne({ 
      applicationId: academy._id,
      order: 12 
    });
    
    console.log('\n=== Module 12 Details ===');
    console.log('Name:', module12.name);
    console.log('ID:', module12._id);
    console.log('Order:', module12.order);
    console.log('Active:', module12.isActive);

    // Find lessons for Module 12
    const lessons = await LearningLesson.find({ 
      moduleId: module12._id,
      isActive: true 
    }).sort({ order: 1 });
    
    console.log('\n=== Lessons in Module 12 ===');
    console.log('Count:', lessons.length);
    lessons.forEach(lesson => {
      console.log(`\nLesson ID: ${lesson._id}`);
      console.log(`Title: ${lesson.title}`);
      console.log(`Order: ${lesson.order}`);
      console.log(`Content length: ${lesson.content.length}`);
      console.log(`First 100 chars: ${lesson.content.substring(0, 100)}`);
    });

    // Also check if there are any other modules with QuickBooks in the name
    const qbModules = await LearningModule.find({ 
      applicationId: academy._id,
      name: { $regex: 'QuickBooks', $options: 'i' }
    });
    
    console.log('\n=== All QuickBooks-related Modules ===');
    qbModules.forEach(mod => {
      console.log(`Order ${mod.order}: ${mod.name} (ID: ${mod._id})`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testModule12API();
