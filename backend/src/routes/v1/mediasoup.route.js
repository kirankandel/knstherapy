const express = require('express');
const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const mediaSoupService = require('../../services/mediasoup.service');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MediaSoup
 *   description: MediaSoup media server API endpoints
 */

/**
 * @swagger
 * /mediasoup/router-capabilities:
 *   get:
 *     summary: Get router RTP capabilities
 *     description: Get MediaSoup router RTP capabilities
 *     tags: [MediaSoup]
 *     responses:
 *       "200":
 *         description: OK
 *       "503":
 *         description: Service Unavailable
 */
router.get(
  '/router-capabilities',
  catchAsync(async (req, res) => {
    try {
      const rtpCapabilities = mediaSoupService.getRouterRtpCapabilities();
      res.json(rtpCapabilities);
    } catch (error) {
      throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'MediaSoup service is not available: ' + error.message);
    }
  })
);

/**
 * @swagger
 * /mediasoup/create-transport:
 *   post:
 *     summary: Create a WebRTC transport
 *     description: Create a WebRTC transport for producing or consuming media
 *     tags: [MediaSoup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - direction
 *               - userType
 *             properties:
 *               sessionId:
 *                 type: string
 *               direction:
 *                 type: string
 *                 enum: [send, recv]
 *               userType:
 *                 type: string
 *                 enum: [user, therapist]
 *     responses:
 *       "200":
 *         description: OK
 *       "503":
 *         description: Service Unavailable
 */
router.post(
  '/create-transport',
  catchAsync(async (req, res) => {
    try {
      const { sessionId, direction, userType } = req.body;
      
      if (!sessionId || !direction || !userType) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required parameters: sessionId, direction, userType');
      }

      const transportParams = await mediaSoupService.createWebRtcTransport(sessionId, userType, direction);
      res.json(transportParams);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create transport: ' + error.message);
    }
  })
);

/**
 * @swagger
 * /mediasoup/connect-transport:
 *   post:
 *     summary: Connect a WebRTC transport
 *     description: Connect a WebRTC transport using the DtlsParameters
 *     tags: [MediaSoup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - transportId
 *               - dtlsParameters
 *               - userType
 *             properties:
 *               sessionId:
 *                 type: string
 *               transportId:
 *                 type: string
 *               dtlsParameters:
 *                 type: object
 *               userType:
 *                 type: string
 *                 enum: [user, therapist]
 *     responses:
 *       "200":
 *         description: OK
 *       "503":
 *         description: Service Unavailable
 */
router.post(
  '/connect-transport',
  catchAsync(async (req, res) => {
    try {
      const { sessionId, transportId, dtlsParameters, userType } = req.body;
      
      if (!transportId || !dtlsParameters) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required parameters: transportId, dtlsParameters');
      }

      await mediaSoupService.connectWebRtcTransport(transportId, dtlsParameters);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to connect transport: ' + error.message);
    }
  })
);

/**
 * @swagger
 * /mediasoup/produce:
 *   post:
 *     summary: Create a producer
 *     description: Create a producer for sending media
 *     tags: [MediaSoup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - transportId
 *               - kind
 *               - rtpParameters
 *               - userType
 *             properties:
 *               sessionId:
 *                 type: string
 *               transportId:
 *                 type: string
 *               kind:
 *                 type: string
 *                 enum: [audio, video]
 *               rtpParameters:
 *                 type: object
 *               userType:
 *                 type: string
 *                 enum: [user, therapist]
 *     responses:
 *       "200":
 *         description: OK
 *       "503":
 *         description: Service Unavailable
 */
router.post(
  '/produce',
  catchAsync(async (req, res) => {
    try {
      const { sessionId, transportId, kind, rtpParameters, userType } = req.body;
      
      if (!sessionId || !transportId || !kind || !rtpParameters || !userType) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required parameters: sessionId, transportId, kind, rtpParameters, userType');
      }

      const producer = await mediaSoupService.produce(sessionId, transportId, kind, rtpParameters, userType);
      res.json(producer);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create producer: ' + error.message);
    }
  })
);

/**
 * @swagger
 * /mediasoup/consume:
 *   post:
 *     summary: Create a consumer
 *     description: Create a consumer for receiving media
 *     tags: [MediaSoup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - transportId
 *               - producerId
 *               - rtpCapabilities
 *               - userType
 *             properties:
 *               sessionId:
 *                 type: string
 *               transportId:
 *                 type: string
 *               producerId:
 *                 type: string
 *               rtpCapabilities:
 *                 type: object
 *               userType:
 *                 type: string
 *                 enum: [user, therapist]
 *     responses:
 *       "200":
 *         description: OK
 *       "503":
 *         description: Service Unavailable
 */
router.post(
  '/consume',
  catchAsync(async (req, res) => {
    try {
      const { sessionId, transportId, producerId, rtpCapabilities, userType } = req.body;
      
      if (!sessionId || !transportId || !producerId || !rtpCapabilities || !userType) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required parameters: sessionId, transportId, producerId, rtpCapabilities, userType');
      }

      const consumer = await mediaSoupService.consume(sessionId, transportId, producerId, rtpCapabilities, userType);
      res.json(consumer);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create consumer: ' + error.message);
    }
  })
);

/**
 * @swagger
 * /mediasoup/get-producers:
 *   post:
 *     summary: Get all producers in a session
 *     description: Get all producers available for consumption in a session
 *     tags: [MediaSoup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - userType
 *             properties:
 *               sessionId:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [user, therapist]
 *     responses:
 *       "200":
 *         description: OK
 *       "503":
 *         description: Service Unavailable
 */
router.post(
  '/get-producers',
  catchAsync(async (req, res) => {
    try {
      const { sessionId, userType } = req.body;
      
      if (!sessionId || !userType) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required parameters: sessionId, userType');
      }

      const producers = mediaSoupService.getProducersForSession(sessionId, userType);
      res.json({ producers });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to get producers: ' + error.message);
    }
  })
);

/**
 * @swagger
 * /mediasoup/resume-consumer:
 *   post:
 *     summary: Resume a consumer
 *     description: Resume a paused consumer
 *     tags: [MediaSoup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - consumerId
 *               - userType
 *             properties:
 *               sessionId:
 *                 type: string
 *               consumerId:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [user, therapist]
 *     responses:
 *       "200":
 *         description: OK
 *       "503":
 *         description: Service Unavailable
 */
router.post(
  '/resume-consumer',
  catchAsync(async (req, res) => {
    try {
      const { sessionId, consumerId, userType } = req.body;
      
      if (!consumerId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required parameter: consumerId');
      }

      await mediaSoupService.resumeConsumer(consumerId);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to resume consumer: ' + error.message);
    }
  })
);

module.exports = router;
