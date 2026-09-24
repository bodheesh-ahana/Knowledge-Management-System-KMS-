const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const TASK_REF_PATTERN = /\(\s*#\s*(\d+)\s*\)/;

const trackerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teamMembers: { type: [String], default: [] },
    ticketId: { type: String, trim: true },
    isTask: { type: Boolean, default: false },
    taskId: { type: String, trim: true },
    title: { type: String, trim: true },
    linkedArticle: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeArticle' },
    role: { type: String, enum: ['Owner', 'Contributor'], default: 'Contributor' },
    date: { type: Date, required: true },
    workDescription: String,
    hoursWorked: { type: Number, required: true },
    workType: {
      type: String,
      enum: ['Investigation', 'Call', 'Follow-up', 'Meeting', 'Documentation', 'Knowledge Creation', 'Other'],
      default: 'Other',
    },
    slaBreach: { type: String, enum: ['Yes', 'No', 'N/A'], default: 'N/A' },
    slaBreachReason: String,
    escalationStatus: { type: String, enum: ['Yes', 'No', 'N/A'], default: 'No' },
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
    ticketsResolved: { type: Number, default: 0 },
    articlesCreated: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Submitted'], default: 'Draft' },
  },
  { timestamps: true }
);

trackerSchema.index({ user: 1, date: -1 });
trackerSchema.index({ status: 1 });
trackerSchema.index({ ticketId: 1 });
trackerSchema.index({ taskId: 1 });
trackerSchema.index({ teamMembers: 1 });

if (mongoose.models.TrackerEntry) {
  delete mongoose.models.TrackerEntry;
}

const TrackerEntry = mongoose.model('TrackerEntry', trackerSchema);

async function backfill() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not configured in .env.local');
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const candidates = await TrackerEntry.find({
    $or: [{ taskId: { $exists: false } }, { taskId: null }, { taskId: '' }],
  }).lean();

  console.log(`Found ${candidates.length} candidate record(s) with empty/missing taskId`);

  let updated = 0;
  let skipped = 0;
  const bulkOps = [];

  for (const entry of candidates) {
    const ticketId = entry.ticketId;
    if (typeof ticketId !== 'string' || !ticketId.trim()) {
      skipped++;
      continue;
    }

    const match = ticketId.match(TASK_REF_PATTERN);
    if (!match) {
      skipped++;
      continue;
    }

    const taskNumber = match[1];
    bulkOps.push({
      updateOne: {
        filter: { _id: entry._id },
        update: { $set: { taskId: taskNumber } },
      },
    });
    updated++;
  }

  if (bulkOps.length > 0) {
    await TrackerEntry.bulkWrite(bulkOps);
    console.log(`Updated ${updated} record(s) with extracted task number`);
  } else {
    console.log('No records required updating');
  }

  const total = candidates.length;
  const withTaskRef = updated;
  const withoutTaskRef = total - withTaskRef;
  console.log(`Summary: ${withTaskRef} updated, ${withoutTaskRef} skipped (no task reference)`);
  console.log(`Existing taskId values were preserved. No ticketId values were modified.`);

  await mongoose.connection.close();
}

backfill().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
