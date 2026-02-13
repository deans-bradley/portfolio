/**
 * @typedef {Object} LogData
 * @property {string} id - Log unique identifier
 * @property {('info'|'warn'|'error'|'debug')} level - Log severity level
 * @property {string} message - Log message
 * @property {string} [method] - HTTP method
 * @property {string} [path] - Request path
 * @property {number} [statusCode] - HTTP status code
 * @property {number} [responseTime] - Response time in milliseconds
 * @property {string} [ip] - Client IP address
 * @property {string} [userAgent] - Client user agent
 * @property {string} [userId] - User ID if authenticated
 * @property {string} [correlationId] - Correlation ID for tracing
 * @property {Object} [metadata] - Additional metadata
 * @property {string} createdAt - Log creation timestamp
 */

/**
 * @typedef {Object} LogsResponse
 * @property {Array<Log>} logs - Array of logs
 * @property {number} total - Total number of logs
 * @property {number} page - Current page
 * @property {number} totalPages - Total pages
 */

class Log {
  /**
   * Create a new Log instance
   * @param {LogData} data - The log data
   */
  constructor(data = {}) {
    this.id = data.id || data._id;
    this.level = data.level;
    this.message = data.message;
    this.method = data.method;
    this.path = data.path;
    this.statusCode = data.statusCode;
    this.responseTime = data.responseTime;
    this.ip = data.ip;
    this.userAgent = data.userAgent;
    this.userId = data.userId;
    this.correlationId = data.correlationId;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt;
  }

  /**
   * Get formatted timestamp
   * @returns {string}
   */
  getFormattedDate() {
    if (!this.createdAt) return '';
    const date = new Date(this.createdAt);
    return date.toLocaleString();
  }

  /**
   * Get CSS class for log level badge
   * @returns {string}
   */
  getLevelClass() {
    const levelClasses = {
      info: 'secondary',
      warn: 'contrast',
      error: 'pico-background-red-500',
      debug: 'outline'
    };
    return levelClasses[this.level] || '';
  }

  /**
   * Create Log from JSON
   * @param {Object} json
   * @returns {Log}
   */
  static fromJSON(json) {
    return new Log(json);
  }

  /**
   * Create array of Logs from JSON array
   * @param {Array<Object>} jsonArray
   * @returns {Array<Log>}
   */
  static fromJSONArray(jsonArray) {
    if (!Array.isArray(jsonArray)) return [];
    return jsonArray.map(json => Log.fromJSON(json));
  }
}

export { Log };
