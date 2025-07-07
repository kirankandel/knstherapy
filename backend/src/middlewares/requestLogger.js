const logger = require('../config/logger');

// Middleware to log all incoming requests
const requestLogger = (req, res, next) => {
  // Get request start time
  const startTime = Date.now();

  // Log request details
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    timestamp: new Date().toISOString(),
  };

  // Log sensitive-safe request body (exclude passwords)
  let requestBody = {};
  if (req.body && Object.keys(req.body).length > 0) {
    requestBody = { ...req.body };
    // Remove sensitive fields
    if (requestBody.password) requestBody.password = '***HIDDEN***';
    if (requestBody.newPassword) requestBody.newPassword = '***HIDDEN***';
    if (requestBody.currentPassword) requestBody.currentPassword = '***HIDDEN***';
  }

  // Log query parameters
  const queryParams = req.query && Object.keys(req.query).length > 0 ? req.query : null;

  logger.info(`[REQUEST] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  logger.debug(
    `[REQUEST_DETAILS] ${JSON.stringify({
      ...requestInfo,
      body: Object.keys(requestBody).length > 0 ? requestBody : null,
      query: queryParams,
    })}`
  );

  // Override res.send to log response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;

    // Log response details
    logger.info(
      `[RESPONSE] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms - IP: ${req.ip}`
    );

    // Log response data (limited to prevent huge logs)
    if (res.statusCode >= 400) {
      // Log error responses
      logger.error(
        `[RESPONSE_ERROR] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Data: ${
          typeof data === 'string' ? data.substring(0, 500) : JSON.stringify(data).substring(0, 500)
        }`
      );
    } else {
      // Log successful responses (but limit data size)
      const responseData = typeof data === 'string' ? data : JSON.stringify(data);
      const truncatedData = responseData.length > 200 ? `${responseData.substring(0, 200)}...` : responseData;
      logger.debug(`[RESPONSE_DATA] ${req.method} ${req.originalUrl} - Data: ${truncatedData}`);
    }

    // Call original send
    originalSend.call(this, data);
  };

  next();
};

module.exports = requestLogger;
