const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { authService, userService, tokenService, emailService } = require('../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const registerCommunityUser = catchAsync(async (req, res) => {
  const user = await userService.createCommunityUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ 
    user, 
    tokens,
    message: 'Community user account created successfully!' 
  });
});

const registerTherapist = catchAsync(async (req, res) => {
  const user = await userService.createTherapist(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ 
    user, 
    tokens,
    message: 'Therapist account created successfully! Your account is pending verification.' 
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  
  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Account has been deactivated');
  }

  // For therapists, check verification status
  if (user.userType === 'therapist' && user.therapistProfile.verificationStatus === 'rejected') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Therapist account verification was rejected');
  }
  
  if (user.userType === 'therapist' && user.therapistProfile.verificationStatus === 'suspended') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Therapist account is suspended');
  }

  const tokens = await tokenService.generateAuthTokens(user);
  
  // Update last active
  user.lastActive = new Date();
  await user.save();
  
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
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
