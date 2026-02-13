/**
 * @typedef {('healthy'|'unhealthy'|'degraded')} HealthStatus
 */

/**
 * @typedef {Object} ServiceStatusData
 * @property {HealthStatus} status - The service health status
 * @property {number} [latency] - Response time in milliseconds
 * @property {string} [error] - Error message if unhealthy
 */

/**
 * @typedef {Object} DetailedHealthData
 * @property {boolean} success - Overall success indicator
 * @property {HealthStatus} status - Overall system status
 * @property {number} uptime - Server uptime in seconds
 * @property {string} timestamp - ISO timestamp
 * @property {string} environment - Current environment
 * @property {string} version - API version
 * @property {Object} services - Individual service statuses
 * @property {ServiceStatusData} services.mongodb - MongoDB status
 * @property {ServiceStatusData} services.email - Email service status
 * @property {ServiceStatusData} services.ftp - FTP service status
 */

/**
 * Represents the health status of an individual service.
 */
class ServiceStatus {
  /**
   * @param {ServiceStatusData} data
   */
  constructor(data = {}) {
    /** @type {HealthStatus} */
    this.status = data.status || 'unhealthy';
    /** @type {number|undefined} */
    this.latency = data.latency;
    /** @type {string|undefined} */
    this.error = data.error;
  }

  /**
   * Check if the service is healthy
   * @returns {boolean}
   */
  isHealthy() {
    return this.status === 'healthy';
  }

  /**
   * Get formatted latency string
   * @returns {string}
   */
  getLatencyDisplay() {
    if (this.latency === undefined) return 'N/A';
    return `${this.latency}ms`;
  }

  /**
   * Create from JSON response
   * @param {ServiceStatusData} json
   * @returns {ServiceStatus}
   */
  static fromJSON(json) {
    return new ServiceStatus(json);
  }
}

/**
 * Represents the detailed health status of the API including all services.
 */
class Health {
  /**
   * @param {DetailedHealthData} data
   */
  constructor(data = {}) {
    /** @type {boolean} */
    this.success = data.success || false;
    /** @type {HealthStatus} */
    this.status = data.status || 'unhealthy';
    /** @type {number} */
    this.uptime = data.uptime || 0;
    /** @type {string} */
    this.timestamp = data.timestamp || new Date().toISOString();
    /** @type {string} */
    this.environment = data.environment || 'unknown';
    /** @type {string} */
    this.version = data.version || 'unknown';
    /** @type {ServiceStatus} */
    this.mongodb = new ServiceStatus(data.services?.mongodb);
    /** @type {ServiceStatus} */
    this.email = new ServiceStatus(data.services?.email);
    /** @type {ServiceStatus} */
    this.ftp = new ServiceStatus(data.services?.ftp);
  }

  /**
   * Check if the overall system is healthy
   * @returns {boolean}
   */
  isHealthy() {
    return this.status === 'healthy';
  }

  /**
   * Check if the system is degraded
   * @returns {boolean}
   */
  isDegraded() {
    return this.status === 'degraded';
  }

  /**
   * Get formatted uptime string
   * @returns {string}
   */
  getUptimeDisplay() {
    const seconds = Math.floor(this.uptime);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  }

  /**
   * Get all services as an array for iteration
   * @returns {Array<{name: string, status: ServiceStatus}>}
   */
  getServices() {
    return [
      { name: 'MongoDB', status: this.mongodb },
      { name: 'Email', status: this.email },
      { name: 'FTP', status: this.ftp }
    ];
  }

  /**
   * Create from JSON response
   * @param {DetailedHealthData} json
   * @returns {Health}
   */
  static fromJSON(json) {
    return new Health(json);
  }
}

export { Health, ServiceStatus };
