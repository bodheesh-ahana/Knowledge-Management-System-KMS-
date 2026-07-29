import mongoose, { Schema } from 'mongoose';
import { INotification } from '@/types';

const notificationSchema = new Schema<INotification>(
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
        'ArticleReviewNeeded',
        'TicketAssigned',
        'CommentMention',
        'ArticleCreated',
        'TicketCreated',
        'TrackerEntryCreated',
        'TicketResolved',
        'System',
      ],
      required: true,
    },
    title: String,
    message: String,
    resourceId: Schema.Types.ObjectId,
    read: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ user: 1, read: 1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', notificationSchema);
