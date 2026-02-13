// components/testimonial-component.js

import { Component } from './component.js';
import { AddTestimonialComponent } from './add-testimonial-component.js';
import { Config, Testimonial } from '../models/index.js';
import { TestimonialService } from '../services/index.js';

export class TestimonialComponent extends Component {
  /**
   * @param {HTMLElement|jQuery} element
   * @param {TestimonialService} testimonialService
   * @param {Config} config
   */
  constructor(element, testimonialService, config) {
    super(element, config);
    
    /** @type {Array<Testimonial>} */
    this.testimonials = [];
    this.displayedCount = 4;
    this.maxInitialDisplay = 4;

    /** @type {TestimonialService} */
    this.testimonialService = testimonialService;

    /** @type {AddTestimonialComponent|null} */
    this.addTestimonialComponent = null;

    this.init();
  }

  /**
   * @override
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
   * @override
   * @returns {string}
   */
  getComponentTemplate() {
    return `
      <div class="testimonials-header">
        <h2 class="section-title">Testimonials</h2>
        <button id="add-testimonial-btn" class="add-testimonial-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add Testimonial</span>
        </button>
      </div>
      <div id="testimonials-content">
        <div id="testimonials-grid" class="testimonials-grid">
        </div>
        <button id="show-more-testimonials-btn" class="show-more-btn" style="display: none;">
            Show More
        </button>
      </div>
      <div id="add-testimonial-container" style="display: none;">
      </div>
    `;
  }

  /**
   * @override
   * @returns {this}
   */
  cacheElements() {
    this.elements = {
      addTestimonialBtn: this.element.find('#add-testimonial-btn'),
      testimonialsContent: this.element.find('#testimonials-content'),
      testimonialGrid: this.element.find('#testimonials-grid'),
      showMoreTestimonialsBtn: this.element.find('#show-more-testimonials-btn'),
      addTestimonialContainer: this.element.find('#add-testimonial-container')
    };
    return this;
  }

  /**
   * @override
   * @returns {this}
   */
  bindEvents() {
    this.elements.showMoreTestimonialsBtn.on('click', () => {
      this.showMore();
    });

    this.elements.addTestimonialBtn.on('click', () => {
      this.showAddTestimonialForm();
    });
    return this;
  }

  /**
   * Show the add testimonial form
   */
  showAddTestimonialForm() {
    // Fade out testimonials content
    this.elements.testimonialsContent.addClass('fading-out');
    this.elements.addTestimonialBtn.hide();

    // After fade out, show form with fade in
    setTimeout(() => {
      this.elements.testimonialsContent.hide().removeClass('fading-out');
      this.elements.addTestimonialContainer.show();

      // Initialize AddTestimonialComponent
      this.addTestimonialComponent = new AddTestimonialComponent(
        this.elements.addTestimonialContainer,
        this.testimonialService,
        this.config,
        {
          onClose: (wasSubmitted) => this.handleAddTestimonialClose(wasSubmitted),
          onSubmit: () => this.handleTestimonialSubmitted()
        }
      );

      // Trigger fade in
      requestAnimationFrame(() => {
        this.elements.addTestimonialContainer.addClass('fading-in');
      });
    }, 300);
  }

  /**
   * Handle add testimonial form close
   * @param {boolean} wasSubmitted - Whether a testimonial was submitted
   */
  handleAddTestimonialClose(wasSubmitted) {
    this.addTestimonialComponent = null;

    // Fade out form
    this.elements.addTestimonialContainer.removeClass('fading-in');

    // After fade out, show testimonials with fade in
    setTimeout(() => {
      this.elements.addTestimonialContainer.hide().empty();
      
      // Show testimonials starting invisible for fade in
      this.elements.testimonialsContent.addClass('fading-in').show();
      this.elements.addTestimonialBtn.show();

      // Trigger fade in
      requestAnimationFrame(() => {
        this.elements.testimonialsContent.addClass('visible');
      });

      // Clean up classes after animation
      setTimeout(() => {
        this.elements.testimonialsContent.removeClass('fading-in visible');
      }, 300);
    }, 300);
  }

  /**
   * Handle successful testimonial submission
   */
  handleTestimonialSubmitted() {
    // Could refresh testimonials here, but since submissions need approval,
    // we just show the success message in the AddTestimonialComponent
    console.log('Testimonial submitted successfully');
  }

  /**
   * @override
   * @returns {Promise<this>}
   */
  async loadData() {
    this.renderLoadingState(true);
    try {
      this.testimonials = await this.testimonialService.fetchTestimonials() || [];
    } catch (error) {
      this.renderLoadingState(false);
      console.log(error);
    }
    return this;
  }

  /**
   * @override
   * @returns {this}
   */
  render() {
    this.renderLoadingState(false);

    const $grid = this.elements.testimonialGrid;
    const $showMoreBtn = this.elements.showMoreTestimonialsBtn;

    if (this.testimonials.length === 0) {
      $grid.html('<p class="no-testimonials">No testimonials yet. Be the first to leave one!</p>');
      $showMoreBtn.hide();
      return;
    }

    const testimonialsToShow = this.testimonials.slice(0, this.displayedCount);
    const html = testimonialsToShow.map(t => this.createTestimonialCard(t)).join('');

    $grid.html(html);

    // Show/hide "Show More" button
    if (this.testimonials.length > this.displayedCount) {
      $showMoreBtn.show().text(`Show More (${this.testimonials.length - this.displayedCount} more)`);
    } else {
      $showMoreBtn.hide();
    }

    return this;
  }

  /**
   * Show more testimonials
   * @returns {this}
   */
  showMore() {
    this.displayedCount = this.testimonials.length;
    this.render();
    return this;
  }

  /**
   * @param {string} firstName 
   * @param {string} lastName 
   * @returns {string}
   */
  getInitials(firstName, lastName) {
    const first = firstName ? firstName[0] : '';
    const last = lastName ? lastName[0] : '';
    return (first + last).toUpperCase();
  }

  createTestimonialCard(testimonial) {
    const fullName = `${testimonial.firstName} ${testimonial.lastName}`.trim();
    const initials = this.getInitials(testimonial.firstName, testimonial.lastName);
    const hasAvatar = testimonial.avatar && testimonial.avatar.trim() !== '';
    const hasLinkedIn = testimonial.linkedinProfileUrl && testimonial.linkedinProfileUrl.trim() !== '';
    const hasJobInfo = testimonial.jobTitle || testimonial.company;

    const avatarHtml = hasAvatar ?
      `<img src="${testimonial.avatar}" alt="${fullName}" onerror="this.parentElement.classList.add('no-photo'); this.parentElement.setAttribute('data-initials', '${initials}'); this.remove();" />` : '';

    const avatarClass = hasAvatar ? '' : 'no-photo';
    const avatarDataAttr = hasAvatar ? '' : `data-initials="${initials}"`;

    const nameHtml = hasLinkedIn ?
          `<a href="${testimonial.linkedinProfileUrl}" target="_blank" rel="noopener noreferrer">${fullName}</a>` :
    fullName;

    const jobInfoHtml = hasJobInfo ?
      `<span class="testimonial-job">${[testimonial.jobTitle, testimonial.company].filter(Boolean).join(' at ')}</span>` : '';

    return `
      <div class="testimonial-card" data-id="${testimonial._id}">
          <div class="testimonial-header">
              <div class="testimonial-photo ${avatarClass}" ${avatarDataAttr}>
                  ${avatarHtml}
              </div>
              <div class="testimonial-info">
                  <h3 class="testimonial-name">${nameHtml}</h3>
                  ${jobInfoHtml}
              </div>
          </div>
          <p class="testimonial-message">"${testimonial.message}"</p>
      </div>
    `;
  }
}