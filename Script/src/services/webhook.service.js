class WebhookService {
  constructor() {
    this.simulateFailure = false;
    this.logs = [];
  }

  setSimulateFailure(shouldFail) {
    this.simulateFailure = Boolean(shouldFail);
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  async dispatchSideEffect(submission, widget) {
    const timestamp = new Date().toISOString();
    try {
      if (this.simulateFailure) {
        throw new Error('Simulated email/webhook delivery failure (upstream SMTP/webhook error)');
      }

      // Simulate network latency for side-effect dispatch
      await new Promise(resolve => setTimeout(resolve, 20));

      const logEntry = {
        id: submission.id,
        widgetId: widget ? widget.id : submission.widgetId,
        status: 'success',
        timestamp,
        message: `Confirmation email & webhook notification delivered to widget owner for submission ${submission.id}`
      };
      this.logs.push(logEntry);
      console.log(`[WebhookService] ${logEntry.message}`);

      return {
        status: 'success',
        timestamp
      };
    } catch (err) {
      // Degrade gracefully - DO NOT rethrow error so submission succeeds
      const logEntry = {
        id: submission.id,
        widgetId: widget ? widget.id : submission.widgetId,
        status: 'failed',
        timestamp,
        error: err.message,
        message: `[WebhookService] Side-effect (email/webhook) failed for submission ${submission.id}: ${err.message}. Degrading gracefully.`
      };
      this.logs.push(logEntry);
      console.warn(logEntry.message);

      return {
        status: 'failed',
        error: err.message,
        timestamp
      };
    }
  }
}

module.exports = new WebhookService();
