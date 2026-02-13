// utils/jquery-helper.js

/**
 * Validates that jQuery is available in the global scope.
 * Logs an error to the console if jQuery is not found.
 * 
 * This check is essential in WordPress environments where jQuery
 * loading can vary based on theme configuration and plugin conflicts.
 */
if (!window.jQuery) {
  console.error('jQuery is not loaded! Make sure jQuery is enqueued.');
}

/**
 * Exported jQuery shorthand reference ($)
 * 
 * Provides the familiar $ syntax for jQuery operations in ES6 modules.
 * This export allows you to use: import { $ } from './helpers/jquery-helper.js'
 * 
 * @constant {Object|undefined} $ - jQuery object or undefined if not loaded
 * @example
 * import { $ } from './helpers/jquery-helper.js';
 * $('#myElement').hide();
 */
export const $ = window.jQuery;

/**
 * Exported full jQuery reference
 * 
 * Provides the full jQuery object reference for cases where you prefer
 * the explicit jQuery syntax or need to avoid conflicts with other libraries.
 * 
 * @constant {Object|undefined} jQuery - jQuery object or undefined if not loaded
 * @example
 * import { jQuery } from './helpers/jquery-helper.js';
 * jQuery('#myElement').fadeIn();
 */
export const jQuery = window.jQuery;