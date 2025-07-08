const express = require('express');
const replyController = require('../../controllers/reply.controller');
const auth = require('../../middlewares/auth');

const router = express.Router({ mergeParams: true }); // Allows access to :postId from parent route

// Routes for replies under a specific post
router
  .route('/')
  .post(auth('createReply'), replyController.createReply)   // POST /posts/:postId/replies
  .get(replyController.getReplies);                         // GET  /posts/:postId/replies

// Routes for individual reply actions
router
  .route('/:replyId')
  .get(replyController.getReply)                            // GET    /posts/:postId/replies/:replyId
  .patch(auth('manageReplies'), replyController.updateReply) // PATCH  /posts/:postId/replies/:replyId
  .delete(auth('manageReplies'), replyController.deleteReply); // DELETE /posts/:postId/replies/:replyId

module.exports = router;
