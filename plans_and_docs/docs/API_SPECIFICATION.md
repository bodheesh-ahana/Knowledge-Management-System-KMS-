# REST API Specification

**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-27  

---

## API Overview

**Base URL:** `https://kms.yourdomain.com/api`  
**Response Format:** JSON  
**Authentication:** Bearer Token (JWT) or Session Cookie  
**Rate Limit:** 100 requests/minute per user  

---

## Authentication Endpoints

### POST /api/auth/login

Sign in user (Microsoft OAuth or email).

**Request:**
```json
{
  "provider": "microsoft" | "email",
  "email": "user@example.com",
  "password": "string" // Only for email provider
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "Engineer",
    "avatar": "https://..."
  },
  "token": "eyJhbGc..." // JWT token
}
```

**Errors:**
- 400 Bad Request – Invalid input
- 401 Unauthorized – Invalid credentials
- 404 Not Found – User not found

---

### GET /api/auth/session

Get current user session.

**Response (200 OK):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "Engineer"
  },
  "expiresAt": "2025-01-01T10:00:00Z"
}
```

**Errors:**
- 401 Unauthorized – No active session

---

### POST /api/auth/logout

Sign out user.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Knowledge Base Endpoints

### GET /api/knowledge

List knowledge articles with pagination and filtering.

**Query Parameters:**
```
page=1 (default: 1)
limit=20 (default: 20, max: 100)
status=Published (filter by status)
application=Drake (filter by application)
owner=user_id (filter by owner)
tags=tag1,tag2 (filter by tags)
sort=updatedAt (updatedAt, views, helpful)
search=query (search in title, symptoms)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "article_id",
      "title": "Drake Icons Not Displaying",
      "application": "Drake",
      "owner": { "id": "user_id", "name": "John Doe" },
      "status": "Published",
      "difficulty": "Easy",
      "views": 45,
      "helpful": 12,
      "updatedAt": "2025-01-01T10:00:00Z",
      "tags": ["icons", "display"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

**Errors:**
- 400 Bad Request – Invalid query parameters

---

### GET /api/knowledge/:id

Get full article details.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "article_id",
    "title": "Drake Icons Not Displaying",
    "slug": "drake-icons-not-displaying",
    "application": "Drake",
    "issueType": "Access",
    "symptoms": "Drake application icons are not visible...",
    "rootCause": "Mapped folder missing on server...",
    "troubleshootingSteps": [
      {
        "stepNumber": 1,
        "title": "Verify Mapped Drive",
        "description": "Check if the drive is mapped...",
        "commands": ["net use"]
      }
    ],
    "resolution": "Map the required folder...",
    "prevention": "Validate mapping during onboarding...",
    "owner": { "id": "user_id", "name": "John Doe", "email": "john@example.com" },
    "reviewer": { "id": "lead_id", "name": "Reviewer Name" },
    "contributors": [],
    "difficulty": "Easy",
    "estimatedResolutionTime": 15,
    "tags": ["drake", "icons", "folder", "mapping"],
    "relatedArticles": ["article_id_2", "article_id_3"],
    "relatedTickets": ["#215823", "#212672"],
    "attachments": [
      {
        "id": "attachment_id",
        "fileName": "screenshot.png",
        "url": "https://cdn...",
        "uploadedBy": { "id": "user_id", "name": "John Doe" }
      }
    ],
    "version": 1,
    "views": 45,
    "helpful": 12,
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-02T14:00:00Z",
    "publishedAt": "2025-01-01T10:30:00Z"
  }
}
```

**Errors:**
- 404 Not Found – Article not found
- 403 Forbidden – No access to article

---

### POST /api/knowledge

Create new knowledge article.

**Request Headers:**
```
Authorization: Bearer token
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Drake Icons Not Displaying",
  "application": "Drake",
  "issueType": "Access",
  "symptoms": "Drake application icons are not visible...",
  "rootCause": "Mapped folder missing on server...",
  "troubleshootingSteps": [
    {
      "stepNumber": 1,
      "title": "Verify Mapped Drive",
      "description": "Check if the drive is mapped..."
    }
  ],
  "resolution": "Map the required folder...",
  "prevention": "Validate mapping during onboarding...",
  "difficulty": "Easy",
  "estimatedResolutionTime": 15,
  "tags": ["drake", "icons"],
  "status": "Draft" | "Published",
  "attachments": ["attachment_id_1", "attachment_id_2"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "new_article_id",
    "title": "Drake Icons Not Displaying",
    "slug": "drake-icons-not-displaying",
    "status": "Draft",
    "owner": { "id": "current_user_id", "name": "Current User" },
    "createdAt": "2025-01-03T10:00:00Z"
  }
}
```

**Errors:**
- 400 Bad Request – Validation failed
- 401 Unauthorized – Not authenticated
- 403 Forbidden – Insufficient permissions
- 409 Conflict – Duplicate article

---

### PUT /api/knowledge/:id

Update knowledge article.

**Request:**
```json
{
  "title": "Updated Title",
  "symptoms": "Updated symptoms...",
  "status": "Draft" | "Published",
  // ... other fields
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { /* updated article */ }
}
```

**Errors:**
- 400 Bad Request – Validation failed
- 403 Forbidden – Not owner or reviewer
- 404 Not Found – Article not found

---

### DELETE /api/knowledge/:id

Archive knowledge article (soft delete).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Article archived"
}
```

