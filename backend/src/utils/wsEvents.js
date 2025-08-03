/**
 * @file WebSocket event handler registry and management
 * @module utils/wsEvents
 * @description 
 * This module provides a centralized registry for WebSocket event handlers with built-in
 * permission checking and rate limiting. It's designed to work with Socket.IO and provides
 * a clean way to organize WebSocket event handling logic.
 * 
 * Key Features:
 * - Centralized event handler registration and management
 * - Built-in permission checking for secured WebSocket events
 * - Configurable rate limiting per event type
 * - Consistent error handling and response formatting
 * - Request tracing and logging
 * 
 * @example
 * // Basic usage in your application:
 * import { initWebSocketHandlers } from './utils/wsEvents';
 * import { createServer } from 'http';
 * import { Server } from 'socket.io';
 * 
 * const httpServer = createServer();
 * const io = new Server(httpServer);
 * 
 * // Initialize WebSocket handlers
 * initWebSocketHandlers(io);
 * 
 * httpServer.listen(3000);
 */

import { PERMISSIONS } from './permissions';
import { logger } from './logger';

/**
 * @constant {number} DEFAULT_RATE_LIMIT_WINDOW_MS
 * @description Default time window for rate limiting in milliseconds (1 minute)
 */
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60000;

/**
 * @constant {number} DEFAULT_RATE_LIMIT_MAX
 * @description Default maximum number of requests allowed per rate limit window
 */
const DEFAULT_RATE_LIMIT_MAX = 60;

/**
 * @constant {Object} RATE_LIMIT_CONFIG
 * @description Default rate limiting configuration for different event types
 */
const RATE_LIMIT_CONFIG = {
  'join-room': { windowMs: 10000, max: 10 },
  'leave-room': { windowMs: 10000, max: 20 },
  'send-message': { windowMs: 1000, max: 5 },
  'typing': { windowMs: 10000, max: 20 },
  'presence': { windowMs: 60000, max: 60 }
};

/**
 * @typedef {Object} RateLimitConfig
 * @property {number} windowMs - Time window in milliseconds for rate limiting
 * @property {number} max - Maximum number of requests allowed in the time window
 */

/**
 * @typedef {Object} EventHandlerConfig
 * @property {Function} handler - The event handler function
 * @property {string[]} requiredPermissions - Array of required permission strings
 * @property {RateLimitConfig} [rateLimit] - Optional rate limiting configuration
 * @property {boolean} [acknowledge=false] - Whether the client expects an acknowledgement
 * @property {string} [description] - Human-readable description of the event
 */

/**
 * @type {Map<string, EventHandlerConfig>}
 * @description Registry of all WebSocket event handlers
 * 
 * The registry maps event names to their handler configurations. Each entry contains:
 * - handler: The function that processes the event
 * - requiredPermissions: Array of permission strings required to access this event
 * - rateLimit: Optional rate limiting configuration for the event
 * - acknowledge: Whether the client expects an acknowledgement
 * - description: Human-readable description of the event
 * 
 * @example
 * {
 *   'join-room': {
 *     handler: async (socket, data) => { /* ... *\/ },
 *     requiredPermissions: ['room:join'],
 *     rateLimit: { windowMs: 10000, max: 10 },
 *     acknowledge: true,
 *     description: 'Handles joining a chat room'
 *   }
 * }
 */
const eventHandlers = new Map();

/**
 * @type {Map<string, Map<string, number[]>>}
 * @description Tracks request timestamps for rate limiting
 * 
 * Structure:
 * {
 *   'eventName': {
 *     'clientId': [timestamp1, timestamp2, ...]
 *   }
 * }
 */
const rateLimitStore = new Map();

/**
 * Registers a WebSocket event handler with optional permission and rate limiting
 * @param {string} eventName - Name of the WebSocket event to handle (e.g., 'join-room', 'send-message')
 * @param {Function} handler - Async function that processes the event
 * @param {Object} [options] - Configuration options for the handler
 * @param {string[]} [options.requiredPermissions=[]] - Array of permission strings required to access this event
 * @param {Object} [options.rateLimit] - Rate limiting configuration
 * @param {number} [options.rateLimit.windowMs=60000] - Time window in milliseconds for rate limiting
 * @param {number} [options.rateLimit.max=60] - Maximum number of requests allowed in the time window
 * @param {boolean} [options.acknowledge=false] - Whether the client expects an acknowledgement
 * @param {string} [options.description] - Human-readable description of the event
 * @returns {void}
 * @throws {Error} If eventName is not a string or handler is not a function
 * 
 * @example <caption>Basic usage</caption>
 * registerEventHandler('custom-event', async (socket, data) => {
 *   // Handle the event
 *   return { success: true };
 * });
 * 
 * @example <caption>With permissions and rate limiting</caption>
 * registerEventHandler('admin-action', 
 *   async (socket, data) => {
 *     // Handle admin action
 *     return { success: true };
 *   }, {
 *     requiredPermissions: ['admin:action'],
 *     rateLimit: { windowMs: 60000, max: 10 },
 *     acknowledge: true,
 *     description: 'Performs an administrative action'
 *   }
 * );
 */
