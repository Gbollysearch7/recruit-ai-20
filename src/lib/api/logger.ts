type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface RequestLog {
  requestId: string;
  method: string;
  path: string;
  duration?: number;
  status?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

interface ApiCallLog {
  requestId: string;
  service: string;
  method: string;
  endpoint: string;
  duration?: number;
  status?: number;
  error?: string;
}

const LOG_COLORS = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  reset: '\x1b[0m',
};

class ApiLogger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLog(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = this.formatTimestamp();
    const color = LOG_COLORS[level];
    const reset = LOG_COLORS.reset;
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `${color}[${timestamp}] [${level.toUpperCase()}]${reset} ${message}${dataStr}`;
  }

  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatLog('debug', message, data));
    }
  }

  info(message: string, data?: unknown): void {
    console.log(this.formatLog('info', message, data));
  }

  warn(message: string, data?: unknown): void {
    console.warn(this.formatLog('warn', message, data));
  }

  error(message: string, data?: unknown): void {
    console.error(this.formatLog('error', message, data));
  }

  // Log incoming API request
  logRequest(log: Omit<RequestLog, 'duration' | 'status'>): void {
    this.info(`→ ${log.method} ${log.path}`, {
      requestId: log.requestId,
      ...log.metadata,
    });
  }

  // Log API response
  logResponse(log: RequestLog): void {
    const statusEmoji = log.status && log.status >= 400 ? '✗' : '✓';
    const level: LogLevel = log.error ? 'error' : log.status && log.status >= 400 ? 'warn' : 'info';

    this[level](`← ${statusEmoji} ${log.method} ${log.path} ${log.status || 'unknown'}`, {
      requestId: log.requestId,
      duration: log.duration ? `${log.duration}ms` : undefined,
      error: log.error,
    });
  }

  // Log external API call (e.g., to Exa)
  logExternalCall(log: Omit<ApiCallLog, 'duration' | 'status'>): () => void {
    const startTime = Date.now();
    this.debug(`↗ ${log.service} ${log.method} ${log.endpoint}`, {
      requestId: log.requestId,
    });

    // Return function to log completion
    return () => {
      const duration = Date.now() - startTime;
      this.debug(`↙ ${log.service} completed`, {
        requestId: log.requestId,
        duration: `${duration}ms`,
      });
    };
  }

  // Log external API error
  logExternalError(log: ApiCallLog): void {
    this.error(`✗ ${log.service} ${log.method} ${log.endpoint} failed`, {
      requestId: log.requestId,
      duration: log.duration ? `${log.duration}ms` : undefined,
      status: log.status,
      error: log.error,
    });
  }

  // Log retry attempt
  logRetry(requestId: string, attempt: number, maxRetries: number, delay: number, error: string): void {
    this.warn(`⟳ Retry attempt ${attempt}/${maxRetries}`, {
      requestId,
      delay: `${delay}ms`,
      error,
    });
  }
}

// Singleton instance
export const logger = new ApiLogger();

// Request timing helper
export function createRequestTimer() {
  const startTime = Date.now();
  return {
    getDuration: () => Date.now() - startTime,
  };
}
