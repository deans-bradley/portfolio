// models/config.js

/**
 * @typedef {Object} ConfigData
 * @property {string} host - Current hostname from window.location.host
 * @property {string} env - Detected environment ('dev', 'staging', or 'production')
 * @property {string} baseApiUrl - Base URL for API endpoints without version
 * @property {string} apiUrl - Complete API URL including version path
 * @property {string} accessControl - CORS access control setting for API requests
 */

export class Config {
  /** @param {Config} data */
  constructor(data) {
    this.host = data.host;
    this.env = data.env;
    this.baseApiUrl = data.baseApiUrl;
    this.apiUrl = data.apiUrl;
    this.accessControl = data.accessControl;
  }

  /**
   * Validate the config object
   * @throws {Error} When Config is invalid
   */
  validate() {
    if (this.host === null || this.host === undefined || typeof this.host !== 'string') {
      throw new Error('Host cannot be null and must be a valid string');
    }

    if (this.env === null || this.env === undefined || typeof this.env !== 'string') {
      throw new Error('Env cannot be null and must be a valid string');
    }

    if (this.baseApiUrl === null || this.baseApiUrl === undefined || typeof this.baseApiUrl !== 'string') {
      throw new Error('BaseApiUrl cannot be null and must be a valid string');
    }

    if (this.apiUrl === null || this.apiUrl === undefined || typeof this.apiUrl !== 'string') {
      throw new Error('ApiUrl cannot be null and must be a valid string');
    }

    if (this.accessControl === null || this.accessControl === undefined || typeof this.accessControl !== 'string') {
      throw new Error('AccessControl cannot be null and must be a valid string');
    }
  }

  /**
   * Create a Config instance from a plain object
   * @param {ConfigData} data - Plain object data
   * @returns {Config} Config instance
   */
  static fromJSON(data) {
    const config = new Config(data);
    config.validate();
    return config;
  }
}