const registerEventHandler = (eventName, handler, options = {}) => {
  // Input validation
  if (typeof eventName !== 'string' || !eventName.trim()) {
    throw new Error('Event name must be a non-empty string');
  }
  
  if (typeof handler !== 'function') {
    throw new Error('Handler must be a function');
  }
  
  // Apply default rate limiting if not specified
  const rateLimit = options.rateLimit || RATE_LIMIT_CONFIG[eventName] || {
    windowMs: DEFAULT_RATE_LIMIT_WINDOW_MS,
    max: DEFAULT_RATE_LIMIT_MAX
  };
  
  // Register the event handler
  eventHandlers.set(eventName, {
    handler,
    requiredPermissions: Array.isArray(options.requiredPermissions) 
      ? options.requiredPermissions 
      : [],
    rateLimit: rateLimit && typeof rateLimit === 'object'
      ? {
          windowMs: Math.max(1000, Number(rateLimit.windowMs) || DEFAULT_RATE_LIMIT_WINDOW_MS),
          max: Math.max(1, Number(rateLimit.max) || DEFAULT_RATE_LIMIT_MAX)
        }
      : null,
    acknowledge: Boolean(options.acknowledge),
    description: typeof options.description === 'string' ? options.description : ''
  });
  
  logger.debug(`Registered WebSocket event handler: ${eventName}`, {
    hasRateLimit: !!rateLimit,
    requiredPermissions: options.requiredPermissions || [],
    acknowledge: Boolean(options.acknowledge)
  });
};

/**
 * Retrieves the handler configuration for a registered WebSocket event
 * @param {string} eventName - Name of the event to look up
 * @returns {EventHandlerConfig|null} Event handler configuration object or null if not found
 * 
 * @example
 * const handlerConfig = getEventHandler('join-room');
 * if (handlerConfig) {
 *   // Use the handler
 *   const result = await handlerConfig.handler(socket, data);
 * }
 */
const getEventHandler = (eventName) => {
  if (typeof eventName !== 'string') {
    return null;
  }
  
  const handler = eventHandlers.get(eventName);
  if (!handler) {
    logger.debug(`No handler found for event: ${eventName}`);
    return null;
  }
  
  return handler;
};

/**
 * Checks if a client has exceeded their rate limit for an event
 * @param {string} eventName - Name of the event
 * @param {string} clientId - Client identifier (usually socket.id)
 * @param {RateLimitConfig} rateLimit - Rate limiting configuration
 * @returns {boolean} True if rate limit is exceeded, false otherwise
 * @private
 */
const isRateLimited = (eventName, clientId, rateLimit) => {
  if (!rateLimit || !rateLimit.windowMs || !rateLimit.max) {
    return false;
  }
  
  const now = Date.now();
  const windowStart = now - rateLimit.windowMs;
  
  // Initialize rate limit store for this event if it doesn't exist
  if (!rateLimitStore.has(eventName)) {
    rateLimitStore.set(eventName, new Map());
  }
  
  const eventStore = rateLimitStore.get(eventName);
  
  // Initialize client's request timestamps if they don't exist
  if (!eventStore.has(clientId)) {
    eventStore.set(clientId, []);
  }
  
  const clientTimestamps = eventStore.get(clientId);
  
  // Filter out old requests outside the current window
  const recentRequests = clientTimestamps.filter(timestamp => timestamp > windowStart);
  
  // Update the store with filtered timestamps
  eventStore.set(clientId, recentRequests);
  
  // Check if rate limit is exceeded
  if (recentRequests.length >= rateLimit.max) {
    return true;
  }
  
  // Add current request timestamp
  recentRequests.push(now);
  return false;
};

/**
 * Checks if a socket has the required permissions for an event
 * @param {Socket} socket - The socket instance
 * @param {string[]} requiredPermissions - Array of required permission strings
 * @returns {boolean} True if the socket has all required permissions
 * @private
 */
const hasRequiredPermissions = (socket, requiredPermissions = []) => {
  if (!requiredPermissions.length) {
    return true; // No permissions required
  }
  
  // TODO: Implement actual permission checking logic
  // This is a placeholder that should be replaced with your actual permission system
  const userPermissions = socket.user?.permissions || [];
  return requiredPermissions.every(perm => userPermissions.includes(perm));
};

/**
 * Registers all WebSocket event handlers used by the application
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @returns {void}
 */
