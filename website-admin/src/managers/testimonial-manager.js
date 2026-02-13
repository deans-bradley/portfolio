// managers/testimonial-manager.js

import { Config } from '../models/index.js';
import { TestimonialService } from '../services/index.js';
import { TestimonialsComponent } from '../components/index.js';
import { $ } from '../utils/index.js';

/**
 * TestimonialManager handles initialization and coordination of testimonial-related components
 */
class TestimonialManager {
  /**
   * @param {Config} config
   */
  constructor(config) {
    /** @type {Config} */
    this.config = config;
    /** @type {TestimonialService} */
    this.testimonialService = new TestimonialService(config);
    /** @type {TestimonialsComponent|null} */
    this.testimonialsComponent = null;
  }

  /**
   * Initialize the testimonials component
   */
  init() {
    const $testimonialsElement = $('#testimonials-component');
    if ($testimonialsElement.length) {
      this.testimonialsComponent = new TestimonialsComponent(
        $testimonialsElement,
        this.testimonialService,
        this.config
      );
    }
  }

  /**
   * Refresh testimonials data
   */
  async refresh() {
    if (this.testimonialsComponent) {
      await this.testimonialsComponent.loadData();
      this.testimonialsComponent.render();
    }
  }
}

export { TestimonialManager };
