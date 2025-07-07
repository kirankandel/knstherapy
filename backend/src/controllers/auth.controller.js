const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { authService, userService, tokenService, emailService } = require('../services');

const register = catchAsync(async (req, res) => {
  logger.info(`[AUTH] Register attempt - IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
  logger.debug(
    `[AUTH] Register data: ${JSON.stringify({
      email: req.body.email,
      name: req.body.name,
      userType: req.body.userType,
    })}`
  );

  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);

  logger.info(`[AUTH] User registered successfully - ID: ${user.id}, Email: ${user.email}, Type: ${user.userType}`);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const registerCommunityUser = catchAsync(async (req, res) => {
  logger.info(`[AUTH] Community user register attempt - IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
  logger.debug(
    `[AUTH] Community user register data: ${JSON.stringify({
      email: req.body.email,
      name: req.body.name,
      username: req.body.username,
    })}`
  );

  const user = await userService.createCommunityUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);

  logger.info(
    `[AUTH] Community user registered successfully - ID: ${user.id}, Email: ${user.email}, Username: ${
      user.communityProfile && user.communityProfile.username ? user.communityProfile.username : 'N/A'
    }`
  );
  res.status(httpStatus.CREATED).send({
    user,
    tokens,
    message: 'Community user account created successfully!',
  });
});

const registerTherapist = catchAsync(async (req, res) => {
  logger.info(`[AUTH] Therapist register attempt - IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
  logger.debug(
    `[AUTH] Therapist register data: ${JSON.stringify({
      email: req.body.email,
      name: req.body.name,
      licenseNumber: req.body.licenseNumber,
      specialties: req.body.specialties,
      yearsOfPractice: req.body.yearsOfPractice,
      sessionTypes: req.body.sessionTypes,
      location: req.body.location,
    })}`
  );

  const user = await userService.createTherapist(req.body);
  const tokens = await tokenService.generateAuthTokens(user);

  logger.info(
    `[AUTH] Therapist registered successfully - ID: ${user.id}, Email: ${user.email}, License: ${
      user.therapistProfile && user.therapistProfile.licenseNumber ? user.therapistProfile.licenseNumber : 'N/A'
    }`
  );
  res.status(httpStatus.CREATED).send({
    user,
    tokens,
    message: 'Therapist account created successfully! Your account is pending verification.',
  });
});

const login = catchAsync(async (req, res) => {
  logger.info(`[AUTH] Login attempt - IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
  logger.debug(`[AUTH] Login data: ${JSON.stringify({ email: req.body.email })}`);

  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);

  // Check if user is active
  if (!user.isActive) {
    logger.warn(`[AUTH] Login failed - Account deactivated - Email: ${email}, IP: ${req.ip}`);
    throw new ApiError(httpStatus.FORBIDDEN, 'Account has been deactivated');
  }

  // For therapists, check verification status
  if (user.userType === 'therapist' && user.therapistProfile.verificationStatus === 'rejected') {
    logger.warn(`[AUTH] Login failed - Therapist verification rejected - Email: ${email}, IP: ${req.ip}`);
    throw new ApiError(httpStatus.FORBIDDEN, 'Therapist account verification was rejected');
  }

  if (user.userType === 'therapist' && user.therapistProfile.verificationStatus === 'suspended') {
    logger.warn(`[AUTH] Login failed - Therapist account suspended - Email: ${email}, IP: ${req.ip}`);
    throw new ApiError(httpStatus.FORBIDDEN, 'Therapist account is suspended');
  }

  const tokens = await tokenService.generateAuthTokens(user);

  // Update last active
  user.lastActive = new Date();
  await user.save();

  logger.info(`[AUTH] Login successful - ID: ${user.id}, Email: ${user.email}, Type: ${user.userType}, IP: ${req.ip}`);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  logger.info(`[AUTH] Logout attempt - IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
  logger.debug(`[AUTH] Logout data: ${JSON.stringify({ refreshToken: req.body.refreshToken ? 'PROVIDED' : 'MISSING' })}`);

  await authService.logout(req.body.refreshToken);

  logger.info(`[AUTH] Logout successful - IP: ${req.ip}`);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  logger.info(`[AUTH] Refresh tokens attempt - IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
  logger.debug(
    `[AUTH] Refresh tokens data: ${JSON.stringify({ refreshToken: req.body.refreshToken ? 'PROVIDED' : 'MISSING' })}`
  );

  const tokens = await authService.refreshAuth(req.body.refreshToken);

  logger.info(`[AUTH] Tokens refreshed successfully - IP: ${req.ip}`);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  logger.info(`[AUTH] Forgot password attempt - IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
  logger.debug(`[AUTH] Forgot password data: ${JSON.stringify({ email: req.body.email })}`);

  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);

  logger.info(`[AUTH] Password reset email sent - Email: ${req.body.email}, IP: ${req.ip}`);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  logger.info(`[AUTH] Reset password attempt - IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
  logger.debug(`[AUTH] Reset password data: ${JSON.stringify({ token: req.query.token ? 'PROVIDED' : 'MISSING' })}`);

  await authService.resetPassword(req.query.token, req.body.password);

  logger.info(`[AUTH] Password reset successful - IP: ${req.ip}`);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  logger.info(`[AUTH] Send verification email attempt - IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
  logger.debug(`[AUTH] Send verification email data: ${JSON.stringify({ userId: req.user.id, email: req.user.email })}`);

  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);

  logger.info(`[AUTH] Verification email sent - User ID: ${req.user.id}, Email: ${req.user.email}, IP: ${req.ip}`);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  logger.info(`[AUTH] Verify email attempt - IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
  logger.debug(`[AUTH] Verify email data: ${JSON.stringify({ token: req.query.token ? 'PROVIDED' : 'MISSING' })}`);

  await authService.verifyEmail(req.query.token);

  logger.info(`[AUTH] Email verified successfully - IP: ${req.ip}`);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  registerCommunityUser,
  registerTherapist,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
