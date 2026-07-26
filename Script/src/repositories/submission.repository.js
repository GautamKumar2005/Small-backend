const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'submissions.json');

class SubmissionRepository {
  constructor() {
    this.submissions = new Map();
    this.ensureDataDir();
    this.load();
  }

  ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const items = JSON.parse(raw);
        items.forEach(sub => this.submissions.set(sub.id, sub));
      }
    } catch (err) {
      console.warn('Could not load submissions from file, starting fresh:', err.message);
    }
  }

  save() {
    try {
      const items = Array.from(this.submissions.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save submissions to disk:', err.message);
    }
  }

  create({ widgetId, tenantId, data, ip, geo, geoProvider, spamScore = 0, isSpam = false, sideEffectStatus = 'success' }) {
    const id = 'sub-' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();
    const submission = {
      id,
      widgetId,
      tenantId: tenantId || 'tenant-admin',
      data: data || {},
      ip: ip || '127.0.0.1',
      geo: geo || { country: 'Unknown', city: 'Unknown', region: 'Unknown' },
      geoProvider: geoProvider || 'unknown',
      spamScore,
      isSpam,
      sideEffectStatus,
      createdAt: now
    };
    this.submissions.set(id, submission);
    this.save();
    return submission;
  }

  findByTenant(tenantId, options = {}) {
    const results = [];
    for (const sub of this.submissions.values()) {
      if (sub.tenantId === tenantId) {
        if (options.includeSpam || !sub.isSpam) {
          results.push(sub);
        }
      }
    }
    // Sort newest first
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return results;
  }

  getStatsByTenant(tenantId) {
    const all = [];
    for (const sub of this.submissions.values()) {
      if (sub.tenantId === tenantId) {
        all.push(sub);
      }
    }

    const totalSubmissions = all.length;
    const validSubmissions = all.filter(s => !s.isSpam).length;
    const spamBlocked = all.filter(s => s.isSpam).length;
    const conversionRate = totalSubmissions > 0 
      ? ((validSubmissions / totalSubmissions) * 100).toFixed(1) + '%' 
      : '0.0%';

    const geoBreakdown = {};
    const providerBreakdown = {};

    all.forEach(sub => {
      const country = sub.geo && sub.geo.country ? sub.geo.country : 'Unknown';
      geoBreakdown[country] = (geoBreakdown[country] || 0) + 1;

      const provider = sub.geoProvider || 'unknown';
      providerBreakdown[provider] = (providerBreakdown[provider] || 0) + 1;
    });

    return {
      totalSubmissions,
      validSubmissions,
      spamBlocked,
      conversionRate,
      geoBreakdown,
      providerBreakdown
    };
  }

  reset() {
    this.submissions.clear();
    this.save();
  }
}

module.exports = new SubmissionRepository();
