// contracts/create-testimonial.js

/**
 * @typedef {Object} CreateTestimonialData
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} [linkedinProfileUrl]
 * @property {string} [company]
 * @property {string} [jobTitle]
 * @property {string} [avatar]
 * @property {string} message
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid
 * @property {Object<string, string>} errors - Field name to error message mapping
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
const BASE64_IMAGE_REGEX = /^data:image\/(jpeg|jpg|png|gif|webp);base64,[A-Za-z0-9+/]+=*$/;
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

class CreateTestimonial {
  /**
   * Create a new CreateTestimonial instance
   * @param {CreateTestimonialData} data - The create testimonial data
   */
  constructor(data = {}) {
    this.firstName = data.firstName?.trim() || '';
    this.lastName = data.lastName?.trim() || '';
    this.email = data.email?.trim().toLowerCase() || '';
    this.linkedinProfileUrl = data.linkedinProfileUrl?.trim() || '';
    this.company = data.company?.trim() || '';
    this.jobTitle = data.jobTitle?.trim() || '';
    this.avatar = data.avatar || '';
    this.message = data.message?.trim() || '';
  }

  /**
   * Validate first name
   * @returns {string|null} Error message or null if valid
   */
  validateFirstName() {
    if (!this.firstName) {
      return 'First name is required';
    }

    if (this.firstName.length < 2 || this.firstName.length > 50) {
      return 'First name must be between 2 and 50 characters';
    }

    return null;
  }

  /**
   * Validate last name
   * @returns {string|null} Error message or null if valid
   */
  validateLastName() {
    if (!this.lastName) {
      return 'Last name is required';
    }

    if (this.lastName.length < 2 || this.lastName.length > 50) {
      return 'Last name must be between 2 and 50 characters';
    }

    return null;
  }

  /**
   * Validate email
   * @returns {string|null} Error message or null if valid
   */
  validateEmail() {
    if (!this.email) {
      return 'Email is required';
    }

    if (!EMAIL_REGEX.test(this.email)) {
      return 'Please provide a valid email';
    }

    return null;
  }

  /**
   * Validate LinkedIn profile URL
   * @returns {string|null} Error message or null if valid
   */
  validateLinkedinProfileUrl() {
    if (!this.linkedinProfileUrl) {
      return null;
    }

    if (!LINKEDIN_REGEX.test(this.linkedinProfileUrl)) {
      return 'Please provide a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)';
    }

    return null;
  }

  /**
   * Validate company
   * @returns {string|null} Error message or null if valid
   */
  validateCompany() {
    if (!this.company) {
      return null;
    }

    if (this.company.length > 100) {
      return 'Company name cannot exceed 100 characters';
    }

    return null;
  }

  /**
   * Validate job title
   * @returns {string|null} Error message or null if valid
   */
  validateJobTitle() {
    if (!this.jobTitle) {
      return null;
    }

    if (this.jobTitle.length > 100) {
      return 'Job title cannot exceed 100 characters';
    }

    return null;
  }

  /**
   * Validate message
   * @returns {string|null} Error message or null if valid
   */
  validateMessage() {
    if (!this.message) {
      return 'Testimonial message is required';
    }

    if (this.message.length > 250) {
      return 'Testimonial message cannot exceed 250 characters';
    }

    return null;
  }

  /**
   * Validate avatar
   * @returns {string|null} Error message or null if valid
   */
  validateAvatar() {
    if (!this.avatar) {
      return null;
    }

    if (!BASE64_IMAGE_REGEX.test(this.avatar)) {
      return 'Avatar must be a valid image (PNG, JPG, GIF, or WebP)';
    }

    // Calculate approximate size of base64 string
    const base64Data = this.avatar.split(',')[1] || '';
    const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
    
    if (sizeInBytes > MAX_AVATAR_SIZE_BYTES) {
      return 'Avatar image must be less than 2MB';
    }

    return null;
  }

  /**
   * Validate all fields and return validation result
   * @returns {ValidationResult} Validation result with errors
   */
  validate() {
    const errors = {};

    const firstNameError = this.validateFirstName();
    if (firstNameError) {
      errors.firstName = firstNameError;
    }

    const lastNameError = this.validateLastName();
    if (lastNameError) {
      errors.lastName = lastNameError;
    }

    const emailError = this.validateEmail();
    if (emailError) {
      errors.email = emailError;
    }

    const linkedinProfileUrlError = this.validateLinkedinProfileUrl();
    if (linkedinProfileUrlError) {
      errors.linkedinProfileUrl = linkedinProfileUrlError;
    }

    const companyError = this.validateCompany();
    if (companyError) {
      errors.company = companyError;
    }

    const jobTitleError = this.validateJobTitle();
    if (jobTitleError) {
      errors.jobTitle = jobTitleError;
    }

    const messageError = this.validateMessage();
    if (messageError) {
      errors.message = messageError;
    }

    const avatarError = this.validateAvatar();
    if (avatarError) {
      errors.avatar = avatarError;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Convert to plain JSON object for serialization
   * @returns {CreateTestimonialData} Plain object representation
   */
  toJSON() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      linkedinProfileUrl: this.linkedinProfileUrl || undefined,
      company: this.company || undefined,
      jobTitle: this.jobTitle || undefined,
      avatar: this.avatar || undefined,
      message: this.message,
    };
  }

  /**
   * Create a CreateTestimonial instance from a plain object
   * @param {CreateTestimonialData} data - Plain object data
   * @returns {CreateTestimonial} CreateTestimonial instance
   */
  static fromJSON(data) {
    return new CreateTestimonial(data);
  }
}

export { CreateTestimonial };

