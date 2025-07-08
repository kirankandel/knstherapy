const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const Post = require('../models/post.model');
const Reply = require('../models/reply.model');

// Create a new post
exports.createPost = catchAsync(async (req, res) => {
  const body = { ...req.body, user: req.user.id }; // attach authenticated user
  const post = await Post.create(body);
  res.status(httpStatus.CREATED).send(post);
});

// Get all posts with filters
exports.getPosts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['user', 'category', 'tags']);
  const search = req.query.search;

  // Optional full-text search (requires indexing on model)
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const result = await Post.paginate(filter, options);
  res.send(result);
});

// Get a single post
exports.getPost = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.postId).populate('user', 'name email');
  if (!post) throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  res.send(post);
});

// Update a post
exports.updatePost = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');

  // Only post owner can update
  if (post.user.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  // Prevent user field from being overwritten
  const allowedUpdates = ['title', 'description', 'category', 'tags'];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      post[field] = req.body[field];
    }
  });

  await post.save();
  res.send(post);
});

// Delete a post
exports.deletePost = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');

  if (post.user.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  // Delete associated replies
  await Reply.deleteMany({ post: post._id });

  await post.deleteOne();
  res.status(httpStatus.NO_CONTENT).send();
});

// Get replies for a specific post
exports.getRepliesForPost = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const filter = { post: req.params.postId };
  const result = await Reply.paginate(filter, options);
  res.send(result);
});
