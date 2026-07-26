const widgetRepo = require('../repositories/widget.repository');
const submissionRepo = require('../repositories/submission.repository');
const enrichmentService = require('../services/enrichment.service');
const spamService = require('../services/spam.service');
const webhookService = require('../services/webhook.service');
const config = require('../config');

class PublicController {
  // Get widget config with CDN-like caching (Cache-Control, ETag, 304 Not Modified)
  getWidgetConfig(req, res) {
    const id = req.params.id;
    const widget = widgetRepo.findById(id);
    if (!widget) {
      return res.status(404).json({ error: 'Not Found', message: 'Widget not found.' });
    }

    const etag = `"wdg-${widget.id}-v${widget.version || 1}"`;
    res.setHeader('Cache-Control', `public, max-age=${config.cache.configMaxAge}, stale-while-revalidate=86400`);
    res.setHeader('ETag', etag);

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    res.json({
      success: true,
      config: {
        id: widget.id,
        type: widget.type,
        name: widget.name,
        copy: widget.copy,
        fields: widget.fields,
        targeting: widget.targeting,
        version: widget.version || 1
      }
    });
  }

  // Public lead-capture CORS submission endpoint
  async submitLead(req, res) {
    const id = req.params.id;
    const widget = widgetRepo.findById(id);
    if (!widget) {
      return res.status(404).json({ error: 'Not Found', message: 'Widget not found.' });
    }

    const payload = req.body || {};
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    // 1. Evaluate spam controls (honeypot, timing, heuristic)
    const spamEvaluation = spamService.evaluate(payload);
    if (spamEvaluation.isSpam) {
      // Record spam attempt in repository so owner dashboard can track "Spam Blocked"
      submissionRepo.create({
        widgetId: widget.id,
        tenantId: widget.tenantId,
        data: payload,
        ip,
        geo: { country: 'Blocked (Spam)', city: 'N/A', region: 'N/A' },
        geoProvider: 'spam-filter',
        spamScore: spamEvaluation.score,
        isSpam: true,
        sideEffectStatus: 'skipped'
      });

      return res.status(422).json({
        error: 'Unprocessable Entity',
        message: 'Submission rejected by automated spam protection.',
        reasons: spamEvaluation.reasons
      });
    }

    // 2. Enrich IP address -> geo with 3-provider fallback chain
    const enrichmentResult = await enrichmentService.enrichIp(ip);

    // 3. Create and store valid submission
    const submission = submissionRepo.create({
      widgetId: widget.id,
      tenantId: widget.tenantId,
      data: payload,
      ip,
      geo: enrichmentResult.geo,
      geoProvider: enrichmentResult.provider,
      spamScore: spamEvaluation.score,
      isSpam: false,
      sideEffectStatus: 'pending'
    });

    // 4. Dispatch side effect asynchronously (degrades gracefully - never throws or fails submission)
    webhookService.dispatchSideEffect(submission, widget)
      .then(resSideEffect => {
        submission.sideEffectStatus = resSideEffect.status;
        submissionRepo.save();
      })
      .catch(err => {
        console.warn(`[PublicController] Unexpected side-effect error: ${err.message}`);
      });

    // 5. Return 201 Created immediately
    return res.status(201).json({
      success: true,
      message: widget.copy && widget.copy.successMessage ? widget.copy.successMessage : 'Submission successful!',
      submissionId: submission.id,
      geo: enrichmentResult.geo,
      geoProvider: enrichmentResult.provider
    });
  }
}

module.exports = new PublicController();
