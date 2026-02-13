// managers/auth-manager.js

import { config } from '../config.js';
import { COOKIE } from '../models/index.js';
import { AuthenticationService } from '../services/index.js';
import { cookie } from '../utils/index.js';

/**
 * AuthManager handles authentication state and operations
 */
class AuthManager {
  constructor() {
    /** @type {AuthenticationService} */
    this.authService = new AuthenticationService(config);
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  /**
   * Check if current user is admin
   * @returns {boolean}
   */
  isAdmin() {
    return this.authService.isAdmin();
  }

  /**
   * Login user with credentials
   * @param {string} email
   * @param {string} password
   * @returns {Promise<import('../models/index.js').LoginResponse>}
   */
  async login(email, password) {
    return this.authService.login({ email, password });
  }

  /**
   * Logout user
   */
  logout() {
    this.authService.logout();
  }

  /**
   * Get current user info
   * @returns {Object|null}
   */
  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  /**
   * Get auth token
   * @returns {string|null}
   */
  getToken() {
    return cookie.getCookie(COOKIE.AUTH);
  }
}

export { AuthManager };
