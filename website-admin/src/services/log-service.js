// services/log-service.js

import { Config, Log } from '../models/index.js';
import { HttpClient } from '../utils/index.js';

/**
 * @typedef {Object} LogQueryParams
 * @property {('info'|'warn'|'error'|'debug')} [level] - Filter by log level
 * @property {string} [startDate] - Filter logs from this date
 * @property {string} [endDate] - Filter logs until this date
 * @property {string} [correlationId] - Filter by correlation ID
 * @property {string} [userId] - Filter by user ID
 * @property {string} [method] - Filter by HTTP method
 * @property {string} [path] - Filter by request path
 * @property {number} [page] - Page number
 * @property {number} [limit] - Results per page
 */

/**
 * @typedef {Object} LogsResult
 * @property {Array<Log>} logs - Array of logs
 * @property {number} total - Total number of logs
 * @property {number} page - Current page
 * @property {number} totalPages - Total pages
 */

class LogService {
  /**
   * @param {Config} config
   */
  constructor(config) {
    /** @type {Config} */
    this.config = config;
    /** @type {HttpClient} */
    this.http = new HttpClient();
    this.logsEndpoint = `${config.apiUrl}/logs`;
  }

  /**
   * Fetches logs with optional filters
   * @param {LogQueryParams} [params] - Query parameters
   * @returns {Promise<LogsResult>}
   */
  async fetchLogs(params = {}) {
    try {
      const queryString = this.buildQueryString(params);
      const url = queryString ? `${this.logsEndpoint}?${queryString}` : this.logsEndpoint;
      
      const response = await this.http.get(url);

      if (response.success && response.data) {
        return {
          logs: Log.fromJSONArray(response.data.logs),
          total: response.data.total,
          page: response.data.page,
          totalPages: response.data.totalPages
        };
      } else {
        console.error('Failed to fetch logs:', response.message);
        return { logs: [], total: 0, page: 1, totalPages: 0 };
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }

  /**
   * Fetches a single log by ID
   * @param {string} logId
   * @returns {Promise<Log|null>}
   */
  async getLogById(logId) {
    try {
      const response = await this.http.get(`${this.logsEndpoint}/${logId}`);

      if (response.success && response.data) {
        return Log.fromJSON(response.data);
      } else {
        console.error('Failed to fetch log:', response.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching log:', error);
      throw error;
    }
  }

  /**
   * Builds query string from parameters
   * @param {LogQueryParams} params
   * @returns {string}
   */
  buildQueryString(params) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    return queryParams.toString();
  }
}

export { LogService };
