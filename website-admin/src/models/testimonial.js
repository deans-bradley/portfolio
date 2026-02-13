/**
 * @typedef {Object} TestimonialData
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} linkedinProfileUrl
 * @property {string} company
 * @property {string} jobTitle
 * @property {string} avatar
 * @property {string} message
 * @property {boolean} approved
 * @property {string} createdAt
 * @property {string} updatedAt
 */

class Testimonial {
  /**
   * Create a new Testimonial instance
   * @param {TestimonialData} data - The testimonial data
   */
  constructor(data = {}) {
    this.id = data.id || data._id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.linkedinProfileUrl = data.linkedinProfileUrl;
    this.company = data.company;
    this.jobTitle = data.jobTitle;
    this.avatar = data.avatar;
    this.message = data.message;
    this.approved = data.approved;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Validate the testimonial object
   * @throws {Error} When testimonial is invalid
   */
  validate() {
    if (!this.id || typeof this.id !== 'string') {
      throw new Error('ID is not a valid string');
    }

    if (!this.firstName || typeof this.firstName !== 'string') {
      throw new Error('First name is not a valid string');
    }

    if (!this.lastName || typeof this.lastName !== 'string') {
      throw new Error('Last name is not a valid string');
    }

    if (!this.email || typeof this.email !== 'string') {
      throw new Error('Email is not a valid string');
    }

    if (this.linkedinProfileUrl && typeof this.linkedinProfileUrl !== 'string') {
      throw new Error('LinkedIn profile URL is not a valid string');
    }

    if (this.company && typeof this.company !== 'string') {
      throw new Error('Company is not a valid string');
    }

    if (this.jobTitle && typeof this.jobTitle !== 'string') {
      throw new Error('Job title is not a valid string');
    }

    if (this.avatar && typeof this.avatar !== 'string') {
      throw new Error('Avatar is not a valid string');
    }

    if (!this.message || typeof this.message !== 'string') {
      throw new Error('Message is not a valid string');
    }

    if (typeof this.approved !== 'boolean') {
      throw new Error('Approved is not a valid boolean');
    }

    if (this.createdAt && typeof this.createdAt !== 'string') {
      throw new Error('Created at is not a valid string');
    }

    if (this.updatedAt && typeof this.updatedAt !== 'string') {
      throw new Error('Updated at is not a valid string');
    }
  }

  /**
   * Convert to plain JSON object for serialization
   * @returns {TestimonialData} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      linkedinProfileUrl: this.linkedinProfileUrl,
      company: this.company,
      jobTitle: this.jobTitle,
      avatar: this.avatar,
      message: this.message,
      approved: this.approved,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create a Testimonial instance from a plain object
   * @param {TestimonialData} data - Plain object data
   * @returns {Testimonial} Testimonial instance
   */
  static fromJSON(data) {
    const testimonial = new Testimonial(data);
    testimonial.validate();
    return testimonial;
  }

  /**
   * Creates an array of Testimonial instances from an array of plain objects
   * @param {TestimonialData[]} data - Array of plain objects
   * @returns {Testimonial[]} Array of Testimonial instances
   */
  static fromJSONArray(data) {
    const testimonials = [];

    data.forEach(testimonial => {
      testimonials.push(Testimonial.fromJSON(testimonial));
    });

    return testimonials;
  }
}

export { Testimonial };
