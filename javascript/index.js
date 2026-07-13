const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Custom Middleware: Logs the time of each request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`);
  next(); // Pass control to the next middleware or route handler
});

// RESTful API Endpoint: GET route (Read)
app.get('/', (req, res) => {
  res.send('Welcome to your first Node.js & Express server!');
});

// RESTful API Endpoint: GET route with JSON response
app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];
  res.json(users);
});

// RESTful API Endpoint: POST route (Create)
app.post('/api/users', (req, res) => {
  const newUser = req.body;
  console.log('Received new user:', newUser);
  res.status(201).json({
    message: 'User created successfully',
    user: newUser
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
