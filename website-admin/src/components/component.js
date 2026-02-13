// components/component.js

import { Config } from '../models/index.js';
import { $ } from '../utils/index.js';

/**
 * Base Component class providing common functionality for all UI components.
 * Implements a lifecycle pattern with template rendering, element caching,
 * event binding, data loading, and rendering phases.
 */
export class Component {
  /**
   * Creates a new Component instance
   * @param {HTMLElement|jQuery} element - The root element or jQuery wrapper
   * @param {Config} config - Application configuration
   */
  constructor(element, config) {
    /** @type {jQuery} */
    this.element = element instanceof $ ? element : $(element);
    /** @type {Config} */
    this.config = config;
    /** @type {Object} */
    this.elements = {};
  }

  /**
   * Initialize component lifecycle
   * Override in subclasses to customize initialization order
   * @returns {Promise<this>}
   */
  async init() {
    this.setupContent();
    this.cacheElements();
    this.bindEvents();
    await this.loadData();
    this.render();
    return this;
  }

  /**
   * Set up initial HTML content
   * @returns {this}
   */
  setupContent() {
    const template = this.getComponentTemplate();
    if (template) {
      this.element.html(template);
    }
    return this;
  }

  /**
   * Get the component's HTML template
   * @abstract
   * @returns {string}
   */
  getComponentTemplate() {
    return '';
  }

  /**
   * Cache frequently accessed DOM elements
   * @abstract
   * @returns {this}
   */
  cacheElements() {
    return this;
  }

  /**
   * Bind event handlers
   * @abstract
   * @returns {this}
   */
  bindEvents() {
    return this;
  }

  /**
   * Load data from APIs or other sources
   * @abstract
   * @returns {Promise<this>}
   */
  async loadData() {
    return this;
  }

  /**
   * Render the component's content
   * @abstract
   * @returns {this}
   */
  render() {
    return this;
  }

  /**
   * Show loading state on the element
   * @param {boolean} isLoading
   * @returns {this}
   */
  renderLoadingState(isLoading) {
    this.element.attr('aria-busy', isLoading ? 'true' : 'false');
    return this;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show an error message
   * @param {string} message
   * @param {jQuery} [container] - Container to show error in (defaults to this.element)
   */
  showError(message, container = null) {
    const $container = container || this.element;
    $container.find('.error-message').remove();
    $container.prepend(`<p class="error-message" style="color: var(--pico-del-color);">${this.escapeHtml(message)}</p>`);
  }

  /**
   * Clear error messages
   * @param {jQuery} [container]
   */
  clearErrors(container = null) {
    const $container = container || this.element;
    $container.find('.error-message').remove();
  }

  /**
   * Show a success message
   * @param {string} message
   * @param {jQuery} [container]
   */
  showSuccess(message, container = null) {
    const $container = container || this.element;
    $container.find('.success-message').remove();
    $container.prepend(`<p class="success-message" style="color: var(--pico-ins-color);">${this.escapeHtml(message)}</p>`);
  }

  /**
   * Clear success messages
   * @param {jQuery} [container]
   */
  clearSuccess(container = null) {
    const $container = container || this.element;
    $container.find('.success-message').remove();
  }

  /**
   * Destroy the component and clean up
   */
  destroy() {
    this.element.empty();
    this.elements = {};
  }
}
