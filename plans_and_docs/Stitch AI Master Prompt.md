Since you're using **Stitch AI**, don't ask it to generate one screen at a time. Ask it to design the **entire product** as if it were a commercial SaaS application (similar to Linear, Notion, Jira, GitHub, or Atlassian). The UI should prioritize speed, low cognitive load, and minimal clicks because engineers will already be updating ManageEngine.

Below is a **master prompt** you can directly paste into Stitch AI.

---

# 🎨 Stitch AI Master Prompt – Internal Application Support Knowledge Management System (KMS)

---

## Project Overview

Design a modern, premium-quality **responsive web application** for an **Internal Application Support Knowledge Management System (KMS)** used by an enterprise IT Application Support Team.

The purpose of the application is **NOT** ticket management.

The application is an internal knowledge repository that captures troubleshooting knowledge from resolved tickets, allowing engineers to search previous solutions instead of depending on senior team members.

The application should feel like a combination of:

* Linear
* Notion
* Jira
* GitHub
* ServiceNow Knowledge Base
* Atlassian Confluence

The interface should be modern, minimal, extremely fast, and designed for engineers who spend all day resolving tickets.

---

# Design Goals

The UI must make engineers feel they are doing **less work**, not more.

Primary goals:

* Minimal typing
* Maximum automation
* Modern SaaS design
* Beautiful but distraction-free
* Clean spacing
* Large search experience
* Rich dashboards
* Fast navigation
* Professional enterprise appearance

Avoid clutter.

Avoid overwhelming forms.

Use progressive disclosure.

Only show advanced fields when needed.

---

# Design Language

Design Style

* Modern SaaS
* Enterprise
* Minimal
* Flat UI
* Rounded corners
* Soft shadows
* Glassmorphism only where appropriate
* High readability

Typography

* Inter
* Geist
* SF Pro style

Spacing

Generous whitespace

Large cards

Clear visual hierarchy

Icons

Lucide Icons

Colour Palette

Professional Blue

Slate

Indigo

Emerald

Orange for warnings

Red only for critical alerts

---

# Theme Support

Design both

✔ Light Mode

✔ Dark Mode

Theme switching should be available from the top navigation.

Dark mode should feel similar to

GitHub Dark

Linear Dark

Notion Dark

---

# Layout

Desktop First

Minimum Resolution

1440px

Responsive

Tablet support

Mobile support

Layout

```
---------------------------------------------------

Top Navigation

---------------------------------------------------

Sidebar | Main Content

Sidebar | Main Content

Sidebar | Main Content

---------------------------------------------------
```

---

# Sidebar

Collapsible

Contains

Dashboard

Knowledge Base

Tickets

Applications

Internal Tracker

Analytics

Documents

Notifications

Users

Settings

Pinned Applications

Favorites

Drafts

Recent Entries

Help

Sidebar should support

Expand

Collapse

Hover tooltips

---

# Top Navigation

Contains

Global Search

Quick Add Button

Notifications

Theme Switch

Profile

Settings

Keyboard Shortcut Hint

Search should remain visible on every page.

---

# Global Search

Most important UI element.

Large search bar.

Supports

Ticket Number

Application

Issue

Symptoms

Engineer

Tags

Server

Knowledge Article

Commands

Documents

Search results should appear instantly.

Like

VS Code Command Palette

Notion Search

GitHub Search

---

# Dashboard

Create a beautiful executive dashboard.

Widgets

Open Tickets

Closed Today

Pending Articles

Knowledge Articles

Applications

Engineers Online

Knowledge Reuse

Average Resolution Time

Charts

Tickets Trend

Top Applications

Most Common Issues

Knowledge Growth

Engineer Contribution

Knowledge Leaderboard

Recent Activities

Pending Reviews

Recent Tickets

Quick Search

Pinned Applications

Favourite Articles

Recent Drafts

---

# Knowledge Base Screen

Professional article listing.

Top

Search

Filters

Application

Category

Owner

Status

Tags

Date

Cards

Each article

Title

Application

Difficulty

Views

Owner

Updated

Tags

Quick Actions

Clicking article

Opens beautiful article page

Like Notion

Sections

Symptoms

Root Cause

Troubleshooting

Resolution

Lessons Learned

Prevention

Attachments

Comments

Version History

Related Tickets

Related Articles

---

# Ticket Repository

Table View

Kanban View

Compact View

Columns

Ticket

Title

Application

Owner

Priority

Status

Knowledge Linked

