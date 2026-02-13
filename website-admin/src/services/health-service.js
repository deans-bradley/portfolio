// services/health-service.js

import { Config, Health, ServiceStatus } from '../models/index.js';
import { HttpClient } from '../utils/index.js';

/**
 * @typedef {Object} BasicHealthResponse
 * @property {boolean} success - Success indicator
 * @property {string} status - Health status
 * @property {string} message - Status message
 * @property {string} timestamp - ISO timestamp
 */

/**
 * Service for checking API health status.
 * Provides methods for fetching both public and detailed health information.
 */
class HealthService {
  /**
   * @param {Config} config
   */
  constructor(config) {
    /** @type {Config} */
    this.config = config;
    /** @type {HttpClient} */
    this.http = new HttpClient();
    this.healthEndpoint = `${config.apiUrl}/health`;
  }

  /**
   * Fetches the public health status (no auth required)
   * @returns {Promise<BasicHealthResponse>}
   */
  async fetchPublicHealth() {
    try {
      const response = await this.http.get(this.healthEndpoint, false);
      return response;
    } catch (error) {
      console.error('Error fetching public health:', error);
      return {
        success: false,
        status: 'unhealthy',
        message: 'Unable to reach API',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Fetches detailed health status including all services (admin only)
   * @returns {Promise<Health>}
   */
  async fetchDetailedHealth() {
    try {
      const response = await this.http.get(`${this.healthEndpoint}/detailed`);

      if (response) {
        return Health.fromJSON(response);
      } else {
        console.error('Failed to fetch detailed health');
        return new Health({ status: 'unhealthy' });
      }
    } catch (error) {
      console.error('Error fetching detailed health:', error);
      return new Health({ status: 'unhealthy' });
    }
  }

  /**
   * Fetches MongoDB health status (admin only)
   * @returns {Promise<ServiceStatus>}
   */
  async fetchMongoHealth() {
    try {
      const response = await this.http.get(`${this.healthEndpoint}/mongodb`);
      return ServiceStatus.fromJSON(response);
    } catch (error) {
      console.error('Error fetching MongoDB health:', error);
      return new ServiceStatus({ status: 'unhealthy', error: error.message });
    }
  }

  /**
   * Fetches Email service health status (admin only)
   * @returns {Promise<ServiceStatus>}
   */
  async fetchEmailHealth() {
    try {
      const response = await this.http.get(`${this.healthEndpoint}/email`);
      return ServiceStatus.fromJSON(response);
    } catch (error) {
      console.error('Error fetching Email health:', error);
      return new ServiceStatus({ status: 'unhealthy', error: error.message });
    }
  }

  /**
   * Fetches FTP service health status (admin only)
   * @returns {Promise<ServiceStatus>}
   */
  async fetchFtpHealth() {
    try {
      const response = await this.http.get(`${this.healthEndpoint}/ftp`);
      return ServiceStatus.fromJSON(response);
    } catch (error) {
      console.error('Error fetching FTP health:', error);
      return new ServiceStatus({ status: 'unhealthy', error: error.message });
    }
  }
}

export { HealthService };
