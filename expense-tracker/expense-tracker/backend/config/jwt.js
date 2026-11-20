const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'expense_tracker_secret_fallback_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(payload, rememberMe = true) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : '1d'
  });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  generateToken,
  verifyToken
};
