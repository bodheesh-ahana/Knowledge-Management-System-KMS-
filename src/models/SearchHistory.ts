import mongoose, { Schema } from 'mongoose';
import { ISearchHistory } from '@/types';

const searchHistorySchema = new Schema<ISearchHistory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    query: {
      type: String,
      required: true,
    },
    resultCount: Number,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
  }
);

searchHistorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SearchHistory =
  mongoose.models.SearchHistory ||
  mongoose.model<ISearchHistory>('SearchHistory', searchHistorySchema);
