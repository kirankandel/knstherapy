const express = require('express');
const postController = require('../../controllers/post.controller');
const replyRoute = require('./reply.route');
const auth = require('../../middlewares/auth');

const router = express.Router();

// POST /api/posts - Create a post
// GET /api/posts - Get all posts (public)
router
  .route('/v1')
//   .post(auth('createPost'), postController.createPost)
    .post(postController.createPost)
  .get(postController.getPosts);

// GET /api/posts/:postId - Get a specific post
// PATCH /api/posts/:postId - Update post (auth required)
// DELETE /api/posts/:postId - Delete post (auth required)
router
  .route('/:postId')
  .get(postController.getPost)
  .patch(auth('managePosts'), postController.updatePost)
  .delete(auth('managePosts'), postController.deletePost);

// Nested route for replies to a post
// e.g., POST /api/posts/:postId/replies
router.use('/:postId/replies', replyRoute);

module.exports = router;
