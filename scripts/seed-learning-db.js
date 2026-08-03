require('dotenv').config();
const mongoose = require('mongoose');

// Import models directly
const LearningApplication = require('../src/models/LearningApplication');
const LearningModule = require('../src/models/LearningModule');
const LearningLesson = require('../src/models/LearningLesson');

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

    console.log('\n✅ Learning data seeded successfully!');
    console.log('Summary:');
    console.log('- 1 Application (CCH Axcess)');
    console.log('- 5 Modules');
    console.log('- 10 Lessons');
    console.log('\nYou can now access the Learning Center at /learning');

  } catch (error) {
    console.error('❌ Error seeding learning data:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedLearningData();