Created

Closed

Top Right

Import Ticket

Quick Add

Filter

Export

---

# Ticket Details

Timeline

Requester

Conversation

Internal Notes

Attachments

Knowledge Link

Tracker Entries

Comments

Resolution

Audit Log

Activity

---

# Quick Create Ticket

This is extremely important.

Engineer should finish within

2 minutes.

Only ask

Ticket ID

Application

Issue

Root Cause

Resolution

Owner

Save

Everything else

Optional

Expandable

---

# Smart Form

Progressive Form

Basic Details

↓

Advanced Details

↓

Attachments

↓

Knowledge

↓

Review

Use

Accordion Layout

Auto Save

Draft Saving

---

# Internal Tracker

Beautiful table

Spreadsheet style

Columns

Engineer

Ticket

Hours

Role

Activity

Date

SLA

Escalation

Filters

Engineer

Application

Date

Charts

Hours Worked

Knowledge Created

Ticket Ownership

---

# Applications Page

Card Layout

Each application

Logo

Name

Version

Owner

Known Issues

Knowledge Count

Ticket Count

Click

Application Dashboard

Contains

Overview

Servers

Installation Guide

Known Issues

FAQs

Knowledge

Tickets

Contacts

Documents

Version History

---

# Analytics

Premium dashboard

Charts

Line

Bar

Pie

Heatmap

Leaderboard

Reports

Export

PDF

Excel

---

# Documents

Grid View

List View

Folders

Search

Preview

Tags

Version

Uploader

---

# Notifications

Modern notification center

Unread

Mentions

Reviews

Comments

Approvals

---

# User Profile

Photo

Role

Applications

Knowledge Score

Articles

Resolved Tickets

Hours

Recent Activities

Achievements

---

# Settings

Profile

Theme

Notifications

Applications

Keyboard Shortcuts

API

Security

Roles

---

# Keyboard Shortcuts

Design

Command Palette

CTRL + K

Search

CTRL + N

New Ticket

CTRL + SHIFT + K

Knowledge Article

CTRL + /

Shortcuts

---

# UX Features

Include all

Dark Mode

Light Mode

Keyboard Shortcuts

Global Search

Auto Save

Recent Entries

Pinned Applications

Favorites

Drafts

Offline Draft

Command Palette

Undo

Autosuggestion

Recent Searches

Drag & Drop Attachments

Infinite Scroll

Resizable Sidebar

Resizable Tables

Breadcrumb Navigation

Context Menus

Quick Actions

Floating Action Button

Sticky Search Bar

Sticky Filters

Empty States

Loading Skeletons

Toast Notifications

Auto Complete

Autosave Indicator

Draft Recovery

Smart Filters

Bulk Edit

Multi Select

Column Visibility

Saved Views

Bookmarks

Pinned Knowledge Articles

---

# Search Experience

Search should behave like

VS Code

Typing

```
Drake Login
```

Immediately shows

Knowledge

Tickets

Applications

Engineers

Documents

Commands

---

# Empty States

Every page should have premium illustrations

No Tickets

No Articles

No Search Results

No Notifications

No Drafts

---

# Forms

Every form

Minimal

Multi-step

Auto Save

Validation

Helpful Tooltips

AI Suggestions

Suggested Tags

Suggested Troubleshooting

Suggested Root Cause

---

# AI Ready

Reserve UI for future AI

Generate Summary

Suggest Root Cause

Suggest Resolution

Similar Articles

Generate Knowledge Article

AI Chat Assistant

---

# Interaction Style

Animations

Smooth

Professional

Fast

Hover Effects

Micro Interactions

Soft Shadows

Rounded Cards

Premium SaaS Feel

---

# Accessibility

Keyboard Navigation

High Contrast

Screen Reader Friendly

Responsive

WCAG AA

---

# Deliverables

Design the complete application including

* Login
* Dashboard
* Knowledge Base
* Knowledge Details
* Knowledge Editor
* Tickets
* Ticket Details
* Quick Ticket Entry
* Applications
* Application Details
* Internal Tracker
* Analytics
* Documents
* Notifications
* User Profile
* Settings
* Global Search Overlay
* Command Palette
* AI Assistant Panel
* Mobile Responsive Views
* Dark Theme
* Light Theme

The final design should feel like a polished enterprise product from Microsoft, Atlassian, or GitHub, optimized for application support engineers. Every interaction should reduce manual effort, encourage documentation, and make knowledge retrieval faster than asking another team member.
