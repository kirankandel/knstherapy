const { Server } = require('socket.io');
const logger = require('./logger');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
      const { therapistId, name } = data;
      
      if (!therapistId) {
        socket.emit('error', { message: 'Therapist ID required' });
        return;
      }

      socket.therapistId = therapistId;
      socket.userType = 'therapist';

      // Add to therapists map
      therapists.set(therapistId, {
        socketId: socket.id,
        name: name || 'Anonymous Therapist',
        isAvailable: true,
        lastHeartbeat: new Date()
      });

      logger.info(`Therapist ${therapistId} (${name}) joined and is available`);
      
      socket.emit('therapist-joined', { 
        therapistId, 
        status: 'online',
        message: 'Successfully joined as therapist' 
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
          status: 'alive'
        });
      }
    });

    // ============================================
    // USER REQUESTS SESSION WITH THERAPIST
    // ============================================
    socket.on('join-as-user', (data) => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      socket.sessionId = sessionId;
      socket.userType = 'user';
      
      socket.join(sessionId);
      
      logger.info(`User joined with session ID: ${sessionId}`);
      
      socket.emit('session-created', { sessionId });
    });

    // User requests session with specific therapist
    socket.on('request-session', (data) => {
      const { therapistId, message } = data;
      
      if (!socket.sessionId || socket.userType !== 'user') {
        socket.emit('request-failed', { message: 'Invalid session state' });
        return;
      }

      if (!therapistId) {
        socket.emit('request-failed', { message: 'Therapist ID required' });
        return;
      }

      const therapist = therapists.get(therapistId);
      if (!therapist || !therapist.isAvailable) {
        socket.emit('request-failed', { message: 'Therapist not available' });
        return;
      }

      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      const request = {
        requestId,
        sessionId: socket.sessionId,
        userId: socket.id,
        therapistId,
        message: message || 'User requesting session',
        timestamp: new Date()
      };

      pendingRequests.set(requestId, request);

      // Send request to therapist
      const therapistSocket = io.sockets.sockets.get(therapist.socketId);
      if (therapistSocket) {
        therapistSocket.emit('session-request', {
          requestId,
          sessionId: socket.sessionId,
          message: request.message,
          timestamp: request.timestamp
        });

        logger.info(`Session request sent: ${requestId} from user to therapist ${therapistId}`);
        
        socket.emit('request-sent', { 
          requestId,
          message: 'Request sent to therapist. Waiting for response...' 
        });
      } else {
        socket.emit('request-failed', { message: 'Therapist connection lost' });
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
        therapistId: socket.therapistId,
        userId: request.userId,
        startTime: new Date()
      };

      activeSessions.set(request.sessionId, session);

      // Join therapist to session room
      socket.join(request.sessionId);
      socket.sessionId = request.sessionId;

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
          message: 'Session started! You are now connected with your therapist.'
        });
      }

      logger.info(`Session started: ${request.sessionId} between therapist ${socket.therapistId} and user`);
      
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
          message: reason || 'Therapist declined the session request'
        });
      }

      logger.info(`Request declined: ${requestId} by therapist ${socket.therapistId}`);
      
      // Cleanup request
      pendingRequests.delete(requestId);
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
        sessionId
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
        endedBy: socket.userType
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
              message: 'Therapist disconnected. Session ended.'
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
            message: 'User disconnected. Session ended.'
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
    // DEBUG ENDPOINTS
    // ============================================
    socket.on('get-therapists', () => {
      const therapistList = Array.from(therapists.entries()).map(([id, data]) => ({
        therapistId: id,
        name: data.name,
        isAvailable: data.isAvailable,
        lastHeartbeat: data.lastHeartbeat
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

    // User joins as anonymous user looking for therapy
    socket.on('join-as-user', (data) => {
      const sessionId = generateSessionId();
      socket.sessionId = sessionId;
      socket.userType = 'user';

      socket.join(sessionId);
      userQueue.set(sessionId, {
        socketId: socket.id,
        timestamp: new Date(),
        preferences: data.preferences || {},
        preferredTherapist: data.preferredTherapist || null,
      });

      logger.info(`User joined with session: ${sessionId}${data.preferredTherapist ? ` (preferred therapist: ${data.preferredTherapist})` : ''}`);

      socket.emit('session-created', { sessionId });

      // Try to match with preferred therapist first, then any available therapist
      if (data.preferredTherapist) {
        matchUserWithSpecificTherapist(socket, sessionId, data.preferredTherapist);
      } else {
        matchUserWithTherapist(socket, sessionId);
      }
    });

    // Therapist joins and becomes available
    socket.on('join-as-therapist', async (data) => {
      const therapistId = data.therapistId || `therapist_${Math.random().toString(36).substr(2, 9)}`;
      socket.therapistId = therapistId;
      socket.userType = 'therapist';

      therapistQueue.set(therapistId, {
        socketId: socket.id,
        timestamp: new Date(),
        specialties: data.specialties || [],
        isAvailable: true,
      });

      // Update therapist status in database when they connect
      try {
        const { userService } = require('../services');
        
        const updateData = {
          lastActive: new Date(),
          isOnline: true,
          isActive: true,
          'therapistProfile.availability.isAvailable': true,
        };
        
        await userService.updateUserById(therapistId, updateData);
        
        logger.info(`Therapist ${therapistId} joined and set as available in database`);
      } catch (error) {
        logger.error(`Error updating therapist ${therapistId} in database during join:`, error);
      }

      logger.info(`Therapist joined: ${therapistId}`);

      socket.emit('therapist-registered', { therapistId });

      // Try to match with waiting users
      matchTherapistWithUser(socket, therapistId);
    });

    // Handle chat messages
    socket.on('send-message', (data) => {
      const { sessionId, content, messageType = 'text' } = data;

      if (!sessionId || !content.trim()) {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }

      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: content.trim(),
        messageType,
        senderType: socket.userType,
        senderId: socket.userType === 'therapist' ? socket.therapistId : 'anonymous',
        timestamp: new Date(),
        sessionId,
      };

      // Emit message to all participants in the session
      io.to(sessionId).emit('new-message', message);

      logger.info(`Message sent in session ${sessionId} by ${socket.userType}`);
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      if (socket.sessionId) {
        socket.to(socket.sessionId).emit('user-typing', {
          senderType: socket.userType,
          isTyping: true,
        });
      }
    });

    socket.on('typing-stop', (data) => {
      if (socket.sessionId) {
        socket.to(socket.sessionId).emit('user-typing', {
          senderType: socket.userType,
          isTyping: false,
        });
      }
    });

    // End session
    socket.on('end-session', (data) => {
      const { sessionId } = data;

      if (sessionId && activeSessions.has(sessionId)) {
        const session = activeSessions.get(sessionId);

        // Notify all participants
        io.to(sessionId).emit('session-ended', {
          message: 'Session has been ended. All data has been permanently deleted.',
          endedBy: socket.userType,
        });

        // Clean up session data
        activeSessions.delete(sessionId);

        logger.info(`Session ${sessionId} ended by ${socket.userType}`);
      }
    });

    // Handle session requests from users to specific therapists
    socket.on('request-session', (data) => {
      const { therapistId, sessionType = 'text', message = '', preferences = {} } = data;
      
      if (!socket.sessionId || socket.userType !== 'user') {
        socket.emit('error', { message: 'Invalid session request' });
        return;
      }

      const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const request = {
        id: requestId,
        sessionId: socket.sessionId,
        userId: socket.id,
        therapistId,
        sessionType,
        message,
        preferences,
        timestamp: new Date(),
        status: 'pending'
      };

      pendingRequests.set(requestId, request);

      // Find the therapist and send them the request
      const therapist = therapistQueue.get(therapistId);
      if (therapist && therapist.isAvailable) {
        const therapistSocket = io.sockets.sockets.get(therapist.socketId);
        if (therapistSocket) {
          therapistSocket.emit('session-request', {
            requestId,
            sessionId: socket.sessionId,
            sessionType,
            message,
            preferences,
            timestamp: request.timestamp
          });
          
          logger.info(`Session request sent from ${socket.sessionId} to therapist ${therapistId}`);
          
          // Notify user that request was sent
          socket.emit('request-sent', {
            requestId,
            therapistId,
            message: 'Your session request has been sent to the therapist. Please wait for their response.'
          });
        } else {
          socket.emit('request-failed', {
            message: 'The selected therapist is not currently online.'
          });
          pendingRequests.delete(requestId);
        }
      } else {
        socket.emit('request-failed', {
          message: 'The selected therapist is not available.'
        });
        pendingRequests.delete(requestId);
      }
    });

    // Handle therapist accepting a session request
    socket.on('accept-request', (data) => {
      const { requestId } = data;
      
      if (socket.userType !== 'therapist') {
        socket.emit('error', { message: 'Only therapists can accept requests' });
        return;
      }

      const request = pendingRequests.get(requestId);
      if (!request || request.therapistId !== socket.therapistId) {
        socket.emit('error', { message: 'Invalid request ID' });
        return;
      }

      // Update request status
      request.status = 'accepted';
      
      // Find the user who made the request
      const userSocket = io.sockets.sockets.get(request.userId);
      if (userSocket) {
        // Create active session
        const session = {
          sessionId: request.sessionId,
          userId: request.userId,
          therapistId: socket.therapistId,
          startTime: new Date(),
          status: 'active',
          sessionType: request.sessionType
        };

        activeSessions.set(request.sessionId, session);

        // Join therapist to session room
        socket.join(request.sessionId);
        socket.sessionId = request.sessionId;

        // Mark therapist as unavailable during session
        const therapistData = therapistQueue.get(socket.therapistId);
        if (therapistData) {
          therapistData.isAvailable = false;
        }

        // Remove user from queue
        userQueue.delete(request.sessionId);

        // Notify both parties
        io.to(request.sessionId).emit('session-matched', {
          sessionId: request.sessionId,
          sessionType: request.sessionType,
          message: 'You have been connected with a mental health professional. This conversation is completely anonymous and encrypted.'
        });

        logger.info(`Session request ${requestId} accepted, session ${request.sessionId} started`);
      } else {
        socket.emit('error', { message: 'User is no longer available' });
      }

      // Clean up the request
      pendingRequests.delete(requestId);
    });

    // Handle therapist declining a session request
    socket.on('decline-request', (data) => {
      const { requestId, reason = 'The therapist is not available at this time.' } = data;
      
      if (socket.userType !== 'therapist') {
        socket.emit('error', { message: 'Only therapists can decline requests' });
        return;
      }

      const request = pendingRequests.get(requestId);
      if (!request || request.therapistId !== socket.therapistId) {
        socket.emit('error', { message: 'Invalid request ID' });
        return;
      }

      // Update request status
      request.status = 'declined';
      
      // Find the user who made the request
      const userSocket = io.sockets.sockets.get(request.userId);
      if (userSocket) {
        userSocket.emit('request-declined', {
          requestId,
          reason,
          message: reason
        });
        
        logger.info(`Session request ${requestId} declined by therapist ${socket.therapistId}`);
      }

      // Clean up the request
      pendingRequests.delete(requestId);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.id}`);

      // Clean up user/therapist from queues
      if (socket.userType === 'user' && socket.sessionId) {
        userQueue.delete(socket.sessionId);

        // Notify therapist if session was active
        if (activeSessions.has(socket.sessionId)) {
          socket.to(socket.sessionId).emit('participant-disconnected', {
            message: 'The user has disconnected from the session.',
          });
        }
      } else if (socket.userType === 'therapist' && socket.therapistId) {
        therapistQueue.delete(socket.therapistId);

        // Update therapist status in database when they disconnect
        try {
          const { userService } = require('../services');
          
          const updateData = {
            lastActive: new Date(),
            isOnline: false,
            // Don't change isActive or availability on disconnect - let them persist
          };
          
          await userService.updateUserById(socket.therapistId, updateData);
          
          logger.info(`Therapist ${socket.therapistId} disconnected and marked as offline in database`);
        } catch (error) {
          logger.error(`Error updating therapist ${socket.therapistId} in database during disconnect:`, error);
        }

        // Notify user if session was active
        const activeSession = Array.from(activeSessions.values()).find(
          (session) => session.therapistId === socket.therapistId
        );

        if (activeSession) {
          socket.to(activeSession.sessionId).emit('participant-disconnected', {
            message: 'The therapist has disconnected from the session.',
          });
        }
      }
    });

    // Heartbeat mechanism for tracking online status
    socket.on('heartbeat', async (data) => {
      const timestamp = new Date();
      
      if (socket.userType === 'therapist' && socket.therapistId) {
        const therapistData = therapistQueue.get(socket.therapistId);
        if (therapistData) {
          therapistData.lastHeartbeat = timestamp;
          therapistData.lastActive = timestamp;
          
          // Update availability status if provided, default to true
          const isAvailable = data.isAvailable !== undefined ? data.isAvailable : true;
          therapistData.isAvailable = isAvailable;
          
          // Update specialties if provided
          if (data.specialties) {
            therapistData.specialties = data.specialties;
          }
          
          // Update therapist status in database
          try {
            const { userService } = require('../services');
            
            const updateData = {
              lastActive: timestamp,
              isOnline: true,
              isActive: true,
            };
            
            // Set availability in database
            if (data.isAvailable === false) {
              updateData['therapistProfile.availability.isAvailable'] = false;
              logger.info(`Socket heartbeat: Therapist ${socket.therapistId} explicitly set availability to false`);
            } else {
              updateData['therapistProfile.availability.isAvailable'] = true;
              logger.info(`Socket heartbeat: Therapist ${socket.therapistId} availability set to true via heartbeat`);
            }
            
            await userService.updateUserById(socket.therapistId, updateData);
            
            logger.info(`Socket heartbeat: Therapist ${socket.therapistId} - Updated in DB:`, updateData);
          } catch (error) {
            logger.error(`Error updating therapist ${socket.therapistId} in database during heartbeat:`, error);
          }
          
          logger.info(`Heartbeat received from therapist ${socket.therapistId}`);
          
          // Send acknowledgment
          socket.emit('heartbeat-ack', { 
            timestamp,
            status: 'online',
            therapistId: socket.therapistId,
            isAvailable: isAvailable
          });
        }
      } else if (socket.userType === 'user' && socket.sessionId) {
        // Update user heartbeat
        const userData = userQueue.get(socket.sessionId);
        if (userData) {
          userData.lastHeartbeat = timestamp;
          logger.info(`Heartbeat received from user ${socket.sessionId}`);
        }
        
        socket.emit('heartbeat-ack', { 
          timestamp,
          status: 'online',
          sessionId: socket.sessionId 
        });
      }
    });

    // Cleanup stale connections every 60 seconds
    const cleanupInterval = setInterval(() => {
      const now = new Date();
      const staleThreshold = 90000; // 90 seconds without heartbeat = stale
      
      // Clean up stale therapists
      for (const [therapistId, therapistData] of therapistQueue.entries()) {
        const lastHeartbeat = therapistData.lastHeartbeat || therapistData.timestamp;
        if (now - lastHeartbeat > staleThreshold) {
          logger.info(`Removing stale therapist connection: ${therapistId}`);
          therapistQueue.delete(therapistId);
          
          // If they were in a session, end it
          for (const [sessionId, session] of activeSessions.entries()) {
            if (session.therapistId === therapistId) {
              io.to(sessionId).emit('session-ended', {
                reason: 'Therapist disconnected',
                message: 'The therapist has disconnected. The session has ended.',
              });
              activeSessions.delete(sessionId);
            }
          }
        }
      }
      
      // Clean up stale users
      for (const [sessionId, userData] of userQueue.entries()) {
        const lastHeartbeat = userData.lastHeartbeat || userData.timestamp;
        if (now - lastHeartbeat > staleThreshold) {
          logger.info(`Removing stale user connection: ${sessionId}`);
          userQueue.delete(sessionId);
        }
      }
    }, 60000); // Run every 60 seconds

    // Clean up interval when server shuts down
    io.engine.on('connection_error', () => {
      clearInterval(cleanupInterval);
    });

    // Matching logic
    function matchUserWithTherapist(userSocket, sessionId) {
      const availableTherapists = Array.from(therapistQueue.entries()).filter(([_, therapist]) => therapist.isAvailable);

      if (availableTherapists.length > 0) {
        const [therapistId, therapistData] = availableTherapists[0];

        // Create active session
        const session = {
          sessionId,
          userId: 'anonymous',
          therapistId,
          startTime: new Date(),
          status: 'active',
        };

        activeSessions.set(sessionId, session);

        // Join therapist to session room
        const therapistSocket = io.sockets.sockets.get(therapistData.socketId);
        if (therapistSocket) {
          therapistSocket.join(sessionId);
          therapistSocket.sessionId = sessionId;

          // Mark therapist as unavailable
          therapistQueue.get(therapistId).isAvailable = false;
        }

        // Remove user from queue
        userQueue.delete(sessionId);

        // Notify both parties
        io.to(sessionId).emit('session-matched', {
          sessionId,
          message:
            'You have been connected with a mental health professional. This conversation is completely anonymous and encrypted.',
        });

        logger.info(`Matched session ${sessionId}: user with therapist ${therapistId}`);
      } else {
        // No therapists available
        userSocket.emit('waiting-for-therapist', {
          message: 'Please wait while we connect you with an available therapist...',
          estimatedWait: '2-5 minutes',
        });
      }
    }

    function matchTherapistWithUser(therapistSocket, therapistId) {
      const waitingUsers = Array.from(userQueue.entries());

      if (waitingUsers.length > 0) {
        const [sessionId, userData] = waitingUsers[0];

        // Create active session
        const session = {
          sessionId,
          userId: 'anonymous',
          therapistId,
          startTime: new Date(),
          status: 'active',
        };

        activeSessions.set(sessionId, session);

        // Join therapist to session room
        therapistSocket.join(sessionId);
        therapistSocket.sessionId = sessionId;

        // Mark therapist as unavailable
        therapistQueue.get(therapistId).isAvailable = false;

        // Remove user from queue
        userQueue.delete(sessionId);

        // Notify both parties
        io.to(sessionId).emit('session-matched', {
          sessionId,
          message:
            'You have been connected with a mental health professional. This conversation is completely anonymous and encrypted.',
        });

        logger.info(`Matched session ${sessionId}: therapist ${therapistId} with user`);
      }
    }

    function matchUserWithSpecificTherapist(userSocket, sessionId, preferredTherapistId) {
      const therapistData = therapistQueue.get(preferredTherapistId);

      if (therapistData && therapistData.isAvailable) {
        // Create active session with preferred therapist
        const session = {
          sessionId,
          userId: 'anonymous',
          therapistId: preferredTherapistId,
          startTime: new Date(),
          status: 'active',
        };

        activeSessions.set(sessionId, session);

        // Join therapist to session room
        const therapistSocket = io.sockets.sockets.get(therapistData.socketId);
        if (therapistSocket) {
          therapistSocket.join(sessionId);
          therapistSocket.sessionId = sessionId;

          // Mark therapist as unavailable
          therapistQueue.get(preferredTherapistId).isAvailable = false;
        }

        // Remove user from queue
        userQueue.delete(sessionId);

        // Notify both parties
        io.to(sessionId).emit('session-matched', {
          sessionId,
          message: `You have been connected with your selected therapist. This conversation is completely anonymous and encrypted.`,
        });

        logger.info(`Matched session ${sessionId}: user with preferred therapist ${preferredTherapistId}`);
      } else {
        // Preferred therapist not available, try to match with any available therapist
        userSocket.emit('waiting-for-therapist', {
          message: 'Your preferred therapist is currently unavailable. Connecting you with another qualified professional...',
          estimatedWait: '2-5 minutes',
        });
        
        // Fall back to general matching
        matchUserWithTherapist(userSocket, sessionId);
      }
    }
  });

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
