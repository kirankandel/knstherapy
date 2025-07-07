const express = require('express');
const chatController = require('../../controllers/chat.controller');

const router = express.Router();

// Get session history (limited for privacy)
router.get('/session/:sessionId/messages', chatController.getSessionMessages);

// Get session status
router.get('/session/:sessionId/status', chatController.getSessionStatus);

// Create new session (alternative to socket)
router.post('/session/create', chatController.createSession);

// End session
router.post('/session/:sessionId/end', chatController.endSession);

// Get available therapists count (for queue estimation)
router.get('/therapists/available', chatController.getAvailableTherapists);

module.exports = router;
