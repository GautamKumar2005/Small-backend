const widgetRepo = require('../repositories/widget.repository');
const submissionRepo = require('../repositories/submission.repository');
const enrichmentService = require('../services/enrichment.service');
const webhookService = require('../services/webhook.service');
const { generateAdminToken } = require('../middleware/auth.middleware');
const config = require('../config');

class AdminController {
  // Login to get token
  login(req, res) {
    const { username, password } = req.body || {};
    if (username === config.adminCredentials.username && password === config.adminCredentials.password) {
      const token = generateAdminToken('tenant-admin');
      return res.json({
        success: true,
        token,
        tenantId: 'tenant-admin',
        username
      });
    }
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid admin username or password.'
    });
  }

  // Get token without credentials for quick dashboard access
  getDemoToken(req, res) {
    const token = generateAdminToken('tenant-admin');
    res.json({ token, tenantId: 'tenant-admin' });
  }

  // List all widgets for authenticated tenant
  listWidgets(req, res) {
    const tenantId = req.user ? req.user.tenantId : 'tenant-admin';
    const widgets = widgetRepo.findByTenant(tenantId);
    res.json({ success: true, count: widgets.length, widgets });
  }

  // Get single widget details + embed snippet
  getWidget(req, res) {
    const id = req.params.id;
    const widget = widgetRepo.findById(id);
    if (!widget) {
      return res.status(404).json({ error: 'Not Found', message: 'Widget not found.' });
    }
    const origin = `${req.protocol}://${req.get('host')}`;
    const embedSnippet = `<script src="${origin}/cdn/widget.js" data-widget-id="${widget.id}" async defer></script>`;
    res.json({
      success: true,
      widget,
      embedSnippet
    });
  }

  // Create new widget
  createWidget(req, res) {
    const tenantId = req.user ? req.user.tenantId : 'tenant-admin';
    const { name, type, copy, fields, targeting } = req.body || {};
    const widget = widgetRepo.create({
      tenantId,
      name,
      type,
      copy,
      fields,
      targeting
    });
    const origin = `${req.protocol}://${req.get('host')}`;
    const embedSnippet = `<script src="${origin}/cdn/widget.js" data-widget-id="${widget.id}" async defer></script>`;
    res.status(201).json({
      success: true,
      widget,
      embedSnippet
    });
  }

  // Update widget
  updateWidget(req, res) {
    const id = req.params.id;
    const tenantId = req.user ? req.user.tenantId : 'tenant-admin';
    const updated = widgetRepo.update(id, tenantId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'Widget not found or unauthorized.' });
    }
    res.json({ success: true, widget: updated });
  }

  // Delete widget
  deleteWidget(req, res) {
    const id = req.params.id;
    const tenantId = req.user ? req.user.tenantId : 'tenant-admin';
    const deleted = widgetRepo.delete(id, tenantId);
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'Widget not found or unauthorized.' });
    }
    res.json({ success: true, message: 'Widget deleted.' });
  }

  // List submissions for tenant
  listSubmissions(req, res) {
    const tenantId = req.user ? req.user.tenantId : 'tenant-admin';
    const includeSpam = req.query.includeSpam === 'true';
    const submissions = submissionRepo.findByTenant(tenantId, { includeSpam });
    res.json({
      success: true,
      count: submissions.length,
      submissions
    });
  }

  // Get aggregated dashboard stats
  getDashboardStats(req, res) {
    const tenantId = req.user ? req.user.tenantId : 'tenant-admin';
    const stats = submissionRepo.getStatsByTenant(tenantId);
    const widgets = widgetRepo.findByTenant(tenantId);
    const providerStatus = enrichmentService.getProviderStatus();
    const fallbackLogs = enrichmentService.getFallbackLogs();
    const webhookLogs = webhookService.getLogs();

    res.json({
      success: true,
      stats: {
        ...stats,
        totalWidgets: widgets.length
      },
      providerStatus,
      fallbackLogs,
      webhookLogs
    });
  }

  // Toggle enrichment provider status (for testing deterministic fallback chain)
  toggleGeoProvider(req, res) {
    const { provider, isUp } = req.body || {};
    const success = enrichmentService.setProviderStatus(provider, isUp);
    if (!success) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid provider name. Use mock-geo-primary, mock-geo-secondary, or mock-geo-fallback.'
      });
    }
    res.json({
      success: true,
      provider,
      isUp: Boolean(isUp),
      status: enrichmentService.getProviderStatus()
    });
  }

  // Get current enrichment provider status
  getGeoStatus(req, res) {
    res.json({
      success: true,
      providerStatus: enrichmentService.getProviderStatus(),
      fallbackLogs: enrichmentService.getFallbackLogs()
    });
  }

  // Reset demo data
  resetData(req, res) {
    widgetRepo.reset();
    submissionRepo.reset();
    enrichmentService.clearFallbackLogs();
    webhookService.clearLogs();
    res.json({ success: true, message: 'All demo data reset to default seed state.' });
  }
}

module.exports = new AdminController();
