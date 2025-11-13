# Time Management Software - System Architecture

## Architecture Overview

The Time Management Software follows a three-tier architecture pattern with clear separation between presentation, business logic, and data layers.

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│              (React + TypeScript + Vite)                │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Executive   │  │  Secretary   │  │    Shared    │ │
│  │  Dashboard   │  │  Dashboard   │  │  Components  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST API
                         │ (JSON over HTTPS)
┌────────────────────────▼────────────────────────────────┐
│                   Backend Layer                          │
│              (Node.js + Express)                         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Middleware Layer                     │  │
│  │  • CORS • Authentication • Authorization         │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Route Layer                          │  │
│  │  • Auth Routes  • Secretary Routes               │  │
│  │  • Executive Routes  • Meeting Routes            │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Business Logic Layer                   │  │
│  │  • Conflict Detection  • Notification Service    │  │
│  │  • Meeting Management  • Task Coordination       │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────────┐
│                   Data Layer                             │
│                  (MongoDB)                               │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │Executive │  │Secretary │  │ Meeting  │  │Conflict│ │
│  │Collection│  │Collection│  │Collection│  │ Coll.  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Components:** Custom components with Tailwind CSS
- **State Management:** React Hooks (useState, useEffect)
- **Routing:** React Router
- **HTTP Client:** Fetch API

### Backend
- **Runtime:** Node.js 14+
- **Framework:** Express.js 5.x
- **Database ODM:** Mongoose 8.x
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Email:** Nodemailer

### Database
- **Database:** MongoDB 4.4+
- **Schema:** Mongoose schemas with validation
- **Indexing:** Optimized queries with indexes on frequently accessed fields

### Development Tools
- **Process Manager:** Nodemon (development)
- **Linting:** ESLint
- **Version Control:** Git

## Backend Architecture Details

### 1. Entry Point (`index.js`)

```javascript
// Server initialization flow:
1. Load environment variables (dotenv)
2. Initialize Express app
3. Configure middleware (CORS, JSON parser)
4. Connect to MongoDB
5. Register routes
6. Start HTTP server
```

**Key Responsibilities:**
- Application bootstrap
- Middleware configuration
- Route registration
- Database connection management
- Error handling at application level

### 2. Route Layer

#### Route Structure
```
routes/
├── auth.js          # Authentication (login/register)
├── secretary.js     # Secretary-specific operations
├── executives.js    # Executive-specific operations
└── events.js        # Meeting and conflict management
```

**Route Design Pattern:**
- RESTful endpoints
- Consistent naming conventions
- Proper HTTP methods (GET, POST, PATCH, DELETE)
- Version-ready structure

**Example Route Registration:**
```javascript
app.use('/api/auth', authRoutes);
app.use('/api/secretary', secretaryRoutes);
app.use('/api/executive', executiveRoutes);
app.use('/api/meetings', eventRoutes);
```

### 3. Middleware Layer

#### Authentication Middleware (`middleware/authMiddleware.js`)
```javascript
Function: auth(req, res, next)
Purpose: Verify JWT token and extract user info
Flow:
1. Extract token from Authorization header
2. Verify token using JWT_SECRET
3. Decode user information (id, role, email)
4. Attach user to req.user
5. Call next() or return 401
```

#### Role-Based Authorization
```javascript
Function: requireSecretary(req, res, next)
Purpose: Ensure user has secretary role
Flow:
1. Check req.user.role === 'secretary'
2. Return 403 if not secretary
3. Call next() if authorized
```

### 4. Data Models

#### Schema Relationships

```
┌─────────────┐
│  Executive  │
│             │
│ - _id       │◀──┐
│ - name      │   │
│ - email     │   │ Referenced by
│ - tasks[]   │   │
└─────────────┘   │
                  │
┌─────────────┐   │
│  Meeting    │   │
│             │   │
│ - _id       │   │
│ - title     │   │
│ - startTime │   │
│ - endTime   │   │
│ - status    │   │
│ - conflict  │◀──┼───┐
│ - created   │───┘   │
│   By        │       │ Referenced by
│ - particip  │───┐   │
│   ants[]    │   │   │
└─────────────┘   │   │
                  │   │
┌─────────────┐   │   │
│  Conflict   │   │   │
│             │   │   │
│ - _id       │───┘   │
│ - meeting   │───────┘
│ - requested │
│   By        │
│ - overlaps[]│
│ - proposals │
│ - consult   │
│   ations[]  │
│ - history[] │
└─────────────┘
```

