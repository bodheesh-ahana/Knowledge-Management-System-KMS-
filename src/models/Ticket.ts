import mongoose, { Schema } from 'mongoose';
import { ITicket } from '@/types';

const ticketSchema = new Schema<ITicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    application: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Open', 'InProgress', 'Resolved', 'Closed'],
      default: 'Open',
      index: true,
    },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      required: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    linkedKnowledgeArticles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'KnowledgeArticle',
      },
    ],
    workTimeLogged: {
      type: Number,
      default: 0,
    },
    resolution: String,
    resolvedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound indexes (unique constraint on ticketNumber is already indexed)
ticketSchema.index({ application: 1, status: 1 });
ticketSchema.index({ assignee: 1, status: 1 });

export const Ticket = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', ticketSchema);
