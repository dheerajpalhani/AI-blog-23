const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // Check token in headers or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded user info to request (typically contains userId or id)
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401);
    return next(new Error('Not authorized, invalid token'));
  }
};

module.exports = { protect };
