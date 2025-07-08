const cop = require('cloudofficeprint');
const fs = require('fs');
const analyticsService = require('./analytics.service');
const User = require('../models/user.model');
const Rating = require('../models/rating.model');
const path=require('path');

const API_KEY = 'FC59A68A8F9A50D1E055043998A2C4EE';
const SERVER_URL = 'http://127.0.0.1:8010';
const templatePath = path.join(__dirname, '../assets/template.docx');

/**
 * Generate a PDF report for a therapist
 * @param {string} therapistId
 * @returns {Promise<Buffer>}
 */
const generateTherapistReport = async (therapistId) => {
  try {
    const therapist = await User.findById(therapistId);
    if (!therapist || therapist.userType !== 'therapist') {
      throw new Error('Therapist not found');
    }

    // Get analytics data
    const analytics = await analyticsService.getTherapistDashboardAnalytics(therapistId);

    // Handle case where analytics might have errors or be empty
    const safeAnalytics = {
      totalSessions: analytics.totalSessions || 0,
      totalRatings: analytics.totalRatings || 0,
      totalClients: analytics.totalClients || 0,
      averageRating: analytics.averageRating || 0,
      ratingDistribution: analytics.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      sessionTypeStats: analytics.sessionTypeStats || { text: 0, audio: 0, video: 0 },
      dateRange: analytics.dateRange || 'Last 30 days',
    };

    // Helper function to get rating stars
    const getRatingStars = (rating) => {
      if (rating === 5) return '⭐⭐⭐⭐⭐';
      if (rating === 4) return '⭐⭐⭐⭐';
      if (rating === 3) return '⭐⭐⭐';
      if (rating === 2) return '⭐⭐';
      return '⭐';
    };

    // Get recent ratings with feedback
    const recentRatings = await Rating.find({ therapistId }).sort({ createdAt: -1 }).limit(10);

    // Calculate totals for percentage calculations
    const totalSessions =
      safeAnalytics.sessionTypeStats.text + safeAnalytics.sessionTypeStats.audio + safeAnalytics.sessionTypeStats.video;
    const totalRatings =
      (safeAnalytics.ratingDistribution[5] || 0) +
      (safeAnalytics.ratingDistribution[4] || 0) +
      (safeAnalytics.ratingDistribution[3] || 0) +
      (safeAnalytics.ratingDistribution[2] || 0) +
      (safeAnalytics.ratingDistribution[1] || 0);

    // Prepare data for the template
    const reportData = {
      // Therapist Information
      therapist_name: therapist.name || 'Anonymous Therapist',
      therapist_id: therapistId,
      therapist_email: therapist.email || 'N/A',
      therapist_specialties:
        therapist.therapistProfile && therapist.therapistProfile.specialties
          ? therapist.therapistProfile.specialties.join(', ')
          : 'General',
      therapist_experience:
        therapist.therapistProfile && therapist.therapistProfile.experience
          ? therapist.therapistProfile.experience
          : 'Not specified',
      therapist_bio:
        therapist.therapistProfile && therapist.therapistProfile.bio ? therapist.therapistProfile.bio : 'No bio available',

      // Report metadata
      report_date: new Date().toLocaleDateString(),
      report_period: safeAnalytics.dateRange,

      // Performance metrics
      total_sessions: safeAnalytics.totalSessions,
      average_rating: safeAnalytics.averageRating ? safeAnalytics.averageRating.toFixed(1) : 'N/A',
      total_ratings: safeAnalytics.totalRatings,
      total_clients: safeAnalytics.totalClients,

      // Session type breakdown with pre-calculated percentages
      text_sessions: safeAnalytics.sessionTypeStats.text || 0,
      audio_sessions: safeAnalytics.sessionTypeStats.audio || 0,
      video_sessions: safeAnalytics.sessionTypeStats.video || 0,
      text_sessions_percentage:
        totalSessions > 0 ? Math.round((safeAnalytics.sessionTypeStats.text / totalSessions) * 100) : 0,
      audio_sessions_percentage:
        totalSessions > 0 ? Math.round((safeAnalytics.sessionTypeStats.audio / totalSessions) * 100) : 0,
      video_sessions_percentage:
        totalSessions > 0 ? Math.round((safeAnalytics.sessionTypeStats.video / totalSessions) * 100) : 0,

      // Rating distribution with pre-calculated percentages
      five_star: safeAnalytics.ratingDistribution[5] || 0,
      four_star: safeAnalytics.ratingDistribution[4] || 0,
      three_star: safeAnalytics.ratingDistribution[3] || 0,
      two_star: safeAnalytics.ratingDistribution[2] || 0,
      one_star: safeAnalytics.ratingDistribution[1] || 0,
      five_star_percentage:
        totalRatings > 0 ? Math.round(((safeAnalytics.ratingDistribution[5] || 0) / totalRatings) * 100) : 0,
      four_star_percentage:
        totalRatings > 0 ? Math.round(((safeAnalytics.ratingDistribution[4] || 0) / totalRatings) * 100) : 0,
      three_star_percentage:
        totalRatings > 0 ? Math.round(((safeAnalytics.ratingDistribution[3] || 0) / totalRatings) * 100) : 0,
      two_star_percentage:
        totalRatings > 0 ? Math.round(((safeAnalytics.ratingDistribution[2] || 0) / totalRatings) * 100) : 0,
      one_star_percentage:
        totalRatings > 0 ? Math.round(((safeAnalytics.ratingDistribution[1] || 0) / totalRatings) * 100) : 0,

      // Recent feedback with pre-computed rating stars
      recent_feedback: recentRatings.map((rating) => ({
        rating: rating.rating,
        feedback: rating.comment || 'No feedback provided',
        session_type: rating.sessionType || 'Unknown',
        date: rating.createdAt.toLocaleDateString(),
        session_duration: 'N/A',
        rating_stars: getRatingStars(rating.rating),
      })),
    };

    // Create the template HTML with beautiful KNSTherapy design
    

    // Create Cloud Office Print elements
    const collection = new cop.elements.ElementCollection();

    // Add all the data properties
    Object.keys(reportData).forEach((key) => {
      if (key !== 'recent_feedback') {
        collection.add(new cop.elements.Property(key, reportData[key]));
      }
    });

    // Add recent feedback as individual properties for looping
    collection.add(new cop.elements.Property('recent_feedback', reportData.recent_feedback));

    // Create Session Type Pie Chart with enhanced styling
    const sessionTypePieSeries = new cop.elements.PieSeries(
      ['Text Sessions', 'Audio Sessions', 'Video Sessions'],
      [reportData.text_sessions, reportData.audio_sessions, reportData.video_sessions],
      'session_type_pie',
      ['#10B981', '#3B82F6', '#8B5CF6'] // Emerald, Blue, Purple from KNSTherapy palette
    );
    const sessionTypePieChart = new cop.elements.PieChart('session_type_chart', [sessionTypePieSeries]);
    collection.add(sessionTypePieChart);

    // Create Rating Distribution Bar Chart with gradient colors
    const ratingBarSeries = new cop.elements.BarSeries(
      ['⭐ 1 Star', '⭐⭐ 2 Stars', '⭐⭐⭐ 3 Stars', '⭐⭐⭐⭐ 4 Stars', '⭐⭐⭐⭐⭐ 5 Stars'],
      [reportData.one_star, reportData.two_star, reportData.three_star, reportData.four_star, reportData.five_star],
      'rating_bars',
      ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#059669'] // Red to Green gradient for ratings
    );
    const ratingBarChart = new cop.elements.BarChart('rating_distribution_chart', [ratingBarSeries]);
    collection.add(ratingBarChart);

    // Create server configuration
    const server = new cop.config.Server(SERVER_URL, new cop.config.ServerConfig(API_KEY));

    // Create template from HTML
    const template = cop.Resource.fromLocalFile(templatePath);

    // Create print job with PDF output configuration
    // IMPORTANT: The filetype 'pdf' explicitly overrides the template type to ensure PDF output
    const outputConfig = new cop.config.OutputConfig('pdf', 'raw');
    const printJob = new cop.PrintJob(collection, server, template, outputConfig);

    try {
      // Execute the print job
      const response = await printJob.execute();

      // Get the PDF data as a buffer - CloudOfficePrint returns an ArrayBuffer
      const arrayBuffer = await response.buffer;
      const pdfBuffer = Buffer.from(arrayBuffer);

      return pdfBuffer;
    } catch (executionError) {
      // Re-throw the error with additional context for debugging
      throw new Error(`CloudOfficePrint execution failed: ${executionError.message}`);
    }
  } catch (error) {
    throw new Error(`Failed to generate PDF report: ${error.message}`);
  }
};

module.exports = {
  generateTherapistReport,
};
