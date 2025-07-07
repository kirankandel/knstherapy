const httpStatus = require('http-status');
const { Message, Session } = require('../models/chat.model');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

/**
 * Create a new chat session
 * @param {Object} preferences - User preferences for therapist matching
 * @param {String} sessionType - Type of session (text/voice)
 * @returns {Promise<Session>}
 */
const createSession = async (preferences = {}, sessionType = 'text') => {
  const sessionId = `session_${Math.random().toString(36).substr(2, 9)}`;

  const session = await Session.create({
    sessionId,
    userId: 'anonymous',
    therapistId: 'pending',
    status: 'waiting',
    sessionType,
    metadata: {
      userPreferences: preferences,
    },
  });

  logger.info(`Session created: ${sessionId}`);
  return session;
};

/**
 * Get session status
 * @param {String} sessionId
 * @returns {Promise<Object>}
 */
const getSessionStatus = async (sessionId) => {
  const session = await Session.findOne({ sessionId });

  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }

  return {
    sessionId: session.sessionId,
    status: session.status,
    startTime: session.startTime,
    endTime: session.endTime,
    sessionType: session.sessionType,
    participantCount: session.participants.length,
  };
};

/**
 * Get session messages (limited for privacy)
 * @param {String} sessionId
 * @param {Number} limit
 * @param {Number} offset
 * @returns {Promise<Array>}
 */
const getSessionMessages = async (sessionId, limit = 50, offset = 0) => {
  // Verify session exists
  const session = await Session.findOne({ sessionId });
  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }

  // Only return recent messages for active sessions (privacy)
  if (session.status !== 'active') {
    return [];
  }

  const messages = await Message.find({ sessionId })
    .sort({ timestamp: -1 })
    .limit(Math.min(limit, 100)) // Cap at 100 messages
    .skip(offset)
    .select('-__v')
    .lean();

  return messages.reverse(); // Return in chronological order
};

/**
 * Save a message to the session
 * @param {Object} messageData
 * @returns {Promise<Message>}
 */
const saveMessage = async (messageData) => {
  const message = await Message.create(messageData);
  logger.info(`Message saved for session: ${messageData.sessionId}`);
  return message;
};

/**
 * End a chat session
 * @param {String} sessionId
 * @returns {Promise<void>}
 */
const endSession = async (sessionId) => {
  const session = await Session.findOne({ sessionId });

  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }

  await Session.updateOne(
    { sessionId },
    {
      status: 'ended',
      endTime: new Date(),
    }
  );

  // Note: Messages will auto-delete due to TTL index
  logger.info(`Session ended: ${sessionId}`);
};

/**
 * Get count of available therapists (mock implementation)
 * @returns {Promise<Number>}
 */
const getAvailableTherapistsCount = async () => {
  // In a real implementation, this would check actual therapist availability
  // For now, return a mock number
  return Math.floor(Math.random() * 5) + 1; // 1-5 available therapists
};

/**
 * Update session with therapist assignment
 * @param {String} sessionId
 * @param {String} therapistId
 * @returns {Promise<void>}
 */
const assignTherapist = async (sessionId, therapistId) => {
  await Session.updateOne(
    { sessionId },
    {
      therapistId,
      status: 'active',
      $push: {
        participants: [
          {
            participantId: 'anonymous',
            participantType: 'user',
            joinedAt: new Date(),
          },
          {
            participantId: therapistId,
            participantType: 'therapist',
            joinedAt: new Date(),
          },
        ],
      },
    }
  );

  logger.info(`Therapist ${therapistId} assigned to session ${sessionId}`);
};

module.exports = {
  createSession,
  getSessionStatus,
  getSessionMessages,
  saveMessage,
  endSession,
  getAvailableTherapistsCount,
  assignTherapist,
};
