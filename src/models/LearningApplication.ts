import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningApplication extends Document {
  name: string;
  description: string;
  icon?: string;
  color: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LearningApplicationSchema = new Schema<ILearningApplication>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    order: {
      type: Number,
      default: 0,
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

export default mongoose.models.LearningApplication || mongoose.model<ILearningApplication>('LearningApplication', LearningApplicationSchema);
