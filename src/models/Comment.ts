import mongoose, { Schema } from 'mongoose';
import { IComment } from '@/types';

const commentSchema = new Schema<IComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      required: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ resourceId: 1, createdAt: -1 });

export const Comment =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);
