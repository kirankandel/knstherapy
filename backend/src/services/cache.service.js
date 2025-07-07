const NodeCache = require('node-cache');
const logger = require('../config/logger');

// Cache configuration
const cache = new NodeCache({
  stdTTL: 30, // Default TTL of 30 seconds
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // For better performance
});

// Cache keys
const CACHE_KEYS = {
  AVAILABLE_THERAPISTS: 'available_therapists',
  ONLINE_THERAPISTS: 'online_therapists',
  REALTIME_STATUS: 'realtime_status',
  THERAPIST_STATS: 'therapist_stats',
};

// Cache TTL configurations (in seconds)
const CACHE_TTL = {
  AVAILABLE_THERAPISTS: 60, // 1 minute
  ONLINE_THERAPISTS: 30, // 30 seconds
  REALTIME_STATUS: 15, // 15 seconds
  THERAPIST_STATS: 300, // 5 minutes
};

/**
 * Generic cache getter
 */
const get = (key) => {
  try {
    const value = cache.get(key);
    if (value) {
      logger.debug(`[CACHE] Cache hit for key: ${key}`);
      return value;
    }
    logger.debug(`[CACHE] Cache miss for key: ${key}`);
    return null;
  } catch (error) {
    logger.error(`[CACHE] Error getting cache key ${key}: ${error.message}`);
    return null;
  }
};

/**
 * Generic cache setter
 */
const set = (key, value, ttl = null) => {
  try {
    cache.set(key, value, ttl);
    logger.debug(`[CACHE] Cache set for key: ${key}, TTL: ${ttl || 'default'}`);
    return true;
  } catch (error) {
    logger.error(`[CACHE] Error setting cache key ${key}: ${error.message}`);
    return false;
  }
};

/**
 * Cache wrapper for available therapists
 */
const getAvailableTherapists = (filter, options) => {
  const cacheKey = `${CACHE_KEYS.AVAILABLE_THERAPISTS}_${JSON.stringify({ filter, options })}`;
  return get(cacheKey);
};

const setAvailableTherapists = (filter, options, data) => {
  const cacheKey = `${CACHE_KEYS.AVAILABLE_THERAPISTS}_${JSON.stringify({ filter, options })}`;
  return set(cacheKey, data, CACHE_TTL.AVAILABLE_THERAPISTS);
};

/**
 * Cache wrapper for online therapists
 */
const getOnlineTherapists = (filter, options) => {
  const cacheKey = `${CACHE_KEYS.ONLINE_THERAPISTS}_${JSON.stringify({ filter, options })}`;
  return get(cacheKey);
};

const setOnlineTherapists = (filter, options, data) => {
  const cacheKey = `${CACHE_KEYS.ONLINE_THERAPISTS}_${JSON.stringify({ filter, options })}`;
  return set(cacheKey, data, CACHE_TTL.ONLINE_THERAPISTS);
};

/**
 * Cache wrapper for realtime status
 */
const getRealtimeStatus = () => {
  return get(CACHE_KEYS.REALTIME_STATUS);
};

const setRealtimeStatus = (data) => {
  return set(CACHE_KEYS.REALTIME_STATUS, data, CACHE_TTL.REALTIME_STATUS);
};

/**
 * Cache wrapper for therapist stats
 */
const getTherapistStats = (therapistId) => {
  return get(`${CACHE_KEYS.THERAPIST_STATS}${therapistId}`);
};

const setTherapistStats = (therapistId, data) => {
  return set(`${CACHE_KEYS.THERAPIST_STATS}${therapistId}`, data, CACHE_TTL.THERAPIST_STATS);
};

/**
 * Clear specific cache patterns
 */
const clearTherapistCache = () => {
  const keys = cache.keys();
  const therapistKeys = keys.filter(key => 
    key.includes(CACHE_KEYS.AVAILABLE_THERAPISTS) || 
    key.includes(CACHE_KEYS.ONLINE_THERAPISTS) ||
    key.includes(CACHE_KEYS.REALTIME_STATUS)
  );
  
  therapistKeys.forEach(key => cache.del(key));
  logger.info(`[CACHE] Cleared ${therapistKeys.length} therapist cache keys`);
};

/**
 * Clear cache for specific therapist
 */
const clearTherapistStatsCache = (therapistId) => {
  const key = `${CACHE_KEYS.THERAPIST_STATS}${therapistId}`;
  cache.del(key);
  logger.debug(`[CACHE] Cleared cache for therapist stats: ${therapistId}`);
};

/**
 * Get cache statistics
 */
const getStats = () => {
  return cache.getStats();
};

module.exports = {
  get,
  set,
  getAvailableTherapists,
  setAvailableTherapists,
  getOnlineTherapists,
  setOnlineTherapists,
  getRealtimeStatus,
  setRealtimeStatus,
  getTherapistStats,
  setTherapistStats,
  clearTherapistCache,
  clearTherapistStatsCache,
  getStats,
  CACHE_KEYS,
  CACHE_TTL,
};
