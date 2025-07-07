const express        = require('express');
const replyController = require('../../controllers/reply.controller');
const auth           = require('../../middlewares/auth');

const router = express.Router({ mergeParams: true }); // mergeParams lets us read :postId

router
  .route('/')
  .post(auth(), replyController.createReply)     // POST /posts/:postId/replies
  .get(replyController.getReplies);              // GET  /posts/:postId/replies

router
  .route('/:replyId')
  .get(replyController.getReply)
  .patch(auth(), replyController.updateReply)
  .delete(auth(), replyController.deleteReply);

module.exports = router;
