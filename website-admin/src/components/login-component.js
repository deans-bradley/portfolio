// components/login-component.js

import { $ } from '../utils/jquery-helper.js';
import { Component } from './component.js';
import { Config } from '../models/index.js';
import { AuthenticationService } from '../services/index.js';

/**
 * LoginComponent handles user authentication
 */
export class LoginComponent extends Component {
  /**
   * @param {HTMLElement|jQuery} element
   * @param {AuthenticationService} authService
   * @param {Config} config
   * @param {Function} onLoginSuccess - Callback when login succeeds
   */
  constructor(element, authService, config, onLoginSuccess) {
    super(element, config);
    
    /** @type {AuthenticationService} */
    this.authService = authService;
    /** @type {Function} */
    this.onLoginSuccess = onLoginSuccess;
    /** @type {boolean} */
    this.isSubmitting = false;

    this.init();
  }

  /**
   * @override
   * @returns {string}
   */
  getComponentTemplate() {
    return `
      <article>
        <header>
          <h2>Admin Login</h2>
        </header>
        <form id="login-form">
          <label for="email">
            Email
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Enter your email"
              autocomplete="email"
              required
            />
          </label>
          <label for="password">
            Password
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            />
          </label>
          <div id="login-error"></div>
          <button type="submit" id="login-btn">Login</button>
        </form>
      </article>
    `;
  }

  /**
   * @override
   * @returns {this}
   */
  cacheElements() {
    this.elements = {
      form: this.element.find('#login-form'),
      email: this.element.find('#email'),
      password: this.element.find('#password'),
      submitBtn: this.element.find('#login-btn'),
      errorContainer: this.element.find('#login-error')
    };
    return this;
  }

  /**
   * @override
   * @returns {this}
   */
  bindEvents() {
    this.elements.form.on('submit', (e) => this.handleSubmit(e));
    return this;
  }

  /**
   * Handle form submission
   * @param {Event} e
   */
  async handleSubmit(e) {
    e.preventDefault();

    if (this.isSubmitting) return;

    this.clearErrors(this.elements.errorContainer);

    const email = this.elements.email.val().trim();
    const password = this.elements.password.val();

    // Basic validation
    if (!email || !password) {
      this.showError('Please enter both email and password', this.elements.errorContainer);
      return;
    }

    this.setSubmitting(true);

    try {
      const loginResponse = await this.authService.login({ email, password });
      
      // Check if user is admin
      if (loginResponse.user && this.authService.isAdmin()) {
        if (this.onLoginSuccess) {
          this.onLoginSuccess(loginResponse);
        }
      } else {
        this.authService.logout();
        this.showError('Access denied. Admin privileges required.', this.elements.errorContainer);
      }
    } catch (error) {
      const errorMessage = this.parseError(error);
      this.showError(errorMessage, this.elements.errorContainer);
    } finally {
      this.setSubmitting(false);
    }
  }

  /**
   * Parse error response
   * @param {Error} error
   * @returns {string}
   */
  parseError(error) {
    if (error.message) {
      try {
        const parsed = JSON.parse(error.message);
        return parsed.message || 'Login failed. Please try again.';
      } catch {
        return error.message || 'Login failed. Please try again.';
      }
    }
    return 'Login failed. Please try again.';
  }

  /**
   * Set submitting state
   * @param {boolean} isSubmitting
   */
  setSubmitting(isSubmitting) {
    this.isSubmitting = isSubmitting;
    this.elements.submitBtn.attr('aria-busy', isSubmitting ? 'true' : 'false');
    this.elements.submitBtn.prop('disabled', isSubmitting);
    this.elements.email.prop('disabled', isSubmitting);
    this.elements.password.prop('disabled', isSubmitting);
  }

  /**
   * @override
   * @returns {this}
   */
  render() {
    // Focus email field on render
    this.elements.email.focus();
    return this;
  }
}