**Errors:**
- 403 Forbidden – Not owner or admin
- 404 Not Found – Article not found

---

### GET /api/knowledge/search

Full-text search.

**Query Parameters:**
```
q=query (required)
limit=20 (default: 20)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "article_id",
      "title": "Drake Icons Not Displaying",
      "snippet": "Drake application icons are not visible due to folder mapping...",
      "score": 0.95,
      "type": "KnowledgeArticle"
    }
  ]
}
```

---

### GET /api/knowledge/validate-duplicate

Check for duplicate articles.

**Query Parameters:**
```
title=query
```

**Response (200 OK):**
```json
{
  "success": true,
  "isDuplicate": true,
  "similar": [
    {
      "id": "article_id",
      "title": "Drake Icons Not Displaying",
      "similarity": 0.85
    }
  ]
}
```

---

## Ticket Endpoints

### GET /api/tickets

List tickets.

**Query Parameters:**
```
page=1
limit=20
status=Open
application=Drake
owner=user_id
priority=P1
search=query
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ticket_id",
      "ticketId": "#215823",
      "title": "Issue with Drake Icons",
      "requesterName": "Jeevan Balluri",
      "application": "Drake",
      "priority": "P3",
      "status": "Closed",
      "owner": { "id": "user_id", "name": "Support Engineer" },
      "linkedKnowledgeArticles": 1,
      "createdAt": "2025-01-01T10:00:00Z",
      "closedAt": "2025-01-02T14:00:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### GET /api/tickets/:id

Get ticket details.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "ticket_id",
    "ticketId": "#215823",
    "title": "Issue with Drake Icons",
    "description": "Drake application icons are not displaying...",
    "requesterName": "Jeevan Balluri",
    "requesterEmail": "jeevan@example.com",
    "application": "Drake",
    "priority": "P3",
    "status": "Closed",
    "owner": { "id": "user_id", "name": "Support Engineer" },
    "contributors": [],
    "linkedKnowledgeArticles": [
      {
        "id": "article_id",
        "title": "Drake Icons Not Displaying",
        "slug": "drake-icons-not-displaying"
      }
    ],
    "internalNotes": [
      {
        "author": { "id": "user_id", "name": "Engineer" },
        "note": "Folder mapping resolved the issue",
        "timestamp": "2025-01-02T10:00:00Z"
      }
    ],
    "attachments": [],
    "createdAt": "2025-01-01T10:00:00Z",
    "closedAt": "2025-01-02T14:00:00Z",
    "resolutionTime": 120 // minutes
  }
}
```

---

### POST /api/tickets

Create new ticket.

**Request:**
```json
{
  "ticketId": "#215823",
  "title": "Issue with Drake Icons",
  "description": "Drake application icons are not displaying...",
  "requesterName": "Jeevan Balluri",
  "application": "Drake",
  "priority": "P3"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": { /* created ticket */ }
}
```

---

### POST /api/tickets/:id/link-knowledge

Link knowledge article to ticket.

**Request:**
```json
{
  "knowledgeArticleId": "article_id"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { /* updated ticket with linked KB */ }
}
```

---

## Activity (Tracker) Endpoints

### POST /api/activities

Log work entry.

**Request:**
```json
{
  "activityType": "Investigation",
  "description": "Investigated Drake icon issue",
  "hoursSpent": 0.5,
  "activityDate": "2025-01-03",
  "ticket": "ticket_id",
  "knowledgeArticle": "article_id",
  "status": "Draft" | "Submitted"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "activity_id",
    "engineer": "current_user_id",
    "hoursSpent": 0.5,
    "status": "Draft",
    "createdAt": "2025-01-03T10:00:00Z"
  }
}
```

---

### GET /api/activities

List activities.

**Query Parameters:**
```
engineer=user_id (own or team's)
startDate=2025-01-01
endDate=2025-01-31
status=Submitted
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "activity_id",
      "engineer": { "id": "user_id", "name": "John Doe" },
      "activityType": "Investigation",
      "hoursSpent": 0.5,
      "activityDate": "2025-01-03",
      "status": "Submitted",
      "ticket": { "id": "ticket_id", "ticketId": "#215823" }
    }
  ]
}
```

---

### GET /api/reports/team

Get team performance report.

