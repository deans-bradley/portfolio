import authenticationService from '../services/authentication-service.js';

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * @typedef {Object} AuthenticatedRequest
 * @property {Object} user - The authenticated user object
 * @property {string} user._id - User's unique identifier
 * @property {string} user.email - User's email address
 * @property {string} user.firstName - User's first name
 * @property {string} user.lastName - User's last name
 * @property {('user'|'admin')} user.role - User's role
 * @property {string} token - The JWT token used for authentication
 */

/**
 * Express middleware that authenticates requests using JWT Bearer tokens.
 * Extracts the token from the Authorization header, verifies it, and attaches
 * the user object and token to the request.
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void|Response>} Calls next() on success or returns 401 response on failure
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Use: Bearer <token>'
      });
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = authenticationService.verifyToken(token);
    const user = await authenticationService.getUserById(decoded.userId);
    
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token'
    });
  }
};

/**
 * Creates an Express middleware that authorizes requests based on user roles.
 * Must be used after the authenticate middleware.
 * @param {...('user'|'admin')} roles - The roles allowed to access the route
 * @returns {function(Request, Response, NextFunction): void|Response} Express middleware function
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Middleware that restricts access to admin users only.
 * @type {function(Request, Response, NextFunction): void|Response}
 */
export const adminOnly = authorize('admin');

/**
 * Alias for the authenticate middleware.
 * @type {function(Request, Response, NextFunction): Promise<void|Response>}
 */
export const authenticatedOnly = authenticate;