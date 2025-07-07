# Therapist Dashboard

A comprehensive dashboard for therapists to manage therapy sessions, accept requests, and communicate with users through secure, anonymous chat sessions.

## Features

### 🎯 Current Implementation
- **Real-time Status Management**: Go online/offline to control availability
- **Session Management**: Accept incoming session requests and manage active sessions
- **Secure Chat Interface**: End-to-end encrypted anonymous messaging
- **Heartbeat System**: Automatic availability updates to ensure therapists appear as online
- **Session Controls**: Start, manage, and end therapy sessions
- **Responsive Design**: Works on desktop and mobile devices

### 🚀 Future Enhancements (Ready for Implementation)
- **Voice Call Integration**: Accept and manage voice-based therapy sessions
- **Video Call Support**: Secure video sessions with identity masking
- **Session Notes**: Private notes for therapists (not shared with users)
- **Session History**: View past sessions and statistics
- **Specialized Request Routing**: Automatic matching based on therapist specialties

## How to Use

### For Therapists

1. **Login**: Sign in with your therapist account
2. **Access Dashboard**: Click "Dashboard" in the top navigation
3. **Go Online**: Click "Go Online" to start receiving session requests
4. **Accept Sessions**: When users request sessions, they'll appear in the "Session Requests" panel
5. **Chat with Users**: Use the chat interface to communicate securely and anonymously
6. **End Sessions**: Click "End Session" when the therapy session is complete
7. **Go Offline**: Click "Go Offline" when you're no longer available

### For Users

1. **Request Session**: Visit the anonymous session page
2. **Wait for Match**: The system will automatically match you with an available therapist
3. **Start Chatting**: Begin your anonymous therapy session
4. **End Session**: Either party can end the session when complete

## Technical Architecture

### Components

- **TherapistDashboard** (`/therapist-dashboard/page.js`): Main dashboard page
- **TherapistStatusCard**: Online/offline controls and status display
- **SessionRequestCard**: Display and manage incoming session requests
- **ActiveSessionCard**: Real-time chat interface for active sessions
- **TherapistAPI**: API service for backend communication

### Real-time Communication

- **Socket.IO**: Real-time messaging and session management
- **Heartbeat System**: Dual heartbeat (Socket.IO + REST API) for reliability
- **Auto-reconnection**: Handles network disconnections gracefully

### Security Features

- **Anonymous Sessions**: No personal information shared
- **End-to-end Encryption**: All messages are encrypted
- **Session Isolation**: Each session is completely separate
- **Auto-cleanup**: Sessions and data are automatically cleaned up

## API Endpoints

### Therapist Management
- `GET /v1/therapists/available` - Get available therapists
- `POST /v1/therapists/heartbeat` - Send therapist heartbeat
- `PUT /v1/therapists/availability` - Update availability status

### Session Management (Future)
- `GET /v1/therapists/session-requests` - Get pending requests
- `POST /v1/therapists/session-requests/:id/accept` - Accept a request
- `POST /v1/therapists/session-requests/:id/decline` - Decline a request

## Development Setup

1. **Backend**: Ensure the backend server is running on port 3001
2. **Frontend**: Start the Next.js development server
3. **Database**: MongoDB should be running with therapist accounts created
4. **Socket.IO**: Real-time communication requires both servers to be running

## Heartbeat System

The dashboard implements a dual heartbeat system with optimizations to prevent excessive requests:

1. **Socket.IO Heartbeat**: Sent every 60 seconds while connected
2. **REST API Heartbeat**: Sent every 60 seconds for database persistence
3. **Request Throttling**: Minimum 10 seconds between API heartbeats
4. **Smart Dependencies**: useEffect hooks optimized to prevent infinite loops

This ensures therapists appear as available in the system reliably without overwhelming the server.

## Database Schema

### Therapist Fields
```javascript
{
  isActive: Boolean,        // Currently active/available
  isOnline: Boolean,        // Connected via Socket.IO
  lastActive: Date,         // Last heartbeat timestamp
  therapistProfile: {
    availability: {
      isAvailable: Boolean  // Available for new sessions
    }
  }
}
```

## Testing

### Manual Testing Steps

1. **Login as Therapist**: Create/use a therapist account
2. **Go to Dashboard**: Navigate to `/therapist-dashboard`
3. **Go Online**: Click the "Go Online" button
4. **Verify Status**: Check that the status shows as "Available"
5. **Open User Session**: In another browser/tab, request an anonymous session
6. **Verify Matching**: The user should be matched with your therapist session
7. **Test Chat**: Send messages in both directions
8. **End Session**: Test ending the session from therapist side

### API Testing

```bash
# Check if therapist appears as available
curl -s http://localhost:3001/v1/therapists/available | jq '.results[] | {name: .name, isActive: .isActive, isOnline: .isOnline, isAvailable: .therapistProfile.availability.isAvailable}'
```

## Troubleshooting

### Common Issues

1. **Therapist Not Showing as Available**
   - Ensure heartbeat system is working
   - Check database for `isOnline: true` and `isAvailable: true`
   - Verify Socket.IO connection

2. **Sessions Not Matching**
   - Check that therapist is online in dashboard
   - Verify backend Socket.IO server is running
   - Check browser console for connection errors

3. **Messages Not Sending**
   - Verify active session exists
   - Check Socket.IO connection status
   - Ensure both users are in the same session room

### Debug Mode

Enable debug logging in the browser console to see:
- Socket.IO connection events
- Heartbeat acknowledgments
- Session matching events
- Message sending/receiving

## Future Development

### Next Features to Implement

1. **Voice Calls**: WebRTC integration for voice sessions
2. **Video Calls**: Video sessions with privacy controls
3. **Session Queue**: Better request management for busy therapists
4. **Notifications**: Push notifications for session requests
5. **Analytics**: Session statistics and therapist performance metrics

### Backend Endpoints Needed

- Session request queue management
- Voice/video call signaling
- Session recording (if permitted)
- Therapist analytics and reporting

## Performance Optimizations

### Request Throttling
- **API Heartbeat**: Minimum 10 seconds between requests
- **Socket.IO Heartbeat**: 60-second intervals
- **Smart Dependencies**: useEffect hooks prevent infinite re-renders
- **Request Debouncing**: Multiple rapid clicks are handled gracefully

### Memory Management
- **Cleanup Functions**: All intervals and listeners are properly cleaned up
- **useCallback**: Event handlers are memoized to prevent unnecessary re-renders
- **Conditional Effects**: useEffect only runs when necessary dependencies change

### Common Performance Issues Fixed
1. **Multiple Heartbeats**: Fixed duplicate heartbeat systems
2. **Infinite Loops**: Added proper dependency arrays to useEffect
3. **Memory Leaks**: Added cleanup functions for intervals
4. **Excessive API Calls**: Added throttling and smart dependencies
