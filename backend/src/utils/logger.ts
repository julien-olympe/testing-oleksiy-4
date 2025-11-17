import pino from 'pino';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface LogContext {
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  message: string;
  context?: Record<string, unknown>;
  stackTrace?: string | null;
}

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});

export class Logger {
  private static formatLog(level: LogLevel, context: LogContext): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      requestId: context.requestId,
      userId: context.userId,
      endpoint: context.endpoint,
      method: context.method,
      statusCode: context.statusCode,
      duration: context.duration,
      message: context.message,
      context: context.context || {},
      stackTrace: context.stackTrace || null,
    };

    switch (level) {
      case 'DEBUG':
        pinoLogger.debug(logEntry);
        break;
      case 'INFO':
        pinoLogger.info(logEntry);
        break;
      case 'WARN':
        pinoLogger.warn(logEntry);
        break;
      case 'ERROR':
        pinoLogger.error(logEntry);
        break;
      case 'CRITICAL':
        pinoLogger.fatal(logEntry);
        break;
    }
  }

  static debug(context: LogContext): void {
    this.formatLog('DEBUG', context);
  }

  static info(context: LogContext): void {
    this.formatLog('INFO', context);
  }

  static warn(context: LogContext): void {
    this.formatLog('WARN', context);
  }

  static error(context: LogContext): void {
    this.formatLog('ERROR', context);
  }

  static critical(context: LogContext): void {
    this.formatLog('CRITICAL', context);
  }
}
