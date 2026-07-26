const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'widgets.json');

class WidgetRepository {
  constructor() {
    this.widgets = new Map();
    this.ensureDataDir();
    this.load();
    this.seedDefaults();
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
        items.forEach(w => this.widgets.set(w.id, w));
      }
    } catch (err) {
      console.warn('Could not load widgets from file, starting fresh:', err.message);
    }
  }

  save() {
    try {
      const items = Array.from(this.widgets.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save widgets to disk:', err.message);
    }
  }

  seedDefaults() {
    if (this.widgets.size === 0) {
      const defaultWidget = {
        id: 'wdg-demo-123',
        tenantId: 'tenant-admin',
        name: 'TechCorp Lead Magnet CTA',
        type: 'popover',
        copy: {
          title: 'Join 10,000+ AI Engineers',
          subtitle: 'Get our weekly digest on Agentic Systems, RAG, and production LLMs.',
          ctaText: 'Subscribe Now',
          successMessage: 'Welcome aboard! Check your inbox for confirmation.'
        },
        fields: [
          { name: 'name', label: 'Full Name', type: 'text', required: true },
          { name: 'email', label: 'Work Email', type: 'email', required: true }
        ],
        targeting: {
          delaySeconds: 1,
          showOncePerVisitor: false
        },
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.widgets.set(defaultWidget.id, defaultWidget);
      this.save();
    }
  }

  create({ tenantId, name, type, copy, fields, targeting }) {
    const id = 'wdg-' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();
    const widget = {
      id,
      tenantId: tenantId || 'tenant-admin',
      name: name || 'Untitled Widget',
      type: type || 'popover',
      copy: copy || {
        title: 'Sign Up',
        subtitle: 'Enter your details below',
        ctaText: 'Submit',
        successMessage: 'Thank you!'
      },
      fields: fields || [
        { name: 'email', label: 'Email', type: 'email', required: true }
      ],
      targeting: targeting || {
        delaySeconds: 0,
        showOncePerVisitor: false
      },
      version: 1,
      createdAt: now,
      updatedAt: now
    };
    this.widgets.set(id, widget);
    this.save();
    return widget;
  }

  findById(id) {
    return this.widgets.get(id) || null;
  }

  findByTenant(tenantId) {
    const results = [];
    for (const widget of this.widgets.values()) {
      if (widget.tenantId === tenantId) {
        results.push(widget);
      }
    }
    return results;
  }

  update(id, tenantId, updates) {
    const existing = this.findById(id);
    if (!existing || existing.tenantId !== tenantId) {
      return null;
    }
    const updated = {
      ...existing,
      ...updates,
      id: existing.id,
      tenantId: existing.tenantId,
      version: (existing.version || 1) + 1,
      updatedAt: new Date().toISOString()
    };
    this.widgets.set(id, updated);
    this.save();
    return updated;
  }

  delete(id, tenantId) {
    const existing = this.findById(id);
    if (!existing || existing.tenantId !== tenantId) {
      return false;
    }
    this.widgets.delete(id);
    this.save();
    return true;
  }

  reset() {
    this.widgets.clear();
    this.seedDefaults();
  }
}

module.exports = new WidgetRepository();
