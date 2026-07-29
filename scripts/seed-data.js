/**
 * Seed script to create sample Applications, Knowledge Articles, Tickets, and a Project.
 * Safe to re-run: uses upsert/find-or-create logic, does not delete existing data.
 * Run with: npm run seed:data
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const APPLICATIONS = [
  { name: 'SAP ERP', description: 'Enterprise resource planning system', icon: 'dns', color: '#0ea5e9' },
  { name: 'Salesforce CRM', description: 'Customer relationship management platform', icon: 'cloud', color: '#3b82f6' },
  { name: 'ServiceNow', description: 'IT service management platform', icon: 'support_agent', color: '#22c55e' },
  { name: 'JIRA', description: 'Issue and project tracking tool', icon: 'bug_report', color: '#f97316' },
  { name: 'Confluence', description: 'Team collaboration and documentation wiki', icon: 'description', color: '#8b5cf6' },
  { name: 'Workday HCM', description: 'Human capital management system', icon: 'badge', color: '#ec4899' },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not configured in .env.local');
    }

    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const applicationSchema = new mongoose.Schema(
      {
        name: { type: String, required: true, unique: true, index: true },
        description: String,
        icon: String,
        color: { type: String, default: '#0ea5e9' },
      },
      { timestamps: true }
    );
    const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);

    const userSchema = new mongoose.Schema(
      {
        email: String,
        name: String,
        role: String,
      },
      { timestamps: true }
    );
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    const articleSchema = new mongoose.Schema(
      {
        title: String,
        description: String,
        application: String,
        symptoms: String,
        rootCause: String,
        resolution: String,
        prevention: String,
        troubleshootingSteps: [String],
        owner: mongoose.Schema.Types.ObjectId,
        reviewer: mongoose.Schema.Types.ObjectId,
        contributors: [mongoose.Schema.Types.ObjectId],
        status: String,
        views: Number,
        helpful: Number,
        unhelpful: Number,
        tags: [String],
        version: Number,
      },
      { timestamps: true }
    );
    const KnowledgeArticle =
      mongoose.models.KnowledgeArticle || mongoose.model('KnowledgeArticle', articleSchema);

    const ticketSchema = new mongoose.Schema(
      {
        ticketNumber: { type: String, unique: true },
        title: String,
        description: String,
        application: String,
        status: String,
        severity: String,
        assignee: mongoose.Schema.Types.ObjectId,
        reporter: mongoose.Schema.Types.ObjectId,
        workTimeLogged: Number,
      },
      { timestamps: true }
    );
    const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

    const projectSchema = new mongoose.Schema(
      {
        name: String,
        description: String,
        progress: Number,
        status: String,
        members: [mongoose.Schema.Types.ObjectId],
        owner: mongoose.Schema.Types.ObjectId,
        dueDate: Date,
      },
      { timestamps: true }
    );
    const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

    // 1. Applications (upsert by name)
    console.log('📦 Seeding applications...');
    for (const app of APPLICATIONS) {
      await Application.updateOne({ name: app.name }, { $setOnInsert: app }, { upsert: true });
      console.log(`  ✅ ${app.name}`);
    }

    // 2. Look up seeded users to attach as owners
    const admin = await User.findOne({ email: 'bodheesh@kms.com' });
    const engineer = await User.findOne({ email: 'engineer@kms.com' });
    const lead = await User.findOne({ email: 'lead@kms.com' });
    const manager = await User.findOne({ email: 'manager@kms.com' });

    if (!admin || !engineer) {
      console.log('⚠️  Seed users not found. Run "npm run seed" first for full sample data linking.');
    }

    const owner = admin || engineer;

    // 3. Knowledge Articles
    if (owner) {
      console.log('📚 Seeding knowledge articles...');
      const articleCount = await KnowledgeArticle.countDocuments();
      if (articleCount === 0) {
        const articles = [
          {
            title: 'SAP ERP: Batch Job Failure Resolution',
            description: 'Steps to diagnose and resolve failed nightly batch jobs in SAP.',
            application: 'SAP ERP',
            symptoms: 'Nightly batch job SM37 shows status CANCELLED with error code ABAP/4.',
            rootCause: 'Insufficient background work processes available during peak load window.',
            resolution: 'Increase background work processes via RZ10 and reschedule job to off-peak window.',
            prevention: 'Monitor work process utilization weekly and adjust job schedules accordingly.',
            troubleshootingSteps: [
              'Check job log in SM37',
              'Review ST22 for dumps',
              'Verify available background work processes in SM50',
              'Reschedule or increase resources',
            ],
            owner: owner._id,
            contributors: [owner._id],
            status: 'Published',
            views: 128,
            helpful: 24,
            unhelpful: 2,
            tags: ['sap', 'batch-job', 'performance'],
            version: 1,
          },
          {
            title: 'Salesforce CRM: Login Access Denied After SSO Migration',
            description: 'Resolving login failures after single sign-on migration.',
            application: 'Salesforce CRM',
            symptoms: 'Users report "Access Denied" when logging in via company SSO portal.',
            rootCause: 'SAML assertion mapping misconfigured after identity provider update.',
            resolution: 'Re-map SAML attributes in Salesforce Setup > Single Sign-On Settings.',
            prevention: 'Add regression test to SSO change management checklist.',
            troubleshootingSteps: [
              'Confirm user exists in Salesforce',
              'Check SAML assertion validation logs',
              'Compare IdP metadata with Salesforce SSO config',
              'Update attribute mappings and retest',
            ],
            owner: owner._id,
            contributors: [owner._id],
            status: 'Published',
            views: 76,
            helpful: 15,
            unhelpful: 1,
            tags: ['salesforce', 'sso', 'authentication'],
            version: 1,
          },
          {
            title: 'ServiceNow: Incident Auto-Assignment Not Working',
            description: 'Fixing broken assignment rules for incoming incidents.',
            application: 'ServiceNow',
            symptoms: 'New incidents remain unassigned despite active assignment rules.',
            rootCause: 'Assignment rule condition referenced a deprecated field after a platform upgrade.',
            resolution: 'Update assignment rule conditions to use the current field references and reactivate.',
            prevention: 'Add assignment rules to upgrade regression test suite.',
            troubleshootingSteps: [
              'Open Assignment Rules list',
              'Check condition builder for broken references',
              'Update field references',
              'Test with a sample incident',
            ],
            owner: owner._id,
            contributors: [owner._id],
            status: 'Published',
            views: 41,
            helpful: 9,
            unhelpful: 0,
            tags: ['servicenow', 'automation', 'incident-management'],
            version: 1,
          },
        ];
        await KnowledgeArticle.insertMany(articles);
        console.log(`  ✅ Created ${articles.length} sample articles`);
      } else {
        console.log('  ⏭️  Articles already exist, skipping');
      }
    }

    // 4. Tickets
    if (owner) {
      console.log('🎫 Seeding tickets...');
      const ticketCount = await Ticket.countDocuments();
      if (ticketCount === 0) {
        const tickets = [
          {
            ticketNumber: 'TCK-1001',
            title: 'SAP batch job failing every night',
            description: 'The nightly inventory sync batch job has failed for 3 consecutive nights.',
            application: 'SAP ERP',
            status: 'Open',
            severity: 'High',
            assignee: (engineer || owner)._id,
            reporter: (lead || owner)._id,
            workTimeLogged: 2,
          },
          {
            ticketNumber: 'TCK-1002',
            title: 'Users cannot log into Salesforce via SSO',
            description: 'Multiple users report Access Denied errors after SSO migration.',
            application: 'Salesforce CRM',
            status: 'InProgress',
            severity: 'Critical',
            assignee: (engineer || owner)._id,
            reporter: (manager || owner)._id,
            workTimeLogged: 4,
          },
          {
            ticketNumber: 'TCK-1003',
            title: 'ServiceNow incidents not auto-assigning',
            description: 'New incidents are staying in the unassigned queue.',
            application: 'ServiceNow',
            status: 'Resolved',
            severity: 'Medium',
            assignee: (lead || owner)._id,
            reporter: (owner)._id,
            workTimeLogged: 3,
          },
          {
            ticketNumber: 'TCK-1004',
            title: 'Confluence page permissions incorrect',
            description: 'Team space pages are visible to users outside the team.',
            application: 'Confluence',
            status: 'Open',
            severity: 'Low',
            assignee: (engineer || owner)._id,
            reporter: (owner)._id,
            workTimeLogged: 0,
          },
        ];
        await Ticket.insertMany(tickets);
        console.log(`  ✅ Created ${tickets.length} sample tickets`);
      } else {
        console.log('  ⏭️  Tickets already exist, skipping');
      }
    }

    // 5. Project (Internal Tracker)
    if (owner) {
      console.log('📊 Seeding projects...');
      const projectCount = await Project.countDocuments();
      if (projectCount === 0) {
        const members = [owner._id];
        if (engineer) members.push(engineer._id);
        if (lead) members.push(lead._id);

        await Project.create({
          name: 'Knowledge Base Migration',
          description: 'Migrate legacy documentation into the new Knowledge Management System.',
          progress: 45,
          status: 'InProgress',
          members,
          owner: owner._id,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        console.log('  ✅ Created sample project');
      } else {
        console.log('  ⏭️  Projects already exist, skipping');
      }
    }

    console.log('\n✅ Sample data seeding complete!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
