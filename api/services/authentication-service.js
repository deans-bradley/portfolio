import jwt from 'jsonwebtoken';
import User from '../schemas/user-schema.js';
import config from '../config/config.js';

/**
 * @typedef {Object} SafeUser
 * @property {string} _id - User's unique identifier
 * @property {string} email - User's email address
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {('user'|'admin')} role - User's role
 * @property {boolean} isActive - Whether the user is active
 * @property {boolean} emailVerified - Whether the user's email is verified
 * @property {Date} [lastLogin] - User's last login date
 * @property {Date} createdAt - User creation timestamp
 * @property {Date} updatedAt - User update timestamp
 */

/**
 * @typedef {Object} UserData
 * @property {string} email - User's email address
 * @property {string} password - User's password
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {('user'|'admin')} [role='user'] - User's role
 */

/**
 * @typedef {Object} AuthResponse
 * @property {SafeUser} user - The authenticated user object
 * @property {string} token - JWT authentication token
 */

/**
 * @typedef {Object} JwtPayload
 * @property {string} userId - User's unique identifier
 * @property {string} role - User's role
 * @property {number} iat - Issued at timestamp
 * @property {number} exp - Expiration timestamp
 * @property {string} iss - Token issuer
 */

/**
 * Service class for handling user authentication operations.
 * Provides methods for user registration, login, token management, and password changes.
 * @class AuthenticationService
 */
class AuthenticationService {
  /**
   * Generates a JWT token for the specified user.
   * @param {string} userId - The user's unique identifier
   * @param {('user'|'admin')} role - The user's role
   * @returns {string} The generated JWT token
   */
  generateToken(userId, role) {
    return jwt.sign(
      {
        userId,
        role,
        iat: Math.floor(Date.now() / 1000)
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn || '7d',
        issuer: config.jwt.issuer || 'pcdg'
      }
    );
  }

  /**
   * Verifies a JWT token and returns its decoded payload.
   * @param {string} token - The JWT token to verify
   * @returns {JwtPayload} The decoded token payload
   * @throws {Error} Throws if the token has expired
   * @throws {Error} Throws if the token is invalid
   * @throws {Error} Throws if token verification fails
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Registers a new user in the system.
   * @async
   * @param {UserData} userData - The user registration data
   * @returns {Promise<AuthResponse>} The created user and authentication token
   * @throws {Error} Throws if a user with the email already exists
   * @throws {Error} Throws if validation fails
   */
  async register(userData) {
    try {
      const { email, password, firstName, lastName, role = 'user' } = userData;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const user = new User({
        email,
        password,
        firstName,
        lastName,
        role
      });

      await user.save();

      const token = this.generateToken(user._id, user.role);

      return {
        user: user.toSafeObject(),
        token
      };
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        throw new Error(messages.join('. '));
      }
      throw error;
    }
  }

  /**
   * Authenticates a user with email and password.
   * @async
   * @param {string} email - The user's email address
   * @param {string} password - The user's password
   * @returns {Promise<AuthResponse>} The authenticated user and token
   * @throws {Error} Throws if credentials are invalid
   * @throws {Error} Throws if the account has been deactivated
   */
  async login(email, password) {
    try {
      const user = await User.findByEmailWithPassword(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.isActive) {
        throw new Error('Account has been deactivated');
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      user.lastLogin = new Date();
      await user.save();

      const token = this.generateToken(user._id, user.role);

      return {
        user: user.toSafeObject(),
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a user by their unique identifier.
   * @async
   * @param {string} userId - The user's unique identifier
   * @returns {Promise<SafeUser>} The user object without sensitive data
   * @throws {Error} Throws if the user is not found
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user.toSafeObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates a new authentication token for an existing user.
   * @async
   * @param {string} userId - The user's unique identifier
   * @returns {Promise<AuthResponse>} The user and new authentication token
   * @throws {Error} Throws if the user is not found or inactive
   */
  async refreshToken(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const token = this.generateToken(user._id, user.role);
      return {
        user: user.toSafeObject(),
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Changes a user's password.
   * @async
   * @param {string} userId - The user's unique identifier
   * @param {string} currentPassword - The user's current password
   * @param {string} newPassword - The new password to set
   * @returns {Promise<{message: string}>} Success message
   * @throws {Error} Throws if user is not found
   * @throws {Error} Throws if current password is incorrect
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      user.password = newPassword;
      await user.save();

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthenticationService();