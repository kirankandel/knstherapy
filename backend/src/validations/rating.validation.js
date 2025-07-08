const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createRating = {
  body: Joi.object().keys({
    sessionId: Joi.string().required(),
    therapistId: Joi.string().required(),
    clientId: Joi.string().required(),
    sessionType: Joi.string().valid('text', 'audio', 'video').required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(500).allow(''),
    isAnonymous: Joi.boolean().default(true),
  }),
};

const getRatings = {
  query: Joi.object().keys({
    therapistId: Joi.string(),
    sessionType: Joi.string().valid('text', 'audio', 'video'),
    rating: Joi.number().integer().min(1).max(5),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getRating = {
  params: Joi.object().keys({
    ratingId: Joi.string().custom(objectId),
  }),
};

const getRatingBySession = {
  params: Joi.object().keys({
    sessionId: Joi.string().required(),
  }),
};

const getTherapistStats = {
  params: Joi.object().keys({
    therapistId: Joi.string().required(),
  }),
};

const getTherapistRatings = {
  params: Joi.object().keys({
    therapistId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateRating = {
  params: Joi.object().keys({
    ratingId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      rating: Joi.number().integer().min(1).max(5),
      comment: Joi.string().max(500).allow(''),
      isAnonymous: Joi.boolean(),
    })
    .min(1),
};

const deleteRating = {
  params: Joi.object().keys({
    ratingId: Joi.string().custom(objectId),
  }),
};

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
