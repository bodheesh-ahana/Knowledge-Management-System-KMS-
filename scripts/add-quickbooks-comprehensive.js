require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define schemas inline
const LearningApplicationSchema = new mongoose.Schema({
  name: String,
  description: String,
  icon: String,
  color: String,
  order: Number,
  isActive: Boolean,
});

const LearningModuleSchema = new mongoose.Schema({
  applicationId: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  order: Number,
  isActive: Boolean,
});

const LearningLessonSchema = new mongoose.Schema({
  moduleId: mongoose.Schema.Types.ObjectId,
  title: String,
  objective: String,
  businessPurpose: String,
  concepts: [String],
  content: String,
  importantNotes: [String],
  commonMistakes: [String],
  estimatedDuration: Number,
  order: Number,
  isActive: Boolean,
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
    }],
  },
});

// Create models
const LearningApplication = mongoose.model('LearningApplication', LearningApplicationSchema);
const LearningModule = mongoose.model('LearningModule', LearningModuleSchema);
const LearningLesson = mongoose.model('LearningLesson', LearningLessonSchema);

async function addComprehensiveQuickBooks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find QuickBooks application
    const qbApp = await LearningApplication.findOne({ name: 'QuickBooks' });
    if (!qbApp) {
      console.log('QuickBooks application not found');
      return;
    }
    console.log('Found QuickBooks application:', qbApp._id);

    // Check if comprehensive module already exists
    const existingModule = await LearningModule.findOne({
      applicationId: qbApp._id,
      name: 'Module 11: Comprehensive QuickBooks Operations & Support'
    });

    if (existingModule) {
      console.log('Comprehensive QuickBooks module already exists. Updating lessons...');
      const moduleId = existingModule._id;
      
      // Delete existing lessons in this module
      await LearningLesson.deleteMany({ moduleId });
      console.log('Deleted existing lessons');
      
      // Add new comprehensive lesson
      await createComprehensiveLesson(moduleId);
    } else {
      // Create new module
      const newModule = await LearningModule.create({
        applicationId: qbApp._id,
        name: 'Module 11: Comprehensive QuickBooks Operations & Support',
        description: 'Master QuickBooks end-to-end operations, business workflows, and production support scenarios',
        order: 11,
        isActive: true,
      });
      console.log('Created new module:', newModule._id);
      
      await createComprehensiveLesson(newModule._id);
    }

    console.log('✅ Comprehensive QuickBooks content added successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

async function createComprehensiveLesson(moduleId) {
  const lessonContent = `1. Creating an Intuit Account
Business User
The first step is creating an Intuit account.
Go to QuickBooks Online and select Sign Up.
Provide:
•	Name 
•	Email 
•	Password 
•	Phone Number 
•	Country 
After registration, verify your email.
________________________________________
What QuickBooks Does Internally
QuickBooks:
•	Creates an Intuit user account 
•	Generates a unique User ID 
•	Encrypts the password 
•	Sends a verification email 
•	Stores user profile information 
Architecture:
User

↓

Registration Form

↓

Authentication Server

↓

User Database

↓

Verification Email
________________________________________
Application Support
Common Issues
•	Verification email not received 
•	Duplicate email 
•	Password policy violations 
•	Account locked 
•	MFA problems 

 

  
________________________________________
2. Selecting a Subscription Plan
QuickBooks offers different subscription levels.
Example
•	Simple Start 
•	Essentials 
•	Plus 
•	Advanced 
________________________________________
Business User
Select the plan based on:
•	Number of users 
•	Payroll requirements 
•	Inventory 
•	Reporting 
•	Budget 
________________________________________
Internally
QuickBooks:
Selected Plan

↓

Subscription Database

↓

Feature Flags Enabled

↓

License Activated
Each plan unlocks different features.
Example
Feature	Simple	Essentials	Plus	Advanced
Invoices	✔	✔	✔	✔
Bills	✖	✔	✔	✔
Inventory	✖	✖	✔	✔
Advanced Reports	✖	✖	Limited	✔
________________________________________
Support Perspective
Common Issues
•	Payment failure 
•	Subscription expired 
•	Incorrect billing 
•	Features missing after upgrade 
________________________________________
3. Creating a Company Profile

 

settings ---- account and settings 
 
Every QuickBooks account needs a company.
Example
Company Name

ABC Technologies

Industry

Software

Country

USA

Currency

USD

Tax Registration

Yes
________________________________________
Internally
QuickBooks creates:
•	Company ID 
•	Fiscal Year 
•	Default Chart of Accounts 
•	Tax Settings 
•	Company Preferences 
Architecture
Company Setup

↓

Company Database

↓

Company ID

↓

Default Configuration
________________________________________
Support Issues
•	Wrong fiscal year 
•	Wrong currency 
•	Duplicate company 
•	Incorrect tax settings 
________________________________________
4. Connecting Bank Accounts


 

 

 
This is one of QuickBooks' most useful features.
User selects:
Banking

↓

Connect Bank
Choose bank
Sign in
Authorize access
________________________________________
Internally
QuickBooks

↓

Secure Banking API

↓

Bank Authentication

↓

Bank Transactions

↓

QuickBooks Database
Transactions begin syncing automatically.
________________________________________
Support Issues
•	MFA failures 
•	API timeout 
•	Invalid credentials 
•	Bank connection expired 
•	Duplicate transactions 
________________________________________
5. Import Customers & Vendors


 

 

 
 
Businesses often already have customer and vendor lists.
Import via:
•	CSV 
•	Excel 
•	Third-party applications 
Example
Customer
John Smith

Phone

Email

Address
Vendor
Dell

Contact

Phone

Payment Terms
________________________________________
Internally
CSV File

↓

Validation

↓

Import Engine

↓

Customer Table

Vendor Table
________________________________________
Support Issues
•	Duplicate customers 
•	Missing columns 
•	Invalid file format 
•	Data mapping errors 
________________________________________
6. Configuring the Chart of Accounts
 
 
The Chart of Accounts is the foundation of accounting.
Examples
Assets
Liabilities
Income
Expenses
Equity
Example
1000 Cash

1100 Bank

1200 Accounts Receivable

2000 Accounts Payable

4000 Sales

5000 Office Expense
________________________________________
Internally
QuickBooks creates ledger accounts.
Every future transaction posts to these accounts.
Example
Invoice
↓
Accounts Receivable
↓
Sales Revenue
________________________________________
Support Issues
•	Wrong account mapping 
•	Duplicate accounts 
•	Deleted accounts 
•	Inactive accounts 
________________________________________
7. Adding Products & Services

 

 
 


 


Example
Laptop
Price
$1000
Taxable
Yes
Inventory
50
________________________________________
User enters
•	SKU 
•	Name 
•	Price 
•	Income Account 
•	Expense Account 
•	Inventory Account 
________________________________________
Internally
Product Master

↓

Inventory Table

↓

Pricing Table

↓

Tax Rules
________________________________________
Support Issues
•	Wrong inventory account 
•	Duplicate SKU 
•	Tax mapping problems 
________________________________________
8. Creating Invoices & Bills
Invoice
Customer owes company.
Bill
Company owes vendor.
Invoice Example
Customer

John

Product

Laptop

Price

1000
Bill Example
Vendor

Dell

Amount

700
________________________________________
Internally
Invoice
Customer

↓

Accounts Receivable

↓

Sales Revenue
Bill
Vendor

↓

Accounts Payable

↓

Expense Account


 
________________________________________
Support Issues
•	Tax calculation errors 
•	Invoice numbering issues 
•	Duplicate invoices 
•	Bill approval workflow problems 
________________________________________

How to create, customize, and send an invoice in QuickBooks Online
 

 


9. Recording Transactions
Transactions include:
•	Payments 
•	Expenses 
•	Transfers 
•	Deposits 
•	Credit Notes 
•	Journal Entries 
Example
Customer pays invoice.
QuickBooks
Invoice

↓

Payment

↓

Bank

↓

General Ledger
Accounting Entry
Debit Bank

Credit Accounts Receivable
________________________________________
Support Issues
•	Duplicate transactions 
•	Missing transactions 
•	Incorrect account postings 
•	Reconciliation mismatches 
________________________________________



 
 
 

10. Running Financial Reports
Navigate to:
Reports
Examples
•	Profit & Loss 
•	Balance Sheet 
•	Cash Flow 
•	Trial Balance 
•	Accounts Receivable Aging 
•	Accounts Payable Aging 
________________________________________
Internally
Transactions

↓

General Ledger

↓

Report Engine

↓

Financial Statements
The report engine reads posted transactions and summarizes them into financial statements.
________________________________________
Complete End-to-End Example
Imagine ABC Technologies has just started using QuickBooks:
1.	The owner creates an Intuit account. 
2.	They subscribe to the Plus plan. 
3.	They create the company profile. 
4.	They connect the company's bank account. 
5.	They import 200 customers and 50 vendors from a CSV file. 
6.	They review and customize the Chart of Accounts. 
7.	They add products such as laptops and printers. 
8.	They create an invoice for a customer. 
9.	The customer pays online, and QuickBooks records the payment and updates the bank balance. 
10.	At month-end, they generate a Profit & Loss report and a Balance Sheet. 
Application Support Perspective
When users report issues during setup, ask:
•	Which step failed? 
•	Was the failure caused by authentication, subscription, data import, banking integration, or accounting configuration? 
•	Are there validation errors or permission issues? 
•	Is the data correctly posted to the Chart of Accounts and General Ledger? 
This structured approach helps isolate problems quickly and is the same mindset used by L2/L3 application support teams.

How QuickBooks Performs Business Operations
1. Track Income and Expenses
Business Scenario
ABC Company sells laptops.
Customer: John
Laptop Price: $1,000
The company also buys office supplies for $100.
________________________________________
Step 1: Record Income
Navigate to:
Sales
   ↓
Invoices
   ↓
Create Invoice
Enter:
Customer : John

Product : Laptop

Amount : $1000
Click Save
________________________________________
What Happens Internally?
User Creates Invoice

↓

Invoice Saved

↓

Accounts Receivable +1000

↓

Sales Revenue +1000

↓

Customer Balance Updated
Database tables updated (conceptually):
Customers

Invoices

Transactions

Accounts

General Ledger
Accounting entry:
Debit  Accounts Receivable   $1000

Credit Sales Revenue         $1000
________________________________________
Step 2: Receive Payment
Customer pays the invoice.
Navigate:
Sales

↓

Receive Payment
Select:
Customer

Invoice

Amount

Deposit Account
________________________________________
Internally:
Customer Pays

↓

Invoice Closed

↓

Accounts Receivable Reduced

↓

Bank Balance Increased
Accounting:
Debit Bank $1000

Credit Accounts Receivable $1000
________________________________________
2. Track Expenses
Company buys printer paper.
Amount:
$100
Navigate:
Expenses

↓

Expense
Choose:
Vendor

Office Supplies

Amount

Bank Account
________________________________________
Internally:
Expense Created

↓

Expense Account Increased

↓

Bank Balance Reduced
Accounting:
Debit Office Expense $100

Credit Bank $100
________________________________________
3. Create Professional Invoices
Navigate:
Sales

↓

Invoices

↓

New Invoice
Fill:
Customer

Product

Quantity

Tax

Payment Terms

Due Date
QuickBooks automatically:
•	Generates invoice number 
•	Calculates taxes 
•	Calculates totals 
•	Updates customer balance 
________________________________________
Workflow
Customer

↓

Invoice

↓

Accounts Receivable

↓

General Ledger
________________________________________
4. Receive Customer Payments
Navigate:
Sales

↓

Receive Payment
Select:
Customer

Invoice

Payment Method
Examples:
•	Cash 
•	Credit Card 
•	Bank Transfer 
•	Check 
QuickBooks:
•	Marks invoice paid 
•	Updates bank account 
•	Updates customer history 
________________________________________
5. Pay Vendors
Example:
Amazon supplies laptops.
Company owes:
$500
Navigate:
Expenses

↓

Pay Bills
Select:
Vendor

Bill

Payment Account
Internally:
Bill Paid

↓

Accounts Payable Reduced

↓

Bank Reduced
Accounting:
Debit Accounts Payable

Credit Bank
________________________________________
6. Manage Payroll
Example
Employee:
John

Salary

$3000
Navigate:
Payroll

↓

Employees

↓

Run Payroll
QuickBooks calculates:
Gross Salary

↓

Tax

↓

Insurance

↓

Retirement

↓

Net Salary
Then:
Payroll Expense

↓

Bank Payment

↓

Payroll Reports
________________________________________
7. Track Inventory
Example
Inventory:
Laptop

Quantity

50
Customer buys:
5
QuickBooks automatically:
Inventory

50

↓

45
Also updates inventory value.
Workflow
Invoice

↓

Inventory Reduced

↓

Cost of Goods Sold Updated

↓

Profit Updated
________________________________________
8. Reconcile Bank Accounts
Purpose:
Verify that QuickBooks transactions match the bank statement.
Navigate:
Accounting

↓

Reconcile
Example
Bank Statement
Deposit

1000

Withdrawal

200
QuickBooks checks:
Bank Statement

↓

QuickBooks Transactions

↓

Compare

↓

Matched

↓

Reconciled
Unmatched items become reconciliation exceptions that must be investigated.
________________________________________
9. Generate Financial Reports
Navigate
Reports
Examples
•	Profit & Loss 
•	Balance Sheet 
•	Cash Flow 
•	Trial Balance 
•	General Ledger 
•	Customer Balance 
•	Vendor Balance 
QuickBooks reads transaction data and summarizes it into reports.
Transactions

↓

General Ledger

↓

Reports Engine

↓

Financial Report
________________________________________
10. Prepare Tax Information
QuickBooks records:
•	Income 
•	Expenses 
•	Payroll 
•	Sales Tax 
•	Purchases 
During tax preparation:
Income

↓

Expenses

↓

Tax Categories

↓

Tax Reports

↓

Export
The information can then be used for tax filing or exported to tax preparation software.
________________________________________
11. Monitor Cash Flow
QuickBooks continuously tracks:
Money Coming In

↓

Income

↓

Bank

↓

Money Going Out

↓

Expenses
Dashboard example:
Cash In

$25,000

Cash Out

$15,000

Current Balance

$10,000
This helps business owners understand whether the business has enough cash to meet its obligations.
________________________________________
End-to-End Business Flow in QuickBooks
Customer Requests Product
           │
           ▼
      Create Estimate
           │
           ▼
      Convert to Invoice
           │
           ▼
     Customer Receives Invoice
           │
           ▼
      Customer Makes Payment
           │
           ▼
      Bank Account Updated
           │
           ▼
   Inventory Reduced (if applicable)
           │
           ▼
 Financial Reports Updated
           │
           ▼
 Month-End Reconciliation
           │
           ▼
 Tax Preparation & Financial Statements
S

QuickBooks Common Production Issues, Scenarios, and Resolutions
Scenario 1: User Cannot Log In
Incident
The user receives an "Invalid credentials" or "Unable to sign in" message.
Possible Causes
•	Incorrect username or password 
•	Expired password 
•	Multi-factor authentication (MFA) failure 
•	Account locked after multiple failed attempts 
•	Browser cache or cookies issue 
•	Intuit authentication service outage 
Troubleshooting
1.	Verify the email address. 
2.	Reset the password if necessary. 
3.	Confirm MFA is working. 
4.	Try signing in using a private/incognito browser window. 
5.	Clear browser cache and cookies. 
6.	Check the status of Intuit services. 
7.	Test with another user account. 
Resolution
•	Unlock the account or reset credentials. 
•	Clear browser cache. 
•	Wait for the Intuit service to recover if it's a platform outage. 
________________________________________
Scenario 2: Bank Transactions Are Not Syncing
Incident
No new bank transactions appear in QuickBooks.
Possible Causes
•	Bank credentials changed 
•	Bank API outage 
•	MFA required 
•	Expired connection 
•	Unsupported bank 
•	Network connectivity issues 
Troubleshooting
1.	Go to Banking → Update. 
2.	Check the last successful sync time. 
3.	Reconnect the bank account. 
4.	Verify online banking credentials. 
5.	Review any error messages. 
6.	Check if the bank is undergoing maintenance. 
Resolution
•	Reauthenticate the bank connection. 
•	Wait for the bank service to become available. 
•	Manually import transactions if needed until synchronization resumes. 
________________________________________
Scenario 3: Duplicate Bank Transactions
Incident
The same bank transaction appears multiple times.
Possible Causes
•	Multiple imports 
•	Reconnected bank account 
•	CSV imported after automatic sync 
•	Duplicate bank feed 
Troubleshooting
1.	Compare transaction dates and amounts. 
2.	Review imported files. 
3.	Check the audit log. 
4.	Confirm bank feed settings. 
Resolution
•	Exclude or delete duplicate transactions. 
•	Avoid importing the same statement twice. 
________________________________________
Scenario 4: Invoice Cannot Be Created
Incident
The invoice fails to save or displays a validation error.
Possible Causes
•	Missing customer 
•	Missing product/service 
•	Invalid tax configuration 
•	Required fields not completed 
Troubleshooting
1.	Verify the customer exists. 
2.	Check product configuration. 
3.	Validate tax settings. 
4.	Review mandatory fields. 
Resolution
•	Correct the missing or invalid information and save the invoice again. 
________________________________________
Scenario 5: Customer Payment Is Not Reflected
Incident
The customer has paid, but the invoice still shows as unpaid.
Possible Causes
•	Payment recorded against the wrong invoice 
•	Deposit not completed 
•	Payment synchronization delay 
•	User recorded an expense instead of a payment 
Troubleshooting
1.	Open the customer profile. 
2.	Review payment history. 
3.	Match the payment to the invoice. 
4.	Check the Undeposited Funds account. 
Resolution
•	Link the payment to the correct invoice. 
•	Record the deposit if it is still in Undeposited Funds. 
________________________________________
Scenario 6: Payroll Processing Failed
Incident
Payroll does not complete successfully.
Possible Causes
•	Expired payroll subscription 
•	Incorrect employee setup 
•	Tax table not updated 
•	Bank account verification failure 
Troubleshooting
1.	Verify the payroll subscription. 
2.	Update payroll tax tables. 
3.	Check employee details. 
4.	Confirm bank account information. 
Resolution
•	Update payroll components. 
•	Correct employee information. 
•	Retry payroll processing. 
________________________________________
Scenario 7: Inventory Quantity Is Incorrect
Incident
Inventory shows negative or incorrect stock levels.
Possible Causes
•	Incorrect opening balance 
•	Duplicate sales 
•	Incorrect purchase entries 
•	Inventory adjustments not recorded 
Troubleshooting
1.	Run the Inventory Valuation report. 
2.	Review purchase and sales history. 
3.	Check inventory adjustment entries. 
Resolution
•	Correct the transactions or create an inventory adjustment if appropriate. 
________________________________________
Scenario 8: Profit & Loss Report Shows Incorrect Values
Incident
Income or expenses appear incorrect.
Possible Causes
•	Incorrect account mapping 
•	Duplicate transactions 
•	Wrong reporting period 
•	Manual journal entry errors 
Troubleshooting
1.	Verify the report date range. 
2.	Review recent journal entries. 
3.	Check account assignments. 
Resolution
•	Correct account mappings or reverse incorrect journal entries. 
________________________________________
Scenario 9: Unable to Import Customers or Vendors
Incident
CSV import fails.
Possible Causes
•	Invalid file format 
•	Missing required columns 
•	Duplicate names 
•	Unsupported characters 
Troubleshooting
1.	Validate the CSV format. 
2.	Confirm required columns are present. 
3.	Remove duplicates. 
4.	Try importing a smaller sample file. 
Resolution
•	Correct the file and re-import. 
________________________________________
Scenario 10: User Cannot Access Certain Features
Incident
A user cannot access Payroll, Reports, or Banking.
Possible Causes
•	Insufficient permissions 
•	Incorrect subscription plan 
•	User role restrictions 
Troubleshooting
1.	Check user permissions. 
2.	Verify the subscription includes the feature. 
3.	Test using an administrator account. 
Resolution
•	Grant the required permissions or upgrade the subscription if necessary. 
________________________________________
Scenario 11: QuickBooks Is Slow
Possible Causes
•	Large company file (Desktop) 
•	Browser cache (Online) 
•	Slow internet connection 
•	Too many browser tabs 
•	Browser extensions interfering 
Resolution
•	Clear browser cache. 
•	Disable unnecessary extensions. 
•	Use a supported browser. 
•	Optimize the company file (Desktop). 
•	Verify internet connectivity. 
________________________________________
Scenario 12: Tax Calculation Is Incorrect
Possible Causes
•	Wrong tax code 
•	Outdated tax rates 
•	Incorrect customer tax settings 
•	Incorrect product taxability 
Resolution
•	Update tax rates. 
•	Verify tax codes. 
•	Review customer and product tax settings. 
________________________________________
Application Support Incident Workflow
User Reports Issue
        │
        ▼
Collect Error Details
        │
        ▼
Identify Module
(Login / Banking / Payroll / Reports / Inventory)
        │
        ▼
Check Logs & Audit Trail
        │
        ▼
Reproduce the Issue
        │
        ▼
Identify Root Cause
        │
        ▼
Implement Fix
        │
        ▼
Validate with User
        │
        ▼
Document Resolution
        │
        ▼
Close Incident
Root Cause Analysis (RCA) Template
Use this format for recurring or high-priority incidents:
Field	Example
Incident ID	INC-2026-1001
Date & Time	01-Aug-2026 09:30 AM
Severity	P1
Reported By	Finance Team
Issue	Bank feed stopped syncing
Business Impact	Transactions unavailable for reconciliation
Root Cause	Bank authentication token expired
Resolution	Reconnected bank account and refreshed authorization
Preventive Action	Monitor bank connection status and notify users before token expiry
Tips for an Application Support Team Lead
•	Gather complete information before making changes. 
•	Review audit logs and recent changes. 
•	Try to reproduce the issue in a safe environment. 
•	Distinguish between a user error, configuration issue, integration problem, and platform outage. 
•	Record the root cause and preventive action so similar incidents can be resolved faster in the future. 
This collection of scenarios covers many of the day-to-day issues encountered when supporting QuickBooks in a production environment.`;

  const lesson = await LearningLesson.create({
    moduleId,
    title: 'QuickBooks Comprehensive Operations & Production Support',
    objective: 'Master QuickBooks from setup to production support including internal architecture, business workflows, and troubleshooting',
    businessPurpose: 'Comprehensive understanding of QuickBooks operations enables effective support for production issues and helps users maximize the platform.',
    concepts: [
      'Account creation and authentication',
      'Subscription management',
      'Company setup and configuration',
      'Bank integration and feeds',
      'Chart of Accounts',
      'Invoicing and billing',
      'Transaction recording',
      'Financial reporting',
      'Payroll processing',
      'Inventory management',
      'Bank reconciliation',
      'Production troubleshooting',
      'Root cause analysis',
    ],
    content: lessonContent,
    importantNotes: [
      'QuickBooks Online requires active internet connection',
      'Bank feeds may require periodic re-authentication due to MFA',
      'Always verify Chart of Accounts mapping before recording transactions',
      'Reconciliation discrepancies must be investigated immediately',
      'Payroll tax tables must be kept current',
      'Backup company files regularly (Desktop version)',
      'Audit logs are critical for troubleshooting production issues',
      'Test changes in a sandbox environment when possible',
    ],
    commonMistakes: [
      'Not verifying email after account creation',
      'Selecting wrong subscription plan for business needs',
      'Incorrect fiscal year or currency in company setup',
      'Ignoring bank feed sync errors',
      'Duplicate customer/vendor imports',
      'Wrong account mapping in Chart of Accounts',
      'Recording expenses instead of payments',
      'Not reconciling bank accounts regularly',
      'Ignoring inventory discrepancies',
      'Not updating payroll tax tables',
    ],
    estimatedDuration: 120,
    order: 1,
    isActive: true,
    quiz: {
      questions: [
        {
          question: 'What does QuickBooks do internally when a user creates an account?',
          options: [
            'Only stores the email address',
            'Creates user account, generates User ID, encrypts password, sends verification email',
            'Immediately creates a company file',
            'Requires payment before account creation'
          ],
          correctAnswer: 1
        },
        {
          question: 'Which QuickBooks plan includes inventory tracking?',
          options: [
            'Simple Start only',
            'Essentials only',
            'Plus and Advanced',
            'All plans include inventory'
          ],
          correctAnswer: 2
        },
        {
          question: 'What is the internal process when connecting a bank account?',
          options: [
            'QuickBooks → Bank → User',
            'QuickBooks → Secure Banking API → Bank Authentication → Bank Transactions → QuickBooks Database',
            'User → Bank → QuickBooks',
            'Bank → QuickBooks → Database'
          ],
          correctAnswer: 1
        },
        {
          question: 'What is the accounting entry when creating an invoice?',
          options: [
            'Debit Bank, Credit Sales Revenue',
            'Debit Accounts Receivable, Credit Sales Revenue',
            'Debit Sales Revenue, Credit Accounts Receivable',
            'Debit Cash, Credit Accounts Receivable'
          ],
          correctAnswer: 1
        },
        {
          question: 'What should you do if bank transactions are not syncing?',
          options: [
            'Delete the bank account',
            'Go to Banking → Update, check sync time, reconnect bank, verify credentials',
            'Create manual transactions for all missing data',
            'Contact the bank to disable online access'
          ],
          correctAnswer: 1
        },
        {
          question: 'What is the purpose of bank reconciliation?',
          options: [
            'To delete old transactions',
            'To verify QuickBooks transactions match actual bank statements',
            'To automatically fix accounting errors',
            'To export data to tax software'
          ],
          correctAnswer: 1
        },
        {
          question: 'What is the accounting entry when a customer pays an invoice?',
          options: [
            'Debit Accounts Receivable, Credit Bank',
            'Debit Bank, Credit Accounts Receivable',
            'Debit Sales Revenue, Credit Bank',
            'Debit Bank, Credit Sales Revenue'
          ],
          correctAnswer: 1
        },
        {
          question: 'What are common causes of duplicate bank transactions?',
          options: [
            'System bug only',
            'Multiple imports, reconnected bank, CSV after sync, duplicate bank feed',
            'User error only',
            'Bank system error only'
          ],
          correctAnswer: 1
        },
        {
          question: 'What should be included in a Root Cause Analysis (RCA) template?',
          options: [
            'Only the incident ID',
            'Incident ID, Date & Time, Severity, Reported By, Issue, Business Impact, Root Cause, Resolution, Preventive Action',
            'Only the resolution',
            'Only the user name'
          ],
          correctAnswer: 1
        },
        {
          question: 'What is the first step in the Application Support Incident Workflow?',
          options: [
            'Close the incident immediately',
            'User Reports Issue → Collect Error Details',
            'Implement fix without investigation',
            'Skip to documentation'
          ],
          correctAnswer: 1
        }
      ]
    }
  });

  console.log('Created comprehensive lesson:', lesson._id);
}

addComprehensiveQuickBooks();
