# Conflict Management System - Workflow Documentation

## System Overview

The Time Management Software includes a comprehensive conflict management system that automatically detects scheduling conflicts and provides tools for secretaries to resolve them through coordination with executives.

## Objective

The conflict management system aims to:
1. Automatically detect scheduling conflicts when meetings are created
2. Provide secretaries with tools to resolve conflicts efficiently
3. Maintain an audit trail of all conflict resolution activities
4. Minimize scheduling disruptions through proactive conflict handling
5. Enable transparent communication between executives and secretaries

## Key Components

### 1. Conflict Detection Engine
- **Automatic Detection**: Analyzes meeting creation requests against existing meetings and tasks
- **Manual Logging**: Allows executives to report conflicts not caught by automatic detection
- **Overlap Analysis**: Identifies time overlaps across multiple executives and their commitments

### 2. Secretary Dashboard
- **Conflict Queue**: Lists all open and in-progress conflicts
- **Summary Statistics**: Shows conflict counts by status
- **Priority Indicators**: Highlights urgent conflicts requiring immediate attention

### 3. Resolution Workflow
- **Proposal System**: Secretaries can propose alternative time slots
- **Consultation Tracking**: Records discussions with executives
- **Decision Management**: Captures approval/decline decisions from participants
- **Automatic Rescheduling**: Updates meetings and tasks when conflicts are resolved

## Workflow Diagrams

### Automatic Conflict Detection Flow

```
┌─────────────────────────────────────────┐
│  Executive Creates Meeting             │
│  (via /api/meetings/create-and-addtasks)│
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  System Checks for Conflicts           │
│  - Existing meetings                   │
│  - Scheduled tasks                     │
│  - Time overlaps                       │
└──────────────┬──────────────────────────┘
               │
         ┌─────┴─────┐
         │           │
    No Conflict   Conflict Found
         │           │
         ▼           ▼
┌────────────┐  ┌─────────────────────────┐
│ Meeting    │  │ Create Conflict Record  │
│ Created    │  │ Status: 'open'          │
│ Status:    │  │ Meeting Status:         │
│ 'pending'  │  │ 'conflict'              │
└────────────┘  └──────────┬──────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ Notify Assigned         │
                │ Secretaries             │
                │ - In-app notification   │
                │ - Email notification    │
                └─────────────────────────┘
```

### Manual Conflict Logging Flow

```
┌─────────────────────────────────────────┐
│  Executive Identifies Conflict         │
│  (busy/unavailable for proposed time)  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Executive Logs Conflict               │
│  (via /api/meetings/conflicts/manual)  │
│  - Meeting details                     │
│  - Conflicting items                   │
│  - Notes/reason                        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  System Creates:                       │
│  1. Meeting record (status: conflict)  │
│  2. Conflict record (status: open)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Notify Secretaries                    │
│  - Conflict added to their queue       │
│  - Email/notification sent             │
└─────────────────────────────────────────┘
```

### Secretary Conflict Resolution Flow

```
┌─────────────────────────────────────────┐
│  Secretary Views Conflict Dashboard    │
│  - Open conflicts: 5                   │
│  - In progress: 3                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Select Conflict to Handle             │
│  View:                                 │
│  - Meeting details                     │
│  - Participant conflicts               │
│  - Time overlaps                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Analyze Available Time Slots          │
│  - Review participant schedules        │
│  - Identify common availability        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Propose Alternative Times             │
│  (via PATCH /conflicts/:id/proposals)  │
│  Status changes: open → in_progress    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Consult with Executives               │
│  - Contact each participant            │
│  - Confirm availability                │
│  - Record responses                    │
│  (via PATCH /conflicts/:id/consultations)│
└──────────────┬──────────────────────────┘
               │
         ┌─────┴─────┐
         │           │
    All Agree    Cannot Agree
         │           │
         ▼           ▼
┌────────────┐  ┌─────────────────────────┐
│ Resolve    │  │ Escalate Conflict       │
│ Conflict   │  │ (POST /conflicts/:id/   │
│            │  │  escalate)              │
│ Actions:   │  │                         │
│ - Update   │  │ Status: 'escalated'     │
│   meeting  │  │ Requires higher         │
│   time     │  │ authority intervention  │
│ - Update   │  └─────────────────────────┘
│   tasks    │
│ - Notify   │
│   parties  │
│            │
│ Status:    │
│ 'resolved' │
└────────────┘
```

