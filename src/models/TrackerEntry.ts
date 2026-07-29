import mongoose, { Schema } from 'mongoose';
import { ITrackerEntry } from '@/types';

const trackerSchema = new Schema<ITrackerEntry>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    teamMembers: {
      type: [String],
      default: [],
    },
    ticketId: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    linkedArticle: {
      type: Schema.Types.ObjectId,
      ref: 'KnowledgeArticle',
    },
    role: {
      type: String,
      enum: ['Owner', 'Contributor'],
      default: 'Contributor',
    },
    date: {
      type: Date,
      required: true,
    },
    workDescription: String,
    hoursWorked: {
      type: Number,
      required: true,
    },
    workType: {
      type: String,
      enum: [
        'Investigation',
        'Call',
        'Follow-up',
        'Meeting',
        'Documentation',
        'Knowledge Creation',
        'Other',
      ],
      default: 'Other',
    },
    slaBreach: {
      type: String,
      enum: ['Yes', 'No', 'N/A'],
      default: 'N/A',
    },
    slaBreachReason: String,
    escalationStatus: {
      type: String,
      enum: ['Yes', 'No', 'N/A'],
      default: 'No',
    },
    application: String,
    ticketStatus: {
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
    },
    ticketsResolved: {
      type: Number,
      default: 0,
    },
    articlesCreated: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted'],
      default: 'Draft',
    },
  },
  {
    timestamps: true,
  }
);

trackerSchema.index({ user: 1, date: -1 });
trackerSchema.index({ status: 1 });
trackerSchema.index({ ticketId: 1 });
trackerSchema.index({ teamMembers: 1 });

// Force recompilation during hot reload so schema changes are picked up
if (mongoose.models.TrackerEntry) {
  delete mongoose.models.TrackerEntry;
}

export const TrackerEntry =
  mongoose.model<ITrackerEntry>('TrackerEntry', trackerSchema);
