class ErrorLogger {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // Keep last 100 errors
    this.listeners = new Set();
  }

  log(error, context = {}) {
    const errorEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      stack: error.stack || null,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    };

    this.errors.unshift(errorEntry);

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(this.errors));

    // Also log to console for debugging
    console.error('[ErrorLogger]', error, context);

    return errorEntry;
  }

  logInfo(message, context = {}) {
    const errorEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      message,
      level: 'info',
      context: {
        ...context,
        url: window.location.href
      }
    };

    this.errors.unshift(errorEntry);

    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    this.listeners.forEach(listener => listener(this.errors));

    console.log('[ErrorLogger]', message, context);

    return errorEntry;
  }

  getErrors() {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
    this.listeners.forEach(listener => listener(this.errors));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getErrorCount() {
    return this.errors.length;
  }

  exportErrors() {
    return JSON.stringify(this.errors, null, 2);
  }
}

export default new ErrorLogger();
