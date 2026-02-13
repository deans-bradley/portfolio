// utils/cookie-helper.js

/**
 * Cookie management utility for handling browser cookies and JWT token operations.
 * Provides methods for JWT decoding, cookie setting, and cookie clearing.
 */
export class CookieHelper {
  /**
   * Decodes and parses a JWT (JSON Web Token) from a cookie value.
   * Extracts the payload portion of the JWT and decodes it from base64.
   * Handles URL-safe base64 encoding by replacing URL-safe characters.
   * @param {string} cookieValue - The JWT token string to decode
   * @returns {Object} Parsed JWT payload containing token claims
   * @throws {Error} If JWT doesn't have exactly 3 parts (header.payload.signature)
   */
  decryptJwt(cookieValue) {
    const parts = cookieValue.split('.');
    if (parts.length !== 3) {
        throw new Error('JWT does not have 3 parts');
    }
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload);  
  }

  /**
   * Sets a cookie with the specified name, value, expiration, and path.
   * Creates a cookie that expires after the specified number of days.
   * @param {string} name - The name of the cookie
   * @param {string} value - The value to store in the cookie
   * @param {number} [exp=30] - Expiration time in days from now
   * @param {string} [path='/'] - The path where the cookie is accessible
   */
  setCookie(name, value, exp = 30, path = '/') {
    const date = new Date();
    date.setTime(date.getTime() + (exp * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=${path}`;
  }

  /**
   * Removes a cookie by setting its expiration date to the past.
   * This effectively deletes the cookie from the browser.
   * @param {string} name - The name of the cookie to remove
   */
  clearCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  /**
   * Retrieves the value of a specific cookie by name.
   * Parses the document.cookie string to find the requested cookie.
   * @param {string} name - The name of the cookie to retrieve
   * @returns {string|null} The cookie value if found, null if not found
   */
  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
}

/**
 * Factory function for creating CookieHelper instances.
 * Enables dependency injection and easier testing.
 * @returns {CookieHelper} A new instance of the CookieHelper class
 */
export function createCookieHelper() {
  return new CookieHelper();
}

// Export singleton instance
export const cookie = new CookieHelper();