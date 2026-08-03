import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningModule extends Document {
  applicationId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LearningModuleSchema = new Schema<ILearningModule>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'LearningApplication',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
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

export default mongoose.models.LearningModule || mongoose.model<ILearningModule>('LearningModule', LearningModuleSchema);
