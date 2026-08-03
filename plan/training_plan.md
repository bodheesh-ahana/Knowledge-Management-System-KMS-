From what you've described, **the problem is not that your team doesn't know the applications.** The real problem is:

> **Your team does not have an Application Support mindset yet.**

They are approaching every ticket like developers:

* Read the ticket
* Google the error
* Ask GPT
* Try random fixes
* Finally solve it

An application support engineer should instead think:

> **Identify → Classify → Verify → Search KB → Troubleshoot → Resolve → Document**

---

# You only have 15 days

Don't try to teach them all six applications.

That will fail.

Instead, train them to become **good support engineers first**, then teach application-specific knowledge.

I would split it into three phases.

---

# Phase 1 (Days 1-3)

## Application Support Foundation

This is the most important training.

Topics:

### Module 1

What is Application Support?

Difference between

Developer

Application Support

Infrastructure

OEM

Customer

---

### Module 2

Ticket Lifecycle

Teach them

Ticket Received

↓

Acknowledge User

↓

Understand Issue

↓

Reproduce

↓

Identify Application

↓

Search KB

↓

Try Known Fix

↓

Collect Logs

↓

Escalate if Required

↓

Document Resolution

↓

Close Ticket

---

### Module 3

Communication

This is probably causing most SLA breaches.

Teach them:

Never disappear.

Even if you don't know the answer...

Update the customer.

Examples

Good:

> We are currently investigating the issue. Initial analysis is in progress. We will provide another update within 30 minutes.

Bad

> ...

No update for 2 hours.

---

Teach

Professional English

Empathy

Expectation setting

Escalation communication

OEM communication

Internal communication

---

### Module 4

SLA

Teach

Response SLA

Resolution SLA

Business Impact

Priority

P1

P2

P3

P4

Show them

Late acknowledgement

↓

Manager escalation

↓

Client dissatisfaction

↓

Penalty

↓

Poor CSAT

They should understand

**Resolution is important**

**But communication is MORE important.**

---

# Phase 2 (Days 4-8)

Instead of teaching every application...

Teach

Common Support Methodology

Every application has

Login

Permissions

Database

Logs

Configuration

Services

Cache

User profile

File location

Updates

License

Imports

Exports

Backups

Printing

Performance

Network

Teach these concepts once.

Then apply them everywhere.

---

For example

QuickBooks

Common issues

Company file

Backup

Restore

Network

License

Printing

PDF

---

Lacerte

Database

Locator

Permission

Updates

Network

Print

---

Drake

Database

Return

Import

Print

Updates

---

Notice?

80% is the same.

Only names change.

---

# Phase 3 (Days 9-15)

Now focus only on the most common applications.

I would prioritize

## 1. QuickBooks

111 KB articles

Probably highest volume.

Train

Company file

Backup

Restore

License

Printer

PDF

Transaction Pro

QBD vs QBO

Common errors

Hosting

---

## 2. CCH Axcess

Cloud

Login

Authentication

Permissions

Workflow

Tax returns

Printing

Updates

---

Don't spend much time on

UltraTax

Transaction Pro

until QuickBooks and Axcess are strong.

---

# Build a Tier-1 Decision Tree

Your team should never start with Google.

Instead

Ticket arrives

↓

Which Application?

↓

Which Module?

↓

Which Error?

↓

Known Error?

↓

Search KB

↓

Resolution

↓

If no KB

↓

Search GPT

↓

Verify

↓

Resolve

↓

Create KB

This should become muscle memory.

---

# Every Ticket Should Produce Knowledge

Today

Ticket comes

↓

Engineer solves

↓

Knowledge disappears

Tomorrow

Same issue

↓

Engineer Googles again

Bad.

Instead

Ticket

↓

Resolution

↓

Convert to KB

↓

Tag

↓

Application

↓

Keywords

↓

Error Code

↓

Root Cause

↓

Resolution

Within three months

You'll have 500+ reusable solutions.

---

# Daily Learning Routine (30 Minutes)

Every day

15 minutes

One engineer presents one ticket.

Explain

Issue

Analysis

Root Cause

Resolution

Mistakes

Lessons

---

15 minutes

Another engineer demonstrates

One application feature

Example

QuickBooks Backup

Restore

Company File

Verify Data

Rebuild Data

No slides.

Only live demonstration.

---

# Create a "Top 50 Issues" Program

Instead of teaching thousands of articles.

Find

Top 50 recurring issues.

These probably cover

70–80%

of tickets.

Master these.

Example

QuickBooks

Cannot Open Company File

PDF Printing

H202

H505

Backup Failed

License Error

Verify Data

Rebuild Data

Transaction Pro Import

Bank Feed

Missing PDF Component

---

CCH Axcess

Login Failed

Authentication

Print Failure

Workflow Lock

Permission Error

Cloud Sync

Update Failure

etc.

Once they know these

Ticket handling speed doubles.

---

# Create Application Playbooks

Every application should have exactly the same structure.

```
QuickBooks

1. Overview

2. Architecture

3. Common Modules

4. Installation

5. Services

6. File Locations

7. Logs

8. Common Errors

9. Troubleshooting Flow

10. Escalation Matrix

11. OEM Contacts

12. Top 50 Issues

13. FAQs

14. Decision Trees
```

Do this for every application.

---

# Measure the Right KPIs

Don't only track "tickets closed."

Track:

* Average first response time
* Average resolution time
* SLA compliance %
* First Contact Resolution (FCR)
* KB reuse rate
* Number of new KB articles created
* Repeat tickets
* Escalation rate
* OEM escalation rate
* Customer satisfaction (if available)

These metrics show whether your training is improving operational performance.

---

# Since You're Building a KMS

This is the perfect opportunity to make your KMS more than a documentation repository.

Create a structured learning path:

```
Application Support Academy

Level 1
│
├── Support Fundamentals
├── Communication
├── SLA
├── Ticket Handling
├── Documentation
└── Knowledge Base Usage

↓

Level 2

├── QuickBooks Fundamentals
├── CCH Axcess Fundamentals
├── Common Troubleshooting
└── Top 50 Issues

↓

Level 3

├── Advanced Troubleshooting
├── Root Cause Analysis
├── OEM Collaboration
├── Knowledge Creation
└── Mentoring Others
```

As engineers complete modules, unlock the next level. Combine short lessons (10–15 minutes), decision trees, quizzes, and hands-on ticket simulations. That way, new team members become productive faster, and the knowledge stays inside your organization instead of depending on Google or GPT.

## What I would do if I were leading this team

Given your 15-day deadline and the fact that you're also building the KMS, I would focus on **only two applications first: QuickBooks and CCH Axcess**. They represent your immediate priority, and the same support methodology will transfer to Drake, Lacerte, UltraTax, and Transaction Pro later.

A practical 15-day plan would be:

* **Days 1–3:** Application Support Fundamentals (communication, SLA, ticket lifecycle, escalation, documentation).
* **Days 4–6:** QuickBooks fundamentals and the top 25 recurring issues.
* **Days 7–9:** CCH Axcess fundamentals and the top 25 recurring issues.
* **Days 10–12:** Live ticket shadowing, role-playing, and troubleshooting drills using real past tickets.
* **Days 13–15:** Mock ticket handling under SLA conditions, with reviews of communication quality, technical accuracy, and KB updates.

This approach gives your team a repeatable support process, reduces dependency on ad hoc internet searches, and simultaneously builds a reusable knowledge base that will continue to improve resolution times after the initial training.
