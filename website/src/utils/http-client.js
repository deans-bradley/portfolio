// util/http-client.js

import { cookie } from './cookie-helper.js';
import { COOKIE } from '../models/index.js';

/**
 * HTTP client for making authenticated and unauthenticated API requests.
 * Provides a consistent interface for all HTTP operations with automatic
 * authentication token handling and response parsing.
 */
export class HttpClient {
  /**
   * Constructs HTTP headers for API requests with optional authentication.
   * Automatically includes Content-Type and Authorization headers based on requirements.
   * @param {boolean} requiresAuth - Whether to include authentication token in headers
   * @returns {Object} Headers object with Content-Type and optionally Authorization
   */
  buildHeaders(requiresAuth = true) {
    const headers = {
      "Content-Type": "application/json"
    };

    if (requiresAuth) {
      const token = cookie.getCookie(COOKIE.AUTH);
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Processes and parses fetch response, handling various response scenarios.
   * Throws errors for non-OK responses and invalid JSON.
   * @param {Response} response - The fetch Response object to process
   * @returns {Object|null} Parsed JSON object or null for empty responses
   * @throws {Error} HTTP errors or JSON parsing errors
   */
  async handleResponse(response) {
    const text = await response.text();
    
    if (!response.ok) {
      throw new Error(text || `HTTP Error: ${response.status}`);
    }
    
    if (text === "") {
      return null;
    }
    
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("Invalid JSON response");
    }
  }

  /**
   * Core HTTP request method that handles all API requests.
   * Builds headers, constructs fetch options, and processes responses.
   * @param {string} endpoint - The API endpoint URL to request
   * @param {Object} options - Request configuration options
   * @param {string} [options.method='GET'] - HTTP method (GET, POST, PUT, etc.)
   * @param {Object|null} [options.body=null] - Request body data
   * @param {boolean} [options.requiresAuth=true] - Whether authentication is required
   * @returns {Promise<Object|null>} Parsed response data or null
   * @throws {Error} Network errors, HTTP errors, or JSON parsing errors
   */
  async request(endpoint, options = {}) {
    const { method = 'GET', body = null, requiresAuth = true } = options;
    
    try {
      const headers = this.buildHeaders(requiresAuth);
      
      const fetchOptions = {
        method,
        headers
      };
      
      if (body !== null) {
        fetchOptions.body = JSON.stringify(body);
      }
      
      const response = await fetch(endpoint, fetchOptions);
      return await this.handleResponse(response);
      
    } catch (error) {
      console.error(`Error with ${method} request to ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Performs HTTP GET request to retrieve data from the specified endpoint.
   * @param {string} endpoint - The API endpoint URL
   * @param {boolean} [requiresAuth=true] - Whether authentication token is required
   * @returns {Promise<Object|null>} Response data from the server
   */
  async get(endpoint, requiresAuth = true) {
    return this.request(endpoint, { method: 'GET', requiresAuth });
  }

  /**
   * Performs HTTP POST request to create new resources or submit data.
   * @param {string} endpoint - The API endpoint URL
   * @param {Object|null} [data=null] - Data to send in request body
   * @param {boolean} [requiresAuth=true] - Whether authentication token is required
   * @returns {Promise<Object|null>} Response data from the server
   */
  async post(endpoint, data = null, requiresAuth = true) {
    return this.request(endpoint, {
      method: 'POST', 
      body: data ?? {}, 
      requiresAuth 
    });
  }

  /**
   * Performs HTTP PATCH request to partially update existing resources.
   * @param {string} endpoint - The API endpoint URL
   * @param {Object} data - Partial data to update in the resource
   * @param {boolean} [requiresAuth=true] - Whether authentication token is required
   * @returns {Promise<Object|null>} Response data from the server
   */
  async patch(endpoint, data, requiresAuth = true) {
    return this.request(endpoint, { 
      method: 'PATCH', 
      body: data, 
      requiresAuth
    });
  }

  /**
   * Performs HTTP PUT request to fully update or replace existing resources.
   * @param {string} endpoint - The API endpoint URL
   * @param {Object|null} [data=null] - Complete data to replace the resource
   * @param {boolean} [requiresAuth=true] - Whether authentication token is required
   * @returns {Promise<Object|null>} Response data from the server
   */
  async put(endpoint, data = null, requiresAuth = true) {
    return this.request(endpoint, { 
      method: 'PUT', 
      body: data ?? {},
      requiresAuth 
    });
  }

  /**
   * Performs HTTP DELETE request to remove resources from the server.
   * @param {string} endpoint - The API endpoint URL
   * @param {boolean} [requiresAuth=true] - Whether authentication token is required
   * @returns {Promise<Object|null>} Response data from the server
   */
  async delete(endpoint, requiresAuth = true) {
    return this.request(endpoint, { method: 'DELETE', requiresAuth });
  }
}