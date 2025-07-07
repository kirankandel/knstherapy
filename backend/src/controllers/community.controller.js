const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const getCommunityUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['username', 'karma']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  // Add community user specific filters
  filter.userType = 'community_user';
  
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getCommunityUser = catchAsync(async (req, res) => {
  const { identifier } = req.params;
  
  let user;
  // Check if identifier is username or user ID
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    // It's an ObjectId
    user = await userService.getUserById(identifier);
  } else {
    // It's a username
    user = await userService.getCommunityUserByUsername(identifier);
  }
  
  if (!user || user.userType !== 'community_user') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Community user not found');
  }
  
  res.send(user);
});

const updateCommunityProfile = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user || user.userType !== 'community_user') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Community user not found');
  }

  // Only allow user to update their own profile
  if (req.user.id !== user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  const allowedUpdates = pick(req.body, [
    'name', 'profile.bio', 'profile.avatar', 'profile.location',
    'communityProfile.username', 'preferences'
  ]);

  // Check if username is being updated and if it's available
  if (allowedUpdates['communityProfile.username']) {
    const isUsernameTaken = await userService.isUsernameTaken(
      allowedUpdates['communityProfile.username'], 
      user.id
    );
    if (isUsernameTaken) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
    }
  }

  const updatedUser = await userService.updateUserById(user.id, allowedUpdates);
  res.send(updatedUser);
});

const updateKarma = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user || user.userType !== 'community_user') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Community user not found');
  }

  const { karmaChange, reason } = req.body;
  
  if (!karmaChange || typeof karmaChange !== 'number') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid karma change value');
  }

  user.communityProfile.karma += karmaChange;
  
  // Ensure karma doesn't go below 0
  if (user.communityProfile.karma < 0) {
    user.communityProfile.karma = 0;
  }

  await user.save();
  
  res.send({
    user,
    message: `Karma updated by ${karmaChange}${reason ? ` (${reason})` : ''}`
  });
});

const addBadge = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user || user.userType !== 'community_user') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Community user not found');
  }

  const { name, description } = req.body;
  
  // Check if user already has this badge
  const existingBadge = user.communityProfile.badges.find(badge => badge.name === name);
  if (existingBadge) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already has this badge');
  }

  user.communityProfile.badges.push({
    name,
    description,
    earnedAt: new Date()
  });

  await user.save();
  
  res.send({
    user,
    message: `Badge "${name}" awarded successfully`
  });
});

const getCommunityUserStats = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user || user.userType !== 'community_user') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Community user not found');
  }

  // Basic stats - in a real app, you'd query posts/comments collections
  const stats = {
    karma: user.communityProfile.karma,
    joinedAt: user.communityProfile.joinedAt,
    badges: user.communityProfile.badges,
    totalPosts: 0, // Would be calculated from posts collection
    totalComments: 0, // Would be calculated from comments collection
    lastActive: user.lastActive,
  };

  res.send(stats);
});

module.exports = {
  getCommunityUsers,
  getCommunityUser,
  updateCommunityProfile,
  updateKarma,
  addBadge,
  getCommunityUserStats,
};
