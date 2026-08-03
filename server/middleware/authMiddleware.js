const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication guard middleware.
 *
 * Extracts a JWT from the `Authorization: Bearer <token>` header or from
 * an HTTP-only cookie named `token`. Verifies the token, looks up the user,
 * and attaches the user document (minus the password hash) to `req.user`.
 *
 * Responds with 401 if no token is present, the token is expired/invalid,
 * or the associated user no longer exists in the database.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in cookies (preferred — HttpOnly cookie flow)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback: check Authorization header (Bearer token flow)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }

  try {
    // Verify token — jwt.verify throws TokenExpiredError / JsonWebTokenError
    // which are handled globally by the error handler middleware
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by decoded ID, excluding password field
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized, user account no longer exists'));
    }

    next();
  } catch (error) {
    // Let specific JWT errors (TokenExpiredError, JsonWebTokenError) bubble
    // up to the global error handler for proper status codes & messages
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return next(error);
    }
    res.status(401);
    return next(new Error('Not authorized, token verification failed'));
  }
};

/**
 * Role-based authorization middleware.
 *
 * Must be used AFTER `protect` so that `req.user` is available.
 * Allows only users with the `admin` role to proceed; responds with
 * 403 Forbidden otherwise.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    return next(new Error('Access denied, administrator privileges required'));
  }
};


/**
 * Attaches the authenticated user when a valid token is supplied, but keeps
 * public routes accessible when no token is present.
 */
const optionalProtect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch (error) {
    // Public endpoints remain public; protected endpoints use `protect`.
  }

  next();
};
module.exports = { protect, optionalProtect, admin };
