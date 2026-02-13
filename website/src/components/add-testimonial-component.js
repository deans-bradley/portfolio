// components/add-testimonial-component.js

import { $ } from '../utils/jquery-helper.js';
import { Component } from './component.js';
import { Config, CreateTestimonial } from '../models/index.js';
import { TestimonialService } from '../services/index.js';

export class AddTestimonialComponent extends Component {
  /**
   * @param {HTMLElement|jQuery} element
   * @param {TestimonialService} testimonialService
   * @param {Config} config
   * @param {Object} options
   * @param {Function} [options.onClose] - Callback when form is closed
   * @param {Function} [options.onSubmit] - Callback when testimonial is submitted successfully
   */
  constructor(element, testimonialService, config, options = {}) {
    super(element, config, options);

    /** @type {TestimonialService} */
    this.testimonialService = testimonialService;

    /** @type {boolean} */
    this.isSubmitted = false;

    this.init();
  }

  /**
   * @override
   * @returns {string}
   */
  getComponentTemplate() {
    return `
      <div class="add-testimonial-form-container">
        <div class="add-testimonial-header">
          <h3 class="add-testimonial-title">Add Your Testimonial</h3>
          <button type="button" class="add-testimonial-close-btn" aria-label="Close form">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form id="add-testimonial-form" class="add-testimonial-form" novalidate>
          <div class="form-row">
            <div class="form-group">
              <label for="firstName" class="form-label">First Name <span class="required">*</span></label>
              <input type="text" id="firstName" name="firstName" class="form-input" required maxlength="50" />
              <span class="form-error" data-field="firstName"></span>
            </div>
            <div class="form-group">
              <label for="lastName" class="form-label">Last Name <span class="required">*</span></label>
              <input type="text" id="lastName" name="lastName" class="form-input" required maxlength="50" />
              <span class="form-error" data-field="lastName"></span>
            </div>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email <span class="required">*</span></label>
            <input type="email" id="email" name="email" class="form-input" required />
            <span class="form-error" data-field="email"></span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="company" class="form-label">Company</label>
              <input type="text" id="company" name="company" class="form-input" maxlength="100" />
              <span class="form-error" data-field="company"></span>
            </div>
            <div class="form-group">
              <label for="jobTitle" class="form-label">Job Title</label>
              <input type="text" id="jobTitle" name="jobTitle" class="form-input" maxlength="100" />
              <span class="form-error" data-field="jobTitle"></span>
            </div>
          </div>

          <div class="form-group">
            <label for="linkedinProfileUrl" class="form-label">LinkedIn Profile URL</label>
            <input type="url" id="linkedinProfileUrl" name="linkedinProfileUrl" class="form-input" placeholder="https://www.linkedin.com/in/username" />
            <span class="form-error" data-field="linkedinProfileUrl"></span>
          </div>

          <div class="form-group">
            <label for="avatar" class="form-label">Profile Photo</label>
            <div class="avatar-upload">
              <div class="avatar-preview" id="avatar-preview">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div class="avatar-upload-controls">
                <input type="file" id="avatar" name="avatar" class="avatar-input" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" />
                <label for="avatar" class="btn btn-secondary btn-small">Choose Photo</label>
                <button type="button" class="btn btn-secondary btn-small remove-avatar-btn" style="display: none;">Remove</button>
                <span class="avatar-hint">Max 2MB. PNG, JPG, GIF, or WebP.</span>
              </div>
            </div>
            <span class="form-error" data-field="avatar"></span>
          </div>

          <div class="form-group">
            <label for="message" class="form-label">Your Testimonial <span class="required">*</span></label>
            <textarea id="message" name="message" class="form-input form-textarea" required maxlength="250" rows="4" placeholder="Share your experience working with me..."></textarea>
            <div class="form-helper">
              <span class="form-error" data-field="message"></span>
              <span class="char-count"><span id="message-count">0</span>/250</span>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary submit-btn">Submit Testimonial</button>
          </div>
        </form>

        <div class="add-testimonial-success" style="display: none;">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h3 class="success-title">Thank You!</h3>
          <p class="success-message">Your testimonial has been submitted successfully. It will be reviewed and published once approved.</p>
          <button type="button" class="btn btn-primary close-success-btn">Back to Testimonials</button>
        </div>
      </div>
    `;
  }

  /**
   * @override
   * @returns {this}
   */
  cacheElements() {
    this.elements = {
      form: this.element.find('#add-testimonial-form'),
      closeBtn: this.element.find('.add-testimonial-close-btn'),
      cancelBtn: this.element.find('.cancel-btn'),
      submitBtn: this.element.find('.submit-btn'),
      successContainer: this.element.find('.add-testimonial-success'),
      closeSuccessBtn: this.element.find('.close-success-btn'),
      messageInput: this.element.find('#message'),
      messageCount: this.element.find('#message-count'),
      avatarInput: this.element.find('#avatar'),
      avatarPreview: this.element.find('#avatar-preview'),
      removeAvatarBtn: this.element.find('.remove-avatar-btn')
    };

    /** @type {string} */
    this.avatarBase64 = '';

    return this;
  }

