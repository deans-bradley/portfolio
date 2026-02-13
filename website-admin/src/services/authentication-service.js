// services/authentication-service.js

import { Config, LoginResponse, COOKIE, COOKIE_EXP, COOKIE_PATH } from '../models/index.js';
import { HttpClient, cookie } from '../utils/index.js';

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} password
 */

class AuthenticationService {
  /**
   * @param {Config} config 
   */
  constructor(config) {
    /** @type {Config} */
    this.config = config;
    /** @type {HttpClient} */
    this.http = new HttpClient();
    this.authEndpoint = `${config.apiUrl}/auth`;
  }

  /**
   * Login user with credentials
   * @param {LoginCredentials} credentials
   * @returns {Promise<LoginResponse>}
   */
  async login(credentials) {
    try {
      const response = await this.http.post(
        `${this.authEndpoint}/login`, 
        credentials, 
        false
      );

      if (response.success && response.data) {
        const loginResponse = new LoginResponse(response.data);
        
        // Store token in cookie
        cookie.setCookie(
          COOKIE.AUTH,
          loginResponse.token,
          COOKIE_EXP[COOKIE.AUTH],
          COOKIE_PATH[COOKIE.AUTH]
        );

        return loginResponse;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  /**
   * Logout user by clearing auth cookie
   */
  logout() {
    cookie.clearCookie(COOKIE.AUTH);
  }

  /**
   * Refresh the authentication token
   * @returns {Promise<LoginResponse>}
   */
  async refreshToken() {
    try {
      const response = await this.http.post(`${this.authEndpoint}/refresh`);

      if (response.success && response.data) {
        const loginResponse = new LoginResponse(response.data);
        
        // Update token in cookie
        cookie.setCookie(
          COOKIE.AUTH,
          loginResponse.token,
          COOKIE_EXP[COOKIE.AUTH],
          COOKIE_PATH[COOKIE.AUTH]
        );

        return loginResponse;
      } else {
        throw new Error(response.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Check if user is currently authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = cookie.getCookie(COOKIE.AUTH);
    if (!token) return false;

    try {
      const payload = cookie.decryptJwt(token);
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Get current user from JWT token
   * @returns {Object|null}
   */
  getCurrentUser() {
    const token = cookie.getCookie(COOKIE.AUTH);
    if (!token) return null;

    try {
      const payload = cookie.decryptJwt(token);
      return {
        id: payload.id,
        email: payload.email,
        role: payload.role
      };
    } catch {
      return null;
    }
  }

  /**
   * Check if current user has admin role
   * @returns {boolean}
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}

export { AuthenticationService };
