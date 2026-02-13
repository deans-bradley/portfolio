// services/testimonial-service.js

import { Config, Testimonial } from '../models/index.js';
import { HttpClient } from '../utils/index.js';

class TestimonialService {
  /**
   * @param {Config} config 
   */
  constructor(config) {
    /** @type {Config} */
    this.config = config;
    /** @type {HttpClient} */
    this.http = new HttpClient();

    this.testimonialEndpoint = `${config.apiUrl}/testimonial`;
  }

  /**
   * Fetches approved testimonials from the API (public)
   * @returns {Promise<Array<Testimonial>>} - The testimonial data
   */
  async fetchTestimonials() {
    try {
      const response = await this.http.get(this.testimonialEndpoint, false);

      if (response.success && response.data) {
        return Testimonial.fromJSONArray(response.data);
      } else {
        console.error('Failed to fetch testimonials:', response.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  }

  /**
   * Fetches all testimonials including unapproved (admin only)
   * @returns {Promise<Array<Testimonial>>}
   */
  async fetchAllTestimonials() {
    try {
      const response = await this.http.get(`${this.testimonialEndpoint}/all`);

      if (response.success && response.data) {
        return Testimonial.fromJSONArray(response.data);
      } else {
        console.error('Failed to fetch all testimonials:', response.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching all testimonials:', error);
      throw error;
    }
  }

  /**
   * Approves a testimonial (admin only)
   * @param {string} testimonialId
   * @returns {Promise<Testimonial>}
   */
  async approveTestimonial(testimonialId) {
    try {
      const response = await this.http.patch(`${this.testimonialEndpoint}/${testimonialId}/approve`);

      if (response.success && response.data) {
        return Testimonial.fromJSON(response.data);
      } else {
        throw new Error(response.message || 'Failed to approve testimonial');
      }
    } catch (error) {
      console.error('Error approving testimonial:', error);
      throw error;
    }
  }

  /**
   * Deletes/rejects a testimonial (admin only)
   * @param {string} testimonialId
   * @returns {Promise<void>}
   */
  async deleteTestimonial(testimonialId) {
    try {
      const response = await this.http.delete(`${this.testimonialEndpoint}/${testimonialId}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  }
}

export { TestimonialService };