## Data Flow Diagram

### Level 0: Context Diagram

```
                    ┌──────────────┐
                    │              │
    Executive ────▶ │   Conflict   │ ◀──── Secretary
                    │  Management  │
                    │    System    │
                    │              │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   MongoDB    │
                    │   Database   │
                    └──────────────┘
```

### Level 1: System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Conflict Management System                    │
│                                                                  │
│  ┌────────────┐      ┌────────────┐      ┌──────────────┐     │
│  │  Conflict  │      │ Resolution │      │ Notification │     │
│  │  Detection │─────▶│   Engine   │─────▶│   Service    │     │
│  │   Module   │      │            │      │              │     │
│  └────────────┘      └────────────┘      └──────────────┘     │
│         │                   │                     │             │
│         ▼                   ▼                     ▼             │
│  ┌────────────────────────────────────────────────────┐        │
│  │             Database Layer (MongoDB)              │        │
│  │  - Conflicts   - Meetings   - Notifications       │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Level 2: Detailed Data Flow

```
Executive                Secretary              Database          Email Service
    │                       │                      │                   │
    │ 1. Log Conflict      │                      │                   │
    ├──────────────────────┼─────────────────────▶│                   │
    │                       │                      │                   │
    │                       │ 2. Query Conflicts   │                   │
    │                       ├─────────────────────▶│                   │
    │                       │◀─────────────────────┤                   │
    │                       │                      │                   │
    │                       │ 3. Propose Times     │                   │
    │                       ├─────────────────────▶│                   │
    │                       │                      │                   │
    │◀──────────────────────┤ 4. Notify Executive  │                   │
    │                       │                      │                   │
    │ 5. Approve/Decline   │                      │                   │
    ├──────────────────────▶│                      │                   │
    │                       │ 6. Record Decision   │                   │
    │                       ├─────────────────────▶│                   │
    │                       │                      │                   │
    │                       │ 7. Resolve Conflict  │                   │
    │                       ├─────────────────────▶│                   │
    │                       │                      ├──────────────────▶│
    │                       │                      │  8. Send Email    │
    │                       │                      │                   │
    │◀──────────────────────┴──────────────────────┴───────────────────┤
    │                  9. Confirmation Emails                          │
```

## Use Cases

### Use Case 1: Automatic Conflict Detection
**Actor:** Executive (Primary), System (Secondary)
**Precondition:** Executive is authenticated and has scheduled meetings/tasks
**Flow:**
1. Executive creates a new meeting with multiple participants
2. System checks all participants' schedules for the proposed time
3. System detects that Participant A has an existing meeting at the same time
4. System creates a conflict record and marks meeting as 'conflict'
5. System notifies the secretary assigned to Participant A
6. Secretary receives notification in dashboard and via email

**Postcondition:** Conflict is logged and visible to secretary for resolution

### Use Case 2: Manual Conflict Logging
**Actor:** Executive
**Precondition:** Executive identifies a scheduling conflict
**Flow:**
1. Executive opens the event creation interface
2. Executive enters meeting details and participants
3. Executive notices they have a conflict and clicks "Log Conflict"
4. System displays conflict logging form
5. Executive provides details of conflicting items
6. Executive submits the conflict
7. System creates conflict record and notifies secretary

**Postcondition:** Conflict is logged and secretary is notified

### Use Case 3: Conflict Resolution
**Actor:** Secretary (Primary), Executives (Secondary)
**Precondition:** Open conflict exists in the system
**Flow:**
1. Secretary logs into dashboard and views conflict queue
2. Secretary selects a conflict to handle
3. Secretary reviews participant schedules and identifies common availability
4. Secretary proposes 2-3 alternative time slots
5. Secretary contacts each participant (phone/email) to discuss options
6. Secretary records each participant's preference in the system
7. All participants agree on a new time
8. Secretary resolves the conflict with the agreed time
9. System updates the meeting and notifies all participants

**Postcondition:** Conflict is resolved, meeting is rescheduled, participants notified

### Use Case 4: Conflict Escalation
**Actor:** Secretary
**Precondition:** Conflict cannot be resolved through normal coordination
**Flow:**
1. Secretary attempts resolution but participants cannot agree
2. Secretary documents all attempted solutions
3. Secretary clicks "Escalate" button
4. Secretary provides escalation reason
5. System marks conflict as 'escalated'
6. System notifies higher management

**Postcondition:** Conflict is escalated for management intervention

