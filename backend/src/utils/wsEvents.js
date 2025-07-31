import { PERMISSIONS } from './permissions';

// WebSocket event registry
const eventHandlers = new Map();

/**
 * Register a WebSocket event handler
 * @param {string} eventName - Name of the event
 * @param {Function} handler - Event handler function
 * @param {Object} options - Handler options
 * @param {string[]} options.requiredPermissions - Required permissions to access this event
 * @param {Object} options.rateLimit - Rate limiting options
 * @param {number} options.rateLimit.windowMs - Time window in milliseconds
 * @param {number} options.rateLimit.max - Maximum number of requests per window
 */
const registerEventHandler = (eventName, handler, options = {}) => {
  eventHandlers.set(eventName, {
    handler,
    requiredPermissions: options.requiredPermissions || [],
    rateLimit: options.rateLimit
  });};

/**
 * Get handler for a WebSocket event
 * @param {string} eventName - Name of the event
 * @returns {Object|null} Event handler information or null if not found
 */
const getEventHandler = (eventName) => {
  return eventHandlers.get(eventName) || null;
};

/**
 * Register all WebSocket event handlers
 * @param {SocketIO.Server} io - Socket.IO server instance
 */
const registerAllHandlers = (io) => {
  // Example: Join room event
  registerEventHandler('join-room', async (socket, data) => {
    const { roomId } = data;
    if (!roomId) {
      throw new Error('Room ID is required');
    }
    
    // Leave any existing rooms
    const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
    if (rooms.length > 0) {
      await socket.leave(rooms);
    }
    
    // Join new room
    await socket.join(roomId);
    
    return { success: true, roomId };
  }, {
    requiredPermissions: [PERMISSIONS.CONTENT_READ],
    rateLimit: { windowMs: 10000, max: 10 } // 10 requests per 10 seconds
  });

  // Example: Leave room event
  registerEventHandler('leave-room', async (socket, data) => {
    const { roomId } = data;
    if (!roomId) {
      throw new Error('Room ID is required');
    }
    
    await socket.leave(roomId);
    return { success: true, roomId };
  });

  // Add more event handlers here...
};

/**
 * Initialize WebSocket event handlers
 * @param {SocketIO.Server} io - Socket.IO server instance
 */
const initWebSocketHandlers = (io) => {
  // Register all event handlers
  registerAllHandlers(io);

  // Set up connection handler
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle incoming messages
    socket.on('message', async (data) => {
      try {
        const { event, payload } = data;
        
        // Get event handler
        const eventHandler = getEventHandler(event);
        if (!eventHandler) {
          throw new Error(`Unknown event: ${event}`);
        }
        
        // Execute handler
        const result = await eventHandler.handler(socket, payload);
        
        // Send response
        socket.emit('message-response', {
          event,
          success: true,
          data: result
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
        
        // Send error response
        socket.emit('message-response', {
          event: data?.event || 'unknown',
          success: false,
          error: error.message || 'An error occurred'
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export {
  registerEventHandler,
  getEventHandler,
  initWebSocketHandlers
};

export default initWebSocketHandlers;
