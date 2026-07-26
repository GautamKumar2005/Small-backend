/**
 * FlyRank Embeddable Widget - Production CDN Bundle
 * Cross-origin lead capture script with built-in spam protection & styling
 */
(function(window, document) {
  'use strict';

  if (window.FlyRankWidgetLoaded) return;
  window.FlyRankWidgetLoaded = true;

  // Find the script tag that loaded this script
  const scripts = document.getElementsByTagName('script');
  let currentScript = null;
  let widgetId = 'wdg-demo-123';
  let serverOrigin = 'http://localhost:3000';

  for (let i = scripts.length - 1; i >= 0; i--) {
    const s = scripts[i];
    if (s.src && s.src.indexOf('/cdn/widget.js') !== -1) {
      currentScript = s;
      const attrId = s.getAttribute('data-widget-id');
      if (attrId) widgetId = attrId;
      try {
        const urlObj = new URL(s.src);
        serverOrigin = urlObj.origin;
      } catch (e) {
        // use default
      }
      break;
    }
  }

  // Inject Scoped Vanilla CSS
  function injectStyles() {
    if (document.getElementById('flyrank-widget-styles')) return;
    const style = document.createElement('style');
    style.id = 'flyrank-widget-styles';
    style.innerHTML = `
      .fr-widget-overlay {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .fr-widget-card {
        background: rgba(18, 24, 38, 0.95);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.15);
        border-radius: 16px;
        width: 340px;
        color: #f8fafc;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        transform: translateY(0);
      }
      .fr-widget-card.fr-hidden {
        transform: translateY(20px);
        opacity: 0;
        pointer-events: none;
      }
      .fr-widget-header {
        padding: 20px 20px 12px;
        position: relative;
      }
      .fr-widget-title {
        font-size: 18px;
        font-weight: 700;
        margin: 0 0 6px;
        color: #ffffff;
        letter-spacing: -0.02em;
      }
      .fr-widget-subtitle {
        font-size: 13px;
        color: #94a3b8;
        margin: 0;
        line-height: 1.4;
      }
      .fr-widget-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: rgba(255, 255, 255, 0.08);
        border: none;
        color: #94a3b8;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transition: background 0.2s;
      }
      .fr-widget-close:hover {
        background: rgba(255, 255, 255, 0.18);
        color: #fff;
      }
      .fr-widget-form {
        padding: 8px 20px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .fr-widget-input {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 10px;
        padding: 10px 14px;
        color: #ffffff;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .fr-widget-input:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
      }
      .fr-widget-input::placeholder {
        color: #64748b;
      }
      .fr-widget-btn {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: #ffffff;
        border: none;
        border-radius: 10px;
        padding: 12px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.2s;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
      }
      .fr-widget-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.45);
      }
      .fr-widget-btn:active {
        transform: translateY(0);
      }
      .fr-widget-badge {
        font-size: 11px;
        color: #64748b;
        text-align: center;
        margin-top: 4px;
      }
      .fr-widget-badge span {
        color: #818cf8;
        font-weight: 600;
      }
      .fr-widget-message {
        padding: 12px;
        border-radius: 10px;
        font-size: 13px;
        line-height: 1.4;
        margin-bottom: 8px;
        display: none;
      }
      .fr-widget-message.fr-success {
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #34d399;
        display: block;
      }
      .fr-widget-message.fr-error {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #f87171;
        display: block;
      }
    `;
    document.head.appendChild(style);
  }

  function renderWidget(config) {
    injectStyles();

    const container = document.createElement('div');
    container.className = 'fr-widget-overlay';
    container.id = `flyrank-widget-${config.id}`;

    const fieldsHtml = (config.fields || [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Work Email', type: 'email', required: true }
    ]).map(f => `
      <input
        type="${f.type || 'text'}"
        name="${f.name}"
        class="fr-widget-input"
        placeholder="${f.label}"
        ${f.required ? 'required' : ''}
      />
    `).join('');

    const copy = config.copy || {
      title: 'Sign Up',
      subtitle: 'Enter your details below',
      ctaText: 'Submit',
      successMessage: 'Thank you!'
    };

    container.innerHTML = `
      <div class="fr-widget-card" id="fr-card-${config.id}">
        <div class="fr-widget-header">
          <button class="fr-widget-close" id="fr-close-${config.id}" aria-label="Close">×</button>
          <h3 class="fr-widget-title">${copy.title}</h3>
          <p class="fr-widget-subtitle">${copy.subtitle}</p>
        </div>
        <form class="fr-widget-form" id="fr-form-${config.id}">
          <div id="fr-msg-${config.id}" class="fr-widget-message"></div>
          ${fieldsHtml}
          <!-- Honeypot spam trap (hidden from users) -->
          <input type="text" name="_hp_trap" style="display:none" tabindex="-1" autocomplete="off" />
          <input type="hidden" name="_render_ts" value="${Date.now()}" />
          <button type="submit" class="fr-widget-btn" id="fr-submit-${config.id}">${copy.ctaText}</button>
          <div class="fr-widget-badge">Powered by <span>FlyRank AI</span></div>
        </form>
      </div>
    `;

    document.body.appendChild(container);

    const form = document.getElementById(`fr-form-${config.id}`);
    const closeBtn = document.getElementById(`fr-close-${config.id}`);
    const card = document.getElementById(`fr-card-${config.id}`);
    const msgDiv = document.getElementById(`fr-msg-${config.id}`);

    closeBtn.addEventListener('click', function() {
      card.classList.add('fr-hidden');
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      msgDiv.className = 'fr-widget-message';
      msgDiv.style.display = 'none';

      const formData = new FormData(form);
      const payload = {};
      formData.forEach((val, key) => {
        payload[key] = val;
      });

      const submitBtn = document.getElementById(`fr-submit-${config.id}`);
      submitBtn.disabled = true;
      submitBtn.innerText = 'Submitting...';

      fetch(`${serverOrigin}/api/widgets/${config.id}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Widget-ID': config.id
        },
        body: JSON.stringify(payload)
      })
      .then(async (response) => {
        const data = await response.json();
        submitBtn.disabled = false;
        submitBtn.innerText = copy.ctaText;

        if (response.status === 201) {
          msgDiv.className = 'fr-widget-message fr-success';
          msgDiv.innerText = data.message || copy.successMessage;
          form.reset();
          // Update render timestamp for next submit
          const tsInput = form.querySelector('input[name="_render_ts"]');
          if (tsInput) tsInput.value = Date.now();
        } else if (response.status === 429) {
          msgDiv.className = 'fr-widget-message fr-error';
          msgDiv.innerText = data.message || 'Too many requests. Please try again later.';
        } else {
          msgDiv.className = 'fr-widget-message fr-error';
          msgDiv.innerText = data.message || 'Error submitting form. Please check your inputs.';
        }
      })
      .catch((err) => {
        submitBtn.disabled = false;
        submitBtn.innerText = copy.ctaText;
        msgDiv.className = 'fr-widget-message fr-error';
        msgDiv.innerText = 'Network error. Could not connect to FlyRank CDN endpoint.';
      });
    });
  }

  // Load widget config from backend
  function init() {
    fetch(`${serverOrigin}/api/widgets/${widgetId}/config`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (data.success && data.config) {
          renderWidget(data.config);
        }
      })
      .catch(err => {
        console.error('[FlyRank Widget] Failed to load widget config:', err.message);
      });
  }

  // Run on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose global controller
  window.FlyRankWidget = {
    init,
    serverOrigin,
    widgetId
  };

})(window, document);
