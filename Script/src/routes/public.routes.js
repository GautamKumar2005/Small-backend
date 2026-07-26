const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');
const { rateLimitMiddleware } = require('../middleware/rateLimit.middleware');
const { validateSubmissionPayload } = require('../middleware/validate.middleware');

// Public Widget Config endpoint (cached)
router.get('/widgets/:id/config', (req, res) => publicController.getWidgetConfig(req, res));

// Public CORS Lead-Capture endpoint (rate-limited, validated)
router.post(
  '/widgets/:id/submissions',
  rateLimitMiddleware,
  validateSubmissionPayload,
  (req, res) => publicController.submitLead(req, res)
);

module.exports = router;
