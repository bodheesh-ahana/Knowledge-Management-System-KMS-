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

export const TrackerEntry =
  mongoose.models.TrackerEntry || mongoose.model<ITrackerEntry>('TrackerEntry', trackerSchema);
