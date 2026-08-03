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

async function verifyRouting() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Academy application
    const academy = await LearningApplication.findOne({ name: 'Application Support Academy' });
    console.log('\n=== CORRECT ROUTING INFORMATION ===');
    console.log('Academy ID:', academy._id);
    console.log('Academy Name:', academy.name);
    
    // Find Module 12
    const module12 = await LearningModule.findOne({ 
      applicationId: academy._id,
      order: 12 
    });
    
    console.log('\nModule 12:');
    console.log('ID:', module12._id);
    console.log('Name:', module12.name);
    
    // Find the lesson
    const lesson = await LearningLesson.findOne({ 
      moduleId: module12._id,
      isActive: true 
    });
    
    console.log('\nCorrect Lesson:');
    console.log('ID:', lesson._id);
    console.log('Title:', lesson.title);
    
    console.log('\n=== CORRECT URL TO USE ===');
    console.log(`/learning/${academy._id}/lesson/${lesson._id}`);
    
    console.log('\n=== WRONG LESSON (Advanced Diagnostics) ===');
    const wrongLesson = await LearningLesson.findOne({ 
      title: { $regex: 'Advanced Diagnostics', $options: 'i' }
    });
    console.log('ID:', wrongLesson._id);
    console.log('Title:', wrongLesson.title);
    console.log('Module ID:', wrongLesson.moduleId);
    
    const wrongModule = await LearningModule.findById(wrongLesson.moduleId);
    console.log('Belongs to Module:', wrongModule.name);
    console.log('Module Application ID:', wrongModule.applicationId);
    
    const wrongApp = await LearningApplication.findById(wrongModule.applicationId);
    console.log('Belongs to Application:', wrongApp.name);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

verifyRouting();
