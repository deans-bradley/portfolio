// components/component.js

import { $ } from '../utils/jquery-helper.js';

/**
 * @typedef {Object} BaseComponentState
 * @property {boolean} isLoading
 * @property {Error|null} error
 */

/**
 * Abstract base component class providing common functionality for all components.
 * Subclasses should override the abstract methods to provide specific implementations.
 * @abstract
 */
export class Component {
  /**
   * @param {HTMLElement|jQuery} element - The DOM element to attach the component to
   * @param {Object} [config={}] - Optional configuration object containing API URLs and other settings
   * @param {Object} [options={}] - Additional options for the component
   */
  constructor(element, config = {}, options = {}) {
    if (new.target === Component) {
      throw new Error('Component is an abstract class and cannot be instantiated directly');
    }
    
    this.element = $(element);
    this.config = config;
    this.options = options;
    
    /** @type {Object} Cached DOM elements */
    this.elements = {};
  }

  /**
   * Initializes the component by setting up content, events, and loading data.
   * Call this method after the constructor to start the component lifecycle.
   * @returns {this}
   */
  init() {
    this.setupContent();
    this.bindEvents();
    this.loadData();
    this.render();
    return this;
  }

  // ============================================
  // ABSTRACT FUNCTIONS
  // ============================================

  /**
   * Returns the HTML template for the component.
   * Override this method to provide component-specific markup.
   * @returns {string} HTML template string
   */
  getComponentTemplate() {
    return '';
  }

  /**
   * Caches frequently used DOM elements for better performance.
   * Should populate this.elements with jQuery-wrapped elements.
   * @returns {this}
   */
  cacheElements() {
    return this;
  }

  /**
   * Binds event listeners for user interactions.
   * @returns {this}
   */
  bindEvents() {
    return this;
  }

  /**
   * Loads initial data for the component (e.g., from an API).
   * @returns {Promise<this>|this}
   */
  loadData() {
    return this;
  }

  /**
   * Renders the component content
   */
  render() {
    return this;
  }

  // ============================================
  // CONTENT SETUP
  // ============================================

  /**
   * Sets up the component content by injecting the template and caching DOM elements.
   * @returns {this}
   */
  setupContent() {
    this.element.html(this.getComponentTemplate());
    this.cacheElements();
    return this;
  }

  // ============================================
  // LOADING STATE RENDERING
  // ============================================

  /**
   * Renders the loading state UI based on the current state.
   * @param {boolean} isLoading - Flag to indicate whether the component should render loading state
   * @returns {this}
   */
  renderLoadingState(isLoading) {
    if (isLoading) {
      this.setLoadingState();
    } else {
      this.clearLoadingState();
    }
    return this;
  }

  /**
   * Sets visual loading indicators on the component.
   * Override this method to customize loading appearance.
   * @returns {this}
   */
  setLoadingState() {
    this.element.attr('aria-busy', 'true');
    return this;
  }

  /**
   * Clears visual loading indicators from the component.
   * Override this method to match custom loading appearance.
   * @returns {this}
   */
  clearLoadingState() {
    this.element.removeAttr('aria-busy');
    return this;
  }

  // ============================================
  // LIFECYCLE FUNCTIONS
  // ============================================

  /**
   * Shows the component with a fade-in animation.
   * @returns {this}
   */
  show() {
    this.element.fadeIn();
    return this;
  }
    
  /**
   * Hides the component with a fade-out animation.
   * @returns {this}
   */
  hide() {
    this.element.fadeOut();
    return this;
  }
    
  /**
   * Destroys the component and cleans up event listeners
   * @returns {this}
   */
  destroy() {
    this.element.off();
    this.element.empty();
    this.elements = {};
    return this;
  }
}