**Query Parameters:**
```
startDate=2025-01-01
endDate=2025-01-31
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2025-01-01",
      "end": "2025-01-31"
    },
    "totalHours": 160,
    "engineers": [
      {
        "id": "user_id",
        "name": "John Doe",
        "hoursLogged": 40,
        "ticketsResolved": 12,
        "knowledgeCreated": 3,
        "utilization": 0.95
      }
    ],
    "byActivityType": {
      "Investigation": 60,
      "Development": 40,
      "Testing": 30,
      "Training": 20,
      "Meeting": 10
    },
    "byApplication": {
      "Drake": 50,
      "QBD": 35,
      "CCH": 40,
      "Axcess": 35
    }
  }
}
```

---

## Application Endpoints

### GET /api/applications

List applications.

**Query Parameters:**
```
page=1
limit=20
status=Active
healthStatus=Stable
owner=user_id
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "app_id",
      "name": "Drake",
      "vendor": "Thomson Reuters",
      "status": "Active",
      "healthStatus": "Stable",
      "owner": { "id": "user_id", "name": "Rajarshi" },
      "knownIssuesCount": 5,
      "openTicketsCount": 2,
      "knowledgeCount": 15
    }
  ]
}
```

---

### GET /api/applications/:id

Get application details.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "app_id",
    "name": "Drake",
    "slug": "drake",
    "vendor": "Thomson Reuters",
    "version": "2024",
    "description": "Tax preparation software...",
    "status": "Active",
    "healthStatus": "Stable",
    "owner": { "id": "user_id", "name": "Rajarshi" },
    "servers": [
      {
        "serverName": "Prod-01",
        "environment": "Production",
        "ipAddress": "192.168.1.1",
        "versionDeployed": "2024",
        "lastUpdated": "2025-01-01"
      }
    ],
    "knowledgeArticles": [
      {
        "id": "article_id",
        "title": "Drake Icons Not Displaying",
        "slug": "drake-icons-not-displaying"
      }
    ],
    "recentTickets": [
      {
        "id": "ticket_id",
        "ticketId": "#215823",
        "title": "Issue with Drake Icons"
      }
    ],
    "vendorContact": "support@thomsonreuters.com",
    "internalContact": [
      { "id": "user_id", "name": "Rajarshi", "role": "Owner" }
    ]
  }
}
```

---

## Search Endpoints

### GET /api/search/global

Cross-module search.

**Query Parameters:**
```
q=query (required)
limit=20
types=KnowledgeArticle,Ticket,Application,User (optional)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "knowledge": [
      {
        "id": "article_id",
        "type": "KnowledgeArticle",
        "title": "Drake Icons Not Displaying",
        "snippet": "Drake application icons are not visible...",
        "score": 0.95
      }
    ],
    "tickets": [
      {
        "id": "ticket_id",
        "type": "Ticket",
        "ticketId": "#215823",
        "title": "Issue with Drake Icons",
        "score": 0.85
      }
    ],
    "applications": [
      {
        "id": "app_id",
        "type": "Application",
        "name": "Drake",
        "score": 0.75
      }
    ],
    "users": []
  }
}
```

---

### GET /api/search/suggestions

Get search suggestions.

**Query Parameters:**
```
q=query (required)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "recent": ["Drake icons", "QBD corrupted"],
    "popular": ["Drake login", "QBD password", "CCH installation"],
    "suggested": ["Drake icons not displaying", "Drake login failed"]
  }
}
```

---

## User Endpoints

### GET /api/users/:id

Get user profile.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Engineer",
    "avatar": "https://...",
    "bio": "Application support engineer with 5 years experience",
    "skills": ["Drake", "QBD", "CCH"],
    "department": "Application Support",
    "stats": {
      "articlesCreated": 25,
      "articlesReviewed": 10,
      "ticketsResolved": 150,
      "hoursLogged": 480,
      "knowledgeScore": 280
    },
    "recentContributions": [
      { "type": "Article", "title": "...", "date": "2025-01-03" }
    ],
    "joinedAt": "2024-06-01"
  }
}
```

---

### PUT /api/users/:id

Update user profile.

**Request:**
```json
{
  "name": "Updated Name",
  "bio": "Updated bio",
  "skills": ["Drake", "QBD"],
  "preferences": {
    "theme": "dark",
    "emailNotifications": true
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { /* updated user */ }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Input validation failed |
| AUTHENTICATION_REQUIRED | 401 | User not authenticated |
| PERMISSION_DENIED | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| DUPLICATE_RESOURCE | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## Rate Limiting

**Limits:**
- 100 requests/minute per authenticated user
- 20 requests/minute per IP (unauthenticated)

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704294000
```

---

## Pagination

All list endpoints support pagination:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8,
    "hasMore": true
  }
}
```

---

**Document Status:** ✅ Ready for Development
