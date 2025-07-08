const express = require('express');
const validate = require('../../middlewares/validate');
const ratingValidation = require('../../validations/rating.validation');
const ratingController = require('../../controllers/rating.controller');

const router = express.Router();

router
  .route('/')
  .post(validate(ratingValidation.createRating), ratingController.createRating)
  .get(validate(ratingValidation.getRatings), ratingController.getRatings);

router
  .route('/:ratingId')
  .get(validate(ratingValidation.getRating), ratingController.getRating)
  .patch(validate(ratingValidation.updateRating), ratingController.updateRating)
  .delete(validate(ratingValidation.deleteRating), ratingController.deleteRating);

router
  .route('/session/:sessionId')
  .get(validate(ratingValidation.getRatingBySession), ratingController.getRatingBySession);

router
  .route('/therapist/:therapistId/stats')
  .get(validate(ratingValidation.getTherapistStats), ratingController.getTherapistStats);

router
  .route('/therapist/:therapistId')
  .get(validate(ratingValidation.getTherapistRatings), ratingController.getTherapistRatings);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Session rating management
 */

/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Create a rating
 *     description: Rate a therapy session
 *     tags: [Ratings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - therapistId
 *               - clientId
 *               - sessionType
 *               - rating
 *             properties:
 *               sessionId:
 *                 type: string
 *               therapistId:
 *                 type: string
 *               clientId:
 *                 type: string
 *               sessionType:
 *                 type: string
 *                 enum: [text, audio, video]
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *               isAnonymous:
 *                 type: boolean
 *                 default: true
 *             example:
 *               sessionId: "session_123456"
 *               therapistId: "therapist_789"
 *               clientId: "client_456"
 *               sessionType: "video"
 *               rating: 5
 *               comment: "Great session, very helpful"
 *               isAnonymous: true
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Rating'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all ratings
 *     description: Retrieve ratings with optional filtering
 *     tags: [Ratings]
 *     parameters:
 *       - in: query
 *         name: therapistId
 *         schema:
 *           type: string
 *         description: Filter by therapist ID
 *       - in: query
 *         name: sessionType
 *         schema:
 *           type: string
 *           enum: [text, audio, video]
 *         description: Filter by session type
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by rating value
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of ratings
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rating'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /ratings/{id}:
 *   get:
 *     summary: Get a rating
 *     description: Retrieve a specific rating by ID
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rating id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Rating'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a rating
 *     description: Update rating details
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rating id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *               isAnonymous:
 *                 type: boolean
 *             example:
 *               rating: 4
 *               comment: "Updated comment"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Rating'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a rating
 *     description: Delete a rating
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rating id
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /ratings/therapist/{therapistId}/stats:
 *   get:
 *     summary: Get therapist rating statistics
 *     description: Get aggregated rating statistics for a therapist
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: therapistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Therapist id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 averageRating:
 *                   type: number
 *                   example: 4.2
 *                 totalRatings:
 *                   type: integer
 *                   example: 25
 *                 ratingDistribution:
 *                   type: object
 *                   properties:
 *                     1:
 *                       type: integer
 *                       example: 1
 *                     2:
 *                       type: integer
 *                       example: 2
 *                     3:
 *                       type: integer
 *                       example: 5
 *                     4:
 *                       type: integer
 *                       example: 8
 *                     5:
 *                       type: integer
 *                       example: 9
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         sessionId:
 *           type: string
 *         therapistId:
 *           type: string
 *         clientId:
 *           type: string
 *         sessionType:
 *           type: string
 *           enum: [text, audio, video]
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         isAnonymous:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 5ebac534954b54139806c112
 *         sessionId: "session_123456"
 *         therapistId: "therapist_789"
 *         clientId: "client_456"
 *         sessionType: "video"
 *         rating: 5
 *         comment: "Great session, very helpful"
 *         isAnonymous: true
 *         createdAt: 2020-05-12T16:18:04.793Z
 *         updatedAt: 2020-05-12T16:18:04.793Z
 */
