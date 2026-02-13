import { User } from '../user.js';

/**
 * @typedef {Object} LoginResponseData
 * @property {User} user
 * @property {string} token
 */

class LoginResponse {
  /** @param {LoginResponseData} data */
  constructor(data) {
    this.user = new User(data.user);
    this.token = data.token;
  }
}

export { LoginResponse };