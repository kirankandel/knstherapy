const express = require('express');
const { pdfController } = require('../../controllers');

const router = express.Router();

router
  .route('/therapist-report/:therapistId')
  .get(pdfController.generateTherapistReport);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: PDF
 *   description: PDF generation endpoints
 */

/**
 * @swagger
 * /pdf/therapist-report/{therapistId}:
 *   get:
 *     summary: Generate a PDF report for a therapist
 *     description: Generates a comprehensive PDF report containing therapist analytics, ratings, and feedback
 *     tags: [PDF]
 *     parameters:
 *       - in: path
 *         name: therapistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Therapist ID
 *     responses:
 *       "200":
 *         description: PDF report generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 */
