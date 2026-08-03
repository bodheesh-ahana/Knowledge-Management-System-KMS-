I actually think you're looking at this the right way.

Your **Knowledge Base** and **Learning Module** should remain **two separate systems**.

* **Knowledge Base** = "How do I solve this issue?" (reference during work)
* **Learning Module** = "How do I become capable of supporting this application?" (structured training)

If you mix them together, new engineers will end up reading hundreds of KB articles without understanding the application.

---

# I would organize it like this

```
Application
│
├── Overview
├── Learning Center
├── Knowledge Base
├── Documents
├── Common Issues
├── Practice Labs
├── Assessments
└── Analytics
```

For example:

```
CCH Axcess

Overview
Learning
Knowledge
Documents
Tickets
Reports
```

---

# Phase 1 - Build the Learning Framework

Don't write articles first.

Build the structure.

For every application, use the same template.

Example:

```
CCH Axcess

Module 1
Introduction

Module 2
Business Process

Module 3
Architecture

Module 4
Installation

Module 5
Configuration

Module 6
Daily Operations

Module 7
Common Tasks

Module 8
Troubleshooting

Module 9
Advanced Topics

Module 10
Assessment
```

Once this framework exists, every application will follow the same learning path.

---

# Phase 2 - Start with CCH Axcess

Don't try to document the whole application at once.

Break it into small lessons.

## Module 1

### What is CCH Axcess?

```
• What is it?

• Why do CPA firms use it?

• Cloud or Desktop?

• Main modules

• User roles

• Login

• Navigation

• Interface
```

This is enough for Lesson 1.

---

## Module 2

Business Workflow

This is what most companies skip.

Explain

```
Client

↓

Creates tax return

↓

Staff prepares return

↓

Reviewer reviews

↓

Manager approves

↓

Partner approves

↓

File electronically

↓

Archive
```

Now they understand why the application exists.

---

## Module 3

Products inside CCH Axcess

Example

```
Axcess Tax

Axcess Document

Axcess Workstream

Axcess Practice

Axcess Portal

Axcess Dashboard
```

Each one can become another lesson.

---

## Module 4

Navigation

Teach them the interface.

```
Home

Dashboard

Client Manager

Search

Notifications

Tasks

Settings
```

Don't explain troubleshooting yet.

---

## Module 5

Daily Operations

Example

```
Open client

Search client

Create client

Edit client

Attach document

Generate return

Review diagnostics

Print

Export

Logout
```

These are the tasks they'll perform daily.

---

# Phase 3 - Add Practical Exercises

After every lesson:

Example

```
Exercise

Login

Search Client

Open Return

Take Screenshot

Submit
```

---

Another

```
Exercise

Create Dummy Client

Fill Information

Save

Delete

```

---

# Phase 4 - Knowledge Base Integration

Only after they know the basics.

Example

```
Lesson

Opening Client

↓

Related KB

Client file locked

Client missing

Access denied

Permission issue

Search not working
```

So they learn

Task

↓

Possible issues

↓

Resolution

---

# Phase 5 - Ticket Simulator

Eventually

```
Customer

Unable to print return

```

Engineer

```
Step 1

Reproduce

↓

Step 2

Collect logs

↓

Step 3

Search KB

↓

Step 4

Resolve

↓

Submit resolution
```

---

# How to use your existing Knowledge Base

Don't rewrite your KB articles.

Just classify them.

Example

```
KB-145

Printer Error

↓

Belongs to

Module 7

Printing
```

Another

```
KB-210

Access Denied

↓

Module

Permissions
```

Your KB becomes supporting material for each lesson.

---

# QuickBooks Learning Path

I'd structure it like this:

```
1 Introduction

2 Editions
   • Pro
   • Premier
   • Enterprise
   • Online

3 Company File

4 Interface

5 Customer Center

6 Vendor Center

7 Banking

8 Reports

9 Backup

10 Restore

11 Verify Data

12 Rebuild Data

13 Multi-user

14 Hosting

15 Common Issues

16 Integrations

17 Ticket Simulation

18 Assessment
```

---

# CCH Axcess Learning Path

```
1 Introduction

2 Products

3 Tax Workflow

4 Login

5 Navigation

6 Client Management

7 Return Management

8 Documents

9 Practice

10 Administration

11 Permissions

12 Troubleshooting

13 Common Errors

14 Best Practices

15 Ticket Simulation

16 Assessment
```

---

# What content should each lesson contain?

Every lesson should follow the same format so engineers know what to expect.

```
Lesson Name

1. Objective
2. Business Purpose
3. Concepts
4. Live Demo / Screenshots
5. Step-by-Step Procedure
6. Important Notes
7. Common Mistakes
8. Related Knowledge Articles
9. Practical Exercise
10. Quiz
```

This consistency makes learning much easier.

---

# How I would build this over the next 6–8 weeks

## Week 1

* Design the Learning Module (UI, database schema, progress tracking).
* Finalize the standard lesson template.

## Week 2

* Complete **CCH Axcess Module 1–5**.
* Record short walkthrough videos (5–10 minutes each).

## Week 3

* Complete **CCH Axcess Module 6–10**.
* Link existing KB articles to the relevant lessons.

## Week 4

* Create practical labs and the first assessment for CCH Axcess.
* Have one new engineer complete the training and collect feedback.

## Week 5–6

* Build the **QuickBooks** learning path using the same structure.
* Reuse the framework, UI, and lesson template from CCH Axcess.

---

## One more recommendation

Don't think of this as documentation.

Think of it as an **internal academy**.

Imagine a new engineer joining your team. They should be able to open the Learning Center, spend two weeks completing lessons, labs, quizzes, and practice tickets, and then confidently handle Level 1 support with minimal supervision. If you achieve that, you'll reduce onboarding effort, improve consistency, and make knowledge transfer much easier as your team grows.
