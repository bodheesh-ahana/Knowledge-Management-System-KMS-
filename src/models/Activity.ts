import mongoose, { Schema } from 'mongoose';
import { IActivity } from '@/types';

const activitySchema = new Schema<IActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'ArticleCreated',
        'ArticleUpdated',
        'ArticlePublished',
        'ArticleArchived',
        'TicketCreated',
        'TicketResolved',
        'HoursLogged',
        'UserLoggedIn',
      ],
      required: true,
    },
    resourceType: String,
    resourceId: Schema.Types.ObjectId,
    details: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

export const Activity =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', activitySchema);
