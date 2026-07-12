const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check token in cookies or headers
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
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
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by decoded ID, excluding password field
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized, user not found'));
    }

    next();
  } catch (error) {
    res.status(401);
    return next(new Error('Not authorized, invalid token'));
  }
};

module.exports = { protect };
