const Joi = require('joi');
const { objectId } = require('./custom.validation');

const updateTherapist = {
  params: Joi.object().keys({
    therapistId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      'profile.bio': Joi.string().max(500),
      'profile.avatar': Joi.string().uri(),
      'profile.location': Joi.string(),
      'therapistProfile.specialties': Joi.array().items(
        Joi.string().valid(
          'anxiety',
          'depression',
          'trauma',
          'relationships',
          'addiction',
          'grief',
          'eating_disorders',
          'family_therapy',
          'couples_therapy',
          'child_therapy',
          'cognitive_behavioral',
          'mindfulness',
          'other'
        )
      ),
      'therapistProfile.contact.phone': Joi.string().pattern(/^[+]?[\d\s\-()]+$/),
      'therapistProfile.contact.professionalEmail': Joi.string().email(),
      'therapistProfile.contact.website': Joi.string().uri(),
      'preferences.notifications.email': Joi.boolean(),
      'preferences.notifications.push': Joi.boolean(),
      'preferences.notifications.newMessages': Joi.boolean(),
      'preferences.notifications.sessionReminders': Joi.boolean(),
      'preferences.privacy.showOnlineStatus': Joi.boolean(),
      'preferences.privacy.allowDirectMessages': Joi.boolean(),
    })
    .min(1),
};

const updateAvailability = {
  params: Joi.object().keys({
    therapistId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      isAvailable: Joi.boolean(),
      workingHours: Joi.array().items(
        Joi.object().keys({
          day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
          startTime: Joi.string()
            .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          endTime: Joi.string()
            .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        })
      ),
      maxConcurrentSessions: Joi.number().min(1).max(20),
      sessionTypes: Joi.array().items(Joi.string().valid('text', 'voice', 'video')).min(1),
    })
    .min(1),
};

const verifyTherapist = {
  params: Joi.object().keys({
    therapistId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('verified', 'rejected', 'suspended').required(),
    notes: Joi.string().max(500),
  }),
};

const getTherapist = {
  params: Joi.object().keys({
    therapistId: Joi.string().custom(objectId),
  }),
};

const getTherapists = {
  query: Joi.object().keys({
    specialties: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
    verificationStatus: Joi.string().valid('pending', 'verified', 'rejected', 'suspended'),
    isAvailable: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  updateTherapist,
  updateAvailability,
  verifyTherapist,
  getTherapist,
  getTherapists,
};
