# Conflict Management API Documentation

## Overview
The conflict management system allows executives to log scheduling conflicts and enables secretaries to resolve them through various coordination mechanisms.

## Base URL
```
http://localhost:5000/api
```

---

## Conflict API Endpoints

### 1. Manual Conflict Logging (Executive)

**Endpoint:** `POST /meetings/conflicts/manual`

**Authentication:** Required (JWT Bearer Token)

**Description:** Allows executives to manually log a scheduling conflict when they cannot attend a proposed meeting.

**Request Body:**
```json
{
  "title": "Project Review Meeting",
  "startTime": "2025-11-15T10:00:00Z",
  "endTime": "2025-11-15T11:00:00Z",
  "participantEmails": ["exec1@example.com", "exec2@example.com"],
  "venue": "Conference Room A",
  "project": "Project Alpha",
  "notes": "Conflict with another meeting",
  "overlaps": [
    {
      "executiveEmail": "exec1@example.com",
      "conflicts": [
        {
          "type": "meeting",
          "title": "Board Meeting",
          "startTime": "2025-11-15T09:30:00Z",
          "endTime": "2025-11-15T11:00:00Z",
          "status": "scheduled"
        }
      ]
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "msg": "Conflict logged and secretary notified.",
  "meeting": {
    "_id": "meeting_id",
    "title": "Project Review Meeting",
    "status": "conflict",
    "hasConflict": true,
    "conflictStatus": "open"
  },
  "conflict": {
    "_id": "conflict_id",
    "meeting": "meeting_id",
    "status": "open",
    "overlaps": [...]
  }
}
```

**Error Responses:**
- `400`: Missing required fields or invalid data
- `401`: Unauthorized (invalid/missing token)
- `409`: No conflicts detected for the provided time range
- `500`: Server error

---

### 2. List All Conflicts (Secretary)

**Endpoint:** `GET /secretary/conflicts`

**Authentication:** Required (Secretary role)

**Query Parameters:**
- `status` (optional): Filter by status (`open`, `in_progress`, `resolved`, `escalated`)
- `limit` (optional): Number of results (default: 25, max: 100)
- `summary` (optional): If `true`, returns summary statistics instead of full list

**Request Example:**
```
GET /api/secretary/conflicts?status=open&limit=10
```

**Response (200 OK):**
```json
{
  "conflicts": [
    {
      "_id": "conflict_id",
      "meeting": {
        "title": "Project Review Meeting",
        "startTime": "2025-11-15T10:00:00Z",
        "endTime": "2025-11-15T11:00:00Z"
      },
      "requestedBy": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "status": "open",
      "overlaps": [...],
      "createdAt": "2025-11-13T10:00:00Z"
    }
  ]
}
```

**Summary Response (when `summary=true`):**
```json
{
  "summary": {
    "open": 5,
    "in_progress": 3,
    "resolved": 10,
    "escalated": 1
  },
  "lastUpdated": "2025-11-13T10:00:00Z",
  "openMeetings": 5
}
```

---

### 3. Get Conflict Details (Secretary)

**Endpoint:** `GET /secretary/conflicts/:id`

**Authentication:** Required (Secretary role)

**Response (200 OK):**
```json
{
  "conflict": {
    "_id": "conflict_id",
    "meeting": {...},
    "requestedBy": {...},
    "participantEmails": ["exec1@example.com", "exec2@example.com"],
    "status": "open",
    "overlaps": [...],
    "proposedOptions": [],
    "consultations": [],
    "history": [
      {
        "action": "conflict_detected",
        "notes": "Scheduling conflict detected",
        "actor": "user_id",
        "actorRole": "executive",
        "createdAt": "2025-11-13T10:00:00Z"
      }
    ]
  }
}
```

---

### 4. Add Proposed Time Slot (Secretary)

**Endpoint:** `PATCH /secretary/conflicts/:id/proposals`

**Authentication:** Required (Secretary role)

**Description:** Secretary proposes a new time slot for the conflicted meeting.

**Request Body:**
```json
{
  "startTime": "2025-11-15T14:00:00Z",
  "endTime": "2025-11-15T15:00:00Z",
  "notes": "Alternative time slot when all participants are available"
}
```

**Response (200 OK):**
```json
{
  "conflict": {
    "_id": "conflict_id",
    "status": "in_progress",
    "proposedOptions": [
      {
        "startTime": "2025-11-15T14:00:00Z",
        "endTime": "2025-11-15T15:00:00Z",
        "notes": "Alternative time slot...",
        "createdBy": "secretary_id",
        "createdAt": "2025-11-13T11:00:00Z"
      }
    ]
  }
}
```

---

### 5. Record Executive Consultation (Secretary)

**Endpoint:** `PATCH /secretary/conflicts/:id/consultations`

**Authentication:** Required (Secretary role)

**Description:** Record a consultation with an executive regarding the conflict.

**Request Body:**
```json
{
  "executiveId": "exec_id",
  "executiveEmail": "exec@example.com",
  "executiveName": "Jane Smith",
  "decision": "approved",
  "notes": "Confirmed availability for the proposed time"
}
```

**Valid Decision Values:**
- `pending`: No decision yet
- `approved`: Executive approves the proposal
- `declined`: Executive declines the proposal

**Response (200 OK):**
```json
{
  "conflict": {
    "_id": "conflict_id",
    "consultations": [
      {
        "executive": "exec_id",
        "executiveEmail": "exec@example.com",
        "executiveName": "Jane Smith",
        "decision": "approved",
        "notes": "Confirmed availability...",
        "recordedBy": "secretary_id",
        "recordedAt": "2025-11-13T12:00:00Z"
      }
    ]
  }
}
```

