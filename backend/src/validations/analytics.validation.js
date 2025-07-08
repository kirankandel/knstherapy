const Joi = require('joi');

const getTherapistAnalytics = {
  params: Joi.object().keys({
    therapistId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    period: Joi.string().valid('7d', '30d', '3m', '6m', '1y').default('30d'),
  }),
};

const getLeaderboard = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(50).default(10),
    sortBy: Joi.string().valid('rating', 'sessions', 'recent').default('rating'),
  }),
};

const getSystemAnalytics = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
  }),
};

module.exports = {
  getTherapistAnalytics,
  getLeaderboard,
  getSystemAnalytics,
};
