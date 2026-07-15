const express = require('express');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// @route   GET /api/protected/secret
// @desc    A protected route that requires a valid JWT
// @access  Private
router.get('/secret', authenticate, (req, res) => {
    // If the request makes it here, the middleware has successfully authenticated the user
    // The user's payload is available in req.user
    res.json({
        message: `Hello ${req.user.username}, you have accessed the protected route!`,
        user: req.user
    });
});

module.exports = router;
