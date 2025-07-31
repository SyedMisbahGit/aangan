import jwt from 'jsonwebtoken';
import { verifyAccessToken } from './jwtUtils';
import { getPermissionsForRole } from './permissions';
import db from '../db';

// WebSocket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    // Get token from handshake query or headers
    const token = socket.handshake.auth?.token || 
                 socket.handshake.query?.token ||
                 socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      console.warn('WebSocket connection attempt without token', {
        id: socket.id,
        ip: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent']
      });
      return next(new Error('Authentication token required'));
    }

    // Verify token
    const decoded = await verifyAccessToken(
      token,
      socket.handshake.address, // Client IP
      socket.handshake.headers['user-agent'] // User-Agent
    );

    // Check if user exists and is active
    const user = await db('users')
      .where({ id: decoded.sub, is_active: true })
      .select('id', 'email', 'role', 'last_login')
      .first();

    if (!user) {
      console.warn('WebSocket connection with invalid user', {
        userId: decoded.sub,
        socketId: socket.id,
        ip: socket.handshake.address
      });
      return next(new Error('User not found or inactive'));
    }

    // Attach user to socket for later use
    socket.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: getPermissionsForRole(user.role),
      jti: decoded.jti,
      lastLogin: user.last_login
    };

    // Log successful authentication
    console.info('WebSocket authenticated', {
      userId: user.id,
      email: user.email,
      role: user.role,
      socketId: socket.id,
      ip: socket.handshake.address
    });

    next();
  } catch (error) {
    console.error('WebSocket authentication error:', {
      error: error.message,
      socketId: socket.id,
      ip: socket.handshake.address,
      userAgent: socket.handshake.headers['user-agent']
    });
    
    // Provide specific error messages based on the error type
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new Error('Invalid token'));
    } else {
      return next(new Error('Authentication failed'));
    }
  }
};

// Role-based authorization middleware for WebSocket events
const authorizeSocket = (requiredPermissions = []) => {
  return (socket, next) => {
    try {
      // Skip if no permissions required
      if (!requiredPermissions.length) {
        return next();
      }

      // Check if user is authenticated
      if (!socket.user) {
        console.warn('Unauthorized WebSocket access attempt', {
          socketId: socket.id,
          event: socket.event,
          ip: socket.handshake.address
        });
        return next(new Error('Authentication required'));
      }

      // Check permissions
      const hasAllPermissions = requiredPermissions.every(permission => 
        socket.user.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        console.warn('Insufficient permissions for WebSocket event', {
          userId: socket.user.id,
          socketId: socket.id,
          event: socket.event,
          requiredPermissions,
          userPermissions: socket.user.permissions
        });
        return next(new Error('Insufficient permissions'));
      }

      next();
    } catch (error) {
      console.error('WebSocket authorization error:', {
        error: error.message,
        socketId: socket.id,
        event: socket.event
      });
      next(error);
    }
  };
};

// Rate limiting middleware for WebSocket events
const rateLimitSocket = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 10, // Max requests per windowMs
    message = 'Too many requests, please try again later',
    keyGenerator = (socket) => `${socket.user?.id || socket.handshake.address}:${socket.event}`
  } = options;

  const store = new Map();

  // Clean up old entries
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (now > value.expiresAt) {
        store.delete(key);
      }
    }
  }, 60 * 1000); // Run cleanup every minute

  return (socket, next) => {
    try {
      const key = keyGenerator(socket);
      const now = Date.now();
      const record = store.get(key) || { count: 0, expiresAt: now + windowMs };

      // Reset if window has passed
      if (now > record.expiresAt) {
        record.count = 0;
        record.expiresAt = now + windowMs;
      }

      // Check rate limit
      record.count++;
      store.set(key, record);

      if (record.count > max) {
        console.warn('WebSocket rate limit exceeded', {
          key,
          count: record.count,
          max,
          windowMs,
          socketId: socket.id,
          userId: socket.user?.id,
          ip: socket.handshake.address
        });
        return next(new Error(message));
      }

      next();
    } catch (error) {
      console.error('WebSocket rate limit error:', error);
      next(error);
    }
  };
};

export {
  authenticateSocket,
  authorizeSocket,
  rateLimitSocket
};

export default authenticateSocket;
