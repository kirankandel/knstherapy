const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick       = require('../utils/pick');
const ApiError   = require('../utils/ApiError');
const Reply      = require('../models/reply.model');

exports.createReply = catchAsync(async (req, res) => {
  const body  = { ...req.body, user: req.user.id, post: req.params.postId };
  const reply = await Reply.create(body);
  res.status(httpStatus.CREATED).send(reply);
});

exports.getReplies = catchAsync(async (req, res) => {
  // allow ?post=123 to filter, otherwise list all
  const filter  = pick(req.query, ['post', 'user']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result  = await Reply.paginate(filter, options);
  res.send(result);
});

exports.getReply = catchAsync(async (req, res) => {
  const reply = await Reply.findById(req.params.replyId)
                           .populate('user', 'name email')
                           .populate('post', 'title');
  if (!reply) throw new ApiError(httpStatus.NOT_FOUND, 'Reply not found');
  res.send(reply);
});

exports.updateReply = catchAsync(async (req, res) => {
  const reply = await Reply.findById(req.params.replyId);
  if (!reply) throw new ApiError(httpStatus.NOT_FOUND, 'Reply not found');

  if (reply.user.toString() !== req.user.id)
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');

  Object.assign(reply, req.body);
  await reply.save();
  res.send(reply);
});

exports.deleteReply = catchAsync(async (req, res) => {
  const reply = await Reply.findById(req.params.replyId);
  if (!reply) throw new ApiError(httpStatus.NOT_FOUND, 'Reply not found');

  if (reply.user.toString() !== req.user.id)
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');

  await reply.deleteOne();
  res.status(httpStatus.NO_CONTENT).send();
});
