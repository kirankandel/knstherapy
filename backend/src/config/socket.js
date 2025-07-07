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
