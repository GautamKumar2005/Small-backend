const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateAdmin } = require('../middleware/auth.middleware');

// Unprotected or auth-generator routes
router.post('/login', (req, res) => adminController.login(req, res));
router.get('/demo-token', (req, res) => adminController.getDemoToken(req, res));

// Protected admin routes
router.use(authenticateAdmin);

router.get('/widgets', (req, res) => adminController.listWidgets(req, res));
router.post('/widgets', (req, res) => adminController.createWidget(req, res));
router.get('/widgets/:id', (req, res) => adminController.getWidget(req, res));
router.put('/widgets/:id', (req, res) => adminController.updateWidget(req, res));
router.delete('/widgets/:id', (req, res) => adminController.deleteWidget(req, res));

router.get('/submissions', (req, res) => adminController.listSubmissions(req, res));
router.get('/stats', (req, res) => adminController.getDashboardStats(req, res));

router.post('/geo-toggle', (req, res) => adminController.toggleGeoProvider(req, res));
router.get('/geo-status', (req, res) => adminController.getGeoStatus(req, res));
router.post('/reset', (req, res) => adminController.resetData(req, res));

module.exports = router;
