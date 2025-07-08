const express = require('express');
const validate = require('../../middlewares/validate');
const analyticsValidation = require('../../validations/analytics.validation');
const analyticsController = require('../../controllers/analytics.controller');

const router = express.Router();

router
  .route('/system')
  .get(validate(analyticsValidation.getSystemAnalytics), analyticsController.getSystemAnalytics);

router
  .route('/leaderboard')
  .get(validate(analyticsValidation.getLeaderboard), analyticsController.getLeaderboard);

router
  .route('/therapist/:therapistId')
  .get(validate(analyticsValidation.getTherapistAnalytics), analyticsController.getTherapistAnalytics);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and dashboard data
 */

/**
 * @swagger
 * /analytics/therapist/{therapistId}:
 *   get:
 *     summary: Get therapist dashboard analytics
 *     description: Retrieve comprehensive analytics data for a therapist's dashboard
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: therapistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Therapist ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics period
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 3m, 6m, 1y]
 *         description: Predefined period for analytics
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 performanceMetrics:
 *                   type: object
 *                   properties:
 *                     totalSessions:
 *                       type: integer
 *                     recentSessions:
 *                       type: integer
 *                     averageRating:
 *                       type: number
 *                     satisfactionRate:
 *                       type: number
 *                 ratingDistribution:
 *                   type: object
 *                 sessionTypeStats:
 *                   type: object
 *                 ratingsOverTime:
 *                   type: array
 *                 dailyActivity:
 *                   type: array
 *                 recentFeedback:
 *                   type: array
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /analytics/system:
 *   get:
 *     summary: Get system-wide analytics
 *     description: Retrieve overall system analytics
 *     tags: [Analytics]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSessions:
 *                   type: integer
 *                 totalTherapists:
 *                   type: integer
 *                 averageRating:
 *                   type: number
 *                 sessionTypeDistribution:
 *                   type: object
 */

/**
 * @swagger
 * /analytics/leaderboard:
 *   get:
 *     summary: Get therapist leaderboard
 *     description: Retrieve top-rated therapists
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of therapists to return
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   rank:
 *                     type: integer
 *                   therapistId:
 *                     type: string
 *                   averageRating:
 *                     type: number
 *                   totalSessions:
 *                     type: integer
 */
