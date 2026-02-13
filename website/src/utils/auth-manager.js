// utils/auth-manager.js

import { cookie } from './index.js';
import { COOKIE } from '../models/index.js';

/**
 * Authentication manager for managing user login state and JWT tokens.
 * Handles token validation, user data extraction, and logout functionality.
 */
export class AuthManager {
  /**
   * Checks if the user is currently authenticated by validating the JWT token.
   * Verifies token existence, decryption, and expiration time.
   * Automatically clears expired tokens from cookies.
   * @returns {boolean} True if user is authenticated with valid token, false otherwise
   */
  isAuthenticated() {
    const token = cookie.getCookie(COOKIE.AUTH);
    if (token === null || token === undefined || token === "") {
      console.warn("No token found");
      return false;
    }
    const tokenData = cookie.decryptJwt(token);
    if (tokenData) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (tokenData.exp > currentTime) {
        return true;
      } else {
        console.warn("Token expired");
        cookie.clearCookie(COOKIE.AUTH);
        return false;
      }
    } else {
      console.warn("No token data found");
      return false;
    }
  }

  /**
   * Logs out the current user by clearing the authentication token cookie.
   * Redirects to the specified URL after successful logout.
   * Warns if attempting to logout when no token exists.
   * @param {string} redirectUrl
   */
  logout(redirectUrl) {
    const token = cookie.getCookie(COOKIE.AUTH);
    if (token !== null && token !== undefined && token !== "") {
      cookie.clearCookie(COOKIE.AUTH);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } else {
      console.warn("No token found. User is not logged in.");
    }
  }
}