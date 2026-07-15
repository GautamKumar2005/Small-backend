require('dotenv').config();
const express = require('express');

// Import routes
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
    res.send('Auth Service is running');
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
