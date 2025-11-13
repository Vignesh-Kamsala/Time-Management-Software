# Time Management Software - Backend Setup Guide

## Overview
This is the backend server for the Time Management Software system. It provides REST APIs for managing meetings, conflicts, tasks, and user authentication for both executives and secretaries.

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Time-Management-Software/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the backend directory using `.env.example` as a template:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# MongoDB Connection
MONGO_URI=mongodb://127.0.0.1:27017/time-management-db

# Server Port
PORT=5000

# JWT Secret for authentication
JWT_SECRET=your_secure_random_string_here

# Email Configuration (for notifications)
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-app-password
EMAIL_SERVICE=gmail
```

**Important Notes:**
- Generate a strong random string for `JWT_SECRET`
- For Gmail, you may need to create an [App Password](https://support.google.com/accounts/answer/185833)
- Make sure MongoDB is running before starting the server

### 4. Start MongoDB
If MongoDB is not running, start it:

```bash
# On Linux/Mac
sudo systemctl start mongod

# Or using mongod directly
mongod --dbpath /path/to/data/directory
```

### 5. Start the Server

**Development Mode (with auto-reload):**
```bash
npm start
```

**Production Mode:**
```bash
node index.js
```

The server will start on the port specified in `.env` (default: 5000).

You should see:
```
Secretary imported: Model OK
Executive imported: Model OK
MongoDB connected successfully
Server is running on port 5000
```

## API Documentation

### Available API Routes

#### Authentication
- `POST /api/auth/login` - Universal login for executives and secretaries
- `POST /api/auth/register` - User registration

#### Secretary Routes
- `GET /api/secretary/me` - Get secretary profile
- `GET /api/secretary/notifications` - Get notifications
- `GET /api/secretary/reports/summary` - Get summary reports
- `GET /api/secretary/conflicts` - List conflicts
- `GET /api/secretary/conflicts/:id` - Get conflict details
- `PATCH /api/secretary/conflicts/:id/proposals` - Add proposed time
- `PATCH /api/secretary/conflicts/:id/consultations` - Record consultation
- `PATCH /api/secretary/conflicts/:id/resolve` - Resolve conflict
- `POST /api/secretary/conflicts/:id/escalate` - Escalate conflict

#### Executive Routes
- `GET /api/executive/me` - Get executive profile
- `POST /api/executive/tasks` - Manage tasks

#### Meeting Routes
- `POST /api/meetings/create-and-addtasks` - Create meeting with automatic conflict detection
- `POST /api/meetings/conflicts/manual` - Manually log a conflict
- `GET /api/meetings/my-day` - Get today's meetings
- `POST /api/meetings/:id/cancel` - Cancel a meeting
- `POST /api/meetings/rsvp` - RSVP to a meeting
- `POST /api/meetings/:id/complete` - Mark meeting as completed

For detailed API documentation, see:
- [Conflict Management API](./docs/CONFLICT_API.md)

## Architecture

### Database Models
The system uses MongoDB with Mongoose ODM. Key models include:

- **Executive**: User data for executives, including tasks and schedules
- **Secretary**: User data for secretaries
- **Meeting (Event)**: Meeting/event records with participants and status
- **Conflict**: Conflict records for scheduling issues
- **Notification**: Notification records for users

### Key Features

#### 1. Automatic Conflict Detection
When creating meetings, the system automatically:
- Checks for scheduling overlaps with existing meetings
- Identifies task conflicts for participants
- Creates conflict records if issues are detected
- Notifies assigned secretaries

#### 2. Conflict Resolution Workflow
Secretaries can:
- View all open conflicts
- Propose alternative time slots
- Consult with executives
- Resolve conflicts by rescheduling meetings
- Escalate unresolvable conflicts

#### 3. Role-Based Access Control
- Authentication via JWT tokens
- Role-specific middleware (`requireSecretary`)
- Protected routes based on user role

#### 4. Notification System
- Secretaries receive notifications for new conflicts
- Email notifications for important events
- In-app notification management

## Development

### Project Structure
```
backend/
├── controllers/         # Request handlers
├── docs/               # API documentation
├── middleware/         # Express middleware (auth, etc.)
├── routes/             # Route definitions
│   ├── auth.js        # Authentication routes
│   ├── events.js      # Meeting/event routes
│   ├── executives.js  # Executive routes
│   └── secretary.js   # Secretary routes
├── schema/            # Mongoose models
│   ├── ConflictSchema.js
│   ├── EventSchema.js
│   ├── ExecutiveSchema.js
│   ├── NotificationSchema.js
│   └── SecretarySchema.js
├── services/          # Business logic services
│   └── notificationService.js
├── utils/             # Utility functions
│   └── mailer.js
├── .env.example       # Environment variables template
├── index.js           # Server entry point
└── package.json       # Dependencies and scripts
```

### Adding New Routes
1. Create route handler in appropriate file under `routes/`
2. Add route to router with proper middleware
3. Document the endpoint in relevant docs file
4. Test the endpoint

### Testing
The system uses MongoDB connection for testing. Ensure your test database is configured separately from production.

```bash
# Run tests (when test suite is set up)
npm test
```

## Troubleshooting

### MongoDB Connection Issues
**Error:** `MongoDB connection error`
**Solution:**
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`
- Verify network connectivity to MongoDB server

### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`
**Solution:**
- Change `PORT` in `.env` to a different port
- Or stop the process using port 5000:
  ```bash
  # Find process
  lsof -i :5000
  # Kill process
  kill -9 <PID>
  ```

### JWT Token Errors
**Error:** `JsonWebTokenError: jwt malformed`
**Solution:**
- Ensure `JWT_SECRET` is set in `.env`
- Check that token is properly formatted in requests
- Verify token hasn't expired

### Email Notifications Not Working
**Error:** Email sending fails
**Solution:**
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- For Gmail, enable "Less secure app access" or use an App Password
- Check email service configuration in `utils/mailer.js`

## Security Considerations

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use strong JWT_SECRET** - Generate a long random string
3. **Secure MongoDB** - Use authentication in production
4. **HTTPS in Production** - Use reverse proxy (nginx) with SSL
5. **Input Validation** - All user inputs are validated
6. **Rate Limiting** - Consider adding rate limiting for production

## Production Deployment

### Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start index.js --name "time-management-api"

# Monitor
pm2 monit

# Set up auto-restart on system boot
pm2 startup
pm2 save
```

### Using Docker
```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production MongoDB URI
- Set up proper email credentials
- Enable CORS for frontend domain only

## Support

For issues, questions, or contributions:
1. Check existing documentation
2. Review error logs
3. Create an issue in the repository
4. Contact the development team

## License

[Add license information here]
