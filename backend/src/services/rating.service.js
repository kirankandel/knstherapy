const { Rating } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Create a rating
 * @param {Object} ratingBody
 * @returns {Promise<Rating>}
 */
const createRating = async (ratingBody) => {
  // Check if rating already exists for this session
  const existingRating = await Rating.isRatingExists(ratingBody.sessionId);
  if (existingRating) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Rating already exists for this session');
  }

  return Rating.create(ratingBody);
};

/**
 * Query ratings
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryRatings = async (filter, options) => {
  const ratings = await Rating.paginate(filter, options);
  return ratings;
};

/**
 * Get rating by id
 * @param {ObjectId} id
 * @returns {Promise<Rating>}
 */
const getRatingById = async (id) => {
  return Rating.findById(id);
};

/**
 * Get rating by session id
 * @param {string} sessionId
 * @returns {Promise<Rating>}
 */
const getRatingBySessionId = async (sessionId) => {
  return Rating.findOne({ sessionId });
};

/**
 * Get therapist rating statistics
 * @param {string} therapistId
 * @returns {Promise<Object>}
 */
const getTherapistStats = async (therapistId) => {
  return Rating.getTherapistStats(therapistId);
};

/**
 * Get ratings for a therapist
 * @param {string} therapistId
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getTherapistRatings = async (therapistId, options = {}) => {
  const filter = { therapistId };
  const defaultOptions = {
    sortBy: 'createdAt:desc',
    limit: 10,
    page: 1,
  };
  return queryRatings(filter, { ...defaultOptions, ...options });
};

/**
 * Update rating by id
 * @param {ObjectId} ratingId
 * @param {Object} updateBody
 * @returns {Promise<Rating>}
 */
const updateRatingById = async (ratingId, updateBody) => {
  const rating = await getRatingById(ratingId);
  if (!rating) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rating not found');
  }
  Object.assign(rating, updateBody);
  await rating.save();
  return rating;
};

/**
 * Delete rating by id
 * @param {ObjectId} ratingId
 * @returns {Promise<Rating>}
 */
const deleteRatingById = async (ratingId) => {
  const rating = await getRatingById(ratingId);
  if (!rating) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rating not found');
  }
  await rating.remove();
  return rating;
};

module.exports = {
  createRating,
  queryRatings,
  getRatingById,
  getRatingBySessionId,
  getTherapistStats,
  getTherapistRatings,
  updateRatingById,
  deleteRatingById,
};
