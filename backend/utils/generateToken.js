const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  // Validate that JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables. Please check your .env file.');
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = generateToken;
