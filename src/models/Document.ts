import mongoose, { Schema } from 'mongoose';
import { IDocumentRecord } from '@/types';

const documentSchema = new Schema<IDocumentRecord>(
  {
    title: {
      type: String,
      required: true,
      index: 'text',
    },
    description: String,
    docType: {
      type: String,
      enum: ['pdf', 'image', 'doc', 'spreadsheet', 'link', 'other'],
      default: 'other',
    },
    application: String,
    externalUrl: {
      type: String,
      required: true,
    },
    sizeLabel: String,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    starred: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ createdAt: -1 });

export const DocumentRecord =
  mongoose.models.DocumentRecord ||
  mongoose.model<IDocumentRecord>('DocumentRecord', documentSchema);
