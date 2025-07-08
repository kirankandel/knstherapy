const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { analyticsService } = require('../services');

const getTherapistAnalytics = catchAsync(async (req, res) => {
  const { therapistId } = req.params;
  const options = pick(req.query, ['startDate', 'endDate', 'period']);
  
  // Convert period to date range if provided
  if (options.period && !options.startDate) {
    const now = new Date();
    const periodMap = {
      '7d': 7,
      '30d': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365
    };
    
    const daysBack = periodMap[options.period] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    options.startDate = startDate.toISOString();
    options.endDate = now.toISOString();
  }
  
  const analytics = await analyticsService.getTherapistDashboardAnalytics(therapistId, options);
  res.send(analytics);
});

const getSystemAnalytics = catchAsync(async (req, res) => {
  const analytics = await analyticsService.getSystemAnalytics();
  res.send(analytics);
});

const getLeaderboard = catchAsync(async (req, res) => {
  const options = pick(req.query, ['limit', 'sortBy']);
  const leaderboard = await analyticsService.getTherapistLeaderboard(options);
  res.send(leaderboard);
});

module.exports = {
  getTherapistAnalytics,
  getSystemAnalytics,
  getLeaderboard,
};
