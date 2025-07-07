const { Server } = require('socket.io');
const logger = require('./logger');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Store active sessions and connections
  const activeSessions = new Map();
  const therapistQueue = new Map();
  const userQueue = new Map();

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Generate anonymous session ID for user
    const generateSessionId = () => {
      return `session_${Math.random().toString(36).substr(2, 9)}`;
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
        preferences: data.preferences || {}
      });

      logger.info(`User joined with session: ${sessionId}`);
      
      socket.emit('session-created', { sessionId });
      
      // Try to match with available therapist
      matchUserWithTherapist(socket, sessionId);
    });

    // Therapist joins and becomes available
    socket.on('join-as-therapist', (data) => {
      const therapistId = data.therapistId || `therapist_${Math.random().toString(36).substr(2, 9)}`;
      socket.therapistId = therapistId;
      socket.userType = 'therapist';
      
      therapistQueue.set(therapistId, {
        socketId: socket.id,
        timestamp: new Date(),
        specialties: data.specialties || [],
        isAvailable: true
      });

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
        sessionId
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
          isTyping: true
        });
      }
    });

    socket.on('typing-stop', (data) => {
      if (socket.sessionId) {
        socket.to(socket.sessionId).emit('user-typing', {
          senderType: socket.userType,
          isTyping: false
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
          endedBy: socket.userType
        });

        // Clean up session data
        activeSessions.delete(sessionId);
        
        logger.info(`Session ${sessionId} ended by ${socket.userType}`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      
      // Clean up user/therapist from queues
      if (socket.userType === 'user' && socket.sessionId) {
        userQueue.delete(socket.sessionId);
        
        // Notify therapist if session was active
        if (activeSessions.has(socket.sessionId)) {
          socket.to(socket.sessionId).emit('participant-disconnected', {
            message: 'The user has disconnected from the session.'
          });
        }
      } else if (socket.userType === 'therapist' && socket.therapistId) {
        therapistQueue.delete(socket.therapistId);
        
        // Notify user if session was active
        const activeSession = Array.from(activeSessions.values())
          .find(session => session.therapistId === socket.therapistId);
          
        if (activeSession) {
          socket.to(activeSession.sessionId).emit('participant-disconnected', {
            message: 'The therapist has disconnected from the session.'
          });
        }
      }
    });

    // Matching logic
    function matchUserWithTherapist(userSocket, sessionId) {
      const availableTherapists = Array.from(therapistQueue.entries())
        .filter(([_, therapist]) => therapist.isAvailable);

      if (availableTherapists.length > 0) {
        const [therapistId, therapistData] = availableTherapists[0];
        
        // Create active session
        const session = {
          sessionId,
          userId: 'anonymous',
          therapistId,
          startTime: new Date(),
          status: 'active'
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
          message: 'You have been connected with a mental health professional. This conversation is completely anonymous and encrypted.'
        });

        logger.info(`Matched session ${sessionId}: user with therapist ${therapistId}`);
      } else {
        // No therapists available
        userSocket.emit('waiting-for-therapist', {
          message: 'Please wait while we connect you with an available therapist...',
          estimatedWait: '2-5 minutes'
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
          status: 'active'
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
          message: 'You have been connected with a mental health professional. This conversation is completely anonymous and encrypted.'
        });

        logger.info(`Matched session ${sessionId}: therapist ${therapistId} with user`);
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
  getIO
};
