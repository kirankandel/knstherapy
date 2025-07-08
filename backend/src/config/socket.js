const { Server } = require('socket.io');
const logger = require('./logger');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'development' ? true : [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://192.168.1.92:3000',
        'http://127.0.0.1:3000',
      ],
      methods: ['GET', 'POST'],
      credentials: false,
    },
  });

  // Simple storage for active connections and sessions
  const therapists = new Map(); // therapistId -> { socketId, isAvailable, lastHeartbeat }
  const activeSessions = new Map(); // sessionId -> { therapistId, userId, startTime }
  const pendingRequests = new Map(); // requestId -> request data

  logger.info('Socket.IO server initialized');

  io.on('connection', (socket) => {
    logger.info(`New socket connection: ${socket.id}`);

    // ============================================
    // THERAPIST JOINS AND SENDS HEARTBEATS
    // ============================================
    socket.on('join-as-therapist', (data) => {
      const { therapistId, name, specialties, experience, bio, supportedSessionTypes } = data;

      if (!therapistId) {
        socket.emit('error', { message: 'Therapist ID required' });
        return;
      }

      socket.therapistId = therapistId;
      socket.userType = 'therapist';

      // Add to therapists map with detailed information
      therapists.set(therapistId, {
        socketId: socket.id,
        name: name || 'Anonymous Therapist',
        specialties: specialties || [],
        experience: experience || 'Not specified',
        bio: bio || 'Professional therapist ready to help.',
        supportedSessionTypes: supportedSessionTypes || ['text', 'audio', 'video'],
        isAvailable: true,
        lastHeartbeat: new Date(),
      });

      logger.info(`Therapist ${therapistId} (${name}) joined with specialties: ${(specialties || []).join(', ')} and session types: ${(supportedSessionTypes || ['text', 'audio', 'video']).join(', ')}`);

      socket.emit('therapist-joined', {
        therapistId,
        status: 'online',
        supportedSessionTypes: supportedSessionTypes || ['text', 'audio', 'video'],
        message: 'Successfully joined as therapist',
      });
    });

    // Therapist sends heartbeat to stay online
    socket.on('therapist-heartbeat', (data) => {
      if (socket.userType !== 'therapist' || !socket.therapistId) {
        return;
      }

      const therapist = therapists.get(socket.therapistId);
      if (therapist) {
        therapist.lastHeartbeat = new Date();
        therapist.isAvailable = data.isAvailable !== false; // default to true

        logger.info(`Heartbeat from therapist ${socket.therapistId}`);

        socket.emit('heartbeat-ack', {
          timestamp: new Date(),
          therapistId: socket.therapistId,
          status: 'alive',
        });
      }
    });

    // ============================================
    // USER REQUESTS SESSION WITH THERAPIST
    // ============================================
    socket.on('join-as-user', (data) => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const sessionType = data.sessionType || 'text'; // text, audio, video

      socket.sessionId = sessionId;
      socket.userType = 'user';
      socket.sessionType = sessionType;

      socket.join(sessionId);

      logger.info(`User joined with session ID: ${sessionId}, type: ${sessionType}`);

      socket.emit('session-created', { sessionId, sessionType });
    });

    // User requests session with specific therapist
    socket.on('request-session', (data) => {
      const { therapistId, message, sessionType = 'text' } = data;

      logger.info(
        `[SOCKET] Session request received - SessionId: ${socket.sessionId}, TherapistId: ${therapistId}, UserType: ${socket.userType}, SessionType: ${sessionType}`
      );
      logger.debug(`[SOCKET] Request data: ${JSON.stringify(data)}`);

      if (!socket.sessionId || socket.userType !== 'user') {
        logger.warn(`[SOCKET] Invalid session state - SessionId: ${socket.sessionId}, UserType: ${socket.userType}`);
        socket.emit('request-failed', { message: 'Invalid session state' });
        return;
      }

      if (!therapistId) {
        logger.warn(`[SOCKET] Missing therapist ID in session request`);
        socket.emit('request-failed', { message: 'Therapist ID required' });
        return;
      }

      const therapist = therapists.get(therapistId);
      logger.debug(`[SOCKET] Therapist lookup for ${therapistId}: ${therapist ? 'found' : 'not found'}`);

      if (!therapist) {
        logger.warn(`[SOCKET] Therapist ${therapistId} not found in active therapists map`);
        logger.debug(`[SOCKET] Active therapists: ${JSON.stringify([...therapists.keys()])}`);
        socket.emit('request-failed', { message: 'The selected therapist is not currently online.' });
        return;
      }

      if (!therapist.isAvailable) {
        logger.warn(`[SOCKET] Therapist ${therapistId} is not available (isAvailable: ${therapist.isAvailable})`);
        socket.emit('request-failed', { message: 'The selected therapist is not available.' });
        return;
      }

      // Check if therapist supports the requested session type
      const supportedTypes = therapist.supportedSessionTypes || ['text'];
      if (!supportedTypes.includes(sessionType)) {
        logger.warn(`[SOCKET] Therapist ${therapistId} does not support session type: ${sessionType}`);
        socket.emit('request-failed', { message: `The selected therapist does not support ${sessionType} sessions.` });
        return;
      }

      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      const request = {
        requestId,
        sessionId: socket.sessionId,
        userId: socket.id,
        therapistId,
        sessionType,
        message: message || `User requesting ${sessionType} session`,
        timestamp: new Date(),
      };

      pendingRequests.set(requestId, request);

      // Send request to therapist
      const therapistSocket = io.sockets.sockets.get(therapist.socketId);
      if (therapistSocket) {
        therapistSocket.emit('session-request', {
          requestId,
          sessionId: socket.sessionId,
          sessionType,
          message: request.message,
          timestamp: request.timestamp,
        });

        logger.info(`[SOCKET] Session request sent: ${requestId} from user to therapist ${therapistId} for ${sessionType} session`);

        socket.emit('request-sent', {
          requestId,
          sessionType,
          message: `${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} session request sent to therapist. Waiting for response...`,
        });
      } else {
        logger.error(`[SOCKET] Therapist socket ${therapist.socketId} not found for therapist ${therapistId}`);
        socket.emit('request-failed', { message: 'Therapist connection lost. Please try again.' });
        pendingRequests.delete(requestId);
      }
    });

    // ============================================
    // THERAPIST ACCEPTS/DECLINES REQUESTS
    // ============================================
    socket.on('accept-request', (data) => {
      const { requestId } = data;
      if (socket.userType !== 'therapist') {
        socket.emit('error', { message: 'Only therapists can accept requests' });
        return;
      }

      const request = pendingRequests.get(requestId);
      if (!request || request.therapistId !== socket.therapistId) {
        socket.emit('error', { message: 'Invalid request' });
        return;
      }

      // Create active session
      const session = {
        sessionId: request.sessionId,
        sessionType: request.sessionType || 'text',
        therapistId: socket.therapistId,
        userId: request.userId,
        startTime: new Date(),
      };

      activeSessions.set(request.sessionId, session);

      // Join therapist to session room
      socket.join(request.sessionId);
      socket.sessionId = request.sessionId;
      socket.sessionType = request.sessionType;

      // Mark therapist as busy
      const therapist = therapists.get(socket.therapistId);
      if (therapist) {
        therapist.isAvailable = false;
      }

      // Notify user that session started
      const userSocket = io.sockets.sockets.get(request.userId);
      if (userSocket) {
        io.to(request.sessionId).emit('session-started', {
          sessionId: request.sessionId,
          sessionType: session.sessionType,
          therapistId: socket.therapistId,
          message: `${session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1)} session started! You are now connected with your therapist.`,
        });
      }

      logger.info(`${session.sessionType} session started: ${request.sessionId} between therapist ${socket.therapistId} and user`);

      // Cleanup request
      pendingRequests.delete(requestId);
    });

    socket.on('decline-request', (data) => {
      const { requestId, reason } = data;

      if (socket.userType !== 'therapist') {
        socket.emit('error', { message: 'Only therapists can decline requests' });
        return;
      }

      const request = pendingRequests.get(requestId);
      if (!request || request.therapistId !== socket.therapistId) {
        socket.emit('error', { message: 'Invalid request' });
        return;
      }

      // Notify user that request was declined
      const userSocket = io.sockets.sockets.get(request.userId);
      if (userSocket) {
        userSocket.emit('request-declined', {
          message: reason || 'Therapist declined the session request',
        });
      }

      logger.info(`Request declined: ${requestId} by therapist ${socket.therapistId}`);

      // Cleanup request
      pendingRequests.delete(requestId);
    });

    // ============================================
    // WEBRTC SIGNALING FOR VOICE/VIDEO CALLS
    // ============================================
    
    // WebRTC offer (from user or therapist)
    socket.on('webrtc-offer', (data) => {
      const { sessionId, offer, to } = data;
      
      const session = activeSessions.get(sessionId);
      if (!session) {
        socket.emit('error', { message: 'No active session for WebRTC offer' });
        return;
      }

      // Forward offer to the other participant
      const targetSocketId = to === 'therapist' ? 
        (therapists.get(session.therapistId) && therapists.get(session.therapistId).socketId) : 
        session.userId;
      
      if (targetSocketId) {
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.emit('webrtc-offer', {
            sessionId,
            offer,
            from: socket.userType
          });
          logger.info(`WebRTC offer forwarded in session ${sessionId} from ${socket.userType} to ${to}`);
        }
      }
    });

    // WebRTC answer (from user or therapist)
    socket.on('webrtc-answer', (data) => {
      const { sessionId, answer, to } = data;
      
      const session = activeSessions.get(sessionId);
      if (!session) {
        socket.emit('error', { message: 'No active session for WebRTC answer' });
        return;
      }

      // Forward answer to the other participant
      const targetSocketId = to === 'therapist' ? 
        (therapists.get(session.therapistId) && therapists.get(session.therapistId).socketId) : 
        session.userId;
      
      if (targetSocketId) {
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.emit('webrtc-answer', {
            sessionId,
            answer,
            from: socket.userType
          });
          logger.info(`WebRTC answer forwarded in session ${sessionId} from ${socket.userType} to ${to}`);
        }
      }
    });

    // WebRTC ICE candidates
    socket.on('webrtc-ice-candidate', (data) => {
      const { sessionId, candidate, to } = data;
      
      const session = activeSessions.get(sessionId);
      if (!session) {
        socket.emit('error', { message: 'No active session for ICE candidate' });
        return;
      }

      // Forward ICE candidate to the other participant
      const targetSocketId = to === 'therapist' ? 
        (therapists.get(session.therapistId) && therapists.get(session.therapistId).socketId) : 
        session.userId;
      
      if (targetSocketId) {
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.emit('webrtc-ice-candidate', {
            sessionId,
            candidate,
            from: socket.userType
          });
        }
      }
    });

    // Call ended
    socket.on('call-ended', (data) => {
      const { sessionId } = data;
      
      const session = activeSessions.get(sessionId);
      if (session) {
        io.to(sessionId).emit('call-ended', {
          sessionId,
          endedBy: socket.userType,
          message: `${socket.userType === 'therapist' ? 'Therapist' : 'User'} ended the call.`
        });
        logger.info(`Call ended in session ${sessionId} by ${socket.userType}`);
      }
    });

    // ============================================
    // CHAT MESSAGES
    // ============================================
    socket.on('send-message', (data) => {
      const { sessionId, content } = data;

      if (!sessionId || !content || !content.trim()) {
        socket.emit('error', { message: 'Invalid message' });
        return;
      }

      const session = activeSessions.get(sessionId);
      if (!session) {
        socket.emit('error', { message: 'No active session' });
        return;
      }

      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        content: content.trim(),
        senderType: socket.userType,
        senderId: socket.userType === 'therapist' ? socket.therapistId : 'user',
        timestamp: new Date(),
        sessionId,
      };

      // Send to all participants in session
      io.to(sessionId).emit('new-message', message);

      logger.info(`Message sent in session ${sessionId} by ${socket.userType}: ${content.substring(0, 50)}...`);
    });

    // ============================================
    // SESSION END
    // ============================================
    socket.on('end-session', (data) => {
      const { sessionId } = data;

      const session = activeSessions.get(sessionId);
      if (!session) {
        socket.emit('error', { message: 'No active session to end' });
        return;
      }

      // Notify all participants
      io.to(sessionId).emit('session-ended', {
        message: 'Session has been ended.',
        endedBy: socket.userType,
      });

      // Make therapist available again
      if (session.therapistId) {
        const therapist = therapists.get(session.therapistId);
        if (therapist) {
          therapist.isAvailable = true;
        }
      }

      // Cleanup
      activeSessions.delete(sessionId);

      logger.info(`Session ended: ${sessionId} by ${socket.userType}`);
    });

    // ============================================
    // DISCONNECT CLEANUP
    // ============================================
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);

      if (socket.userType === 'therapist' && socket.therapistId) {
        // Remove therapist
        therapists.delete(socket.therapistId);
        logger.info(`Therapist ${socket.therapistId} went offline`);

        // End any active sessions
        for (const [sessionId, session] of activeSessions.entries()) {
          if (session.therapistId === socket.therapistId) {
            io.to(sessionId).emit('session-ended', {
              message: 'Therapist disconnected. Session ended.',
            });
            activeSessions.delete(sessionId);
          }
        }
      }

      if (socket.userType === 'user' && socket.sessionId) {
        // End session if active
        const session = activeSessions.get(socket.sessionId);
        if (session) {
          io.to(socket.sessionId).emit('session-ended', {
            message: 'User disconnected. Session ended.',
          });

          // Make therapist available again
          if (session.therapistId) {
            const therapist = therapists.get(session.therapistId);
            if (therapist) {
              therapist.isAvailable = true;
            }
          }

          activeSessions.delete(socket.sessionId);
        }
      }
    });

    // ============================================
    // GET AVAILABLE THERAPISTS
    // ============================================
    socket.on('get-available-therapists', () => {
      const availableTherapists = Array.from(therapists.entries())
        .filter(([_, data]) => data.isAvailable)
        .map(([id, data]) => ({
          therapistId: id,
          name: data.name,
          specialties: data.specialties || [],
          experience: data.experience || 'Not specified',
          bio: data.bio || 'Professional therapist ready to help.',
          supportedSessionTypes: data.supportedSessionTypes || ['text'],
          isAvailable: data.isAvailable,
          lastHeartbeat: data.lastHeartbeat,
          status: 'online',
        }));

      logger.info(`Sending ${availableTherapists.length} available therapists to client`);
      socket.emit('available-therapists', { therapists: availableTherapists });
    });

    // ============================================
    // DEBUG ENDPOINTS
    // ============================================
    socket.on('get-therapists', () => {
      const therapistList = Array.from(therapists.entries()).map(([id, data]) => ({
        therapistId: id,
        name: data.name,
        isAvailable: data.isAvailable,
        lastHeartbeat: data.lastHeartbeat,
      }));

      socket.emit('therapists-list', { therapists: therapistList });
    });
  });

  // Cleanup stale therapists every 60 seconds
  setInterval(() => {
    const now = new Date();
    const staleThreshold = 120000; // 2 minutes

    for (const [therapistId, therapist] of therapists.entries()) {
      if (now - therapist.lastHeartbeat > staleThreshold) {
        logger.info(`Removing stale therapist: ${therapistId}`);
        therapists.delete(therapistId);
      }
    }
  }, 60000);

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};
