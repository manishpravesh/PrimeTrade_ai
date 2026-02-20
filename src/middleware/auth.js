const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const { findUserById } = require('../services/store');

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, jwtSecret);
    const user = await findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token user' });
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }

    return next();
  };
}

module.exports = { authenticate, authorizeRole };
