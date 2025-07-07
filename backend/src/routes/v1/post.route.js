const express        = require('express');
const postController  = require('../../controllers/post.controller');
const replyRoute      = require('./reply.route');   // ⬅ nested
const auth           = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .post(auth(), postController.createPost)
  .get(postController.getPosts);

router
  .route('/:postId')
  .get(postController.getPost)
  .patch(auth(), postController.updatePost)
  .delete(auth(), postController.deletePost);

/* ─── nested replies ─── */
router.use('/:postId/replies', replyRoute);

module.exports = router;
