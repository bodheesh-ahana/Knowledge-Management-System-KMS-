/**
 * Import tab-separated ticket report data (exported from ManageEngine/Excel)
 * into the TicketLog collection.
 *
 * Expected columns (tab-separated), header row required:
 * Account | Request ID | Request Status | Request Type | Technician | Subject
 * | Requester | Created Time | Responded Date | Response DueBy Time
 * | Resolved Time | SLA resolution time | SLA response time
 *
 * Usage: node scripts/import-ticket-log.js <path-to-tsv-or-md-file> [source-label]
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

function deriveCategory(subject, requestType) {
  const s = (subject || '').toLowerCase();
  if (s.includes('offboard')) return 'Offboarding';
  if (s.includes('onboard')) return 'Onboarding';
  return (requestType || '').trim() || 'Other';
}

function parseDate(value) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'not applicable') return null;
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  const filePath = process.argv[2];
  const source = process.argv[3] || (filePath ? path.basename(filePath) : 'unknown');

  if (!filePath) {
    console.error('Usage: node scripts/import-ticket-log.js <path-to-file> [source-label]');
    process.exit(1);
  }

  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not configured in .env.local');
  }

  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  const raw = fs.readFileSync(absPath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    console.log('No data rows found in file.');
    await mongoose.disconnect();
    return;
  }

  const header = lines[0].split('\t').map((h) => h.trim().toLowerCase());

  const colIndex = (names) => {
    for (const name of names) {
      const idx = header.indexOf(name);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idx = {
    account: colIndex(['account']),
    requestId: colIndex(['request id']),
    status: colIndex(['request status', 'status']),
    requestType: colIndex(['request type']),
    technician: colIndex(['technician']),
    subject: colIndex(['subject']),
    requester: colIndex(['requester']),
    createdTime: colIndex(['created time', 'created date']),
    respondedDate: colIndex(['responded date', 'responded time']),
    responseDueByTime: colIndex(['response dueby time', 'response due by time']),
    resolvedTime: colIndex(['resolved time', 'resolved date']),
    slaResolutionTime: colIndex(['sla resolution time']),
    slaResponseTime: colIndex(['sla response time']),
  };

  if (idx.requestId === -1 || idx.subject === -1) {
    throw new Error('File is missing required "Request ID" or "Subject" column.');
  }

  const TicketLogSchema = new mongoose.Schema(
    {
      account: String,
      requestId: { type: String, required: true, unique: true, index: true },
      status: { type: String, required: true, index: true },
      requestType: { type: String, index: true },
      category: { type: String, index: true },
      technician: { type: String, index: true },
      subject: { type: String, required: true },
      requester: String,
      createdTime: Date,
      respondedDate: { type: Date, default: null },
      responseDueByTime: { type: Date, default: null },
      resolvedTime: { type: Date, default: null },
      slaResolutionTime: String,
      slaResponseTime: String,
      source: String,
    },
    { timestamps: true }
  );

  const TicketLog =
    mongoose.models.TicketLog || mongoose.model('TicketLog', TicketLogSchema);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    const requestId = (cols[idx.requestId] || '').trim();
    const subject = (cols[idx.subject] || '').trim();

    if (!requestId || !subject) {
      skipped++;
      continue;
    }

    const requestType = idx.requestType !== -1 ? (cols[idx.requestType] || '').trim() : '';

    const doc = {
      account: idx.account !== -1 ? (cols[idx.account] || '').trim() || 'Numera' : 'Numera',
      requestId,
      status: idx.status !== -1 ? (cols[idx.status] || '').trim() : 'Unknown',
      requestType,
      category: deriveCategory(subject, requestType),
      technician: idx.technician !== -1 ? (cols[idx.technician] || '').trim() : '',
      subject,
      requester: idx.requester !== -1 ? (cols[idx.requester] || '').trim() : '',
      createdTime: idx.createdTime !== -1 ? parseDate(cols[idx.createdTime]) : null,
      respondedDate: idx.respondedDate !== -1 ? parseDate(cols[idx.respondedDate]) : null,
      responseDueByTime:
        idx.responseDueByTime !== -1 ? parseDate(cols[idx.responseDueByTime]) : null,
      resolvedTime: idx.resolvedTime !== -1 ? parseDate(cols[idx.resolvedTime]) : null,
      slaResolutionTime:
        idx.slaResolutionTime !== -1 ? (cols[idx.slaResolutionTime] || '').trim() : '',
      slaResponseTime:
        idx.slaResponseTime !== -1 ? (cols[idx.slaResponseTime] || '').trim() : '',
      source,
    };

    const result = await TicketLog.updateOne(
      { requestId },
      { $set: doc },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      created++;
    } else if (result.modifiedCount > 0) {
      updated++;
    }
  }

  console.log(`✅ Import complete: ${created} created, ${updated} updated, ${skipped} skipped.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
