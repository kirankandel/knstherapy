const httpStatus = require('http-status');
const { Rating } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get comprehensive dashboard analytics for a therapist
 * @param {string} therapistId
 * @param {Object} options - Query options like dateRange
 * @returns {Promise<Object>}
 */
const getTherapistDashboardAnalytics = async (therapistId, options = {}) => {
  const { startDate, endDate } = options;

  // Default to last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Build date filter
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else {
    dateFilter.createdAt = { $gte: thirtyDaysAgo };
  }

  const baseFilter = { therapistId, ...dateFilter };

  try {
    // Get basic stats
    const totalRatings = await Rating.countDocuments({ therapistId });
    const recentRatings = await Rating.countDocuments(baseFilter);

    // Get rating statistics
    const ratingStats = await Rating.aggregate([
      { $match: { therapistId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          ratingsBreakdown: {
            $push: '$rating',
          },
        },
      },
    ]);

    // Get ratings distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (ratingStats.length > 0) {
      ratingStats[0].ratingsBreakdown.forEach((rating) => {
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
      });
    }

    // Get session type breakdown
    const sessionTypeStats = await Rating.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$sessionType',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    // Get ratings over time (weekly)
    const ratingsOverTime = await Rating.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            week: { $week: '$createdAt' },
          },
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } },
    ]);

    // Get daily activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyActivity = await Rating.aggregate([
      {
        $match: {
          therapistId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          sessionsCount: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Get recent feedback
    const recentFeedback = await Rating.find(baseFilter)
      .select('rating comment sessionType createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate performance metrics
    const performanceMetrics = {
      totalSessions: totalRatings,
      recentSessions: recentRatings,
      averageRating: ratingStats.length > 0 ? Math.round(ratingStats[0].averageRating * 10) / 10 : 0,
      satisfactionRate:
        ratingStats.length > 0 ? Math.round(((ratingDistribution[4] + ratingDistribution[5]) / totalRatings) * 100) : 0,
      responseRate: 100, // Assuming all sessions get rated for now
    };

    return {
      performanceMetrics,
      ratingDistribution,
      sessionTypeStats: sessionTypeStats.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          averageRating: Math.round(item.averageRating * 10) / 10,
        };
        return acc;
      }, {}),
      ratingsOverTime,
      dailyActivity,
      recentFeedback,
      dateRange: {
        startDate: startDate || thirtyDaysAgo.toISOString(),
        endDate: endDate || new Date().toISOString(),
      },
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * Get system-wide analytics (for admin use)
 * @returns {Promise<Object>}
 */
const getSystemAnalytics = async () => {
  try {
    const totalRatings = await Rating.countDocuments();
    const totalTherapists = await Rating.distinct('therapistId').then((ids) => ids.length);

    const overallStats = await Rating.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalSessions: { $sum: 1 },
        },
      },
    ]);

    const sessionTypeDistribution = await Rating.aggregate([
      {
        $group: {
          _id: '$sessionType',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      totalSessions: totalRatings,
      totalTherapists,
      averageRating: overallStats.length > 0 ? Math.round(overallStats[0].averageRating * 10) / 10 : 0,
      sessionTypeDistribution: sessionTypeDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch system analytics');
  }
};

/**
 * Get therapist ranking/leaderboard
 * @param {Object} options
 * @returns {Promise<Array>}
 */
const getTherapistLeaderboard = async (options = {}) => {
  const { limit = 10 } = options;

  try {
    const leaderboard = await Rating.aggregate([
      {
        $group: {
          _id: '$therapistId',
          averageRating: { $avg: '$rating' },
          totalSessions: { $sum: 1 },
          recentRating: { $last: '$rating' },
        },
      },
      {
        $match: {
          totalSessions: { $gte: 5 }, // Only include therapists with at least 5 sessions
        },
      },
      {
        $sort: {
          averageRating: -1,
          totalSessions: -1,
        },
      },
      {
        $limit: limit,
      },
    ]);

    return leaderboard.map((therapist, index) => ({
      rank: index + 1,
      therapistId: therapist._id,
      averageRating: Math.round(therapist.averageRating * 10) / 10,
      totalSessions: therapist.totalSessions,
      recentRating: therapist.recentRating,
    }));
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch leaderboard');
  }
};

module.exports = {
  getTherapistDashboardAnalytics,
  getSystemAnalytics,
  getTherapistLeaderboard,
};
