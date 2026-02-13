// config.js

import { Config } from './models/index.js';

/**
 * Application configuration module.
 * Handles environment detection, URL building, and API configuration
 * for dev and production environments
 */

/**
 * Detects the current environment based on the browser's hostname.
 * Uses domain patterns to determine if running on production, staging, or dev.
 * @returns {string} Environment name: 'production', 'staging', or 'dev'
 */
function detectEnvironment() {
  const host = window.location.host;
  
  if (host === 'deansbrad.com' || host === 'www.deansbrad.com') {
    return 'production';
  }
  
  return 'dev';
}

/**
 * Retrieves environment-specific API configuration settings.
 * Defines different API endpoints, versions, and CORS settings for each environment.
 * @param {string} env - The detected environment ('dev' or 'production')
 * @returns {Object} API configuration with baseApiUrl, apiVersion, and accessControl settings
 */
function getApiConfig(env) {
  const apiConfigs = {
    dev: {
      baseApiUrl: 'http://localhost:3000',
      apiVersion: 1,
      accessControl: "*"
    },
    production: {
      baseApiUrl: 'htttps://api.deansbrad.com',
      apiVersion: 1,
      accessControl: window.location.origin
    }
  };
  
  return apiConfigs[env] || apiConfigs.dev;
}

/**
 * Creates the complete application configuration object.
 * Combines environment detection, API settings, authentication config,
 * WordPress integration, and URL routing into a single configuration.
 * @returns {Config} Complete application configuration with all settings
 */
function createConfig() {
  const host = window.location.host;
  const env = detectEnvironment();
  const apiConfig = getApiConfig(env);
  
  return Config.fromJSON({
    host,
    env,
    baseApiUrl: apiConfig.baseApiUrl,
    apiVersion: apiConfig.apiVersion,
    apiUrl: `${apiConfig.baseApiUrl}/v${apiConfig.apiVersion}`,
    accessControl: apiConfig.accessControl
  });
}

// Export configuration as a singleton instance
// This ensures the same config object is used throughout the application
export const config = createConfig();

// Development debugging - log configuration in dev environment
if (config.env === 'dev') {
  console.log('App Config:', config);
}