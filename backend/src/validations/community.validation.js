const Joi = require('joi');
const { objectId } = require('./custom.validation');

const updateProfile = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      'profile.bio': Joi.string().max(500),
      'profile.avatar': Joi.string().uri(),
      'profile.location': Joi.string(),
      'communityProfile.username': Joi.string().alphanum().min(3).max(20),
      'preferences.notifications.email': Joi.boolean(),
      'preferences.notifications.push': Joi.boolean(),
      'preferences.notifications.newMessages': Joi.boolean(),
      'preferences.privacy.showOnlineStatus': Joi.boolean(),
      'preferences.privacy.allowDirectMessages': Joi.boolean(),
    })
    .min(1),
};

const updateKarma = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    karmaChange: Joi.number().integer().min(-1000).max(1000).required(),
    reason: Joi.string().max(200),
  }),
};

const addBadge = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().required().max(50),
    description: Joi.string().required().max(200),
  }),
};

const getCommunityUser = {
  params: Joi.object().keys({
    identifier: Joi.alternatives().try(Joi.string().custom(objectId), Joi.string().alphanum().min(3).max(20)),
  }),
};

const getCommunityUsers = {
  query: Joi.object().keys({
    username: Joi.string().alphanum(),
    karma: Joi.number().integer(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  updateProfile,
  updateKarma,
  addBadge,
  getCommunityUser,
  getCommunityUsers,
};
