const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { chatService } = require('../services');

const createSession = catchAsync(async (req, res) => {
  const { preferences, sessionType = 'text' } = req.body;
  const session = await chatService.createSession(preferences, sessionType);
  res.status(httpStatus.CREATED).send({ session });
});

const getSessionStatus = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const status = await chatService.getSessionStatus(sessionId);
  res.send({ status });
});

const getSessionMessages = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { limit = 50, offset = 0 } = req.query;
  
  const messages = await chatService.getSessionMessages(sessionId, limit, offset);
  res.send({ messages });
});

const endSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  await chatService.endSession(sessionId);
  res.send({ message: 'Session ended successfully' });
});

const getAvailableTherapists = catchAsync(async (req, res) => {
  const count = await chatService.getAvailableTherapistsCount();
  res.send({ availableCount: count });
});

module.exports = {
  createSession,
  getSessionStatus,
  getSessionMessages,
  endSession,
  getAvailableTherapists,
};
