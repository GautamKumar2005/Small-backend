const config = require('../config');

class RateLimiter {
  constructor(windowMs = config.rateLimit.windowMs, maxRequests = config.rateLimit.maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.buckets = new Map();
  }

  middleware() {
    return (req, res, next) => {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const widgetId = req.params.id || req.headers['x-widget-id'] || 'global';
      const key = `${ip}:${widgetId}`;
      const now = Date.now();

      let bucket = this.buckets.get(key);
      if (!bucket || (now - bucket.startTime) > this.windowMs) {
        bucket = {
          count: 0,
          startTime: now
        };
        this.buckets.set(key, bucket);
      }

      bucket.count += 1;

      if (bucket.count > this.maxRequests) {
        const retryAfterSeconds = Math.ceil((this.windowMs - (now - bucket.startTime)) / 1000) || 60;
        res.header('Retry-After', String(retryAfterSeconds));
        res.header('X-RateLimit-Limit', String(this.maxRequests));
        res.header('X-RateLimit-Remaining', '0');
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded (${this.maxRequests} requests per minute). Please try again in ${retryAfterSeconds} seconds.`
        });
      }

      res.header('X-RateLimit-Limit', String(this.maxRequests));
      res.header('X-RateLimit-Remaining', String(Math.max(0, this.maxRequests - bucket.count)));
      next();
    };
  }

  reset() {
    this.buckets.clear();
  }
}

const defaultLimiter = new RateLimiter();

module.exports = {
  rateLimitMiddleware: defaultLimiter.middleware(),
  limiterInstance: defaultLimiter
};
