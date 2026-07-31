/**
 * Seed SLA breach tickets for Application Support (Numera).
 * Data source: manually exported SLA breach report shared by the user.
 * Safe to re-run: upserts by requestId.
 *
 * Usage: node scripts/seed-sla-breach.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const SLA_BREACHES = [
  {
    requestId: '199831',
    subject: 'Aditi Goel <agoel@mystartupcfo.com> messaged you on Google Chat while you were away',
    requester: 'Sheenal Chand (via Google Chat)',
    assignedTo: 'Numera Support',
    dueByDate: 'Apr 19, 2026 07:57 AM',
    status: 'Closed',
    createdDate: 'Apr 18, 2026 03:57 PM',
    site: 'Bengaluru',
    priority: 'P3',
    group: 'Application Support Team',
    account: 'Numera',
  },
  {
    requestId: '184566',
    subject: 'Disappearance of files on desktop',
    requester: 'Surendra Agarwal',
    assignedTo: 'Kanchetti Sai Kumar',
    dueByDate: 'Jan 16, 2026 12:54 AM',
    status: 'Closed',
    createdDate: 'Jan 15, 2026 08:54 AM',
    site: 'Bengaluru',
    priority: 'P3',
    group: 'Application Support Team',
    account: 'Numera',
  },
  {
    requestId: '183626',
    subject: 'Gdrive and Remote Desktop Access',
    requester: 'Akshatha Hegde',
    assignedTo: 'Surya S',
    dueByDate: 'Jan 10, 2026 02:15 AM',
    status: 'Closed',
    createdDate: 'Jan 9, 2026 10:01 AM',
    site: 'Bengaluru',
    priority: 'P3',
    group: 'Application Support Team',
    account: 'Numera',
  },
  {
    requestId: '183639',
    subject: 'Laptop touchpad not working.',
    requester: 'Shalini Karakoti',
    assignedTo: 'Shantesh Irappa Kambar',
    dueByDate: 'Jan 10, 2026 02:24 AM',
    status: 'Closed',
    createdDate: 'Jan 9, 2026 10:24 AM',
    site: 'Bengaluru',
    priority: 'P3',
    group: 'Application Support Team',
    account: 'Numera',
  },
  {
    requestId: '199425',
    subject: 'Login issues?',
    requester: 'Sandeep Shroff',
    assignedTo: 'Sudheer',
    dueByDate: 'Apr 15, 2026 09:38 PM',
    status: 'Closed',
    createdDate: 'Apr 15, 2026 08:38 PM',
    site: 'Bengaluru',
    priority: 'P1',
    group: 'Application Support Team',
    account: 'Numera',
  },
  {
    requestId: '213770',
    subject: 'QDB issue - critical',
    requester: 'Supraj Purohit',
    assignedTo: 'Application Support',
    dueByDate: 'Jul 2, 2026 03:54 PM',
    status: 'Closed',
    createdDate: 'Jul 2, 2026 02:54 PM',
    site: 'Bengaluru',
    priority: 'P1',
    group: 'Application Support Team',
    account: 'Numera',
  },
  {
    requestId: '184169',
    subject: 'Re: Request to place the Asset Order for New JVG Team Member',
    requester: 'Freeda Gonsalves',
    assignedTo: 'Adarsh R',
    dueByDate: 'Jan 13, 2026 03:27 PM',
    status: 'Closed',
    createdDate: 'Jan 12, 2026 11:27 PM',
    site: 'Bengaluru',
    priority: 'P3',
    group: 'Application Support Team',
    account: 'Numera',
  },
  {
    requestId: '190093',
    subject: 'Test',
    requester: 'Keerthivasan S D',
    assignedTo: 'Keerthivasan S D',
    dueByDate: 'Feb 16, 2026 04:36 PM',
    status: 'Closed',
    createdDate: 'Feb 16, 2026 03:36 PM',
    site: 'Bengaluru',
    priority: 'P1',
    group: 'Application Support Team',
    account: 'Numera',
  },
  {
    requestId: '190068',
    subject: 'Test Ticket',
    requester: 'Keerthivasan S D',
    assignedTo: 'Keerthivasan S D',
    dueByDate: 'Feb 16, 2026 02:35 PM',
    status: 'Closed',
    createdDate: 'Feb 16, 2026 01:35 PM',
    site: 'Bengaluru',
    priority: 'P1',
    group: 'Application Support Team',
    account: 'Numera',
  },
  {
    requestId: '190802',
    subject: 'TEST TICKET - DO NOT CLOSE THE TICKET WITHOUT CONSENT',
    requester: 'Shrinivas B',
    assignedTo: 'Adarsh R',
    dueByDate: 'Feb 19, 2026 03:37 PM',
    status: 'Closed',
    createdDate: 'Feb 19, 2026 02:37 PM',
    site: 'Bengaluru',
    priority: 'P1',
    group: 'Application Support Team',
    account: 'Numera',
  },
  {
    requestId: '183638',
    subject: 'Unable to log in Remote Desktop(RDS)',
    requester: 'Rina Agadi',
    assignedTo: 'Surya S',
    dueByDate: 'Jan 10, 2026 02:23 AM',
    status: 'Closed',
    createdDate: 'Jan 9, 2026 10:23 AM',
    site: 'Bengaluru',
    priority: 'P3',
    group: 'Application Support Team',
    account: 'Numera',
  },
];

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not configured in .env.local');
  }

  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  const SlaBreachSchema = new mongoose.Schema(
    {
      requestId: { type: String, required: true, unique: true, index: true },
      subject: { type: String, required: true },
      requester: String,
      assignedTo: String,
      dueByDate: { type: Date, default: null },
      status: String,
      createdDate: { type: Date, index: true },
      site: String,
      priority: String,
      group: String,
      account: { type: String, default: 'Numera' },
    },
    { timestamps: true }
  );

  const SlaBreach = mongoose.models.SlaBreach || mongoose.model('SlaBreach', SlaBreachSchema);

  let created = 0;
  let updated = 0;

  for (const row of SLA_BREACHES) {
    const doc = {
      ...row,
      dueByDate: parseDate(row.dueByDate),
      createdDate: parseDate(row.createdDate),
    };

    const result = await SlaBreach.updateOne(
      { requestId: row.requestId },
      { $set: doc },
      { upsert: true }
    );

    if (result.upsertedCount > 0) created++;
    else if (result.modifiedCount > 0) updated++;
  }

  console.log(`✅ SLA breach seed complete: ${created} created, ${updated} updated.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ SLA breach seed failed:', err);
  process.exit(1);
});
