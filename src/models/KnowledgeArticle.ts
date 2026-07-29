import mongoose, { Schema } from 'mongoose';
import { IKnowledgeArticle, ITroubleshootingStep } from '@/types';

const troubleshootingStepSchema = new Schema<ITroubleshootingStep>({
  order: Number,
  description: String,
});

const knowledgeArticleSchema = new Schema<IKnowledgeArticle>(
  {
    title: {
      type: String,
      required: true,
      index: 'text',
    },
    description: String,
    application: {
      type: String,
      required: true,
      index: true,
    },
    symptoms: {
      type: String,
      required: true,
      index: 'text',
    },
    rootCause: String,
    resolution: String,
    prevention: String,
    troubleshootingSteps: [troubleshootingStepSchema],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reviewer: Schema.Types.ObjectId,
    contributors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['Draft', 'UnderReview', 'Approved', 'Published', 'Archived'],
      default: 'Draft',
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    unhelpful: {
      type: Number,
      default: 0,
    },
    relatedArticles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'KnowledgeArticle',
      },
    ],
    relatedTickets: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Ticket',
      },
    ],
    tags: [String],
    // Featured image for article (stored locally in public/uploads)
    featuredImage: String,
    // Attachments with metadata
    attachments: [
      {
        filename: String,
        url: String,
        type: String, // 'image', 'document', 'video'
        size: Number,
        uploadedAt: Date,
      },
    ],
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

knowledgeArticleSchema.index({ title: 'text', symptoms: 'text', resolution: 'text' });
knowledgeArticleSchema.index({ application: 1, status: 1 });
knowledgeArticleSchema.index({ owner: 1, createdAt: -1 });

export const KnowledgeArticle =
  mongoose.models.KnowledgeArticle ||
  mongoose.model<IKnowledgeArticle>('KnowledgeArticle', knowledgeArticleSchema);
