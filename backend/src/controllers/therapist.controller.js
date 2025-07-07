const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const getTherapists = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['specialties', 'verificationStatus', 'isAvailable']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  // Add therapist-specific filters
  filter.userType = 'therapist';
  
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getAvailableTherapists = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['specialties']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  const result = await userService.getAvailableTherapists(filter, options);
  res.send(result);
});

const getTherapist = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.therapistId);
  if (!user || user.userType !== 'therapist') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Therapist not found');
  }
  res.send(user);
});

const updateTherapistProfile = catchAsync(async (req, res) => {
  const therapist = await userService.getUserById(req.params.therapistId);
  if (!therapist || therapist.userType !== 'therapist') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Therapist not found');
  }

  // Only allow therapist to update their own profile
  if (req.user.id !== therapist.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  const allowedUpdates = pick(req.body, [
    'name', 'profile.bio', 'profile.avatar', 'profile.location',
    'therapistProfile.specialties', 'therapistProfile.contact',
    'therapistProfile.availability', 'preferences'
  ]);

  const updatedTherapist = await userService.updateUserById(therapist.id, allowedUpdates);
  res.send(updatedTherapist);
});

const updateAvailability = catchAsync(async (req, res) => {
  const therapist = await userService.getUserById(req.params.therapistId);
  if (!therapist || therapist.userType !== 'therapist') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Therapist not found');
  }

  // Only allow therapist to update their own availability
  if (req.user.id !== therapist.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  const availabilityData = pick(req.body, [
    'isAvailable', 'workingHours', 'maxConcurrentSessions', 'sessionTypes'
  ]);

  const updatedTherapist = await userService.updateTherapistAvailability(therapist.id, availabilityData);
  res.send(updatedTherapist);
});

const verifyTherapist = catchAsync(async (req, res) => {
  const { status } = req.body;
  
  if (!['verified', 'rejected', 'suspended'].includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid verification status');
  }

  const updatedTherapist = await userService.updateTherapistVerification(
    req.params.therapistId,
    status,
    req.user.id
  );
  
  res.send(updatedTherapist);
});

const getTherapistStats = catchAsync(async (req, res) => {
  const therapist = await userService.getUserById(req.params.therapistId);
  if (!therapist || therapist.userType !== 'therapist') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Therapist not found');
  }

  // Only allow therapist to view their own stats or admin
  if (req.user.id !== therapist.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  const stats = {
    totalSessions: therapist.therapistProfile.experience.completedSessions,
    totalCases: therapist.therapistProfile.experience.totalCases,
    averageRating: therapist.therapistProfile.rating.average,
    totalReviews: therapist.therapistProfile.rating.totalReviews,
    yearsOfPractice: therapist.therapistProfile.experience.yearsOfPractice,
    specialties: therapist.therapistProfile.specialties,
    verificationStatus: therapist.therapistProfile.verificationStatus,
  };

  res.send(stats);
});

module.exports = {
  getTherapists,
  getAvailableTherapists,
  getTherapist,
  updateTherapistProfile,
  updateAvailability,
  verifyTherapist,
  getTherapistStats,
};
