const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { ratingService } = require('../services');

const createRating = catchAsync(async (req, res) => {
  const rating = await ratingService.createRating(req.body);
  res.status(httpStatus.CREATED).send(rating);
});

const getRatings = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['therapistId', 'sessionType', 'rating']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await ratingService.queryRatings(filter, options);
  res.send(result);
});

const getRating = catchAsync(async (req, res) => {
  const rating = await ratingService.getRatingById(req.params.ratingId);
  if (!rating) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rating not found');
  }
  res.send(rating);
});

const getRatingBySession = catchAsync(async (req, res) => {
  const rating = await ratingService.getRatingBySessionId(req.params.sessionId);
  if (!rating) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rating not found for this session');
  }
  res.send(rating);
});

const getTherapistStats = catchAsync(async (req, res) => {
  const stats = await ratingService.getTherapistStats(req.params.therapistId);
  res.send(stats);
});

const getTherapistRatings = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await ratingService.getTherapistRatings(req.params.therapistId, options);
  res.send(result);
});

const updateRating = catchAsync(async (req, res) => {
  const rating = await ratingService.updateRatingById(req.params.ratingId, req.body);
  res.send(rating);
});

const deleteRating = catchAsync(async (req, res) => {
  await ratingService.deleteRatingById(req.params.ratingId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createRating,
  getRatings,
  getRating,
  getRatingBySession,
  getTherapistStats,
  getTherapistRatings,
  updateRating,
  deleteRating,
};