## System Requirements

### Functional Requirements

1. **FR-1: Conflict Detection**
   - System shall automatically detect scheduling conflicts when meetings are created
   - System shall identify conflicts across meetings and tasks
   - System shall support manual conflict logging by executives

2. **FR-2: Conflict Management**
   - Secretaries shall be able to view all conflicts
   - Secretaries shall be able to filter conflicts by status
   - System shall track conflict resolution history

3. **FR-3: Resolution Tools**
   - Secretaries shall be able to propose alternative times
   - Secretaries shall be able to record consultation outcomes
   - System shall support conflict resolution with automatic meeting updates

4. **FR-4: Notifications**
   - System shall notify secretaries when conflicts are created
   - System shall send email notifications for conflict-related events
   - System shall provide in-app notifications

5. **FR-5: Audit Trail**
   - System shall maintain complete history of conflict actions
   - System shall record actor, action, and timestamp for all changes

### Non-Functional Requirements

1. **NFR-1: Performance**
   - Conflict detection shall complete within 2 seconds
   - Dashboard shall load within 1 second
   - API response time shall not exceed 500ms for 95% of requests

2. **NFR-2: Availability**
   - System shall have 99.5% uptime
   - Database backups shall be performed daily

3. **NFR-3: Security**
   - All API endpoints shall require authentication
   - Role-based access control shall be enforced
   - Sensitive data shall be encrypted in transit

4. **NFR-4: Scalability**
   - System shall support up to 1000 concurrent users
   - System shall handle up to 10,000 meetings per day

5. **NFR-5: Usability**
   - Secretary dashboard shall be intuitive and require no training
   - Conflict resolution workflow shall require no more than 5 steps
   - API documentation shall be comprehensive and up-to-date

## Test Cases

### Test Case 1: Automatic Conflict Detection
**Test ID:** TC-001
**Objective:** Verify system detects conflicts automatically
**Preconditions:**
- Executive A has a meeting scheduled from 10:00-11:00
- Executive A is authenticated

**Steps:**
1. Attempt to create new meeting for Executive A from 10:30-11:30
2. Verify conflict is detected
3. Check conflict record is created in database
4. Verify meeting status is 'conflict'
5. Check secretary notification is sent

**Expected Result:** Conflict detected, recorded, and secretary notified

### Test Case 2: Propose Alternative Time
**Test ID:** TC-002
**Objective:** Verify secretary can propose alternative times
**Preconditions:**
- Open conflict exists in system
- Secretary is authenticated

**Steps:**
1. Secretary accesses conflict details
2. Secretary submits proposal with new time (14:00-15:00)
3. Verify proposal is added to conflict record
4. Check conflict status changes to 'in_progress'
5. Verify history entry is created

**Expected Result:** Proposal added successfully and status updated

### Test Case 3: Resolve Conflict
**Test ID:** TC-003
**Objective:** Verify conflict resolution updates meeting
**Preconditions:**
- Conflict with approved proposal exists
- Secretary is authenticated

**Steps:**
1. Secretary resolves conflict with approved time
2. Verify conflict status changes to 'resolved'
3. Check meeting time is updated
4. Verify participant tasks are updated
5. Check notifications are sent to participants

**Expected Result:** Conflict resolved, meeting rescheduled, tasks updated

## Security Considerations

### Authentication
- All API requests require valid JWT token
- Tokens expire after 5 hours
- Token contains user ID, role, and email

### Authorization
- Secretary endpoints require 'secretary' role
- Executives cannot access secretary-only functions
- Conflict resolution limited to assigned secretaries

### Data Protection
- Passwords hashed using bcrypt
- Sensitive data encrypted in database
- HTTPS required in production

### Input Validation
- All user inputs validated
- SQL injection protection via parameterized queries
- XSS protection via input sanitization

## Maintenance and Support

### Monitoring
- Server logs located in `/var/log/time-management/`
- Error logs include stack traces
- Performance metrics tracked via PM2

### Backup
- Database backed up daily at 2 AM
- Backup retention: 30 days
- Recovery procedure documented

### Updates
- Apply security patches monthly
- Feature updates quarterly
- Database migrations version controlled

## Conclusion

The conflict management system provides a comprehensive solution for handling scheduling conflicts in the Time Management Software. Through automatic detection, structured resolution workflows, and complete audit trails, the system ensures efficient coordination between executives and secretaries while maintaining data integrity and system reliability.
