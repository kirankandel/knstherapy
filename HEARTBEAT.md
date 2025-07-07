# Heartbeat System Implementation

## Overview

The KNSTherapy platform now includes a comprehensive heartbeat system to track real-time online status of users and### Configuration

### Heartbeat Intervals (Optimized)

- **Socket.IO**: 60 seconds (optimized to reduce server load)
- **REST API**: 60 seconds (with 10-second throttling)
- **Cleanup**: 90 seconds for stale connections (configurable in `socket.js`)
- **UI Refresh**: 30 seconds for therapist list updates
- **Throttling**: Minimum 10 seconds between API heartbeat requestssts. This system operates on both Socket.IO connections and REST API endpoints to ensure accurate presence tracking.

## Architecture

### 1. Socket.IO Heartbeat (Real-time Sessions)

**Location**: `backend/src/config/socket.js`

- **Frequency**: Every 60 seconds (optimized to reduce server load)
- **Purpose**: Track therapists and users during active chat sessions
- **Cleanup**: Automatic removal of stale connections after 90 seconds of inactivity

**Events**:
- `heartbeat` - Client sends heartbeat signal
- `heartbeat-ack` - Server acknowledges heartbeat

### 2. REST API Heartbeat (Authenticated Users)

**Endpoints**:
- `POST /v1/therapists/heartbeat` - For therapist users
- `POST /v1/community/heartbeat` - For community users

**Controllers**:
- `backend/src/controllers/therapist.controller.js#sendHeartbeat`
- `backend/src/controllers/community.controller.js#sendHeartbeat`

### 3. Frontend Implementation

#### Socket.IO Heartbeat Hook
**Location**: `frontend/src/hooks/useSocket.js`

- Automatically starts heartbeat when socket connects
- Sends heartbeat every 60 seconds (optimized frequency)
- Includes user-specific data (therapist ID, availability status)

#### Authenticated User Heartbeat Service
**Location**: `frontend/src/services/heartbeat.js`

- Singleton service for managing heartbeat for logged-in users
- Automatically starts when user logs in (via AuthContext)
- Sends heartbeat to appropriate endpoint based on user role
- Throttled to prevent excessive requests (minimum 10 seconds between calls)

#### AuthContext Integration
**Location**: `frontend/src/contexts/AuthContext.js`

- Automatically starts heartbeat service on login
- Stops heartbeat service on logout
- Handles different user types (therapist vs community)

## Features

### Real-time Therapist Status
**Location**: `frontend/src/app/anonymous-session/page.js`

- Shows live online status for therapists
- Updates every 30 seconds (twice per minute)
- Color-coded status indicators:
  - 🟢 Green: Online now (active within 2 minutes)
  - 🟡 Yellow: Recently active (within 1 hour)
  - ⚪ Gray: Available but not recently active

### Status Categories

1. **Online Now**: Last active within 2 minutes
2. **Recently Active**: Active within last hour (shows "Xm ago" or "Xh ago")
3. **Available**: Available but no recent activity

## Usage

### For Socket.IO Connections

```javascript
// Client side - automatically handled in useSocket hook
const { connect, joinAsTherapist } = useSocket();

connect();
joinAsTherapist({
  therapistId: 'therapist_123',
  specialties: ['anxiety', 'depression']
});
// Heartbeat automatically starts sending every 30 seconds (twice per minute)
```

### For Authenticated Users

```javascript
// Automatic via AuthContext
const { login } = useAuth();
await login(email, password);
// Heartbeat service automatically starts for logged-in users
```

### Manual Heartbeat Service

```javascript
import heartbeatService from '../services/heartbeat';

// Start for authenticated user
heartbeatService.start(authToken, 'therapist');

// Stop
heartbeatService.stop();

// Check status
const isRunning = heartbeatService.isRunning();
const userType = heartbeatService.getCurrentUserType();
```

## Backend Data Model

### User Model Extensions

The user model includes fields for tracking heartbeat data:

- `lastActive`: Timestamp of last heartbeat
- `isOnline`: Boolean flag for online status
- `lastHeartbeat`: Timestamp of last heartbeat (Socket.IO)

### Real-time Status Manager

**Location**: `backend/src/services/therapistStatus.service.js`

Manages real-time therapist status from Socket.IO connections:

- Tracks active therapist connections
- Provides real-time availability data
- Handles connection cleanup

## API Endpoints

### Therapist Heartbeat
```
POST /v1/therapists/heartbeat
Authorization: Bearer {token}
Content-Type: application/json

{
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```
### Get Real-time Therapist Status
```
GET /v1/therapists/status/realtime
```


### Manual Testing

1. **Frontend Testing**:
   - Open anonymous session page
   - Check therapist list refreshes every 30 seconds (twice per minute)
   - Verify status indicators update correctly

2. **Backend Testing**:
   - Check server logs for heartbeat messages
   - Monitor database for `lastActive` updates
   - Verify stale connection cleanup

## Configuration

### Heartbeat Intervals

- **Socket.IO**: 30 seconds (twice per minute, configurable in `useSocket.js`)
- **REST API**: 30 seconds (twice per minute, configurable in `heartbeat.js`)
- **Cleanup**: 90 seconds for stale connections (configurable in `socket.js`)
- **UI Refresh**: 30 seconds for therapist list updates (twice per minute)

### Environment Variables

```env
# Frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001/v1

# Backend
FRONTEND_URL=http://localhost:3000
```

## Security Considerations

1. **Authentication**: REST API heartbeats require valid JWT tokens
2. **Rate Limiting**: Consider implementing rate limiting for heartbeat endpoints
3. **Privacy**: No personal data transmitted in heartbeat signals
4. **Cleanup**: Automatic cleanup prevents resource leaks

## Future Enhancements

1. **Adaptive Intervals**: Adjust heartbeat frequency based on activity
2. **Offline Detection**: Detect when users go offline (page visibility API)
3. **Push Notifications**: Notify when preferred therapists come online
4. **Analytics**: Track user engagement and session patterns
5. **Load Balancing**: Distribute heartbeat processing across servers

## Troubleshooting

### Common Issues

1. **Heartbeat Not Starting**:
   - Check Socket.IO connection
   - Verify authentication token
   - Check browser console for errors

2. **Stale Status**:
   - Check network connectivity
   - Verify heartbeat intervals
   - Check server logs for errors

3. **Performance Issues**:
   - Monitor heartbeat frequency
   - Check database query performance
   - Consider caching for status queries
   - Review throttling settings (10s minimum between API calls)
   - Check for excessive useEffect re-renders

### Debug Logs

Enable debug logging to troubleshoot:

```javascript
// Frontend
localStorage.setItem('debug', 'socket.io-client:*');

// Backend
DEBUG=socket.io:* npm run dev
```
