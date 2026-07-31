/**
 * One-time seed from the Numera ticket Excel into the KMS MongoDB.
 * Creates / updates Applications, Tickets and KnowledgeArticles.
 * Safe to re-run: skips existing tickets by Ticket ID.
 *
 * Usage:
 *   npm install xlsx
 *   node scripts/seed-excel.js "c:\path\to\Numera_ticket_ids.xlsx"
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

let xlsx;
try {
  xlsx = require('xlsx');
} catch {
  console.error('❌ The "xlsx" package is required. Run: npm install xlsx');
  process.exit(1);
}

const filePath = process.argv[2];
if (!filePath || !fs.existsSync(filePath)) {
  console.error('❌ Provide a valid .xlsx file path, e.g.:');
  console.error('   node scripts/seed-excel.js "c:\\Users\\BodheeshVC\\Downloads\\Numera_ticket_ids.xlsx"');
  process.exit(1);
}

const APP_DESCRIPTIONS = {
  QuickBooks: 'Accounting and bookkeeping platform used for client financial management.',
  Drake: 'Professional tax preparation software used for individual and business tax filings.',
  Lacerte: "Intuit's professional tax software for complex individual and business returns.",
  Ultratax: 'Thomson Reuters tax compliance and preparation software.',
  'Transaction Pro': 'Data import/export utility for QuickBooks and accounting transactions.',
  'CCH Axcess': 'Wolters Kluwer cloud-based tax, audit, and accounting workflow platform.',
  'Numera Cloud': 'Numera cloud application / remote access environment.',
  Unknown: 'Application not specified or unrecognized.',
};

const applicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: String,
    icon: { type: String, default: 'apps' },
    color: { type: String, default: '#0ea5e9' },
  },
  { timestamps: true }
);
const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    name: String,
    role: String,
    active: Boolean,
  },
  { timestamps: true }
);
const User = mongoose.models.User || mongoose.model('User', userSchema);

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    application: { type: String, required: true },
    status: {
      type: String,
      enum: ['Open', 'Assigned', 'In Progress', 'On Hold', 'Resolved', 'Closed'],
      default: 'Closed',
    },
    severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },
    resolution: String,
    assignee: mongoose.Schema.Types.ObjectId,
    reporter: mongoose.Schema.Types.ObjectId,
    workTimeLogged: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

const stepSchema = new mongoose.Schema({
  order: Number,
  description: String,
});
const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    application: { type: String, required: true },
    symptoms: { type: String, required: true },
    rootCause: String,
    resolution: String,
    prevention: String,
    troubleshootingSteps: [stepSchema],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Draft', 'UnderReview', 'Approved', 'Published', 'Archived'], default: 'Published' },
    tags: [String],
    ticketId: { type: String, index: true },
    relatedTickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
    views: { type: Number, default: 0 },
    helpful: { type: Number, default: 0 },
    unhelpful: { type: Number, default: 0 },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);
const KnowledgeArticle = mongoose.models.KnowledgeArticle || mongoose.model('KnowledgeArticle', articleSchema);

function cleanStr(value) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeApplication(raw) {
  const s = cleanStr(raw).toLowerCase();
  if (!s) return 'Unknown';

  const quickBooksKeys = ['quickbooks', 'quick books', 'quickbook', 'qbd', 'qbo', 'qb ', 'qb-', 'qb online'];
  if (quickBooksKeys.some((k) => s.includes(k))) return 'QuickBooks';

  if (s.includes('drake')) return 'Drake';
  if (s.includes('lacerte')) return 'Lacerte';
  if (s.includes('transaction pro')) return 'Transaction Pro';
  if (s.includes('ultratax') || s.includes('ultra tax')) return 'Ultratax';
  if (s.includes('cch')) return 'CCH Axcess';
  if (s.includes('numera')) return 'Numera Cloud';

  return cleanStr(raw);
}

function priorityToSeverity(raw) {
  const p = cleanStr(raw).toUpperCase();
  if (p.includes('P1')) return 'Critical';
  if (p.includes('P2')) return 'High';
  if (p.includes('P3')) return 'Medium';
  if (p.includes('P4')) return 'Low';
  return 'Medium';
}

function parseDate(raw) {
  const d = cleanStr(raw).replace(/^"|"$/g, '').trim();
  if (!d) return null;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function splitSteps(raw) {
  return String(raw || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\d+[.\)\-]\s*/, '').trim())
    .filter(Boolean)
    .map((desc, index) => ({ order: index + 1, description: desc }));
}

