const jwt = require('jsonwebtoken');
const { getSession } = require('../config/redis');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'No token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if user session exists in Redis
    const session = await getSession(decoded.sessionId);
    if (!session) {
      return res.status(401).json({
        error: 'Invalid session',
        message: 'Session expired or invalid'
      });
    }

    // Add user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      sessionId: decoded.sessionId,
      ...session
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is not valid'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Token has expired'
      });
    } else {
      console.error('Authentication error:', error);
      return res.status(500).json({
        error: 'Authentication failed',
        message: 'Internal server error'
      });
    }
  }
};

const authenticateOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const session = await getSession(decoded.sessionId);
    
    if (session) {
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        sessionId: decoded.sessionId,
        ...session
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be logged in'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'User does not have required role'
      });
    }

    next();
  };
};

const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'User must be logged in'
    });
  }

  if (!req.user.isPremium) {
    return res.status(403).json({
      error: 'Premium feature',
      message: 'This feature requires a premium subscription'
    });
  }

  next();
};

const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const userData = userRequests.get(userId) || { count: 0, resetTime: now + windowMs };

    if (now > userData.resetTime) {
      userData.count = 1;
      userData.resetTime = now + windowMs;
    } else {
      userData.count++;
    }

    userRequests.set(userId, userData);

    if (userData.count > maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests from this user'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authenticateOptional,
  requireRole,
  requirePremium,
  rateLimitByUser
}; 