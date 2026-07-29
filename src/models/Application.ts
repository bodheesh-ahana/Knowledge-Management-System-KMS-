import mongoose, { Schema } from 'mongoose';
import { IApplication } from '@/types';

const applicationSchema = new Schema<IApplication>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    description: String,
    icon: String,
    color: {
      type: String,
      default: '#0ea5e9',
    },
  },
  {
    timestamps: true,
  }
);

export const Application =
  mongoose.models.Application ||
  mongoose.model<IApplication>('Application', applicationSchema);
