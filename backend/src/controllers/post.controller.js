const httpStatus = require('http-status');
const catchAsync  = require('../utils/catchAsync');
const pick        = require('../utils/pick');
const ApiError    = require('../utils/ApiError');
const Post        = require('../models/post.model');
const Reply       = require('../models/reply.model');

/* ───────────── CRUD POSTS ───────────── */

exports.createPost = catchAsync(async (req, res) => {
  const body = { ...req.body, user: req.user.id };     // req.user is set by your auth middleware
  const post = await Post.create(body);
  res.status(httpStatus.CREATED).send(post);
});

exports.getPosts = catchAsync(async (req, res) => {
  const filter  = pick(req.query, ['user', 'category']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']); // paginate plugin
  const result  = await Post.paginate(filter, options);
  res.send(result);
});

exports.getPost = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.postId).populate('user', 'name email');
  if (!post) throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  res.send(post);
});

exports.updatePost = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');

  // optional: enforce “only owner can edit”
  if (post.user.toString() !== req.user.id)
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');

  Object.assign(post, req.body);
  await post.save();
  res.send(post);
});

exports.deletePost = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');

  if (post.user.toString() !== req.user.id)
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');

  await post.deleteOne();
  res.status(httpStatus.NO_CONTENT).send();
});

/* ────── BONUS: Replies belonging to a Post ────── */

exports.getRepliesForPost = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const filter  = { post: req.params.postId };
  const result  = await Reply.paginate(filter, options);
  res.send(result);
});
