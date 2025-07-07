const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const communityValidation = require('../../validations/community.validation');
const communityController = require('../../controllers/community.controller');

const router = express.Router();

router
  .route('/users')
  .get(communityController.getCommunityUsers);

router
  .route('/users/:identifier')
  .get(communityController.getCommunityUser);

router
  .route('/users/:userId/profile')
  .patch(auth('manageCommunityProfile'), validate(communityValidation.updateProfile), communityController.updateCommunityProfile);

router
  .route('/users/:userId/karma')
  .patch(auth('manageUsers'), validate(communityValidation.updateKarma), communityController.updateKarma);

router
  .route('/users/:userId/badges')
  .post(auth('manageUsers'), validate(communityValidation.addBadge), communityController.addBadge);

router
  .route('/users/:userId/stats')
  .get(auth(), communityController.getCommunityUserStats);

module.exports = router;
