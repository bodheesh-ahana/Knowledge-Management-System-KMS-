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
      enum: [
        'Open',
        'Assigned',
        'In Progress',
        'On Hold',
        'Awaiting User Response',
        'Awaiting Vendor/OEM',
        'Awaiting Spare',
        'Awaiting Approval',
        'Pending with Customer Management',
        'Under Procurement',
        'Under IT Validation',
        'Under Sales Team Review',
        'Outside Business Hours',
        'Resolved',
        'Closed',
        'Cancelled',
      ],
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

// Force recompilation during hot reload so schema changes are picked up
if (mongoose.models.Ticket) {
  delete mongoose.models.Ticket;
}

export const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);
