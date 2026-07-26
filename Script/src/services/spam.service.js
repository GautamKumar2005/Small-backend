class SpamService {
  constructor() {
    this.botKeywords = ['viagra', 'casino', 'free-crypto', 'seo-ranking-boost', 'buy-followers'];
  }

  evaluate(payload = {}) {
    const reasons = [];
    let score = 0;

    // 1. Honeypot check
    if (payload._hp_trap || payload.website_url_hp || payload.bot_trap) {
      reasons.push('honeypot_triggered');
      score += 100;
    }

    // 2. Timestamp / speed check (if submitted faster than 1.2s after render)
    if (payload._render_ts) {
      const elapsedMs = Date.now() - Number(payload._render_ts);
      if (!isNaN(elapsedMs) && elapsedMs < 1200 && elapsedMs >= 0) {
        reasons.push('submission_too_fast');
        score += 50;
      }
    }

    // 3. Spam keywords check
    const textToScan = JSON.stringify(payload).toLowerCase();
    for (const kw of this.botKeywords) {
      if (textToScan.includes(kw)) {
        reasons.push(`spam_keyword_${kw}`);
        score += 40;
      }
    }

    // 4. Repetitive characters check (e.g. "aaaaaaa")
    const values = Object.values(payload).filter(v => typeof v === 'string');
    for (const val of values) {
      if (/([a-zA-Z0-9])\1{7,}/.test(val)) {
        reasons.push('repetitive_characters_spam');
        score += 30;
        break;
      }
    }

    const isSpam = score >= 50;
    return {
      isSpam,
      score,
      reasons
    };
  }
}

module.exports = new SpamService();
