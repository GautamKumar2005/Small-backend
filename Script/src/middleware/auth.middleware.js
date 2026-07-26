const jwt = require('jsonwebtoken');
const config = require('../config');

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For demo/dashboard simplicity, allow fallback token or reject 401
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization Bearer token.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded; // { tenantId, username, role }
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token verification failed: ' + err.message
    });
  }
}

// Helper to generate admin JWT token
function generateAdminToken(tenantId = 'tenant-admin') {
  return jwt.sign(
    {
      tenantId,
      username: config.adminCredentials.username,
      role: 'owner'
    },
    config.jwtSecret,
    { expiresIn: '24h' }
  );
}

module.exports = {
  authenticateAdmin,
  generateAdminToken
};
