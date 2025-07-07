const rateLimit = require('express-rate-limit');

// Rate limiter for heartbeat endpoint (very frequent calls)
const heartbeatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 heartbeat requests per minute
  message: {
    error: 'Too many heartbeat requests, please slow down',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for status/realtime endpoint (dashboard polling)
const realtimeStatusLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 realtime status requests per minute
  message: {
    error: 'Too many status requests, please reduce polling frequency',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for general therapist queries
const therapistQueryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 therapist queries per minute
  message: {
    error: 'Too many therapist queries, please slow down',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  heartbeatLimiter,
  realtimeStatusLimiter,
  therapistQueryLimiter,
};