const registerAllHandlers = (io) => {
  /**
   * Handles joining a room and leaving any previously joined rooms
   * @event join-room
   * @param {Socket} socket - The socket instance
   * @param {Object} data - Event data
   * @param {string} data.roomId - ID of the room to join
   * @returns {Promise<Object>} Result of the operation
   * @throws {Error} If roomId is not provided
   */
  registerEventHandler('join-room', async (socket, data) => {
    const { roomId } = data || {};
    if (!roomId || typeof roomId !== 'string') {
      throw new Error('Room ID is required and must be a string');
    }
    
    // Leave any existing rooms except the default room (socket's own ID)
    const rooms = Array.from(socket.rooms || []).filter(room => room !== socket.id);
    if (rooms.length > 0) {
      await Promise.all(rooms.map(room => socket.leave(room)));
    }
    
    // Join the new room
    await socket.join(roomId);
    
    return { 
      success: true, 
      roomId,
      timestamp: new Date().toISOString()
    };
  }, {
    requiredPermissions: [PERMISSIONS.CONTENT_READ],
    rateLimit: { 
      windowMs: 10000,  // 10 seconds
      max: 10           // Max 10 requests per window
    }
  });

  /**
   * Handles leaving a room
   * @event leave-room
   * @param {Socket} socket - The socket instance
   * @param {Object} data - Event data
   * @param {string} data.roomId - ID of the room to leave
   * @returns {Promise<Object>} Result of the operation
   * @throws {Error} If roomId is not provided
   */
  registerEventHandler('leave-room', async (socket, data) => {
    const { roomId } = data || {};
    if (!roomId || typeof roomId !== 'string') {
      throw new Error('Room ID is required and must be a string');
    }
    
    await socket.leave(roomId);
    return { 
      success: true, 
      roomId,
      timestamp: new Date().toISOString()
    };
  });

  // Additional event handlers can be registered here following the same pattern
  // Example:
  // registerEventHandler('custom-event', async (socket, data) => {
  //   // Handler implementation
  // }, { requiredPermissions: ['custom:permission'] });
};

/**
 * Initializes WebSocket event handlers and sets up the Socket.IO connection handling
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @returns {void}
 */
const initWebSocketHandlers = (io) => {
  if (!io || typeof io.on !== 'function') {
    throw new Error('Valid Socket.IO server instance is required');
  }

  // Register all application event handlers
  registerAllHandlers(io);

  // Set up connection handler for new WebSocket connections
  io.on('connection', (socket) => {
    const clientId = socket.id;
    console.log(`Client connected: ${clientId}`);

    /**
     * Handles incoming WebSocket messages and routes them to the appropriate handler
     * @param {Object} message - The incoming message
     * @param {string} message.event - The event name
     * @param {*} message.payload - The event payload
     */
    const handleIncomingMessage = async (message) => {
      const { event, payload } = message || {};
      const requestId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        // Validate message format
        if (!event || typeof event !== 'string') {
          throw new Error('Invalid message format: event is required and must be a string');
        }
        
        // Get the registered event handler
        const eventHandler = getEventHandler(event);
        if (!eventHandler) {
          throw new Error(`Unknown event: ${event}`);
        }
        
        // TODO: Add permission checks here
        // if (!hasPermissions(socket.user, eventHandler.requiredPermissions)) {
        //   throw new Error('Insufficient permissions');
        // }
        
        // TODO: Add rate limiting here
        // if (eventHandler.rateLimit) {
        //   await checkRateLimit(socket.id, event, eventHandler.rateLimit);
        // }
        
        // Execute the handler with the socket and payload
        const result = await eventHandler.handler(socket, payload || {});
        
        // Send success response
        socket.emit('message-response', {
          requestId,
          event,
          success: true,
          timestamp: new Date().toISOString(),
          data: result || null
        });
        
      } catch (error) {
        console.error(`[${requestId}] WebSocket error (${event}):`, error);
        
        // Send error response
        socket.emit('message-response', {
          requestId,
          event: event || 'unknown',
          success: false,
          timestamp: new Date().toISOString(),
          error: {
            message: error.message || 'An error occurred',
            code: error.code || 'WEBSOCKET_ERROR',
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
          }
        });
      }
    };

    // Set up message handler
    socket.on('message', handleIncomingMessage);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${clientId} (${reason})`);
      // Clean up any resources associated with this connection
      // e.g., remove from presence tracking, notify other users, etc.
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`WebSocket error (${clientId}):`, error);
    });
  });
};

/**
 * @typedef {Object} WebSocketEventHandler
 * @property {Function} handler - The event handler function
 * @property {string[]} requiredPermissions - Required permissions for the event
 * @property {Object} [rateLimit] - Rate limiting configuration
 */

export {
  registerEventHandler,
  getEventHandler,
  initWebSocketHandlers
};

// Default export for easier importing
export default initWebSocketHandlers;
