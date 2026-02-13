/**
 * @typedef {Object} UserData
 * @property {string} id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} role
 * @property {boolean} isActive
 * @property {boolean} emailVerified
 * @property {string} lastLogin
 * @property {string} createdAt
 * @property {string} updatedAt
 */

class User {
  /**
   * Create a new User instance
   * @param {UserData} data - The user data
   */
  constructor(data = {}) {
    this.id = data.id || data._id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.isActive = data.isActive;
    this.emailVerified = data.emailVerified;
    this.lastLogin = data.lastLogin;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

export { User };
