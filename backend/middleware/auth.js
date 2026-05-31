const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'meditrace_super_secret_key_change_in_production_2024';

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function authorize(...allowedTypes) {
  return (req, res, next) => {
    if (!req.user || !allowedTypes.includes(req.user.user_type)) {
      return res.status(403).json({ success: false, message: 'Access denied: insufficient permissions' });
    }
    next();
  };
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      unique_id: user.unique_id,
      email: user.email,
      user_type: user.user_type,
      full_name: user.full_name,
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = { authenticate, authorize, generateToken };
