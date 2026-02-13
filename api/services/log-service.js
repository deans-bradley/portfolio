import crypto from 'crypto';
import Log from '../schemas/log-schema.js';
import config from '../config/config.js';

/**
 * @typedef {Object} RequestLogData
 * @property {string} method - HTTP method
 * @property {string} path - Request path
 * @property {number} statusCode - Response status code
 * @property {number} responseTime - Response time in milliseconds
 * @property {string} [ip] - Client IP address
 * @property {string} [userAgent] - Client user agent
 * @property {string} [userId] - Authenticated user ID
 * @property {string} [correlationId] - Request correlation ID
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} LogEntry
 * @property {('info'|'warn'|'error'|'debug')} level - Log level
 * @property {string} message - Log message
 * @property {Object} [metadata] - Additional metadata
 * @property {string} [correlationId] - Correlation ID for tracing
 */

/**
 * Service class for application logging to MongoDB.
 * Provides structured logging with automatic 30-day retention via TTL index.
 * @class LogService
 */
class LogService {
  /**
   * Generates a unique correlation ID for request tracing.
   * @returns {string} A unique correlation ID
   */
  generateCorrelationId() {
    return crypto.randomUUID();
  }

  /**
   * Logs a message at the specified level.
   * @param {('info'|'warn'|'error'|'debug')} level - Log severity level
   * @param {string} message - Log message
   * @param {Object} [options] - Additional log options
   * @param {Object} [options.metadata] - Additional metadata
   * @param {string} [options.correlationId] - Correlation ID
   * @param {string} [options.userId] - User ID if authenticated
   * @returns {Promise<void>}
   */
  async log(level, message, options = {}) {
    try {
      const logEntry = {
        level,
        message,
        metadata: options.metadata,
        correlationId: options.correlationId,
        userId: options.userId
      };

      await Log.create(logEntry);
    } catch (error) {
      console.error('Failed to persist log:', error.message);
    }
  }

  /**
   * Logs an info-level message.
   * @param {string} message - Log message
   * @param {Object} [options] - Additional log options
   * @returns {Promise<void>}
   */
  async info(message, options = {}) {
    await this.log('info', message, options);
  }

  /**
   * Logs a warning-level message.
   * @param {string} message - Log message
   * @param {Object} [options] - Additional log options
   * @returns {Promise<void>}
   */
  async warn(message, options = {}) {
    await this.log('warn', message, options);
  }

  /**
   * Logs an error-level message.
   * @param {string} message - Log message
   * @param {Object} [options] - Additional log options
   * @returns {Promise<void>}
   */
  async error(message, options = {}) {
    await this.log('error', message, options);
  }

  /**
   * Logs a debug-level message (only in development).
   * @param {string} message - Log message
   * @param {Object} [options] - Additional log options
   * @returns {Promise<void>}
   */
  async debug(message, options = {}) {
    if (config.env !== 'development') {
      return;
    }
    await this.log('debug', message, options);
  }

  /**
   * Logs an HTTP request with response details.
   * @param {RequestLogData} data - Request log data
   * @returns {Promise<void>}
   */
  async logRequest(data) {
    try {
      const level = this.#getLogLevelFromStatusCode(data.statusCode);
      const message = `${data.method} ${data.path} ${data.statusCode} ${data.responseTime}ms`;

      const logEntry = {
        level,
        message,
        method: data.method,
        path: data.path,
        statusCode: data.statusCode,
        responseTime: data.responseTime,
        ip: data.ip,
        userAgent: data.userAgent,
        userId: data.userId,
        correlationId: data.correlationId,
        metadata: data.metadata
      };

      await Log.create(logEntry);
    } catch (error) {
      console.error('Failed to persist request log:', error.message);
    }
  }

  /**
   * Logs an error with stack trace and request context.
   * @param {Error} error - The error object
   * @param {Object} [context] - Request context
   * @param {string} [context.method] - HTTP method
   * @param {string} [context.path] - Request path
   * @param {string} [context.ip] - Client IP
   * @param {string} [context.userId] - User ID
   * @param {string} [context.correlationId] - Correlation ID
   * @returns {Promise<void>}
   */
  async logError(error, context = {}) {
    try {
      const logEntry = {
        level: 'error',
        message: error.message || 'Unknown error',
        method: context.method,
        path: context.path,
        ip: context.ip,
        userId: context.userId,
        correlationId: context.correlationId,
        metadata: {
          stack: error.stack,
          name: error.name,
          ...context.metadata
        }
      };

      await Log.create(logEntry);
    } catch (logError) {
      console.error('Failed to persist error log:', logError.message);
    }
  }

  /**
   * Determines log level based on HTTP status code.
   * @param {number} statusCode - HTTP status code
   * @returns {('info'|'warn'|'error')} Appropriate log level
   */
  #getLogLevelFromStatusCode(statusCode) {
    if (statusCode >= 500) {
      return 'error';
    }
    if (statusCode >= 400) {
      return 'warn';
    }
    return 'info';
  }

  /**
   * Creates Express middleware for request logging.
   * Attaches correlation ID to request and logs response on finish.
   * @returns {Function} Express middleware function
   */
  createRequestLoggerMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      req.correlationId = this.generateCorrelationId();
      
      res.setHeader('X-Correlation-ID', req.correlationId);

      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        const ip = req.ip || req.socket?.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';

        this.logRequest({
          method: req.method,
          path: req.originalUrl || req.path,
          statusCode: res.statusCode,
          responseTime,
          ip,
          userAgent,
          userId: req.user?.userId,
          correlationId: req.correlationId
        });
      });

      next();
    };
  }

  /**
   * Retrieves logs with optional filtering and pagination.
   * @param {Object} [options] - Query options
   * @param {('info'|'warn'|'error'|'debug')} [options.level] - Filter by log level
   * @param {Date} [options.startDate] - Filter logs from this date
   * @param {Date} [options.endDate] - Filter logs until this date
   * @param {string} [options.correlationId] - Filter by correlation ID
   * @param {string} [options.userId] - Filter by user ID
   * @param {string} [options.method] - Filter by HTTP method
   * @param {string} [options.path] - Filter by request path (partial match)
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.limit=50] - Number of logs per page (max 100)
   * @returns {Promise<{logs: Array, total: number, page: number, totalPages: number}>}
   */
  async getLogs(options = {}) {
    const {
      level,
      startDate,
      endDate,
      correlationId,
      userId,
      method,
      path,
      page = 1,
      limit = 50
    } = options;

    const query = {};

    if (level) {
      query.level = level;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    if (correlationId) {
      query.correlationId = correlationId;
    }

    if (userId) {
      query.userId = userId;
    }

    if (method) {
      query.method = method.toUpperCase();
    }

    if (path) {
      query.path = { $regex: path, $options: 'i' };
    }

    const sanitizedLimit = Math.min(Math.max(1, limit), 100);
    const sanitizedPage = Math.max(1, page);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const [logs, total] = await Promise.all([
      Log.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(sanitizedLimit)
        .lean(),
      Log.countDocuments(query)
    ]);

    return {
      logs,
      total,
      page: sanitizedPage,
      totalPages: Math.ceil(total / sanitizedLimit)
    };
  }

  /**
   * Retrieves a single log by ID.
   * @param {string} logId - The log ID
   * @returns {Promise<Object|null>} The log document or null
   */
  async getLogById(logId) {
    return Log.findById(logId).lean();
  }
}

const logService = new LogService();

export default logService;
