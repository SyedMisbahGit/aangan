import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { getPermissionsForRole } from './permissions';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Generate access and refresh tokens with enhanced security
const generateTokens = async (user, ipAddress, userAgent) => {
  if (!user || !user.id || !user.email || !user.role) {
    throw new Error('Invalid user object provided for token generation');
  }

  const jti = uuidv4();
  const now = Math.floor(Date.now() / 1000);
  
  // Include additional security claims
  const accessToken = jwt.sign(
    { 
      // Standard claims
      sub: user.id,
      email: user.email,
      role: user.role,
      jti,
      iat: now,
      
      // Security context
      iss: 'college-whisper-api',
      aud: ['college-whisper-web', 'college-whisper-mobile'],
      
      // Device fingerprinting
      ip: ipAddress,
      ua: userAgent
    },
    process.env.JWT_ACCESS_SECRET,
    { 
      expiresIn: ACCESS_TOKEN_EXPIRY,
      algorithm: 'HS256', // Explicitly specify algorithm
      allowInsecureKeySizes: false
    }
  );

  const refreshToken = jwt.sign(
    { 
      sub: user.id,
      jti,
      iat: now,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: REFRESH_TOKEN_EXPIRY,
      algorithm: 'HS256',
      allowInsecureKeySizes: false
    }
  );

  // Store refresh token in database
  await db('refresh_tokens').insert({
    id: jti,
    user_id: user.id,
    token: refreshToken,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    created_at: new Date(),
    used: false
  });

  return { accessToken, refreshToken };
};

// Verify access token with enhanced security
const verifyAccessToken = (token, ipAddress, userAgent) => {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    // Decode without verification first to get the header
    const decodedHeader = jwt.decode(token, { complete: true });
    
    // Check token algorithm
    if (decodedHeader?.header?.alg !== 'HS256') {
      throw new Error('Invalid token algorithm');
    }

    // Verify token with secret and options
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
      ignoreExpiration: false,
      ignoreNotBefore: false,
      allowInsecureKeySizes: false,
      clockTolerance: 5, // 5 seconds clock tolerance
      complete: false
    });

    // Additional security validations
    if (decoded.type === 'refresh') {
      throw new Error('Invalid token type');
    }

    // Validate standard claims
    if (decoded.iss !== 'college-whisper-api') {
      throw new Error('Invalid token issuer');
    }

    if (!decoded.aud?.includes('college-whisper-web')) {
      throw new Error('Invalid token audience');
    }

    // Validate IP and User-Agent if provided
    if (ipAddress && decoded.ip !== ipAddress) {
      throw new Error('Token IP address mismatch');
    }

    if (userAgent && decoded.ua !== userAgent) {
      throw new Error('Token user agent mismatch');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token expired');
    }
    throw new Error('Invalid access token');
  }
};

// Verify refresh token and check if it's valid in the database
const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // Check if token exists in database and is not used/revoked
    const storedToken = await db('refresh_tokens')
      .where({ 
        id: decoded.jti,
        used: false,
        user_id: decoded.userId
      })
      .first();

    if (!storedToken || new Date(storedToken.expires_at) < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Revoke refresh token
const revokeRefreshToken = async (jti) => {
  await db('refresh_tokens')
    .where({ id: jti })
    .update({ 
      used: true,
      revoked_at: new Date() 
    });
};

// Revoke all refresh tokens for a user (on password change, logout all, etc.)
const revokeUserRefreshTokens = async (userId) => {
  await db('refresh_tokens')
    .where({ user_id: userId, used: false })
    .update({ 
      used: true,
      revoked_at: new Date()
    });
};

export {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeUserRefreshTokens,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY
};
