# KNSTherapy Authentication System

## Overview

KNSTherapy now supports two types of user registration and authentication:

1. **Community Users** - Users who want to participate in forum discussions
2. **Therapists** - Licensed mental health professionals who provide therapy services

## User Types

### Community Users
- Can register with username and email
- Participate in community forums
- Build karma through contributions
- Earn badges for achievements
- Anonymous therapy sessions (no registration required)

### Therapists
- Must provide license number and credentials
- Account requires admin verification
- Can set availability and working hours
- Accept therapy session requests
- Rating system based on user feedback

## API Endpoints

### Authentication Routes

#### Register Community User
```
POST /v1/auth/register/community
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "username": "johndoe",
  "bio": "Mental health advocate",
  "location": "New York"
}
```

#### Register Therapist
```
POST /v1/auth/register/therapist
Content-Type: application/json

{
  "name": "Dr. Jane Smith",
  "email": "jane@example.com",
  "password": "Password123",
  "licenseNumber": "LIC123456",
  "specialties": ["anxiety", "depression"],
  "yearsOfPractice": 5,
  "credentials": [{
    "type": "degree",
    "name": "PhD in Clinical Psychology",
    "institution": "University of Example",
    "year": 2018
  }],
  "phone": "+1234567890",
  "professionalEmail": "dr.jane@clinic.com",
  "bio": "Experienced therapist specializing in anxiety and depression"
}
```

#### Login (Both User Types)
```
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

### Therapist Routes

#### Get Available Therapists
```
GET /v1/therapists/available?specialties=anxiety,depression&limit=10
```

#### Get Therapist Profile
```
GET /v1/therapists/:therapistId
```

#### Update Therapist Availability (Therapist only)
```
PATCH /v1/therapists/:therapistId/availability
Authorization: Bearer <token>

{
  "isAvailable": true,
  "workingHours": [{
    "day": "monday",
    "startTime": "09:00",
    "endTime": "17:00"
  }],
  "sessionTypes": ["text", "voice"]
}
```

#### Verify Therapist (Admin only)
```
PATCH /v1/therapists/:therapistId/verify
Authorization: Bearer <admin-token>

{
  "status": "verified",
  "notes": "Credentials verified successfully"
}
```

### Community Routes

#### Get Community Users
```
GET /v1/community/users?sortBy=karma:desc&limit=20
```

#### Get Community User Profile
```
GET /v1/community/users/:identifier
# identifier can be username or user ID
```

#### Update Community Profile (User only)
```
PATCH /v1/community/users/:userId/profile
Authorization: Bearer <token>

{
  "name": "John Doe Updated",
  "profile.bio": "Updated bio",
  "communityProfile.username": "newusername"
}
```

#### Award Badge (Admin only)
```
POST /v1/community/users/:userId/badges
Authorization: Bearer <admin-token>

{
  "name": "Helpful Contributor",
  "description": "Awarded for helping others in the community"
}
```

## User Roles and Permissions

### Community Users (`role: 'user'`)
- `manageCommunityProfile` - Update their own profile
- `createPosts` - Create forum posts
- `createComments` - Comment on posts

### Therapists (`role: 'therapist'`)
- `manageTherapistProfile` - Update their own profile
- `acceptSessions` - Accept therapy sessions
- `viewSessionHistory` - View their session history
- `updateAvailability` - Update availability status

### Admins (`role: 'admin'`)
- `getUsers` - View all users
- `manageUsers` - Manage user accounts
- `verifyTherapists` - Verify therapist credentials
- `manageContent` - Moderate content
- `viewAnalytics` - View system analytics

## Database Schema

### User Model Fields

#### Common Fields
- `name` - Full name
- `email` - Email address (unique)
- `password` - Hashed password
- `userType` - 'community_user' | 'therapist' | 'admin'
- `role` - 'user' | 'therapist' | 'admin'
- `isEmailVerified` - Email verification status
- `isActive` - Account status
- `lastActive` - Last activity timestamp

#### Community User Fields
- `communityProfile.username` - Unique username
- `communityProfile.karma` - Karma points
- `communityProfile.badges` - Array of earned badges

#### Therapist Fields
- `therapistProfile.licenseNumber` - Unique license number
- `therapistProfile.specialties` - Array of specialties
- `therapistProfile.credentials` - Array of credentials/certifications
- `therapistProfile.experience` - Years of practice, completed sessions
- `therapistProfile.rating` - Average rating and review count
- `therapistProfile.availability` - Working hours and availability status
- `therapistProfile.verificationStatus` - 'pending' | 'verified' | 'rejected' | 'suspended'

## Socket.IO Chat System

The chat system supports real-time communication between users and therapists:

### Socket Events

#### Client to Server
- `join-as-user` - Anonymous user joins session queue
- `join-as-therapist` - Therapist becomes available
- `send-message` - Send chat message
- `typing-start` / `typing-stop` - Typing indicators
- `end-session` - End chat session

#### Server to Client
- `session-created` - Session ID assigned
- `session-matched` - Connected with therapist/user
- `new-message` - Incoming message
- `user-typing` - Typing indicator
- `session-ended` - Session terminated

## Privacy & Security Features

1. **Anonymous Sessions** - Chat sessions don't require user registration
2. **Data Retention** - Messages auto-delete after 24 hours
3. **Encryption** - All communications are encrypted
4. **No Personal Data** - Anonymous sessions collect no identifying information
5. **Verification System** - Therapists must be verified before accepting sessions

## Testing

Run the test script to verify all endpoints:

```bash
cd backend
node test-auth.js
```

Make sure MongoDB is running and the backend server is started with:

```bash
npm run dev
```

## Next Steps

1. Start MongoDB: `mongod`
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Test registration endpoints
5. Implement frontend registration forms
6. Add community forum features
7. Enhance therapist verification workflow
