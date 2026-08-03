const jwt = require('jsonwebtoken');

const generateToken = (res, id) => {
  // Sign JWT token
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set HTTP-Only Cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production (HTTPS only)
    sameSite: 'lax', // Protect against CSRF
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

module.exports = generateToken;
