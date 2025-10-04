/**
 * ErrorLogger Service
 * Centralized error logging for production error tracking
 * Ready for Sentry/Bugsnag integration
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface LoggedError {
  message: string;
  error: Error | unknown;
  severity: ErrorSeverity;
  context?: ErrorContext;
  timestamp: Date;
}

class ErrorLoggerService {
  private errors: LoggedError[] = [];
  private readonly maxStoredErrors = 100;
  private isDevelopment = __DEV__;

  /**
   * Log an error with context and severity
   */
  logError(
    component: string,
    message: string,
    error: Error | unknown,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    metadata?: Record<string, unknown>
  ): void {
    const loggedError: LoggedError = {
      message,
      error,
      severity,
      context: metadata ? {
        component,
        metadata,
      } : {
        component,
      },
      timestamp: new Date(),
    };

    // Store error locally
    this.storeError(loggedError);

    // In development, log to console
    if (this.isDevelopment) {
      this.logToConsole(loggedError);
    }

    // In production, send to error tracking service
    if (!this.isDevelopment) {
      this.sendToTrackingService(loggedError);
    }
  }

  /**
   * Log an error with action context
   */
  logActionError(
    component: string,
    action: string,
    error: Error | unknown,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ): void {
    this.logError(component, `Failed to ${action}`, error, severity, { action });
  }

  /**
   * Log a critical error that affects core functionality
   */
  logCritical(component: string, message: string, error: Error | unknown): void {
    this.logError(component, message, error, ErrorSeverity.CRITICAL);
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit: number = 10): LoggedError[] {
    return this.errors.slice(-limit);
  }

  /**
   * Clear stored errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Store error locally (in-memory for now, can be persisted to AsyncStorage)
   */
  private storeError(error: LoggedError): void {
    this.errors.push(error);

    // Keep only the most recent errors
    if (this.errors.length > this.maxStoredErrors) {
      this.errors = this.errors.slice(-this.maxStoredErrors);
    }
  }

  /**
   * Log to console in development mode
   */
  private logToConsole(loggedError: LoggedError): void {
    const { severity, context, message, error } = loggedError;
    const prefix = `[${severity.toUpperCase()}] ${context?.component || 'Unknown'}:`;

    console.group(prefix, message);
    console.error(error);
    if (context?.metadata) {
      console.log('Metadata:', context.metadata);
    }
    console.groupEnd();
  }

  /**
   * Send to error tracking service (Sentry, Bugsnag, etc.)
   * Placeholder for production integration
   */
  private sendToTrackingService(loggedError: LoggedError): void {
    // TODO: Integrate with Sentry or Bugsnag
    // Example Sentry integration:
    // Sentry.captureException(loggedError.error, {
    //   level: this.mapSeverityToSentryLevel(loggedError.severity),
    //   tags: {
    //     component: loggedError.context?.component,
    //   },
    //   extra: loggedError.context?.metadata,
    // });

    // For now, we'll just store it
    // In production, this should send to your error tracking service
  }

  /**
   * Map error severity to Sentry levels
   */
  private mapSeverityToSentryLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'info';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.CRITICAL:
        return 'fatal';
      default:
        return 'error';
    }
  }
}

// Export singleton instance
export const ErrorLogger = new ErrorLoggerService();

// Export for testing
export { ErrorLoggerService };
