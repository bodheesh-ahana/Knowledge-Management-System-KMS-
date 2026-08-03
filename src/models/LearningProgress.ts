import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningProgress extends Document {
  userId: string;
  applicationId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: Date;
  quizScore?: number;
  exerciseSubmitted?: boolean;
  exerciseScreenshot?: string;
  notes?: string;
  timeSpent: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

const LearningProgressSchema = new Schema<ILearningProgress>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'LearningApplication',
      required: true,
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'LearningModule',
      required: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'LearningLesson',
      required: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    completedAt: {
      type: Date,
    },
    quizScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    exerciseSubmitted: {
      type: Boolean,
      default: false,
    },
    exerciseScreenshot: {
      type: String,
    },
    notes: {
      type: String,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique user-lesson combination
LearningProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export default mongoose.models.LearningProgress || mongoose.model<ILearningProgress>('LearningProgress', LearningProgressSchema);
