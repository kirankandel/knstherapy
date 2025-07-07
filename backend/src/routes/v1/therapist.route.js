const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const therapistValidation = require('../../validations/therapist.validation');
const therapistController = require('../../controllers/therapist.controller');

const router = express.Router();

router.route('/').get(therapistController.getTherapists);

router.route('/available').get(therapistController.getAvailableTherapists);

router
  .route('/:therapistId')
  .get(therapistController.getTherapist)
  .patch(
    auth('manageTherapistProfile'),
    validate(therapistValidation.updateTherapist),
    therapistController.updateTherapistProfile
  );

router
  .route('/:therapistId/availability')
  .patch(
    auth('manageTherapistProfile'),
    validate(therapistValidation.updateAvailability),
    therapistController.updateAvailability
  );

router
  .route('/:therapistId/verify')
  .patch(auth('verifyTherapists'), validate(therapistValidation.verifyTherapist), therapistController.verifyTherapist);

router.route('/:therapistId/stats').get(auth(), therapistController.getTherapistStats);

module.exports = router;
