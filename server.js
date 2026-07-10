const express = require('express');
const app = express();
const port = 3000;

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.get('/api/info', (req, res) => {
  res.json({ version: '1.0.0', name: 'smallest-backend' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
