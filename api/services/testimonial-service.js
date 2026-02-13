import Testimonial from '../schemas/testimonial-schema.js';
import { compressAvatar } from '../utils/image-helper.js';
import emailService from './email-service.js';

/**
 * @typedef {Object} TestimonialData
 * @property {string} firstName - Testimonial author's first name
 * @property {string} lastName - Testimonial author's last name
 * @property {string} email - Testimonial author's email address
 * @property {string} [linkedinProfileUrl] - Author's LinkedIn profile URL
 * @property {string} [company] - Author's company name
 * @property {string} [jobTitle] - Author's job title
 * @property {string} [avatar] - Base64 encoded avatar image
 * @property {string} message - The testimonial message content
 */

/**
 * @typedef {Object} TestimonialDocument
 * @property {string} _id - Testimonial's unique identifier
 * @property {string} firstName - Author's first name
 * @property {string} lastName - Author's last name
 * @property {string} email - Author's email address
 * @property {string} [linkedinProfileUrl] - Author's LinkedIn profile URL
 * @property {string} [company] - Author's company name
 * @property {string} [jobTitle] - Author's job title
 * @property {string} [avatar] - Base64 encoded avatar image
 * @property {string} message - The testimonial message
 * @property {boolean} approved - Whether the testimonial is approved
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Update timestamp
 */

/**
 * Service class for handling testimonial operations.
 * Provides methods for creating, retrieving, and approving testimonials.
 * @class TestimonialService
 */
class TestimonialService {
  /**
   * Creates a new testimonial with compressed avatar.
   * Sends a confirmation email to the testimonial author.
   * @async
   * @param {TestimonialData} testimonialData - The testimonial data to create
   * @returns {Promise<void>}
   * @throws {Error} Throws if validation fails
   */
  async createTestimonial(testimonialData) {
    try {
      const { firstName, lastName, email, linkedinProfileUrl, company, jobTitle, avatar, message } = testimonialData;

      const compressedAvatar = await compressAvatar(avatar);

      const testimonial = new Testimonial({
        firstName,
        lastName,
        email,
        linkedinProfileUrl,
        company,
        jobTitle,
        avatar: compressedAvatar,
        message
      });

      await testimonial.save();

      // Send confirmation email (non-blocking)
      emailService.sendTestimonialConfirmation(email, firstName)
        .catch(err => console.error('Failed to send confirmation email:', err.message));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        throw new Error(messages.join('. '));
      }
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new Error(`A testimonial with this ${field} already exists`);
      }
      throw error;
    }
  }

  /**
   * Retrieves all approved testimonials sorted by creation date (newest first).
   * Excludes email for privacy in public responses.
   * @async
   * @returns {Promise<Array<TestimonialDocument>>} Array of approved testimonials
   */
  async getTestimonials() {
    const testimonials = await Testimonial.find({ approved: true })
      .select('-__v -email')
      .sort({ createdAt: -1 })
      .lean();

    return testimonials;
  }

  /**
   * Retrieves all testimonials regardless of approval status (admin only).
   * @async
   * @returns {Promise<Array<TestimonialDocument>>} Array of all testimonials
   */
  async getAllTestimonials() {
    const testimonials = await Testimonial.find()
      .select('-__v')
      .sort({ createdAt: -1 });

    return testimonials;
  }

  /**
   * Approves a testimonial by setting its approved flag to true.
   * Sends a notification email to the testimonial author.
   * @async
   * @param {string} testimonialId - The testimonial's unique identifier
   * @returns {Promise<TestimonialDocument>} The updated testimonial
   * @throws {Error} Throws if testimonial is not found
   */
  async approveTestimonial(testimonialId) {
    const testimonial = await Testimonial.findByIdAndUpdate(
      testimonialId,
      { approved: true },
      { new: true }
    ).select('-__v');

    if (!testimonial) {
      throw new Error('Testimonial not found');
    }

    // Send approval notification email (non-blocking)
    emailService.sendTestimonialApproved(testimonial.email, testimonial.firstName)
      .catch(err => console.error('Failed to send approval email:', err.message));

    return testimonial;
  }

  /**
   * Deletes a testimonial by its ID.
   * @async
   * @param {string} testimonialId - The testimonial's unique identifier
   * @returns {Promise<void>}
   * @throws {Error} Throws if testimonial is not found
   */
  async deleteTestimonial(testimonialId) {
    const testimonial = await Testimonial.findByIdAndDelete(testimonialId);

    if (!testimonial) {
      throw new Error('Testimonial not found');
    }
  }
}

export default new TestimonialService();