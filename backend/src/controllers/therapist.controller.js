const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../config/logger');
const { userService } = require('../services');
const cacheService = require('../services/cache.service');
const therapistStatusManager = require('../services/therapistStatus.service');

const getTherapists = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['specialties', 'verificationStatus', 'isAvailable']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  // Add therapist-specific filters
  filter.userType = 'therapist';

  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getAvailableTherapists = catchAsync(async (req, res) => {
  logger.info(`[THERAPIST] Get available therapists attempt - IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
  
  const filter = pick(req.query, ['specialties']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  logger.debug(`[THERAPIST] Available therapists query filter: ${JSON.stringify(filter)}`);
  logger.debug(`[THERAPIST] Available therapists query options: ${JSON.stringify(options)}`);

  // Try to get from cache first
  const cachedResult = cacheService.getAvailableTherapists(filter, options);
  if (cachedResult) {
    logger.info(`[THERAPIST] Returning cached available therapists - Count: ${cachedResult.totalResults}, IP: ${req.ip}`);
    return res.send(cachedResult);
  }

  // If not in cache, query database
  const result = await userService.getAvailableTherapists(filter, options);

  // Cache the result
  cacheService.setAvailableTherapists(filter, options, result);

  logger.info(`[THERAPIST] Found ${result.totalResults} available therapists - IP: ${req.ip}`);
  if (result.results && result.results.length > 0) {
    result.results.forEach((therapist) => {
      logger.debug(`[THERAPIST] Available therapist ${therapist.id}: ${JSON.stringify({
        name: therapist.name,
        isActive: therapist.isActive,
        isOnline: therapist.isOnline,
        lastActive: therapist.lastActive,
        isAvailable: therapist.therapistProfile && therapist.therapistProfile.availability && therapist.therapistProfile.availability.isAvailable,
        verificationStatus: therapist.therapistProfile && therapist.therapistProfile.verificationStatus,
      })}`);
    });
  }

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
    'name',
    'profile.bio',
    'profile.avatar',
    'profile.location',
    'therapistProfile.specialties',
    'therapistProfile.contact',
    'therapistProfile.availability',
    'preferences',
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

  const availabilityData = pick(req.body, ['isAvailable', 'workingHours', 'maxConcurrentSessions', 'sessionTypes']);

  const updatedTherapist = await userService.updateTherapistAvailability(therapist.id, availabilityData);
  res.send(updatedTherapist);
});

const verifyTherapist = catchAsync(async (req, res) => {
  const { status } = req.body;

  if (!['verified', 'rejected', 'suspended'].includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid verification status');
  }

  const updatedTherapist = await userService.updateTherapistVerification(req.params.therapistId, status, req.user.id);

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

const getOnlineTherapists = catchAsync(async (req, res) => {
  // This would require access to the socket.io instance
  // For now, let's get therapists who are marked as available and recently active
  
  const filter = pick(req.query, ['specialties']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  // Get therapists who are:
  // 1. Verified
  // 2. Available 
  // 3. Recently active (within last 30 minutes)
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  const therapistFilter = {
    userType: 'therapist',
    'therapistProfile.verificationStatus': 'verified',
    'therapistProfile.availability.isAvailable': true,
    lastActive: { $gte: thirtyMinsAgo },
    isActive: true,
    ...filter,
  };

  const result = await userService.queryUsers(therapistFilter, options);
  res.send(result);
});

const getRealTimeTherapistStatus = catchAsync(async (req, res) => {
  logger.info(`[THERAPIST] Get realtime status attempt - IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
  
  // Try to get from cache first
  const cachedStatus = cacheService.getRealtimeStatus();
  if (cachedStatus) {
    logger.info(`[THERAPIST] Returning cached realtime status - IP: ${req.ip}`);
    return res.send({
      ...cachedStatus,
      timestamp: new Date(),
      cached: true,
    });
  }

  // Get real-time data from socket.io connections
  const realTimeStats = therapistStatusManager.getRealTimeStats();

  // Cache the result
  cacheService.setRealtimeStatus(realTimeStats);

  logger.info(`[THERAPIST] Generated fresh realtime status - IP: ${req.ip}`);
  res.send({
    ...realTimeStats,
    timestamp: new Date(),
    cached: false,
    message: 'Real-time therapist status from active socket connections',
  });
});

const sendHeartbeat = catchAsync(async (req, res) => {
  const { user } = req;
  const { timestamp, isAvailable } = req.body;

  logger.info(`[THERAPIST] Heartbeat received - User ID: ${user.id}, IP: ${req.ip}`);
  logger.debug(`[THERAPIST] Heartbeat from user: ${JSON.stringify({
    id: user.id,
    role: user.role,
    userType: user.userType,
    email: user.email,
    requestedAvailability: isAvailable,
  })}`);

  // Ensure user is a therapist (check both role and userType for compatibility)
  if (user.role !== 'therapist' && user.userType !== 'therapist') {
    logger.warn(`[THERAPIST] Heartbeat failed - Non-therapist attempted heartbeat - User ID: ${user.id}, IP: ${req.ip}`);
    throw new ApiError(httpStatus.FORBIDDEN, 'Only therapists can send heartbeats to this endpoint');
  }

  // Update therapist's last active timestamp and availability
  const updateData = {
    lastActive: timestamp ? new Date(timestamp) : new Date(),
    isOnline: true,
    isActive: true, // Set therapist as active when heartbeat received
  };
  
  // Always set availability to true when heartbeat is received (unless explicitly set to false)
  if (isAvailable === false) {
    updateData['therapistProfile.availability.isAvailable'] = false;
    logger.debug(`[THERAPIST] Therapist ${user.id} explicitly set availability to false`);
  } else {
    // Default to available when sending heartbeat
    updateData['therapistProfile.availability.isAvailable'] = true;
    logger.debug(`[THERAPIST] Therapist ${user.id} availability set to true via heartbeat`);
  }
  
  const updatedUser = await userService.updateUserById(user.id, updateData);
  
  // Clear cache to ensure fresh data
  cacheService.clearTherapistCache();
  
  logger.info(`[THERAPIST] Heartbeat processed - User ID: ${user.id}, Fields updated: ${JSON.stringify(updateData)}, IP: ${req.ip}`);
  logger.debug(`[THERAPIST] Therapist profile availability: ${JSON.stringify(updatedUser.therapistProfile && updatedUser.therapistProfile.availability)}`);

  res.status(httpStatus.OK).json({
    message: 'Heartbeat received',
    timestamp: new Date(),
    status: 'online',
    therapistId: user.id,
  });
});

module.exports = {
  getTherapists,
  getAvailableTherapists,
  getTherapist,
  updateTherapistProfile,
  updateAvailability,
  verifyTherapist,
  getTherapistStats,
  getOnlineTherapists,
  getRealTimeTherapistStatus,
  sendHeartbeat,
};
