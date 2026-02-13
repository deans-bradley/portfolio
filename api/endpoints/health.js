import express from 'express';
import mongoose from 'mongoose';
import { authenticate, adminOnly } from '../utils/authentication-helper.js';
import emailService from '../services/email-service.js';
import ftpService from '../services/ftp-service.js';
import config from '../config/config.js';

const router = express.Router();

/**
 * @typedef {Object} ServiceStatus
 * @property {('healthy'|'unhealthy'|'degraded')} status - The service status
 * @property {number} [latency] - Response time in milliseconds
 * @property {string} [error] - Error message if unhealthy
 */

/**
 * @typedef {Object} DetailedHealthResponse
 * @property {boolean} success - Overall success indicator
 * @property {('healthy'|'unhealthy'|'degraded')} status - Overall system status
 * @property {number} uptime - Server uptime in seconds
 * @property {string} timestamp - ISO timestamp
 * @property {string} environment - Current environment
 * @property {Object} services - Individual service statuses
 */

/**
 * Maps mongoose connection ready state to a descriptive string.
 * @param {number} state - Mongoose connection ready state
 * @returns {string} Human-readable connection status
 */
const getMongooseConnectionStatus = (state) => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[state] || 'unknown';
};

/**
 * Checks MongoDB connection health.
 * @async
 * @returns {Promise<ServiceStatus>} MongoDB service status
 */
const checkMongoHealth = async () => {
  const startTime = Date.now();
  
  try {
    const state = mongoose.connection.readyState;
    
    if (state !== 1) {
      return {
        status: 'unhealthy',
        error: `Connection state: ${getMongooseConnectionStatus(state)}`
      };
    }

    // Verify connection with a ping command
    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - startTime;

    return {
      status: 'healthy',
      latency
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

/**
 * Checks Email service connection health.
 * @async
 * @returns {Promise<ServiceStatus>} Email service status
 */
const checkEmailHealth = async () => {
  const startTime = Date.now();
  
  try {
    const isConnected = await emailService.verifyConnection();
    const latency = Date.now() - startTime;

    return {
      status: isConnected ? 'healthy' : 'unhealthy',
      latency,
      ...(isConnected ? {} : { error: 'SMTP connection verification failed' })
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

/**
 * Checks FTP service connection health.
 * @async
 * @returns {Promise<ServiceStatus>} FTP service status
 */
const checkFtpHealth = async () => {
  const startTime = Date.now();
  
  try {
    const isConnected = await ftpService.checkConnection();
    const latency = Date.now() - startTime;

    return {
      status: isConnected ? 'healthy' : 'unhealthy',
      latency,
      ...(isConnected ? {} : { error: 'FTP connection failed' })
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

/**
 * Determines overall system status based on individual service statuses.
 * @param {Object} services - Object containing service statuses
 * @returns {('healthy'|'unhealthy'|'degraded')} Overall system status
 */
const determineOverallStatus = (services) => {
  const statuses = Object.values(services).map(s => s.status);
  
  if (statuses.every(s => s === 'healthy')) {
    return 'healthy';
  }
  
  // MongoDB is critical - if it's down, system is unhealthy
  if (services.mongodb.status === 'unhealthy') {
    return 'unhealthy';
  }
  
  // Other services down means degraded
  if (statuses.some(s => s === 'unhealthy')) {
    return 'degraded';
  }
  
  return 'healthy';
};

// @route   GET /v1/health
// @desc    Public health check - returns basic API status without sensitive data
// @access  Public
router.get('/', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const isHealthy = mongoState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'unhealthy',
    message: isHealthy ? 'API is running' : 'API is experiencing issues',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /v1/health/detailed
// @desc    Detailed health check - returns status of all services
// @access  Admin only
router.get('/detailed', authenticate, adminOnly, async (req, res) => {
  try {
    const [mongoHealth, emailHealth, ftpHealth] = await Promise.all([
      checkMongoHealth(),
      checkEmailHealth(),
      checkFtpHealth()
    ]);

    const services = {
      mongodb: mongoHealth,
      email: emailHealth,
      ftp: ftpHealth
    };

    const overallStatus = determineOverallStatus(services);
    const isHealthy = overallStatus === 'healthy';

    /** @type {DetailedHealthResponse} */
    const response = {
      success: isHealthy,
      status: overallStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: config.env,
      version: config.version,
      services
    };

    res.status(isHealthy ? 200 : 503).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// @route   GET /v1/health/mongodb
// @desc    Check MongoDB connection status
// @access  Admin only
router.get('/mongodb', authenticate, adminOnly, async (req, res) => {
  const health = await checkMongoHealth();
  const isHealthy = health.status === 'healthy';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    service: 'mongodb',
    ...health,
    timestamp: new Date().toISOString()
  });
});

// @route   GET /v1/health/email
// @desc    Check Email service connection status
// @access  Admin only
router.get('/email', authenticate, adminOnly, async (req, res) => {
  const health = await checkEmailHealth();
  const isHealthy = health.status === 'healthy';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    service: 'email',
    ...health,
    timestamp: new Date().toISOString()
  });
});

// @route   GET /v1/health/ftp
// @desc    Check FTP service connection status
// @access  Admin only
router.get('/ftp', authenticate, adminOnly, async (req, res) => {
  const health = await checkFtpHealth();
  const isHealthy = health.status === 'healthy';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    service: 'ftp',
    ...health,
    timestamp: new Date().toISOString()
  });
});

export default router;
