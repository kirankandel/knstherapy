const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const Reply = require('../models/reply.model');

// Create a reply under a specific post
exports.createReply = catchAsync(async (req, res) => {
  const body = {
    ...req.body,
    user: req.user.id,
    post: req.params.postId,
  };

  const reply = await Reply.create(body);
  res.status(httpStatus.CREATED).send(reply);
});

// Get replies with optional filters (post/user)
exports.getReplies = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['post', 'user']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const result = await Reply.paginate(filter, options);
  res.send(result);
});

// Get a single reply by ID
exports.getReply = catchAsync(async (req, res) => {
  const reply = await Reply.findById(req.params.replyId)
    .populate('user', 'name email')
    .populate('post', 'title');

  if (!reply) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reply not found');
  }

  res.send(reply);
});

// Update a reply (only by owner)
exports.updateReply = catchAsync(async (req, res) => {
  const reply = await Reply.findById(req.params.replyId);
  if (!reply) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reply not found');
  }

  if (reply.user.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only edit your own replies');
  }

  // Only allow certain fields to be updated
  const allowedUpdates = ['title', 'description'];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      reply[field] = req.body[field];
    }
  });

  await reply.save();
  res.send(reply);
});

// Delete a reply (only by owner)
exports.deleteReply = catchAsync(async (req, res) => {
  const reply = await Reply.findById(req.params.replyId);
  if (!reply) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reply not found');
  }

  if (reply.user.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only delete your own replies');
  }

  await reply.deleteOne();
  res.status(httpStatus.NO_CONTENT).send();
});
