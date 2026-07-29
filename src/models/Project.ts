import mongoose, { Schema } from 'mongoose';
import { IProject } from '@/types';

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      index: 'text',
    },
    description: String,
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['Planning', 'InProgress', 'OnHold', 'Completed'],
      default: 'Planning',
      index: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dueDate: Date,
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ status: 1, dueDate: 1 });

export const Project =
  mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);
