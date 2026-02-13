// services/testimonial-service.js

import { Config, Testimonial, CreateTestimonial } from '../models/index.js';
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
   * Fetches the testimonial data from the API
   * @returns {Promise<Array<Testimonial>>} - The testimonial data
   */
  async fetchTestimonials() {
    try {
      const response = await this.http.get(this.testimonialEndpoint);

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
   * Creates a new testimonial and saves it to the DB
   * @param {CreateTestimonial} createTestimonial
   * @return {Promise<void>}
   */
  async createTestimonial(createTestimonial) {
    try {
      await this.http.post(this.testimonialEndpoint, createTestimonial);
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }
}

export { TestimonialService };