function normalizeHeader(h) {
  return String(h || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function headerIndex(row, ...candidates) {
  const idx = row.findIndex((h) => candidates.includes(normalizeHeader(h)));
  return idx;
}

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found. Make sure .env.local is configured.');
    }

    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const owner = await User.findOne({ email: 'bodheesh@kms.com' }) ||
                  await User.findOne({ role: 'Admin' }) ||
                  await User.findOne().sort({ createdAt: 1 });

    if (!owner) {
      throw new Error('No seed user found. Run "npm run seed" first to create users.');
    }
    console.log(`👤 Using owner: ${owner.name} (${owner.email})`);

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rawRows = xlsx.utils.sheet_to_json(worksheet, { defval: '', header: 1 });
    if (rawRows.length < 2) {
      throw new Error('Excel sheet looks empty or has no header.');
    }

    const headerRow = rawRows[0];
    const dataRows = rawRows.slice(1);

    const col = {
      ticketId: headerIndex(headerRow, 'ticketid'),
      issue: headerIndex(headerRow, 'issues', 'issue'),
      application: headerIndex(headerRow, 'application', 'app'),
      steps: headerIndex(headerRow, 'troubleshootingsteps', 'troubleshootsteps', 'steps'),
      date: headerIndex(headerRow, 'ticketgeneratedate', 'generatedate', 'date'),
      priority: headerIndex(headerRow, 'ticketpriority', 'priority'),
    };

    if (col.ticketId < 0 || col.issue < 0) {
      throw new Error('Required columns not found: Ticket ID / Issues. Detected headers: ' + headerRow.join(' | '));
    }

    let createdTickets = 0;
    let createdArticles = 0;
    let skipped = 0;
    let errors = 0;

    for (const [index, row] of dataRows.entries()) {
      const ticketId = cleanStr(row[col.ticketId]);
      const issue = cleanStr(row[col.issue]);

      // Stop at the first completely blank row to avoid trailing garbage
      if (!ticketId && !issue) continue;

      // Skip rows that are just ticket IDs with no issue data
      if (!issue) {
        console.log(`  ⏭️  Row ${index + 2}: no issue description, skipping`);
        skipped++;
        continue;
      }

      const rawApp = col.application >= 0 ? row[col.application] : '';
      const rawSteps = col.steps >= 0 ? row[col.steps] : '';
      const rawDate = col.date >= 0 ? row[col.date] : '';
      const rawPriority = col.priority >= 0 ? row[col.priority] : '';

      const application = normalizeApplication(rawApp);
      const severity = priorityToSeverity(rawPriority);
      const generatedAt = parseDate(rawDate);
      const stepsList = splitSteps(rawSteps);

      // Ensure application catalog entry exists
      const appDoc = await Application.findOneAndUpdate(
        { name: application },
        { $setOnInsert: { description: APP_DESCRIPTIONS[application] || `Application: ${application}`, icon: 'apps' } },
        { upsert: true, new: true }
      );

      // Upsert the ticket
      const ticketResult = await Ticket.findOneAndUpdate(
        { ticketNumber: ticketId },
        {
          $set: {
            ticketNumber: ticketId,
            title: issue,
            description: issue,
            application,
            status: 'Closed',
            severity,
            resolution: cleanStr(rawSteps),
            reporter: owner._id,
            ...(generatedAt && { createdAt: generatedAt }),
          },
        },
        { upsert: true, new: true }
      );

      if (ticketResult.isNew !== false) createdTickets++;

      // Upsert the linked knowledge article
      const existingArticle = await KnowledgeArticle.findOne({ ticketId });
      if (!existingArticle) {
        await KnowledgeArticle.create({
          title: issue,
          description: issue,
          application,
          symptoms: issue,
          resolution: cleanStr(rawSteps),
          troubleshootingSteps: stepsList,
          owner: owner._id,
          status: 'Published',
          tags: [application, severity],
          ticketId,
          relatedTickets: [ticketResult._id],
          ...(generatedAt && { createdAt: generatedAt }),
        });
        createdArticles++;
      } else {
        skipped++;
      }

      console.log(`  ✅ ${ticketId}: ${issue.slice(0, 60)}...`);
    }

    console.log(`\n📊 Summary`);
    console.log(`   Tickets created/updated: ${createdTickets}`);
    console.log(`   Articles created:        ${createdArticles}`);
    console.log(`   Skipped:                 ${skipped}`);
    console.log(`   Errors:                  ${errors}`);
    console.log('\n✅ Excel seeding complete!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
