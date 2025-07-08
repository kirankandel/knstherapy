const cop = require('cloudofficeprint');
const fs = require('fs');
const analyticsService = require('./analytics.service');
const User = require('../models/user.model');
const Rating = require('../models/rating.model');

const API_KEY = 'FC59A68A8F9A50D1E055043998A2C4EE';
const SERVER_URL = 'http://127.0.0.1:8010';

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
    const templateHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Therapist Performance Report - KNSTherapy</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; 
            margin: 0;
            padding: 40px;
            color: #1F2937;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center; 
            padding: 70px 40px;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
        }
        
        .logo { 
            font-size: 36px; 
            font-weight: 800; 
            margin-bottom: 25px; 
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .report-title { 
            font-size: 48px; 
            font-weight: 700; 
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .report-subtitle { 
            font-size: 20px; 
            opacity: 0.95;
            font-weight: 400;
            position: relative;
            z-index: 1;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        
        .content {
            padding: 50px;
        }
        
        .section { 
            margin-bottom: 50px;
            background: #FAFBFC;
            border-radius: 16px;
            padding: 40px;
            border: 1px solid #E5E7EB;
        }
        
        .section-title { 
            font-size: 24px; 
            font-weight: 600; 
            margin-bottom: 30px; 
            color: #667eea;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .section-title::after {
            content: '';
            flex: 1;
            height: 2px;
            background: linear-gradient(90deg, #667eea, transparent);
        }
        
        /* Therapist Information Grid */
        .info-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 25px; 
            margin-bottom: 25px; 
        }
        
        .info-item { 
            background: white;
            padding: 25px; 
            border-radius: 12px; 
            border: 1px solid #E5E7EB;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s ease;
        }
        
        .info-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .info-label { 
            font-weight: 600; 
            color: #374151;
            font-size: 14px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            font-size: 16px;
            color: #1F2937;
            line-height: 1.5;
        }
        
        /* Performance Metrics - Enhanced */
        .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
            gap: 30px; 
            margin-bottom: 40px; 
        }
        
        .metric-card { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 35px 25px; 
            border-radius: 20px; 
            text-align: center;
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.1);
            transform: translateX(-100%);
            transition: transform 0.6s ease;
        }
        
        .metric-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 25px 50px rgba(102, 126, 234, 0.5);
        }
        
        .metric-card:hover::before {
            transform: translateX(100%);
        }
        
        .metric-card:nth-child(1) { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .metric-card:nth-child(2) { background: linear-gradient(135deg, #10B981 0%, #059669 100%); }
        .metric-card:nth-child(3) { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
        .metric-card:nth-child(4) { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); }
        
        .metric-value { 
            font-size: 36px; 
            font-weight: 700; 
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
        }
        
        .metric-label { 
            font-size: 14px; 
            opacity: 0.9;
            font-weight: 500;
            position: relative;
            z-index: 1;
        }
        
        /* Charts Section - Enhanced */
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin: 40px 0;
        }
        
        .chart-container {
            background: white;
            border-radius: 20px;
            padding: 35px;
            border: 1px solid #E5E7EB;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .chart-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2, #10B981);
        }
        
        .chart-container:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }
        
        .chart-title {
            font-size: 20px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 25px;
            text-align: center;
            position: relative;
            padding-bottom: 15px;
        }
        
        .chart-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 50px;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 2px;
        }
        
        .chart-placeholder {
            height: 350px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px dashed #D1D5DB;
            border-radius: 16px;
            color: #6B7280;
            font-size: 16px;
            font-weight: 500;
            background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
        }
        
        /* Tables */
        .table-container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .table { 
            width: 100%; 
            border-collapse: collapse;
        }
        
        .table th { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .table td { 
            padding: 18px 20px;
            border-bottom: 1px solid #F3F4F6;
            font-size: 15px;
        }
        
        .table tbody tr:hover {
            background: #F9FAFB;
        }
        
        .table tbody tr:last-child td {
            border-bottom: none;
        }
        
        /* Feedback Section - Enhanced */
        .feedback-item { 
            background: white;
            padding: 30px; 
            margin-bottom: 25px; 
            border-radius: 16px; 
            border-left: 5px solid #667eea;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            position: relative;
        }
        
        .feedback-item::before {
            content: '"';
            position: absolute;
            top: 20px;
            left: 20px;
            font-size: 48px;
            color: #E5E7EB;
            font-family: Georgia, serif;
            font-weight: bold;
            line-height: 1;
        }
        
        .feedback-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
            border-left-color: #10B981;
        }
        
        .feedback-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            margin-left: 40px;
        }
        
        .rating-stars { 
            color: #F59E0B;
            font-size: 20px;
            font-weight: 700;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .feedback-meta {
            font-size: 12px;
            color: #6B7280;
            background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
            padding: 8px 15px;
            border-radius: 25px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .feedback-text {
            color: #374151;
            line-height: 1.7;
            font-style: italic;
            font-size: 16px;
            margin-left: 40px;
            position: relative;
            z-index: 1;
        }
        
        /* Footer */
        .footer { 
            margin-top: 60px; 
            padding: 40px;
            text-align: center; 
            color: #6B7280; 
            font-size: 14px;
            background: #F9FAFB;
            border-radius: 16px;
            border: 1px solid #E5E7EB;
        }
        
        .footer p {
            margin-bottom: 5px;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            body { padding: 20px; }
            .content { padding: 30px; }
            .section { padding: 25px; }
            .charts-grid { grid-template-columns: 1fr; }
            .info-grid { grid-template-columns: 1fr; }
            .metrics-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏥 KNSTherapy</div>
            <h1 class="report-title">Therapist Performance Report</h1>
            <p class="report-subtitle">Generated on {report_date} | Period: {report_period}</p>
        </div>

        <div class="content">
            <div class="section">
                <h2 class="section-title">👨‍⚕️ Therapist Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Full Name</div>
                        <div class="info-value">{therapist_name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Therapist ID</div>
                        <div class="info-value">{therapist_id}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email Address</div>
                        <div class="info-value">{therapist_email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Specializations</div>
                        <div class="info-value">{therapist_specialties}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Experience Level</div>
                        <div class="info-value">{therapist_experience}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Professional Bio</div>
                        <div class="info-value">{therapist_bio}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">📊 Performance Metrics</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">{total_sessions}</div>
                        <div class="metric-label">Total Sessions</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{average_rating}</div>
                        <div class="metric-label">Average Rating</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{total_ratings}</div>
                        <div class="metric-label">Total Ratings</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{total_clients}</div>
                        <div class="metric-label">Total Clients</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">📈 Visual Analytics</h2>
                <div class="charts-grid">
                    <div class="chart-container">
                        <div class="chart-title">Session Type Distribution</div>
                        {session_type_chart}
                    </div>
                    <div class="chart-container">
                        <div class="chart-title">Rating Distribution</div>
                        {rating_distribution_chart}
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">🎯 Session Type Breakdown</h2>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Session Type</th>
                                <th>Count</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>💬 Text Sessions</td>
                                <td>{text_sessions}</td>
                                <td>{text_sessions_percentage}%</td>
                            </tr>
                            <tr>
                                <td>🎤 Audio Sessions</td>
                                <td>{audio_sessions}</td>
                                <td>{audio_sessions_percentage}%</td>
                            </tr>
                            <tr>
                                <td>📹 Video Sessions</td>
                                <td>{video_sessions}</td>
                                <td>{video_sessions_percentage}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">⭐ Rating Distribution</h2>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Rating</th>
                                <th>Count</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>⭐⭐⭐⭐⭐ (5 stars)</td>
                                <td>{five_star}</td>
                                <td>{five_star_percentage}%</td>
                            </tr>
                            <tr>
                                <td>⭐⭐⭐⭐ (4 stars)</td>
                                <td>{four_star}</td>
                                <td>{four_star_percentage}%</td>
                            </tr>
                            <tr>
                                <td>⭐⭐⭐ (3 stars)</td>
                                <td>{three_star}</td>
                                <td>{three_star_percentage}%</td>
                            </tr>
                            <tr>
                                <td>⭐⭐ (2 stars)</td>
                                <td>{two_star}</td>
                                <td>{two_star_percentage}%</td>
                            </tr>
                            <tr>
                                <td>⭐ (1 star)</td>
                                <td>{one_star}</td>
                                <td>{one_star_percentage}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">💬 Recent Client Feedback</h2>
                {#recent_feedback}
                <div class="feedback-item">
                    <div class="feedback-header">
                        <div class="rating-stars">
                            {rating_stars} ({rating}/5)
                        </div>
                        <div class="feedback-meta">
                            {session_type} session • {date} • {session_duration}
                        </div>
                    </div>
                    <div class="feedback-text">"{feedback}"</div>
                </div>
                {/recent_feedback}
            </div>

            <div class="footer">
                <p><strong>This report was generated automatically by KNSTherapy Analytics System</strong></p>
                <p>© 2025 KNSTherapy - Confidential and Proprietary</p>
                <p>Healing, not headlines. Anonymity first, always.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

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
    const template = cop.Resource.fromHtml(templateHTML);

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