#### Executive Schema
```javascript
{
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (default: 'executive'),
  department: String,
  tasks: [
    {
      title: String,
      startTime: Date,
      endTime: Date,
      description: String,
      meetingId: ObjectId,
      status: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email`: Unique index for fast lookups
- `department`: For department-based queries

#### Meeting Schema (EventSchema)
```javascript
{
  title: String,
  startTime: Date (indexed),
  endTime: Date,
  venue: String,
  project: String,
  status: String (pending/scheduled/conflict/cancelled/completed),
  hasConflict: Boolean (indexed),
  conflictStatus: String,
  conflictNotes: String,
  createdBy: ObjectId → Executive,
  participants: [ObjectId] → Executive,
  invited: [
    {
      email: String,
      execId: ObjectId → Executive,
      status: String (invited/accepted/declined/tentative)
    }
  ],
  cancelledBy: ObjectId,
  cancelledAt: Date,
  completedAt: Date,
  timestamps: true
}
```

**Indexes:**
- `startTime, endTime`: For time-range queries
- `hasConflict`: For conflict filtering
- `participants`: For participant-based queries
- `status`: For status filtering

#### Conflict Schema
```javascript
{
  meeting: ObjectId → Meeting (indexed),
  requestedBy: ObjectId → Executive,
  participantEmails: [String],
  participantIds: [ObjectId] → Executive,
  conflictReason: String,
  status: String (open/in_progress/resolved/escalated, indexed),
  overlaps: [
    {
      executive: ObjectId → Executive,
      executiveEmail: String,
      conflicts: [
        {
          type: String (meeting/task),
          refId: ObjectId,
          title: String,
          startTime: Date,
          endTime: Date,
          notes: String,
          status: String
        }
      ]
    }
  ],
  proposedOptions: [
    {
      startTime: Date,
      endTime: Date,
      notes: String,
      createdBy: ObjectId → Secretary,
      createdAt: Date
    }
  ],
  consultations: [
    {
      executive: ObjectId → Executive,
      executiveName: String,
      executiveEmail: String,
      decision: String (pending/approved/declined),
      notes: String,
      recordedBy: ObjectId → Secretary,
      recordedAt: Date,
      updatedAt: Date
    }
  ],
  resolutionNotes: String,
  resolvedBy: ObjectId → Secretary,
  history: [
    {
      action: String,
      notes: String,
      actor: ObjectId,
      actorRole: String (executive/secretary),
      createdAt: Date
    }
  ],
  timestamps: true
}
```

**Indexes:**
- `meeting`: For meeting-based queries
- `status`: For status filtering
- `updatedAt`: For sorting by most recent

### 5. Business Logic Services

#### Notification Service (`services/notificationService.js`)

**Purpose:** Centralized notification handling

**Functions:**
```javascript
notifySecretariesForExecutives({
  executiveIds,
  title,
  message,
  channel,
  severity,
  meetingId,
  conflictId,
  metadata,
  emailSubject,
  emailText
})
```

**Flow:**
1. Find secretaries assigned to given executives
2. Create notification records in database
3. Send email notifications (if configured)
4. Return notification results

#### Conflict Detection Engine (`routes/events.js`)

**Purpose:** Automatic conflict detection

**Function:** `buildConflictReport({ execs, start, end })`

**Algorithm:**
```
1. For each executive:
   a. Find all meetings in time range
   b. Find all tasks in time range
   c. Check for overlaps with proposed time
   d. Collect conflicting items
2. Build conflict report with:
   - Executive information
   - List of conflicting meetings
   - List of conflicting tasks
3. Return conflict report array
```

**Overlap Detection:**
```javascript
function intervalsOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}
```

### 6. API Design Principles

#### RESTful Conventions
- **GET**: Retrieve resources
- **POST**: Create new resources
- **PATCH**: Partial update of resources
- **DELETE**: Remove resources

