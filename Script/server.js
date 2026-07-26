const express = require('express');
const path = require('path');
const config = require('./src/config');
const corsMiddleware = require('./src/middleware/cors.middleware');
const adminRoutes = require('./src/routes/admin.routes');
const publicRoutes = require('./src/routes/public.routes');

const app = express();

// 0. Boundary hardening: reject oversized payloads immediately before parsing
app.use((req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 10240) {
    return res.status(413).json({
      error: 'Payload Too Large',
      message: 'Request payload exceeds the maximum allowed limit of 10 KB.'
    });
  }
  next();
});

// 1. JSON body parsing
app.use(express.json({ limit: '10kb' }));

// 2. Global CORS middleware (public internet is input)
app.use(corsMiddleware);

// 3. CDN asset serving with CDN-like Cache-Control headers
app.use('/cdn', express.static(path.join(__dirname, 'public/cdn'), {
  maxAge: config.cache.cdnMaxAge * 1000,
  setHeaders: (res, pathStr) => {
    res.setHeader('Cache-Control', `public, max-age=${config.cache.cdnMaxAge}, stale-while-revalidate=86400`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// 4. Serve static dashboard and public files
app.use(express.static(path.join(__dirname, 'public')));

// 5. API Routes
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// 6. Global error handler for JSON parse syntax/size errors
app.use((err, req, res, next) => {
  if (err.status === 413 || err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload Too Large',
      message: 'Request payload exceeds the maximum allowed limit of 10 KB.'
    });
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Malformed JSON payload.'
    });
  }
  next(err);
});

// 7. Health & Info endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'embeddable-widget-platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

let server = null;
let demoServer = null;

function startServers(port = config.port, demoPort = config.demoPort) {
  server = app.listen(port, () => {
    console.log(`[Main Server] Running on http://localhost:${port}`);
    console.log(`  - Owner Dashboard: http://localhost:${port}/dashboard.html`);
    console.log(`  - CDN Widget JS  : http://localhost:${port}/cdn/widget.js`);
  });

  // Start second-origin server for demo customer site
  const demoApp = express();
  demoApp.use(express.static(path.join(__dirname, 'public')));
  demoServer = demoApp.listen(demoPort, () => {
    console.log(`[Demo Customer Site] Running on second origin http://localhost:${demoPort}/customer-site.html`);
  });

  return { server, demoServer };
}

function stopServers() {
  return new Promise((resolve) => {
    let closed = 0;
    const checkClosed = () => {
      closed++;
      if (closed >= 2) resolve();
    };
    if (server) server.close(checkClosed);
    else checkClosed();
    if (demoServer) demoServer.close(checkClosed);
    else checkClosed();
  });
}

// Automatically start if run directly from CLI
if (require.main === module) {
  startServers();
}

module.exports = {
  app,
  startServers,
  stopServers
};
