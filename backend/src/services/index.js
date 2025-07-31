import { cache } from '../utils/cache.js';
import { WhisperDal } from '../dal/whisperDal.js';
import { initReactionDal } from '../dal/reactionDal.js';
import { db } from '../db.js';
import { metrics, trackError } from '../middleware/metrics.js';
import logger from '../utils/logger.js';

// Initialize cache
let isCacheInitialized = false;

// Track service initialization metrics
const serviceStartTime = process.hrtime();

/**
 * Initialize all services with metrics and error tracking
 */
export async function initServices() {
  try {
    const initStartTime = process.hrtime();
    
    // Initialize cache with metrics
    if (!isCacheInitialized) {
      const cacheStartTime = process.hrtime();
      try {
        await cache.connect();
        isCacheInitialized = true;
        const [seconds, nanoseconds] = process.hrtime(cacheStartTime);
        metrics.trackRedisOperation('connect', { duration: seconds * 1000 + nanoseconds / 1e6 });
        logger.info('✅ Cache service initialized', { duration: seconds * 1000 + nanoseconds / 1e6 });
      } catch (error) {
        trackError('initServices', 500, 'cache_initialization_failed');
        logger.error('❌ Failed to initialize cache service', { error: error.message, stack: error.stack });
        throw error;
      }
    }

    // Initialize DALs with metrics
    let whisperDal, reactionDal;
    try {
      const dalStartTime = process.hrtime();
      whisperDal = new WhisperDal(db);
      reactionDal = initReactionDal(db);
      const [seconds, nanoseconds] = process.hrtime(dalStartTime);
      logger.info('✅ Data Access Layers initialized', { duration: seconds * 1000 + nanoseconds / 1e6 });
    } catch (error) {
      trackError('initServices', 500, 'dal_initialization_failed');
      logger.error('❌ Failed to initialize Data Access Layers', { error: error.message, stack: error.stack });
      throw error;
    }

    // Calculate total initialization time
    const [seconds, nanoseconds] = process.hrtime(serviceStartTime);
    const totalInitTime = seconds * 1000 + nanoseconds / 1e6;
    
    logger.info('✅ All services initialized', { 
      duration: totalInitTime,
      service: 'initServices'
    });
    
    return {
      cache,
      whisperDal,
      reactionDal,
      metrics,
      logger
    };
  } catch (error) {
    trackError('initServices', 500, 'service_initialization_failed');
    logger.error('❌ Failed to initialize services', { 
      error: error.message, 
      stack: error.stack,
      service: 'initServices'
    });
    throw error;
  }
}

// Export a singleton instance
let services = null;

export async function getServices() {
  if (!services) {
    services = await initServices();
  }
  return services;
}

/**
 * Gracefully shutdown all services with metrics
 */
export async function shutdownServices() {
  const shutdownStartTime = process.hrtime();
  
  try {
    if (isCacheInitialized) {
      logger.info('🛑 Disconnecting cache service...');
      const cacheStartTime = process.hrtime();
      await cache.disconnect();
      isCacheInitialized = false;
      const [seconds, nanoseconds] = process.hrtime(cacheStartTime);
      logger.info('✅ Cache service disconnected', { duration: seconds * 1000 + nanoseconds / 1e6 });
    }
    
    // Close database connections if needed
    if (db && typeof db.destroy === 'function') {
      logger.info('🛑 Closing database connections...');
      const dbStartTime = process.hrtime();
      await db.destroy();
      const [seconds, nanoseconds] = process.hrtime(dbStartTime);
      logger.info('✅ Database connections closed', { duration: seconds * 1000 + nanoseconds / 1e6 });
    }
    
    // Log total shutdown time
    const [totalSeconds, totalNanoseconds] = process.hrtime(shutdownStartTime);
    logger.info('🛑 All services shut down', { 
      duration: totalSeconds * 1000 + totalNanoseconds / 1e6,
      service: 'shutdownServices'
    });
  } catch (error) {
    trackError('shutdownServices', 500, 'service_shutdown_failed');
    logger.error('❌ Error during service shutdown', { 
      error: error.message, 
      stack: error.stack,
      service: 'shutdownServices'
    });
    throw error;
  }
}
