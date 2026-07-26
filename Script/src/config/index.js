require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  demoPort: parseInt(process.env.DEMO_PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'super-secret-capstone-jwt-key-2026',
  adminCredentials: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10) // 10 requests per minute per IP/widget
  },
  cache: {
    configMaxAge: parseInt(process.env.CACHE_MAX_AGE_CONFIG || '300', 10), // 5 minutes for widget config
    cdnMaxAge: parseInt(process.env.CACHE_MAX_AGE_CDN || '3600', 10)      // 1 hour for cdn/widget.js bundle
  },
  cors: {
    allowedOrigins: ['*'], // Public internet is input; enable '*' or dynamic origin
    allowedMethods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Requested-With', 'Authorization', 'X-Widget-ID']
  }
};
