const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Create a community user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createCommunityUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  if (userBody.username && (await User.isUsernameTaken(userBody.username))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }

  const userData = {
    name: userBody.name,
    email: userBody.email,
    password: userBody.password,
    userType: 'community_user',
    role: 'user',
    profile: {
      bio: userBody.bio,
      location: userBody.location,
    },
    communityProfile: {
      username: userBody.username,
      karma: 0,
    },
  };

  return User.create(userData);
};

/**
 * Create a therapist
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createTherapist = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  if (await User.isLicenseNumberTaken(userBody.licenseNumber)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'License number already registered');
  }

  const userData = {
    name: userBody.name,
    email: userBody.email,
    password: userBody.password,
    userType: 'therapist',
    role: 'therapist',
    profile: {
      bio: userBody.bio,
    },
    therapistProfile: {
      licenseNumber: userBody.licenseNumber,
      specialties: userBody.specialties,
      credentials: userBody.credentials,
      experience: {
        yearsOfPractice: userBody.yearsOfPractice,
        totalCases: 0,
        completedSessions: 0,
      },
      rating: {
        average: 0,
        totalReviews: 0,
      },
      availability: {
        isAvailable: false,
        sessionTypes: ['text'], // Default to text sessions
        maxConcurrentSessions: 5,
      },
      contact: {
        phone: userBody.phone,
        professionalEmail: userBody.professionalEmail,
        website: userBody.website,
      },
      verificationStatus: 'pending',
    },
  };

  return User.create(userData);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  
  // Auto-set isOnline to true when isActive is set to true
  const updatedBody = { ...updateBody };
  if (updatedBody.isActive === true) {
    updatedBody.isOnline = true;
  }
  
  Object.assign(user, updatedBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

/**
 * Get available therapists
 * @param {Object} filter - Additional filters
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getAvailableTherapists = async (filter = {}, options = {}) => {
  // Get therapists who are either:
  // 1. Currently active (isActive: true) OR
  // 2. Recently sent heartbeat (isOnline: true and lastActive within last 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const therapistFilter = {
    userType: 'therapist',
    'therapistProfile.verificationStatus': 'verified',
    'therapistProfile.availability.isAvailable': true,
    $or: [
      { isActive: true },
      {
        isOnline: true,
        lastActive: { $gte: fiveMinutesAgo },
      },
    ],
    ...filter,
  };

  return User.paginate(therapistFilter, options);
};

/**
 * Get therapist by license number
 * @param {string} licenseNumber
 * @returns {Promise<User>}
 */
const getTherapistByLicense = async (licenseNumber) => {
  return User.findOne({
    userType: 'therapist',
    'therapistProfile.licenseNumber': licenseNumber,
  });
};

/**
 * Get community user by username
 * @param {string} username
 * @returns {Promise<User>}
 */
const getCommunityUserByUsername = async (username) => {
  return User.findOne({
    userType: 'community_user',
    'communityProfile.username': username,
  });
};

/**
 * Update therapist verification status
 * @param {ObjectId} therapistId
 * @param {string} status - 'verified', 'rejected', 'suspended'
 * @param {ObjectId} verifiedBy - Admin user ID
 * @returns {Promise<User>}
 */
const updateTherapistVerification = async (therapistId, status, verifiedBy) => {
  const therapist = await getUserById(therapistId);
  if (!therapist || therapist.userType !== 'therapist') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Therapist not found');
  }

  therapist.therapistProfile.verificationStatus = status;
  if (status === 'verified') {
    therapist.therapistProfile.verifiedAt = new Date();
    therapist.therapistProfile.verifiedBy = verifiedBy;
  }

  await therapist.save();
  return therapist;
};

/**
 * Update therapist availability
 * @param {ObjectId} therapistId
 * @param {Object} availabilityData
 * @returns {Promise<User>}
 */
const updateTherapistAvailability = async (therapistId, availabilityData) => {
  const therapist = await getUserById(therapistId);
  if (!therapist || therapist.userType !== 'therapist') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Therapist not found');
  }

  Object.assign(therapist.therapistProfile.availability, availabilityData);
  therapist.lastActive = new Date();
  await therapist.save();
  return therapist;
};

module.exports = {
  createUser,
  createCommunityUser,
  createTherapist,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  getAvailableTherapists,
  getTherapistByLicense,
  getCommunityUserByUsername,
  updateTherapistVerification,
  updateTherapistAvailability,
};