  /**
   * @override
   * @returns {this}
   */
  bindEvents() {
    // Close button
    this.elements.closeBtn.on('click', () => this.close());
    this.elements.cancelBtn.on('click', () => this.close());
    this.elements.closeSuccessBtn.on('click', () => this.close());

    // Form submission
    this.elements.form.on('submit', (e) => this.handleSubmit(e));

    // Character count for message
    this.elements.messageInput.on('input', () => {
      const count = this.elements.messageInput.val().length;
      this.elements.messageCount.text(count);
    });

    // Clear error on input
    this.element.find('.form-input').on('input', (e) => {
      const $input = $(e.currentTarget);
      this.clearFieldError($input.attr('name'));
    });

    // Avatar upload
    this.elements.avatarInput.on('change', (e) => this.handleAvatarChange(e));
    this.elements.removeAvatarBtn.on('click', () => this.removeAvatar());

    // Close on escape key
    $(document).on('keydown.addTestimonial', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });

    return this;
  }

  /**
   * Handle form submission
   * @param {Event} e
   */
  async handleSubmit(e) {
    e.preventDefault();

    // Clear all previous errors
    this.clearAllErrors();

    // Get form data
    const formData = this.getFormData();
    const createTestimonial = new CreateTestimonial(formData);

    // Validate
    const validation = createTestimonial.validate();
    if (!validation.isValid) {
      this.showValidationErrors(validation.errors);
      return;
    }

    // Submit
    this.setSubmitting(true);

    try {
      await this.testimonialService.createTestimonial(createTestimonial.toJSON());
      this.isSubmitted = true;
      this.showSuccess();

      if (this.options.onSubmit) {
        this.options.onSubmit();
      }
    } catch (error) {
      console.error('Failed to submit testimonial:', error);
      let message = 'Please try again.';
      try {
        const errorData = JSON.parse(error.message);
        message = errorData.message || message;
      } catch {
        message = error.message || message;
      }
      this.showFormError(`Failed to submit testimonial. ${message}`);
    } finally {
      this.setSubmitting(false);
    }
  }

  /**
   * Handle avatar file selection
   * @param {Event} e
   */
  handleAvatarChange(e) {
    const file = e.target.files?.[0];
    this.clearFieldError('avatar');

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      this.avatarBase64 = event.target.result;
      this.elements.avatarPreview.html(`<img src="${this.avatarBase64}" alt="Avatar preview" />`);
      this.elements.removeAvatarBtn.show();
    };
    reader.onerror = () => {
      this.showFieldError('avatar', 'Failed to read image file');
    };
    reader.readAsDataURL(file);
  }

  /**
   * Remove the selected avatar
   */
  removeAvatar() {
    this.avatarBase64 = '';
    this.elements.avatarInput.val('');
    this.elements.avatarPreview.html(`
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    `);
    this.elements.removeAvatarBtn.hide();
    this.clearFieldError('avatar');
  }

  /**
   * Show error for a specific field
   * @param {string} fieldName
   * @param {string} message
   */
  showFieldError(fieldName, message) {
    const $error = this.element.find(`[data-field="${fieldName}"]`);
    const $input = this.element.find(`[name="${fieldName}"]`);
    
    $error.text(message).addClass('visible');
    $input.addClass('has-error');
  }

  /**
   * Get form data as object
   * @returns {Object}
   */
  getFormData() {
    const form = this.elements.form[0];
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Replace file input with base64 string
    delete data.avatar;
    if (this.avatarBase64) {
      data.avatar = this.avatarBase64;
    }
    
    return data;
  }

  /**
   * Show validation errors on form fields
   * @param {Object<string, string>} errors
   */
  showValidationErrors(errors) {
    Object.entries(errors).forEach(([field, message]) => {
      const $error = this.element.find(`[data-field="${field}"]`);
      const $input = this.element.find(`[name="${field}"]`);
      
      $error.text(message).addClass('visible');
      $input.addClass('has-error');
    });

    // Focus first error field
    const firstErrorField = Object.keys(errors)[0];
    this.element.find(`[name="${firstErrorField}"]`).focus();
  }

  /**
   * Clear error for a specific field
   * @param {string} fieldName
   */
  clearFieldError(fieldName) {
    const $error = this.element.find(`[data-field="${fieldName}"]`);
    const $input = this.element.find(`[name="${fieldName}"]`);
    
    $error.text('').removeClass('visible');
    $input.removeClass('has-error');
  }

  /**
   * Clear all form errors
   */
  clearAllErrors() {
    this.element.find('.form-error').text('').removeClass('visible');
    this.element.find('.form-input').removeClass('has-error');
    this.element.find('.form-error-general').remove();
  }

  /**
   * Show general form error
   * @param {string} message
   */
  showFormError(message) {
    let $errorElement = this.element.find('.form-error-general');
    if ($errorElement.length) {
      $errorElement.text(message);
    } else {
      this.elements.form.prepend(`<div class="form-error-general">${message}</div>`);
      $errorElement = this.element.find('.form-error-general');
    }
    $errorElement[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * Set submitting state
   * @param {boolean} isSubmitting
   */
  setSubmitting(isSubmitting) {
    this.elements.submitBtn.prop('disabled', isSubmitting);
    this.elements.cancelBtn.prop('disabled', isSubmitting);
    
    if (isSubmitting) {
      this.elements.submitBtn.html('<span class="btn-spinner"></span> Submitting...');
    } else {
      this.elements.submitBtn.text('Submit Testimonial');
    }
  }

  /**
   * Show success state
   */
  showSuccess() {
    this.elements.form.hide();
    this.elements.successContainer.show();
    
    // Scroll to the success message
    this.elements.successContainer[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Close the component
   */
  close() {
    // Unbind escape key handler
    $(document).off('keydown.addTestimonial');

    if (this.options.onClose) {
      this.options.onClose(this.isSubmitted);
    }

    this.destroy();
  }
}