#### Response Format
```json
// Success Response
{
  "data": { ... },
  "message": "Operation successful"
}

// Error Response
{
  "msg": "Error description",
  "error": "Detailed error message"
}
```

#### Status Codes
- **200**: Success (GET, PATCH)
- **201**: Created (POST)
- **202**: Accepted (async operations)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (auth required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (business logic conflicts)
- **500**: Internal Server Error

### 7. Security Architecture

#### Authentication Flow
```
1. User Login
   ├─→ POST /api/auth/login
   ├─→ Verify credentials (bcrypt.compare)
   ├─→ Generate JWT token
   └─→ Return token + user info

2. Authenticated Request
   ├─→ Client sends: Authorization: Bearer <token>
   ├─→ Middleware verifies token
   ├─→ Extract user info from token
   ├─→ Attach to req.user
   └─→ Continue to route handler
```

#### Token Structure
```javascript
{
  id: "user_mongodb_id",
  role: "executive" | "secretary",
  email: "user@example.com",
  iat: 1234567890,
  exp: 1234585890  // 5 hours later
}
```

#### Password Security
- Passwords hashed with bcrypt (salt rounds: 10)
- Never stored in plain text
- Never returned in API responses

### 8. Error Handling Strategy

#### Application-Level Errors
```javascript
// MongoDB connection error
mongoose.connect(uri)
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
```

#### Route-Level Errors
```javascript
try {
  // Business logic
} catch (err) {
  console.error('Route error:', err);
  return res.status(500).json({
    msg: 'Server error',
    error: err.message
  });
}
```

#### Validation Errors
```javascript
if (!requiredField) {
  return res.status(400).json({
    msg: 'Missing required field'
  });
}
```

## Scalability Considerations

### Horizontal Scaling
- Stateless API design allows multiple instances
- Session data stored in JWT (no server-side sessions)
- MongoDB supports sharding for data distribution

### Performance Optimization
- Database indexes on frequently queried fields
- Lean queries for read-only operations
- Connection pooling (Mongoose default)
- Pagination for large result sets

### Caching Strategy (Future)
- Redis for session caching
- API response caching for read-heavy endpoints
- Cache invalidation on data updates

## Deployment Architecture

### Development Environment
```
Developer Machine
├─→ Node.js + Nodemon (auto-reload)
├─→ MongoDB Local Instance
└─→ Environment: .env file
```

### Production Environment
```
┌─────────────────────┐
│   Load Balancer     │
│     (nginx)         │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼───┐   ┌────▼────┐
│ Node  │   │  Node   │
│ App 1 │   │  App 2  │
└───┬───┘   └────┬────┘
    │            │
    └──────┬─────┘
           │
    ┌──────▼──────────┐
    │  MongoDB Cluster│
    │  (Replica Set)  │
    └─────────────────┘
```

### Production Deployment Steps
1. Set up MongoDB replica set
2. Configure nginx as reverse proxy
3. Deploy Node.js app with PM2
4. Configure environment variables
5. Set up SSL certificates (Let's Encrypt)
6. Configure firewall rules
7. Set up monitoring (PM2, MongoDB logs)
8. Configure automated backups

## Monitoring and Logging

### Application Logs
- Console logs for all operations
- Error logs with stack traces
- Request/response logging (optional)

### Database Monitoring
- Connection pool status
- Query performance
- Index usage statistics

### Performance Metrics
- API response times
- Database query times
- Error rates
- Active connections

## Future Enhancements

### Short-term
1. Add rate limiting to prevent abuse
2. Implement request caching with Redis
3. Add comprehensive logging system (Winston)
4. Set up automated testing (Jest)

### Long-term
1. Microservices architecture
   - Separate authentication service
   - Separate notification service
   - Event-driven communication
2. GraphQL API alternative
3. WebSocket for real-time updates
4. Advanced analytics and reporting
5. Mobile application support

## Conclusion

The Time Management Software architecture is designed for maintainability, scalability, and security. The three-tier architecture provides clear separation of concerns, while the RESTful API design ensures ease of integration and extension. The system is built on proven technologies and follows industry best practices for web application development.
