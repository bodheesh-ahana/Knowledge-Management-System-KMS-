import mongoose, { Schema } from 'mongoose';
import { IUser } from '@/types';

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't include password by default in queries
    },
    role: {
      type: String,
      enum: ['Engineer', 'TeamLead', 'Manager', 'Admin'],
      default: 'Engineer',
    },
    avatar: String,
    bio: String,
    active: {
      type: Boolean,
      default: true,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
      language: {
        type: String,
        default: 'en',
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Only add indexes that aren't automatically created by unique constraints
userSchema.index({ role: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
