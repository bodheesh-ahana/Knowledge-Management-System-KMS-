require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define schemas inline
const LearningApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: String,
  color: { type: String, default: '#3b82f6' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const LearningModuleSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningApplication', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const LearningLessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningModule', required: true },
  title: { type: String, required: true },
  objective: { type: String, required: true },
  businessPurpose: String,
  concepts: [String],
  content: { type: String, required: true },
  importantNotes: [String],
  commonMistakes: [String],
  relatedKBIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeArticle' }],
  practicalExercise: {
    title: String,
    instructions: [String],
    requiresScreenshot: { type: Boolean, default: false },
  },
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
    }],
  },
  order: { type: Number, default: 0 },
  estimatedDuration: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Create models
const LearningApplication = mongoose.model('LearningApplication', LearningApplicationSchema);
const LearningModule = mongoose.model('LearningModule', LearningModuleSchema);
const LearningLesson = mongoose.model('LearningLesson', LearningLessonSchema);

async function seedLearningData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing learning data
    await LearningApplication.deleteMany({});
    await LearningModule.deleteMany({});
    await LearningLesson.deleteMany({});
    console.log('Cleared existing learning data');

    console.log('Starting learning data seed...');

    // Create CCH Axcess Application
    const application = await LearningApplication.create({
      name: 'CCH Axcess',
      description: 'Comprehensive tax preparation and workflow management platform for CPA firms',
      icon: 'account_balance',
      color: '#0066cc',
      order: 1,
      isActive: true,
    });
    const applicationId = application._id;
    console.log('Created CCH Axcess application:', applicationId);

    // Module 1: Introduction
    const module1 = await LearningModule.create({
      applicationId,
      name: 'Module 1: Introduction',
      description: 'Learn what CCH Axcess is, why CPA firms use it, and get familiar with the interface',
      order: 1,
      isActive: true,
    });
    const module1Id = module1._id;
    console.log('Created Module 1:', module1Id);

    // Module 1 Lessons
    await LearningLesson.create([
      {
        moduleId: module1Id,
        title: 'What is CCH Axcess?',
        objective: 'Understand the purpose and main features of CCH Axcess',
        businessPurpose: 'CCH Axcess is the primary tax preparation platform used by CPA firms to manage client tax returns, workflows, and compliance.',
        concepts: [
          'Cloud-based tax platform',
          'Integration with tax research',
          'Workflow management',
          'Client collaboration tools',
        ],
        content: `CCH Axcess is a comprehensive cloud-based tax preparation platform designed specifically for CPA firms.

Key Features:
- Tax Return Preparation: Supports federal and state tax returns for individuals and businesses
- Workflow Management: Streamlines the tax preparation process from client intake to filing
- Document Management: Centralized storage for tax documents and client files
- Collaboration Tools: Enables secure client communication and document sharing
- Integration: Seamlessly integrates with CCH tax research tools

Why CPA Firms Use It:
- Industry-leading tax calculation engine
- Regular updates for tax law changes
- Secure cloud infrastructure
- Mobile access for client work
- Comprehensive audit trail`,
        importantNotes: [
          'CCH Axcess is cloud-based, requiring internet access',
          'Multi-factor authentication is required for security',
          'Tax updates are applied automatically',
          'Client data is encrypted at rest and in transit',
        ],
        commonMistakes: [
          'Not saving work frequently - auto-save is enabled but manual saves are recommended',
          'Forgetting to check for software updates before complex returns',
          'Not using the proper user role for specific tasks',
        ],
        estimatedDuration: 20,
        order: 1,
        isActive: true,
      },
      {
        moduleId: module1Id,
        title: 'Login and Navigation',
        objective: 'Learn how to log in to CCH Axcess and navigate the interface',
        businessPurpose: 'Efficient navigation is essential for daily productivity in tax preparation workflows.',
        concepts: [
          'Dashboard',
          'Client Manager',
          'Return Manager',
          'Tools menu',
          'Search functionality',
        ],
        content: `Logging In:
1. Navigate to the CCH Axcess login page
2. Enter your username and password
3. Complete multi-factor authentication if prompted
4. You will be directed to the Dashboard

Dashboard Overview:
- Recent Returns: Quick access to recently worked on returns
- Notifications: Alerts for updates, deadlines, and messages
- Quick Actions: Common tasks like creating new returns
- Performance Metrics: Your productivity statistics`,
        importantNotes: [
          'Bookmark the login page for quick access',
          'Use the "Remember me" option only on secure devices',
          'The dashboard can be customized to show your preferred widgets',
        ],
        commonMistakes: [
          'Using the wrong login URL - always use the official firm URL',
          'Not checking notifications for important updates',
          'Not using search effectively, leading to manual navigation',
        ],
        estimatedDuration: 25,
        order: 2,
        isActive: true,
      },
    ]);
    console.log('Created Module 1 lessons');

    // Module 2: Business Workflow
    const module2 = await LearningModule.create({
      applicationId,
      name: 'Module 2: Business Workflow',
      description: 'Understand the complete tax return workflow from client intake to filing',
      order: 2,
      isActive: true,
    });
    const module2Id = module2._id;
    console.log('Created Module 2:', module2Id);

    await LearningLesson.create({
      moduleId: module2Id,
      title: 'Tax Return Lifecycle',
      objective: 'Understand the complete workflow of a tax return from creation to filing',
      businessPurpose: 'Understanding the tax return lifecycle ensures proper process adherence and quality control.',
      concepts: [
        'Client Intake',
        'Data Entry',
        'Review Process',
        'Approval',
        'E-filing',
        'Archiving',
      ],
      content: `The Tax Return Workflow:

1. Client Intake
   - Client provides tax documents and information
   - Staff creates client profile in CCH Axcess
   - Documents are uploaded to client folder
   - Initial assessment of return complexity

2. Data Entry
   - Staff enters tax data into appropriate forms
   - System performs automatic calculations
   - Diagnostics check for errors and missing information
   - Preliminary review of calculations

3. Staff Review
   - Preparer reviews their own work
   - Checks for completeness and accuracy
   - Runs diagnostics and addresses issues
   - Submits for reviewer approval`,
      importantNotes: [
        'Each step must be completed before moving to the next',
        'Proper documentation is required at each stage',
        'Client approval is required before e-filing',
        'All returns must go through review process',
      ],
      commonMistakes: [
        'Skipping the review process to save time',
        'Not obtaining client approval before filing',
        'Not documenting client communications',
        'Filing before all diagnostics are resolved',
      ],
      estimatedDuration: 30,
      order: 1,
      isActive: true,
    });
    console.log('Created Module 2 lessons');

    // Module 3: Products Overview
    const module3 = await LearningModule.create({
      applicationId,
      name: 'Module 3: Products Overview',
      description: 'Learn about the different products within the CCH Axcess ecosystem',
      order: 3,
      isActive: true,
    });
    const module3Id = module3._id;
    console.log('Created Module 3:', module3Id);

    await LearningLesson.create({
      moduleId: module3Id,
      title: 'CCH Axcess Products',
      objective: 'Understand the different products available in the CCH Axcess ecosystem',
      businessPurpose: 'Knowing the available products helps in selecting the right tools for specific client needs.',
      concepts: [
        'Axcess Tax',
        'Axcess Document',
        'Axcess Workstream',
        'Axcess Practice',
        'Axcess Portal',
        'Axcess Dashboard',
      ],
      content: `CCH Axcess Product Suite:

Axcess Tax:
- Core tax preparation software
- Supports all federal and state forms
- Automatic calculations and diagnostics
- Integration with tax research tools

Axcess Document:
- Document management system
- Client document storage and organization
- Secure document sharing with clients
- Version control and audit trail

Axcess Workstream:
- Workflow automation
- Task management and assignment
- Deadline tracking
- Process standardization`,
      importantNotes: [
        'Products can be used individually or as an integrated suite',
        'Not all firms use all products',
        'Integration between products enhances efficiency',
        'Each product requires separate licensing',
      ],
      commonMistakes: [
        'Not utilizing integration between products',
        'Using manual processes when automation is available',
        'Not exploring all features of licensed products',
      ],
      estimatedDuration: 25,
      order: 1,
      isActive: true,
    });
    console.log('Created Module 3 lessons');

    // Module 4: Daily Operations
    const module4 = await LearningModule.create({
      applicationId,
      name: 'Module 4: Daily Operations',
      description: 'Learn the common daily tasks performed in CCH Axcess',
      order: 4,
      isActive: true,
    });
    const module4Id = module4._id;
    console.log('Created Module 4:', module4Id);

    await LearningLesson.create([
      {
        moduleId: module4Id,
        title: 'Client Management',
        objective: 'Learn how to manage client information and perform common client-related tasks',
        businessPurpose: 'Efficient client management is fundamental to daily tax preparation operations.',
        concepts: [
          'Creating clients',
          'Searching clients',
          'Editing client information',
          'Client document management',
          'Client communication',
        ],
        content: `Client Management Tasks:

Creating a New Client:
1. Navigate to Client Manager
2. Click "New Client"
3. Enter client information:
   - Name and contact details
   - Tax ID (SSN/EIN)
   - Address and demographics
   - Entity type (individual, business, etc.)
4. Save client profile

Searching for Clients:
- Use the search bar in Client Manager
- Search by name, tax ID, or client ID
- Use filters for location, entity type, or status
- Save frequently used searches`,
        importantNotes: [
          'Always verify client information before creating returns',
          'Keep client profiles updated with current information',
          'Use document folders to organize by tax year',
          'All client communications are logged for compliance',
        ],
        commonMistakes: [
          'Creating duplicate client profiles',
          'Not updating client information regularly',
          'Poor document organization leading to lost files',
          'Not using secure channels for sensitive information',
        ],
        estimatedDuration: 35,
        order: 1,
        isActive: true,
      },
      {
        moduleId: module4Id,
        title: 'Return Management',
        objective: 'Learn how to create, manage, and work with tax returns',
        businessPurpose: 'Return management is the core daily activity in tax preparation.',
        concepts: [
          'Creating returns',
          'Opening existing returns',
          'Data entry',
          'Diagnostics',
          'Printing and exporting',
        ],
        content: `Return Management Tasks:

Creating a New Return:
1. Select client from Client Manager
2. Click "New Return"
3. Select tax year and return type
4. Choose appropriate tax form
5. Begin data entry

Opening Existing Returns:
- Navigate to Return Manager
- Search by client name or return ID
- Filter by tax year or status
- Click to open return

Data Entry Best Practices:
- Enter data in logical order (personal info first)
- Use import features when available (W-2, 1099 imports)
- Save work frequently
- Run diagnostics regularly`,
        importantNotes: [
          'Always select the correct tax year and return type',
          'Use diagnostic tools throughout the process',
          'Save before running complex calculations',
          'Keep backup copies of important returns',
        ],
        commonMistakes: [
          'Selecting wrong tax year or return type',
          'Ignoring diagnostic warnings',
          'Not saving work frequently enough',
          'Printing before final review',
        ],
        estimatedDuration: 40,
        order: 2,
        isActive: true,
      },
    ]);
    console.log('Created Module 4 lessons');

    // Module 5: Common Tasks
    const module5 = await LearningModule.create({
      applicationId,
      name: 'Module 5: Common Tasks',
      description: 'Master the most frequently performed tasks in CCH Axcess',
      order: 5,
      isActive: true,
    });
    const module5Id = module5._id;
    console.log('Created Module 5:', module5Id);

    await LearningLesson.create([
      {
        moduleId: module5Id,
        title: 'Importing Tax Documents',
        objective: 'Learn how to import W-2s, 1099s, and other tax documents',
        businessPurpose: 'Importing documents saves time and reduces data entry errors.',
        concepts: [
          'W-2 import',
          '1099 import',
          'Document upload',
          'Data verification',
        ],
        content: `Importing Tax Documents:

W-2 Import:
1. Open the appropriate return
2. Navigate to W-2 section
3. Click "Import W-2"
4. Enter employer EIN or select from list
5. System retrieves W-2 data
6. Verify imported data for accuracy
7. Save or correct as needed

1099 Import:
1. Navigate to 1099 section
2. Click "Import 1099"
3. Select payer from list or enter payer info
4. Import data for each 1099 type
5. Review and verify all imported data
6. Address any import errors`,
        importantNotes: [
          'Import features are available for most common tax forms',
          'Not all employers participate in electronic W-2 programs',
          'Manual entry may be required for some documents',
          'Always keep source documents for audit purposes',
        ],
        commonMistakes: [
          'Not verifying imported data',
          'Importing to wrong tax year',
          'Not categorizing uploaded documents',
          'Overwriting existing data without confirmation',
        ],
        estimatedDuration: 30,
        order: 1,
        isActive: true,
      },
      {
        moduleId: module5Id,
        title: 'Running Diagnostics',
        objective: 'Learn how to use diagnostic tools to identify and fix errors',
        businessPurpose: 'Diagnostics ensure return accuracy and compliance before filing.',
        concepts: [
          'Diagnostic types',
          'Error resolution',
          'Critical vs. informational',
          'Diagnostic history',
        ],
        content: `Using Diagnostic Tools:

Running Diagnostics:
1. Click "Diagnostics" in the toolbar
2. Select diagnostic type (Federal, State, All)
3. System scans return for issues
4. Results displayed by severity

Diagnostic Types:
- Critical Errors: Must be resolved before filing
- Warnings: Should be reviewed and addressed
- Informational: For awareness, may not require action
- Calculations: Verify calculation accuracy

Resolving Errors:
1. Click on diagnostic message
2. System highlights affected area
3. Review the issue
4. Make necessary corrections
5. Re-run diagnostics to verify fix
6. Document resolution if needed`,
        importantNotes: [
          'Diagnostics cannot catch all errors - manual review is still required',
          'Some warnings may be acceptable with proper documentation',
          'Diagnostic rules update with tax law changes',
          'Save return before running diagnostics',
        ],
        commonMistakes: [
          'Ignoring warnings that seem minor',
          'Not re-running diagnostics after corrections',
          'Not understanding the difference between error types',
          'Relying solely on diagnostics without manual review',
        ],
        estimatedDuration: 25,
        order: 2,
        isActive: true,
      },
    ]);
    console.log('Created Module 5 lessons');

    // Create QuickBooks Application
    const qbApplication = await LearningApplication.create({
      name: 'QuickBooks',
      description: 'Comprehensive accounting and financial management software for businesses of all sizes',
      icon: 'account_balance_wallet',
      color: '#2ca02c',
      order: 2,
      isActive: true,
    });
    const qbApplicationId = qbApplication._id;
    console.log('Created QuickBooks application:', qbApplicationId);

    // QuickBooks Module 1: Introduction
    const qbModule1 = await LearningModule.create({
      applicationId: qbApplicationId,
      name: 'Module 1: Introduction',
      description: 'Learn what QuickBooks is, its editions, and how to get started',
      order: 1,
      isActive: true,
    });
    const qbModule1Id = qbModule1._id;
    console.log('Created QuickBooks Module 1:', qbModule1Id);

    await LearningLesson.create([
      {
        moduleId: qbModule1Id,
        title: 'What is QuickBooks?',
        objective: 'Understand the purpose and main features of QuickBooks',
        businessPurpose: 'QuickBooks is the leading accounting software used by small businesses to manage finances, invoicing, and reporting.',
        concepts: [
          'Accounting software',
          'Financial management',
          'Cloud vs Desktop',
          'Business size suitability',
        ],
        content: `QuickBooks is comprehensive accounting software designed for small to medium-sized businesses.

Key Features:
- Invoicing and payments
- Expense tracking
- Financial reporting
- Tax preparation
- Payroll management
- Inventory tracking
- Bank reconciliation

Why Businesses Use It:
- User-friendly interface
- Automated bookkeeping
- Real-time financial insights
- Integration with banking systems
- Tax compliance features
- Scalable for business growth

QuickBooks Editions:
- Pro: Basic accounting for small businesses
- Premier: Industry-specific features
- Enterprise: Advanced features for larger businesses
- Online: Cloud-based with mobile access`,
        importantNotes: [
          'QuickBooks Online requires internet connection',
          'Desktop versions have one-time licensing',
          'Online versions have monthly subscriptions',
          'Data syncs automatically in Online version',
        ],
        commonMistakes: [
          'Choosing wrong edition for business needs',
          'Not setting up preferences correctly initially',
          'Not backing up data regularly (Desktop)',
          'Not using automatic bank feeds',
        ],
        estimatedDuration: 20,
        order: 1,
        isActive: true,
      },
      {
        moduleId: qbModule1Id,
        title: 'QuickBooks Editions',
        objective: 'Understand the differences between QuickBooks Pro, Premier, Enterprise, and Online',
        businessPurpose: 'Selecting the right edition ensures you have the features needed for your business.',
        concepts: [
          'QuickBooks Pro',
          'QuickBooks Premier',
          'QuickBooks Enterprise',
          'QuickBooks Online',
        ],
        content: `QuickBooks Editions Comparison:

QuickBooks Pro:
- Best for small businesses
- Basic accounting features
- Up to 3 users
- Desktop installation
- One-time purchase

QuickBooks Premier:
- Industry-specific versions (Contractor, Retail, Nonprofit, etc.)
- Advanced reporting
- Up to 5 users
- Desktop installation
- One-time purchase

QuickBooks Enterprise:
- For larger businesses
- Advanced inventory
- Up to 30 users
- Custom reporting
- Desktop installation
- Annual subscription

QuickBooks Online:
- Cloud-based access
- Mobile apps
- Automatic updates
- Multiple user tiers
- Monthly subscription
- Bank feeds integration`,
        importantNotes: [
          'Online versions include automatic updates',
          'Desktop versions require manual updates',
          'Data migration between editions requires planning',
          'Online has limited features compared to Enterprise',
        ],
        commonMistakes: [
          'Overbuying features you won\'t use',
          'Underbuying and needing to upgrade later',
          'Not considering user limits',
          'Not evaluating integration needs',
        ],
        estimatedDuration: 25,
        order: 2,
        isActive: true,
      },
    ]);
    console.log('Created QuickBooks Module 1 lessons');

    // QuickBooks Module 2: Company File
    const qbModule2 = await LearningModule.create({
      applicationId: qbApplicationId,
      name: 'Module 2: Company File',
      description: 'Learn how to create and manage QuickBooks company files',
      order: 2,
      isActive: true,
    });
    const qbModule2Id = qbModule2._id;
    console.log('Created QuickBooks Module 2:', qbModule2Id);

    await LearningLesson.create({
      moduleId: qbModule2Id,
      title: 'Creating and Managing Company Files',
      objective: 'Learn how to create, backup, and restore QuickBooks company files',
      businessPurpose: 'Proper company file management ensures data security and business continuity.',
      concepts: [
        'Company file creation',
        'Backup procedures',
        'Restore process',
        'File maintenance',
      ],
      content: `Company File Management:

Creating a New Company File:
1. Open QuickBooks
2. Select "Create New Company"
3. Enter business information:
   - Company name
   - Industry type
   - Business type
   - Tax ID
   - Fiscal year start
4. Set up preferences
5. Create chart of accounts

Backing Up Company Files:
- Desktop: File → Backup Company → Create Backup
- Online: Automatic cloud backup
- Schedule regular backups
- Store backups in multiple locations

Restoring Company Files:
1. File → Open or Restore Company
2. Select "Restore a backup copy"
3. Browse to backup location
4. Select backup file
5. Choose restore location
6. Verify data after restore

File Maintenance:
- Run Verify Data regularly
- Run Rebuild Data if issues found
- Condense data if file is large
- Archive old transactions`,
        importantNotes: [
          'Always backup before major changes',
          'Test restore procedures regularly',
          'Keep multiple backup versions',
          'Document backup locations',
        ],
        commonMistakes: [
          'Not backing up regularly',
          'Storing backups only on same computer',
          'Not testing restore procedures',
          'Ignoring file maintenance warnings',
        ],
        estimatedDuration: 30,
        order: 1,
        isActive: true,
    });
    console.log('Created QuickBooks Module 2 lessons');

    // QuickBooks Module 3: Interface
    const qbModule3 = await LearningModule.create({
      applicationId: qbApplicationId,
      name: 'Module 3: Interface',
      description: 'Learn to navigate the QuickBooks interface and understand key areas',
      order: 3,
      isActive: true,
    });
    const qbModule3Id = qbModule3._id;
    console.log('Created QuickBooks Module 3:', qbModule3Id);

    await LearningLesson.create({
      moduleId: qbModule3Id,
      title: 'QuickBooks Interface Navigation',
      objective: 'Learn to navigate the QuickBooks interface and understand key areas',
      businessPurpose: 'Efficient navigation is essential for daily accounting tasks.',
      concepts: [
        'Home screen',
        'Left navigation bar',
        'Top menu bar',
        'Customer center',
        'Vendor center',
        'Banking center',
      ],
      content: `QuickBooks Interface Overview:

Home Screen:
- Dashboard with key metrics
- Quick actions for common tasks
- Recent transactions
- Alerts and notifications

Left Navigation Bar:
- Dashboard: Overview of business finances
- Banking: Bank accounts, transfers, reconciliation
- Sales: Invoices, sales receipts, customers
- Expenses: Vendors, bills, expenses
- Reports: Financial and management reports
- Taxes: Sales tax, payroll tax
- Employees: Payroll, employee management
- Settings: Company settings, preferences

Top Menu Bar:
- File: Company file operations
- Edit: Cut, copy, paste, find
- View: Customize interface
- Lists: Customer, vendor, item lists
- Reports: Report center
- Window: Multiple windows management
- Help: Support and resources

Key Centers:
- Customer Center: Manage customer information
- Vendor Center: Manage vendor relationships
- Banking Center: Bank feeds and reconciliation`,
        importantNotes: [
          'Interface varies between Desktop and Online',
          'Customize dashboard for your needs',
          'Use keyboard shortcuts for efficiency',
          'Pin frequently used reports',
        ],
        commonMistakes: [
          'Not customizing the dashboard',
          'Not using keyboard shortcuts',
          'Not exploring all navigation options',
          'Getting lost in complex menus',
        ],
        estimatedDuration: 25,
        order: 1,
        isActive: true,
    });
    console.log('Created QuickBooks Module 3 lessons');

    // QuickBooks Module 4: Daily Operations
    const qbModule4 = await LearningModule.create({
      applicationId: qbApplicationId,
      name: 'Module 4: Daily Operations',
      description: 'Learn common daily tasks in QuickBooks',
      order: 4,
      isActive: true,
    });
    const qbModule4Id = qbModule4._id;
    console.log('Created QuickBooks Module 4:', qbModule4Id);

    await LearningLesson.create([
      {
        moduleId: qbModule4Id,
        title: 'Customer Management',
        objective: 'Learn how to manage customers and process sales',
        businessPurpose: 'Customer management is fundamental to accounts receivable and revenue tracking.',
        concepts: [
          'Adding customers',
          'Creating invoices',
          'Sales receipts',
          'Payments',
          'Statements',
        ],
        content: `Customer Management Tasks:

Adding Customers:
1. Go to Customers → Customer Center
2. Click "New Customer"
3. Enter customer information:
   - Name and contact details
   - Billing address
   - Shipping address
   - Payment terms
   - Tax settings
4. Save customer record

Creating Invoices:
1. Customers → Create Invoices
2. Select customer
3. Add line items:
   - Product/service
   - Quantity
   - Rate
   - Description
4. Set terms and due date
5. Review and send

Processing Payments:
1. Customers → Receive Payments
2. Select customer
3. Enter payment amount
4. Select payment method
5. Apply to open invoices
6. Deposit to bank account

Sending Statements:
1. Customers → Create Statements
2. Select customers
3. Choose statement period
4. Review and send`,
        importantNotes: [
          'Keep customer information updated',
          'Use consistent naming conventions',
          'Set appropriate payment terms',
          'Send invoices promptly',
        ],
        commonMistakes: [
          'Creating duplicate customer records',
          'Not updating customer information',
          'Incorrect payment terms',
          'Not following up on overdue invoices',
        ],
        estimatedDuration: 35,
        order: 1,
        isActive: true,
      },
      {
        moduleId: qbModule4Id,
        title: 'Vendor Management',
        objective: 'Learn how to manage vendors and process expenses',
        businessPurpose: 'Vendor management is essential for accounts payable and expense tracking.',
        concepts: [
          'Adding vendors',
          'Creating bills',
          'Writing checks',
          'Vendor credits',
          '1099 tracking',
        ],
        content: `Vendor Management Tasks:

Adding Vendors:
1. Go to Vendors → Vendor Center
2. Click "New Vendor"
3. Enter vendor information:
   - Name and contact details
   - Address
   - Tax ID (for 1099)
   - Payment terms
   - Account number
4. Save vendor record

Creating Bills:
1. Vendors → Enter Bills
2. Select vendor
3. Enter bill details:
   - Date
   - Due date
   - Bill number
   - Expense items
   - Amount
4. Save bill

Writing Checks:
1. Banking → Write Checks
2. Select bank account
3. Select payee (vendor)
4. Enter check details:
   - Date
   - Check number
   - Amount
   - Expense account
5. Save and print

Managing 1099 Vendors:
- Mark vendors eligible for 1099
- Track payments throughout year
- Generate 1099 forms at year-end
- File with IRS`,
        importantNotes: [
          'Track 1099-eligible vendors separately',
          'Enter bills when received, not when paid',
          'Reconcile vendor statements regularly',
          'Keep vendor information current',
        ],
        commonMistakes: [
          'Not entering bills timely',
          'Incorrect expense account assignment',
          'Missing 1099 eligibility',
          'Not reconciling vendor accounts',
        ],
        estimatedDuration: 35,
        order: 2,
        isActive: true,
      },
    ]);
    console.log('Created QuickBooks Module 4 lessons');

    // QuickBooks Module 5: Banking
    const qbModule5 = await LearningModule.create({
      applicationId: qbApplicationId,
      name: 'Module 5: Banking',
      description: 'Learn to manage bank accounts and perform reconciliations',
      order: 5,
      isActive: true,
    });
    const qbModule5Id = qbModule5._id;
    console.log('Created QuickBooks Module 5:', qbModule5Id);

    await LearningLesson.create([
      {
        moduleId: qbModule5Id,
        title: 'Bank Feeds and Transactions',
        objective: 'Learn how to set up bank feeds and manage bank transactions',
        businessPurpose: 'Bank feeds automate transaction entry and improve accuracy.',
        concepts: [
          'Bank feed setup',
          'Transaction matching',
          'Categorization',
          'Rules',
        ],
        content: `Bank Feeds Setup:

Setting Up Bank Feeds:
1. Banking → Bank Feeds
2. Select "Connect Account"
3. Search for your bank
4. Enter login credentials
5. Select accounts to connect
6. Choose download period

Managing Bank Transactions:
- Transactions download automatically
- Review each transaction
- Match to existing records:
  - Invoices (customer payments)
  - Bills (vendor payments)
  - Transfers
- Add new transactions if needed
- Exclude personal transactions

Creating Transaction Rules:
1. Banking → Rules
2. Create new rule
3. Set conditions:
  - Description contains
  - Amount range
  - Payee
4. Set actions:
  - Transaction type
  - Account
  - Payee
5. Save rule

Best Practices:
- Review transactions daily
- Categorize consistently
- Use rules for recurring transactions
- Reconcile monthly`,
        importantNotes: [
          'Bank feeds require bank participation',
          'Not all banks support feeds',
          'Security credentials are encrypted',
          'Feeds may have delays',
        ],
        commonMistakes: [
          'Not reviewing downloaded transactions',
          'Incorrect categorization',
          'Not setting up rules for recurring items',
          'Ignoring unmatched transactions',
        ],
        estimatedDuration: 30,
        order: 1,
        isActive: true,
      },
      {
        moduleId: qbModule5Id,
        title: 'Bank Reconciliation',
        objective: 'Learn how to reconcile bank accounts in QuickBooks',
        businessPurpose: 'Reconciliation ensures QuickBooks matches actual bank statements.',
        concepts: [
          'Reconciliation process',
          'Beginning balance',
          'Ending balance',
          'Discrepancies',
        ],
        content: `Bank Reconciliation Process:

Starting Reconciliation:
1. Banking → Reconcile
2. Select bank account
3. Enter statement information:
   - Statement date
   - Ending balance
   - Service charges
   - Interest earned
4. Click "Start Reconcile"

Matching Transactions:
- Mark transactions that appear on statement
- Check off:
  - Deposits
  - Checks
  - Payments
  - Transfers
- Compare to statement line by line

Handling Discrepancies:
- Difference should be zero when complete
- Common causes:
  - Missing transactions
  - Incorrect amounts
  - Duplicate entries
  - Bank errors
- Investigate and correct before finishing

Completing Reconciliation:
1. Verify difference is zero
2. Click "Finish Now"
3. Print reconciliation report
4. Save for records

Tips:
- Reconcile monthly
- Keep statements organized
- Investigate small differences
- Use reconciliation reports for audits`,
        importantNotes: [
          'Reconciliation is critical for accuracy',
          'Don\'t force finish with discrepancies',
          'Keep reconciliation reports',
          'Reconcile all bank accounts',
        ],
        commonMistakes: [
          'Not reconciling monthly',
          'Ignoring small differences',
          'Forcing finish with discrepancies',
          'Not keeping reconciliation reports',
        ],
        estimatedDuration: 30,
        order: 2,
        isActive: true,
      },
    ]);
    console.log('Created QuickBooks Module 5 lessons');

    // CCH Axcess Module 6: Advanced Topics
    const module6 = await LearningModule.create({
      applicationId,
      name: 'Module 6: Advanced Topics',
      description: 'Learn advanced features and troubleshooting in CCH Axcess',
      order: 6,
      isActive: true,
    });
    const module6Id = module6._id;
    console.log('Created CCH Axcess Module 6:', module6Id);

    await LearningLesson.create([
      {
        moduleId: module6Id,
        title: 'Advanced Diagnostics',
        objective: 'Learn to use advanced diagnostic tools and resolve complex issues',
        businessPurpose: 'Advanced diagnostics help resolve complex return issues that basic diagnostics cannot identify.',
        concepts: [
          'Advanced diagnostic rules',
          'Custom diagnostics',
          'Diagnostic history',
          'Error codes',
        ],
        content: `Advanced Diagnostics:

Custom Diagnostic Rules:
- Create custom rules for firm-specific requirements
- Set up automatic checks for common issues
- Configure diagnostic severity levels
- Create diagnostic templates

Error Code Reference:
- Common error codes and their meanings
- Resolution procedures for each error type
- When to escalate to support
- Documenting error resolutions

Diagnostic Best Practices:
- Run diagnostics at each workflow stage
- Document all diagnostic results
- Track recurring errors for patterns
- Use diagnostic history for audit trails

Advanced Troubleshooting:
- System-generated vs. user errors
- Data corruption issues
- Calculation errors
- Form compatibility issues`,
        importantNotes: [
          'Custom diagnostics require admin access',
          'Test custom rules before production use',
          'Keep error code documentation updated',
          'Escalate unresolved errors promptly',
        ],
        commonMistakes: [
          'Ignoring diagnostic warnings',
          'Not documenting error resolutions',
          'Overlooking pattern in recurring errors',
          'Not using custom diagnostic features',
        ],
        estimatedDuration: 35,
        order: 1,
        isActive: true,
      },
      {
        moduleId: module6Id,
        title: 'Performance Optimization',
        objective: 'Learn to optimize CCH Axcess performance for large firms',
        businessPurpose: 'Performance optimization ensures smooth operation during peak tax season.',
        concepts: [
          'System performance',
          'Database optimization',
          'Network configuration',
          'Resource management',
        ],
        content: `Performance Optimization:

System Performance:
- Monitor system resources during peak times
- Identify performance bottlenecks
- Optimize database indexes
- Manage concurrent user limits

Database Optimization:
- Regular database maintenance
- Archive old returns
- Optimize data storage
- Clean up temporary files

Network Configuration:
- Optimize network settings
- Configure bandwidth allocation
- Set up caching strategies
- Manage connection pooling

Resource Management:
- Balance server load
- Optimize memory usage
- Manage disk space
- Schedule maintenance windows`,
        importantNotes: [
          'Performance testing before tax season',
          'Monitor metrics regularly',
          'Have backup systems ready',
          'Document optimization changes',
        ],
        commonMistakes: [
          'Not monitoring performance metrics',
          'Ignoring early warning signs',
          'Making changes during peak season',
          'Not testing optimization changes',
        ],
        estimatedDuration: 30,
        order: 2,
        isActive: true,
      },
    ]);
    console.log('Created CCH Axcess Module 6 lessons');

    // CCH Axcess Module 7: Administration
    const module7 = await LearningModule.create({
      applicationId,
      name: 'Module 7: Administration',
      description: 'Learn administrative tasks and user management in CCH Axcess',
      order: 7,
      isActive: true,
    });
    const module7Id = module7._id;
    console.log('Created CCH Axcess Module 7:', module7Id);

    await LearningLesson.create([
      {
        moduleId: module7Id,
        title: 'User Management',
        objective: 'Learn to manage users, roles, and permissions in CCH Axcess',
        businessPurpose: 'Proper user management ensures security and appropriate access levels.',
        concepts: [
          'User roles',
          'Permissions',
          'User provisioning',
          'Access control',
        ],
        content: `User Management:

User Roles:
- Administrator: Full system access
- Manager: Administrative functions
- Preparer: Return preparation
- Reviewer: Return review
- Partner: Final approval
- View Only: Read-only access

Creating Users:
1. Navigate to Administration
2. Click "Add User"
3. Enter user information
4. Assign appropriate role
5. Set permissions
6. Send activation email

Managing Permissions:
- Role-based access control
- Feature-level permissions
- Client access restrictions
- Data access limitations

User Maintenance:
- Regular user access reviews
- Update roles as needed
- Deactivate inactive users
- Audit user activity logs`,
        importantNotes: [
          'Follow principle of least privilege',
          'Regular permission audits',
          'Document role assignments',
          'Monitor user activity',
        ],
        commonMistakes: [
          'Over-assigning permissions',
          'Not deactivating former employees',
          'Not reviewing access regularly',
          'Sharing user credentials',
        ],
        estimatedDuration: 30,
        order: 1,
        isActive: true,
      },
      {
        moduleId: module7Id,
        title: 'System Configuration',
        objective: 'Learn to configure CCH Axcess settings for your firm',
        businessPurpose: 'Proper system configuration ensures CCH Axcess meets firm-specific requirements.',
        concepts: [
          'Firm settings',
          'Preferences',
          'Integrations',
          'Security settings',
        ],
        content: `System Configuration:

Firm Settings:
- Firm information and branding
- Contact details
- Tax preparer information
- E-file credentials

Preferences:
- Default settings for returns
- Interface customization
- Notification preferences
- Workflow configurations

Integrations:
- Tax research integration
- Document management
- Practice management
- Client portals

Security Settings:
- Password policies
- Multi-factor authentication
- Session timeout settings
- Audit trail configuration`,
        importantNotes: [
          'Test configuration changes in sandbox',
          'Document all configuration changes',
          'Regular security audits',
          'Backup configuration settings',
        ],
        commonMistakes: [
          'Changing settings without testing',
          'Not documenting changes',
          'Over-customizing preferences',
          'Ignoring security best practices',
        ],
        estimatedDuration: 35,
        order: 2,
        isActive: true,
      },
    ]);
    console.log('Created CCH Axcess Module 7 lessons');

    // CCH Axcess Module 8: Reporting
    const module8 = await LearningModule.create({
      applicationId,
      name: 'Module 8: Reporting',
      description: 'Learn to generate and analyze reports in CCH Axcess',
      order: 8,
      isActive: true,
    });
    const module8Id = module8._id;
    console.log('Created CCH Axcess Module 8:', module8Id);

    await LearningLesson.create({
      moduleId: module8Id,
      title: 'Firm Reporting',
      objective: 'Learn to generate and analyze firm-level reports',
      businessPurpose: 'Firm reports provide insights into productivity and performance metrics.',
      concepts: [
        'Productivity reports',
        'Workload analysis',
        'Performance metrics',
        'Custom reports',
      ],
      content: `Firm Reporting:

Productivity Reports:
- Returns prepared by staff
- Time spent per return
- Review cycle times
- E-filing success rates

Workload Analysis:
- Peak period analysis
- Resource utilization
- Client distribution
- Return type breakdown

Performance Metrics:
- Staff productivity rankings
- Error rates by preparer
- Client satisfaction metrics
- Revenue per return

Custom Reports:
- Report builder tools
- Custom calculations
- Data filtering
- Report scheduling

Report Distribution:
- Automated report delivery
- Email notifications
- Dashboard integration
- Export options`,
        importantNotes: [
          'Regular report review meetings',
          'Use reports for strategic planning',
          'Compare year-over-year metrics',
          'Share reports with stakeholders',
        ],
        commonMistakes: [
          'Not reviewing reports regularly',
          'Ignoring negative trends',
          'Not acting on report insights',
          'Overloading with too many reports',
        ],
        estimatedDuration: 30,
        order: 1,
        isActive: true,
    });
    console.log('Created CCH Axcess Module 8 lessons');

    // CCH Axcess Module 9: Best Practices
    const module9 = await LearningModule.create({
      applicationId,
      name: 'Module 9: Best Practices',
      description: 'Learn industry best practices for using CCH Axcess',
      order: 9,
      isActive: true,
    });
    const module9Id = module9._id;
    console.log('Created CCH Axcess Module 9:', module9Id);

    await LearningLesson.create([
      {
        moduleId: module9Id,
        title: 'Tax Season Preparation',
        objective: 'Learn best practices for preparing for tax season',
        businessPurpose: 'Proper tax season preparation ensures smooth operations during peak periods.',
        concepts: [
          'Pre-season planning',
          'Resource allocation',
          'System preparation',
          'Staff training',
        ],
        content: `Tax Season Preparation:

Pre-Season Planning:
- Review previous season performance
- Identify improvement areas
- Set season goals and metrics
- Create contingency plans

Resource Allocation:
- Staff scheduling
- Workload distribution
- Backup systems
- Support resources

System Preparation:
- Software updates and patches
- Performance testing
- Capacity planning
- Backup verification

Staff Training:
- Refresher training sessions
- New feature training
- Process reviews
- Quality standards

Communication Plan:
- Client communication strategy
- Internal communication protocols
- Escalation procedures
- Status reporting`,
        importantNotes: [
          'Start preparation 2-3 months before season',
          'Test all systems before peak period',
          'Have backup plans for critical systems',
          'Regular check-ins during season',
        ],
        commonMistakes: [
          'Starting preparation too late',
          'Not testing systems thoroughly',
          'Overloading staff during peak',
          'Poor communication during season',
        ],
        estimatedDuration: 30,
        order: 1,
        isActive: true,
      },
      {
        moduleId: module9Id,
        title: 'Quality Control',
        objective: 'Learn quality control best practices for tax preparation',
        businessPurpose: 'Quality control ensures accuracy and compliance in tax preparation.',
        concepts: [
          'Review processes',
          'Quality standards',
          'Error prevention',
          'Continuous improvement',
        ],
        content: `Quality Control:

Review Processes:
- Multi-level review structure
- Review checklists
- Random quality audits
- Peer review programs

Quality Standards:
- Accuracy targets
- Completeness requirements
- Documentation standards
- Compliance guidelines

Error Prevention:
- Root cause analysis
- Process improvements
- Training interventions
- System enhancements

Continuous Improvement:
- Regular process reviews
- Feedback collection
- Best practice sharing
- Industry benchmarking`,
        importantNotes: [
          'Quality is everyone\'s responsibility',
          'Document all quality issues',
          'Regular training on quality standards',
          'Celebrate quality achievements',
        ],
        commonMistakes: [
          'Rushing reviews during peak season',
          'Not documenting quality issues',
          'Ignoring root causes of errors',
          'Not investing in quality improvement',
        ],
        estimatedDuration: 30,
        order: 2,
        isActive: true,
      },
    ]);
    console.log('Created CCH Axcess Module 9 lessons');

    // CCH Axcess Module 10: Assessment
    const module10 = await LearningModule.create({
      applicationId,
      name: 'Module 10: Assessment',
      description: 'Complete assessment to test your CCH Axcess knowledge',
      order: 10,
      isActive: true,
    });
    const module10Id = module10._id;
    console.log('Created CCH Axcess Module 10:', module10Id);

    await LearningLesson.create({
      moduleId: module10Id,
      title: 'CCH Axcess Knowledge Assessment',
      objective: 'Test your comprehensive knowledge of CCH Axcess',
      businessPurpose: 'This assessment validates your readiness to support CCH Axcess users.',
      concepts: [
        'Comprehensive knowledge test',
        'Practical scenarios',
        'Troubleshooting skills',
        'Best practices',
      ],
      content: `Assessment Overview:

This comprehensive assessment covers all modules:
- Module 1: Introduction
- Module 2: Business Workflow
- Module 3: Products Overview
- Module 4: Daily Operations
- Module 5: Common Tasks
- Module 6: Advanced Topics
- Module 7: Administration
- Module 8: Reporting
- Module 9: Best Practices

Assessment Format:
- Multiple choice questions
- Scenario-based questions
- Practical exercises
- Troubleshooting scenarios

Passing Criteria:
- Minimum 80% score required
- Must complete all sections
- Practical exercises must be submitted
- Time limit: 90 minutes

Preparation Tips:
- Review all module content
- Practice with sample scenarios
- Complete all module exercises
- Review important notes and common mistakes`,
        importantNotes: [
          'Assessment can be retaken if failed',
          'Use open-book resources during practice',
          'Time yourself during practice',
          'Focus on weak areas',
        ],
        commonMistakes: [
          'Not reviewing all modules',
          'Rushing through assessment',
          'Not practicing scenarios',
          'Ignoring time management',
        ],
        estimatedDuration: 90,
        order: 1,
        isActive: true,
    });
    console.log('Created CCH Axcess Module 10 lessons');

    // QuickBooks Module 6: Reports
    const qbModule6 = await LearningModule.create({
      applicationId: qbApplicationId,
      name: 'Module 6: Reports',
      description: 'Learn to generate and analyze QuickBooks reports',
      order: 6,
      isActive: true,
    });
    const qbModule6Id = qbModule6._id;
    console.log('Created QuickBooks Module 6:', qbModule6Id);

    await LearningLesson.create([
      {
        moduleId: qbModule6Id,
        title: 'Financial Reports',
        objective: 'Learn to generate and analyze key financial reports',
        businessPurpose: 'Financial reports provide insights into business performance and financial health.',
        concepts: [
          'Balance Sheet',
          'Profit and Loss',
          'Cash Flow Statement',
          'Statement of Changes in Equity',
        ],
        content: `Financial Reports:

Balance Sheet:
- Assets: Current and fixed
- Liabilities: Current and long-term
- Equity: Owner's equity, retained earnings
- Report customization options
- Comparative periods

Profit and Loss:
- Revenue streams
- Expense categories
- Gross and net profit
- Year-over-year comparisons
- Budget vs actual

Cash Flow Statement:
- Operating activities
- Investing activities
- Financing activities
- Cash position analysis
- Forecasting

Customization:
- Report filters
- Column customization
- Row modifications
- Formatting options
- Memorized reports`,
        importantNotes: [
          'Run financial reports monthly',
          'Compare to previous periods',
          'Use for decision making',
          'Share with stakeholders',
        ],
        commonMistakes: [
          'Not running reports regularly',
          'Ignoring negative trends',
          'Not customizing for business needs',
          'Not understanding report components',
        ],
        estimatedDuration: 35,
        order: 1,
        isActive: true,
      },
      {
        moduleId: qbModule6Id,
        title: 'Management Reports',
        objective: 'Learn to generate management and operational reports',
        businessPurpose: 'Management reports help with business operations and decision making.',
        concepts: [
          'Sales reports',
          'Expense reports',
          'Inventory reports',
          'Custom report builder',
        ],
        content: `Management Reports:

Sales Reports:
- Sales by customer
- Sales by item
- Sales by rep
- Sales trends
- Sales by region

Expense Reports:
- Expenses by vendor
- Expenses by category
- Expense trends
- Budget vs actual
- Unbilled expenses

Inventory Reports:
- Inventory valuation
- Stock status by item
- Physical inventory worksheet
- Inventory shortage
- Sales by item

Custom Reports:
- Report builder interface
- Custom fields and filters
- Calculated fields
- Report grouping
- Report scheduling`,
        importantNotes: [
          'Customize reports for business needs',
          'Schedule regular report runs',
          'Use reports for trend analysis',
          'Share with relevant stakeholders',
        ],
        commonMistakes: [
          'Using default reports only',
          'Not customizing for business',
          'Not analyzing report data',
          'Running too many reports',
        ],
        estimatedDuration: 30,
        order: 2,
        isActive: true,
      },
    ]);
    console.log('Created QuickBooks Module 6 lessons');

    // QuickBooks Module 7: Payroll
    const qbModule7 = await LearningModule.create({
      applicationId: qbApplicationId,
      name: 'Module 7: Payroll',
      description: 'Learn to manage payroll in QuickBooks',
      order: 7,
      isActive: true,
    });
    const qbModule7Id = qbModule7._id;
    console.log('Created QuickBooks Module 7:', qbModule7Id);

    await LearningLesson.create([
      {
        moduleId: qbModule7Id,
        title: 'Payroll Setup',
        objective: 'Learn to set up payroll in QuickBooks',
        businessPurpose: 'Proper payroll setup ensures accurate and compliant payroll processing.',
        concepts: [
          'Payroll service setup',
          'Employee setup',
          'Tax setup',
          'Direct deposit',
        ],
        content: `Payroll Setup:

Payroll Service Setup:
- Activate payroll service
- Choose payroll plan
- Set up payroll administrator
- Configure payroll preferences

Employee Setup:
- Add employee information
- Set up pay rates
- Configure tax information
- Set up deductions and contributions
- Set up direct deposit

Tax Setup:
- Federal tax setup
- State tax setup
- Local tax setup
- Unemployment insurance
- Workers compensation

Direct Deposit:
- Set up direct deposit
- Employee bank information
- Deposit schedules
- Pre-note verification`,
        importantNotes: [
          'Payroll requires active subscription',
          'Keep tax information current',
          'Test payroll before first live run',
          'Comply with all tax regulations',
        ],
        commonMistakes: [
          'Incorrect tax setup',
          'Not updating employee information',
          'Not testing before live payroll',
          'Missing tax filing deadlines',
        ],
        estimatedDuration: 40,
        order: 1,
        isActive: true,
      },
      {
        moduleId: qbModule7Id,
        title: 'Processing Payroll',
        objective: 'Learn to process payroll in QuickBooks',
        businessPurpose: 'Accurate payroll processing ensures employees are paid correctly and on time.',
        concepts: [
          'Payroll runs',
          'Payroll taxes',
          'Pay stubs',
          'Tax filings',
        ],
        content: `Processing Payroll:

Running Payroll:
1. Employees → Payroll Center
2. Select "Run Payroll"
3. Choose pay period
4. Review employee hours
5. Calculate payroll
6. Review and approve
7. Submit payroll

Payroll Taxes:
- Automatic tax calculations
- Tax payment schedules
- Tax filing requirements
- Tax form generation
- Compliance tracking

Pay Stubs:
- Electronic pay stubs
- Pay stub customization
- Pay stub delivery
- Historical pay stubs

Tax Filings:
- Federal tax filings
- State tax filings
- Quarterly filings
- Annual filings
- W-2 and 1099 generation`,
        importantNotes: [
          'Process payroll on consistent schedule',
          'Review before submitting',
          'Keep payroll records',
          'Stay compliant with tax deadlines',
        ],
        commonMistakes: [
          'Missing payroll deadlines',
          'Incorrect employee hours',
          'Not reviewing before submission',
          'Missing tax filings',
        ],
        estimatedDuration: 35,
        order: 2,
        isActive: true,
      },
    ]);
    console.log('Created QuickBooks Module 7 lessons');

    // QuickBooks Module 8: Advanced Features
    const qbModule8 = await LearningModule.create({
      applicationId: qbApplicationId,
      name: 'Module 8: Advanced Features',
      description: 'Learn advanced QuickBooks features and integrations',
      order: 8,
      isActive: true,
    });
    const qbModule8Id = qbModule8._id;
    console.log('Created QuickBooks Module 8:', qbModule8Id);

    await LearningLesson.create([
      {
        moduleId: qbModule8Id,
        title: 'Class and Location Tracking',
        objective: 'Learn to use classes and locations for advanced tracking',
        businessPurpose: 'Class and location tracking provides detailed reporting and analysis capabilities.',
        concepts: [
          'Class tracking',
          'Location tracking',
          'Segmentation',
          'Advanced reporting',
        ],
        content: `Class and Location Tracking:

Class Tracking:
- Set up class list
- Assign classes to transactions
- Class-based reporting
- Profit by class analysis
- Class hierarchy

Location Tracking:
- Set up locations
- Assign locations to transactions
- Location-based reporting
- Multi-location management
- Location performance

Segmentation:
- Multiple tracking categories
- Custom segments
- Segment reporting
- Cross-segment analysis

Best Practices:
- Consistent assignment
- Regular review
- Training staff
- Report utilization`,
        importantNotes: [
          'Enable tracking in preferences',
          'Plan class/location structure',
          'Train all users',
          'Regular reporting review',
        ],
        commonMistakes: [
          'Inconsistent assignment',
          'Too many classes/locations',
          'Not using for decisions',
          'Poor structure planning',
        ],
        estimatedDuration: 30,
        order: 1,
        isActive: true,
      },
      {
        moduleId: qbModule8Id,
        title: 'Integrations and Add-ons',
        objective: 'Learn about QuickBooks integrations and third-party apps',
        businessPurpose: 'Integrations extend QuickBooks functionality and improve workflows.',
        concepts: [
          'App Center',
          'API integration',
          'Common integrations',
          'Integration management',
        ],
        content: `QuickBooks Integrations:

App Center:
- Browse available apps
- App categories
- Reviews and ratings
- Installation process
- Subscription management

Common Integrations:
- Payment processing
- CRM systems
- E-commerce platforms
- Time tracking
- Expense management

API Integration:
- QuickBooks API overview
- Authentication
- Data synchronization
- Webhooks
- Rate limits

Integration Management:
- Monitor integration health
- Troubleshoot issues
- Update integrations
- Remove unused apps
- Security considerations`,
        importantNotes: [
          'Review app security before installing',
          'Test integrations in sandbox',
          'Monitor integration performance',
          'Keep integrations updated',
        ],
        commonMistakes: [
          'Installing too many apps',
          'Not reviewing security',
          'Not testing before production',
          'Ignoring integration issues',
        ],
        estimatedDuration: 30,
        order: 2,
        isActive: true,
      },
    ]);
    console.log('Created QuickBooks Module 8 lessons');

    // QuickBooks Module 9: Troubleshooting
    const qbModule9 = await LearningModule.create({
      applicationId: qbApplicationId,
      name: 'Module 9: Troubleshooting',
      description: 'Learn to troubleshoot common QuickBooks issues',
      order: 9,
      isActive: true,
    });
    const qbModule9Id = qbModule9._id;
    console.log('Created QuickBooks Module 9:', qbModule9Id);

    await LearningLesson.create([
      {
        moduleId: qbModule9Id,
        title: 'Common Issues and Solutions',
        objective: 'Learn to resolve common QuickBooks problems',
        businessPurpose: 'Troubleshooting skills minimize downtime and maintain productivity.',
        concepts: [
          'Data issues',
          'Performance issues',
          'Connectivity issues',
          'Error resolution',
        ],
        content: `Common QuickBooks Issues:

Data Issues:
- Company file won't open
- Data corruption
- Missing transactions
- Incorrect balances
- Resolution steps

Performance Issues:
- Slow performance
- Freezing or crashing
- Long load times
- Memory issues
- Optimization techniques

Connectivity Issues:
- Bank feed problems
- Sync errors
- Online access issues
- Network problems
- Troubleshooting steps

Error Resolution:
- Common error codes
- Error message interpretation
- Resolution procedures
- When to escalate
- Support resources`,
        importantNotes: [
          'Always backup before troubleshooting',
          'Document error messages',
          'Try basic fixes first',
          'Know when to contact support',
        ],
        commonMistakes: [
          'Not backing up before fixes',
          'Ignoring error messages',
          'Trying complex fixes first',
          'Not documenting solutions',
        ],
        estimatedDuration: 35,
        order: 1,
        isActive: true,
      },
      {
        moduleId: qbModule9Id,
        title: 'Data Recovery and Repair',
        objective: 'Learn to recover and repair QuickBooks data',
        businessPurpose: 'Data recovery skills protect against data loss and corruption.',
        concepts: [
          'Verify Data',
          'Rebuild Data',
          'Restore from backup',
          'Data migration',
        ],
        content: `Data Recovery and Repair:

Verify Data:
- Purpose of Verify Data
- Running Verify Data
- Interpreting results
- Common issues found
- Resolution steps

Rebuild Data:
- When to use Rebuild Data
- Running Rebuild Data
- What Rebuild does
- Post-rebuild verification
- Data integrity checks

Restore from Backup:
- Selecting backup file
- Restore process
- Post-restore verification
- Handling missing transactions
- Update to current date

Data Migration:
- Company file migration
- Version upgrades
- Data conversion
- Migration testing
- Rollback procedures`,
        importantNotes: [
          'Always backup before repair operations',
          'Test repairs on copy first',
          'Document repair process',
          'Verify after repairs',
        ],
        commonMistakes: [
          'Not backing up before repairs',
          'Running repairs on production without testing',
          'Not verifying after repairs',
          'Ignoring repair warnings',
        ],
        estimatedDuration: 30,
        order: 2,
        isActive: true,
      },
    ]);
    console.log('Created QuickBooks Module 9 lessons');

    // QuickBooks Module 10: Assessment
    const qbModule10 = await LearningModule.create({
      applicationId: qbApplicationId,
      name: 'Module 10: Assessment',
      description: 'Complete assessment to test your QuickBooks knowledge',
      order: 10,
      isActive: true,
    });
    const qbModule10Id = qbModule10._id;
    console.log('Created QuickBooks Module 10:', qbModule10Id);

    await LearningLesson.create({
      moduleId: qbModule10Id,
      title: 'QuickBooks Knowledge Assessment',
      objective: 'Test your comprehensive knowledge of QuickBooks',
      businessPurpose: 'This assessment validates your readiness to support QuickBooks users.',
      concepts: [
        'Comprehensive knowledge test',
        'Practical scenarios',
        'Troubleshooting skills',
        'Best practices',
      ],
      content: `Assessment Overview:

This comprehensive assessment covers all modules:
- Module 1: Introduction
- Module 2: Company File
- Module 3: Interface
- Module 4: Daily Operations
- Module 5: Banking
- Module 6: Reports
- Module 7: Payroll
- Module 8: Advanced Features
- Module 9: Troubleshooting

Assessment Format:
- Multiple choice questions
- Scenario-based questions
- Practical exercises
- Troubleshooting scenarios

Passing Criteria:
- Minimum 80% score required
- Must complete all sections
- Practical exercises must be submitted
- Time limit: 90 minutes

Preparation Tips:
- Review all module content
- Practice with sample scenarios
- Complete all module exercises
- Review important notes and common mistakes`,
        importantNotes: [
          'Assessment can be retaken if failed',
          'Use open-book resources during practice',
          'Time yourself during practice',
          'Focus on weak areas',
        ],
        commonMistakes: [
          'Not reviewing all modules',
          'Rushing through assessment',
          'Not practicing scenarios',
          'Ignoring time management',
        ],
        estimatedDuration: 90,
        order: 1,
        isActive: true,
    });
    console.log('Created QuickBooks Module 10 lessons');

    console.log('\n✅ Learning data seeded successfully!');
    console.log('Summary:');
    console.log('- 2 Applications (CCH Axcess, QuickBooks)');
    console.log('- 20 Modules (10 per application)');
    console.log('- 40 Lessons (20 per application)');
    console.log('\nYou can now access the Learning Center at /learning');

  } catch (error) {
    console.error('❌ Error seeding learning data:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedLearningData();