---

### 6. Resolve Conflict (Secretary)

**Endpoint:** `PATCH /secretary/conflicts/:id/resolve`

**Authentication:** Required (Secretary role)

**Description:** Resolve the conflict by setting a final meeting time. This updates the original meeting, notifies participants, and updates their task lists.

**Request Body:**
```json
{
  "startTime": "2025-11-15T14:00:00Z",
  "endTime": "2025-11-15T15:00:00Z",
  "resolutionNotes": "Rescheduled after consulting all participants"
}
```

**Response (200 OK):**
```json
{
  "conflict": {
    "_id": "conflict_id",
    "status": "resolved",
    "resolutionNotes": "Rescheduled after consulting all participants",
    "resolvedBy": "secretary_id"
  },
  "meeting": {
    "_id": "meeting_id",
    "title": "Project Review Meeting",
    "startTime": "2025-11-15T14:00:00Z",
    "endTime": "2025-11-15T15:00:00Z",
    "status": "pending",
    "hasConflict": false,
    "conflictStatus": "resolved"
  }
}
```

**Side Effects:**
- Meeting times are updated
- Meeting status changes to `pending`
- All participants' task lists are updated
- Invited participants' status resets to `invited` (except the requester who is marked `accepted`)

---

### 7. Escalate Conflict (Secretary)

**Endpoint:** `POST /secretary/conflicts/:id/escalate`

**Authentication:** Required (Secretary role)

**Description:** Escalate the conflict to a higher authority when it cannot be resolved through normal coordination.

**Request Body:**
```json
{
  "reason": "Unable to find mutually agreeable time after multiple consultations"
}
```

**Response (200 OK):**
```json
{
  "conflict": {
    "_id": "conflict_id",
    "status": "escalated",
    "history": [
      {
        "action": "conflict_escalated",
        "notes": "Unable to find mutually agreeable time...",
        "actor": "secretary_id",
        "actorRole": "secretary",
        "createdAt": "2025-11-13T15:00:00Z"
      }
    ]
  }
}
```

---

## Conflict Workflow

```
1. Executive creates meeting with conflicts
   ↓
2. System detects conflicts OR Executive manually logs conflict
   ↓
3. Meeting status = 'conflict', Conflict status = 'open'
   ↓
4. Secretary views conflict in dashboard
   ↓
5. Secretary proposes alternative time slots
   ↓
6. Conflict status = 'in_progress'
   ↓
7. Secretary consults with executives
   ↓
8. Secretary records consultations and decisions
   ↓
9a. If successful → Secretary resolves conflict
    - Conflict status = 'resolved'
    - Meeting rescheduled with new time
    - Participants' tasks updated
   ↓
9b. If unsuccessful → Secretary escalates
    - Conflict status = 'escalated'
    - Higher authority intervention required
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid authentication token |
| 403 | Forbidden - Insufficient permissions (e.g., not a secretary) |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## Authentication

All endpoints require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token should be obtained from the login endpoint (`POST /api/auth/login`) and contains:
- User ID
- User role (executive/secretary)
- User email

Secretary-specific endpoints (`/api/secretary/*`) additionally check that the user's role is 'secretary'.

---

## Data Models

### Conflict Schema
```javascript
{
  meeting: ObjectId,              // Reference to Meeting
  requestedBy: ObjectId,          // Reference to Executive
  participantEmails: [String],    // List of participant emails
  participantIds: [ObjectId],     // List of Executive IDs
  conflictReason: String,         // Reason for conflict
  status: String,                 // 'open', 'in_progress', 'resolved', 'escalated'
  overlaps: [ConflictOverlap],    // Details of scheduling conflicts
  proposedOptions: [Proposal],    // Alternative time slots
  resolutionNotes: String,        // Final resolution details
  resolvedBy: ObjectId,           // Secretary who resolved
  consultations: [Consultation],  // Executive consultations
  history: [HistoryEntry],        // Audit trail
  createdAt: Date,
  updatedAt: Date
}
```

### ConflictOverlap
```javascript
{
  executive: ObjectId,
  executiveEmail: String,
  conflicts: [
    {
      type: String,           // 'meeting' or 'task'
      refId: ObjectId,        // Reference to meeting/task
      title: String,
      startTime: Date,
      endTime: Date,
      notes: String,
      status: String
    }
  ]
}
```

### Proposal
```javascript
{
  startTime: Date,
  endTime: Date,
  notes: String,
  createdBy: ObjectId,      // Secretary ID
  createdAt: Date
}
```

### Consultation
```javascript
{
  executive: ObjectId,
  executiveName: String,
  executiveEmail: String,
  decision: String,         // 'pending', 'approved', 'declined'
  notes: String,
  recordedBy: ObjectId,     // Secretary ID
  recordedAt: Date,
  updatedAt: Date
}
```

---

## Notes

1. **Automatic Conflict Detection**: When creating meetings via `/api/meetings/create-and-addtasks`, the system automatically checks for scheduling conflicts and creates conflict records if found.

2. **Manual Conflict Logging**: Executives can also manually log conflicts via `/api/meetings/conflicts/manual` when they identify a conflict that wasn't automatically detected.

3. **Secretary Notifications**: When conflicts are created, secretaries assigned to the involved executives receive notifications.

4. **Task Synchronization**: When conflicts are resolved, the system automatically updates the task lists of all involved executives.

5. **Audit Trail**: All actions on a conflict are recorded in the `history` array for accountability and tracking.
