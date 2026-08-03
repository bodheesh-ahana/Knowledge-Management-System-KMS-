import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningLesson extends Document {
  moduleId: mongoose.Types.ObjectId;
  title: string;
  objective: string;
  businessPurpose: string;
  concepts: string[];
  content: string; // Step-by-step procedure
  importantNotes: string[];
  commonMistakes: string[];
  relatedKBIds: mongoose.Types.ObjectId[];
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
  order: number;
  estimatedDuration: number; // in minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LearningLessonSchema = new Schema<ILearningLesson>(
  {
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'LearningModule',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    objective: {
      type: String,
      required: true,
    },
    businessPurpose: {
      type: String,
      required: true,
    },
    concepts: {
      type: [String],
      default: [],
    },
    content: {
      type: String,
      required: true,
    },
    importantNotes: {
      type: [String],
      default: [],
    },
    commonMistakes: {
      type: [String],
      default: [],
    },
    relatedKBIds: {
      type: [Schema.Types.ObjectId],
      ref: 'KnowledgeArticle',
      default: [],
    },
    practicalExercise: {
      title: String,
      instructions: [String],
      requiresScreenshot: {
        type: Boolean,
        default: false,
      },
    },
    quiz: {
      questions: [
        {
          question: String,
          options: [String],
          correctAnswer: Number,
        },
      ],
    },
    order: {
      type: Number,
      default: 0,
    },
    estimatedDuration: {
      type: Number,
      default: 30,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.LearningLesson || mongoose.model<ILearningLesson>('LearningLesson', LearningLessonSchema);
