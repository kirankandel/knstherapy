const Joi = require('joi');
const { password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    userType: Joi.string().valid('community_user', 'therapist').default('community_user'),
  }),
};

const registerCommunityUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    username: Joi.string().alphanum().min(3).max(20),
    bio: Joi.string().max(500),
    location: Joi.string(),
  }),
};

const registerTherapist = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    licenseNumber: Joi.string().required(),
    specialties: Joi.array()
      .items(
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
      )
      .min(1)
      .required(),
    yearsOfPractice: Joi.number().min(0).required(),
    credentials: Joi.array()
      .items(
        Joi.object().keys({
          type: Joi.string().valid('degree', 'certification', 'license').required(),
          name: Joi.string().required(),
          institution: Joi.string().required(),
          year: Joi.number().min(1980).max(new Date().getFullYear()).required(),
        })
      )
      .min(1)
      .required(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/),
    professionalEmail: Joi.string().email(),
    website: Joi.string().uri(),
    bio: Joi.string().max(500),
    sessionTypes: Joi.array().items(Joi.string().valid('text', 'voice', 'video')),
    location: Joi.string().max(100),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

module.exports = {
  register,
  registerCommunityUser,
  registerTherapist,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
