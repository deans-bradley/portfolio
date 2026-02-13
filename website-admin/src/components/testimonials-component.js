// components/testimonials-component.js

import { $ } from '../utils/jquery-helper.js';
import { Component } from './component.js';
import { Config, Testimonial } from '../models/index.js';
import { TestimonialService } from '../services/index.js';

/**
 * TestimonialsComponent handles testimonial review (approve/reject)
 */
export class TestimonialsComponent extends Component {
  /**
   * @param {HTMLElement|jQuery} element
   * @param {TestimonialService} testimonialService
   * @param {Config} config
   */
  constructor(element, testimonialService, config) {
    super(element, config);
    
    /** @type {Array<Testimonial>} */
    this.testimonials = [];
    /** @type {TestimonialService} */
    this.testimonialService = testimonialService;
    /** @type {Set<string>} */
    this.processingIds = new Set();

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
          <h2>Testimonial Reviews</h2>
          <p>Approve or reject testimonial submissions</p>
        </header>
        <div id="testimonials-filter">
          <fieldset role="group">
            <label>
              <input type="radio" name="filter" value="pending" checked />
              Pending
            </label>
            <label>
              <input type="radio" name="filter" value="approved" />
              Approved
            </label>
            <label>
              <input type="radio" name="filter" value="all" />
              All
            </label>
          </fieldset>
        </div>
        <div id="testimonials-list"></div>
      </article>
    `;
  }

  /**
   * @override
   * @returns {this}
   */
  cacheElements() {
    this.elements = {
      list: this.element.find('#testimonials-list'),
      filter: this.element.find('#testimonials-filter')
    };
    return this;
  }

  /**
   * @override
   * @returns {this}
   */
  bindEvents() {
    // Filter change
    this.elements.filter.on('change', 'input[name="filter"]', () => {
      this.render();
    });

    // Event delegation for approve/reject buttons
    this.elements.list.on('click', '.approve-btn', (e) => {
      const id = $(e.currentTarget).data('id');
      this.handleApprove(id);
    });

    this.elements.list.on('click', '.reject-btn', (e) => {
      const id = $(e.currentTarget).data('id');
      this.handleReject(id);
    });

    return this;
  }

  /**
   * @override
   * @returns {Promise<this>}
   */
  async loadData() {
    this.renderLoadingState(true);
    try {
      this.testimonials = await this.testimonialService.fetchAllTestimonials() || [];
    } catch (error) {
      this.showError('Failed to load testimonials');
      this.testimonials = [];
    }
    return this;
  }

  /**
   * Get current filter value
   * @returns {string}
   */
  getFilter() {
    return this.elements.filter.find('input[name="filter"]:checked').val() || 'pending';
  }

  /**
   * Get filtered testimonials
   * @returns {Array<Testimonial>}
   */
  getFilteredTestimonials() {
    const filter = this.getFilter();
    
    switch (filter) {
      case 'pending':
        return this.testimonials.filter(t => !t.approved);
      case 'approved':
        return this.testimonials.filter(t => t.approved);
      case 'all':
      default:
        return this.testimonials;
    }
  }

  /**
   * Get template for a single testimonial card
   * @param {Testimonial} testimonial
   * @returns {string}
   */
  getTestimonialCardTemplate(testimonial) {
    const fullName = `${this.escapeHtml(testimonial.firstName)} ${this.escapeHtml(testimonial.lastName)}`;
    const statusBadge = testimonial.approved 
      ? '<mark style="background: var(--pico-ins-color); color: white;">Approved</mark>'
      : '<mark style="background: var(--pico-secondary); color: white;">Pending</mark>';
    
    const isProcessing = this.processingIds.has(testimonial.id);

    const avatarHtml = testimonial.avatar
      ? `<img src="${this.escapeHtml(testimonial.avatar)}" alt="${fullName}" class="testimonial-avatar" />`
      : `<div class="testimonial-avatar testimonial-avatar-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>`;
    
    return `
      <article class="testimonial-card" data-id="${this.escapeHtml(testimonial.id)}">
        <header>
          ${avatarHtml}
          <hgroup>
            <h4>${fullName}</h4>
            <p>${this.escapeHtml(testimonial.jobTitle || '')} ${testimonial.company ? 'at ' + this.escapeHtml(testimonial.company) : ''}</p>
          </hgroup>
          ${statusBadge}
        </header>
        <p><strong>Email:</strong> ${this.escapeHtml(testimonial.email)}</p>
        ${testimonial.linkedinProfileUrl ? `<p><strong>LinkedIn:</strong> <a href="${this.escapeHtml(testimonial.linkedinProfileUrl)}" target="_blank" rel="noopener">${this.escapeHtml(testimonial.linkedinProfileUrl)}</a></p>` : ''}
        <blockquote>
          ${this.escapeHtml(testimonial.message)}
        </blockquote>
        <footer>
          <small>Submitted: ${new Date(testimonial.createdAt).toLocaleDateString()}</small>
          <div class="testimonial-actions" role="group">
            ${!testimonial.approved ? `
              <button 
                class="approve-btn" 
                data-id="${this.escapeHtml(testimonial.id)}"
                ${isProcessing ? 'disabled aria-busy="true"' : ''}
              >
                Approve
              </button>
            ` : ''}
            <button 
              class="reject-btn secondary" 
              data-id="${this.escapeHtml(testimonial.id)}"
              ${isProcessing ? 'disabled aria-busy="true"' : ''}
            >
              ${testimonial.approved ? 'Remove' : 'Reject'}
            </button>
          </div>
        </footer>
      </article>
    `;
  }

  /**
   * @override
   * @returns {this}
   */
  render() {
    this.renderLoadingState(false);
    this.clearErrors();

    const filtered = this.getFilteredTestimonials();

    if (!filtered || filtered.length === 0) {
      const filter = this.getFilter();
      const message = filter === 'pending' 
        ? 'No pending testimonials to review.'
        : filter === 'approved'
          ? 'No approved testimonials.'
          : 'No testimonials found.';
      this.elements.list.html(`<p>${message}</p>`);
      return this;
    }

    const html = filtered
      .map(t => this.getTestimonialCardTemplate(t))
      .join('');

    this.elements.list.html(html);
    return this;
  }

  /**
   * Handle approve action
   * @param {string} id
   */
  async handleApprove(id) {
    if (this.processingIds.has(id)) return;

    this.processingIds.add(id);
    this.render();

    try {
      await this.testimonialService.approveTestimonial(id);
      
      // Update local data
      const testimonial = this.testimonials.find(t => t.id === id);
      if (testimonial) {
        testimonial.approved = true;
      }
      
      this.showSuccess('Testimonial approved successfully');
    } catch (error) {
      this.showError('Failed to approve testimonial');
    } finally {
      this.processingIds.delete(id);
      this.render();
    }
  }

  /**
   * Handle reject/delete action
   * @param {string} id
   */
  async handleReject(id) {
    if (this.processingIds.has(id)) return;

    const confirmed = confirm('Are you sure you want to remove this testimonial?');
    if (!confirmed) return;

    this.processingIds.add(id);
    this.render();

    try {
      await this.testimonialService.deleteTestimonial(id);
      
      // Remove from local data
      this.testimonials = this.testimonials.filter(t => t.id !== id);
      
      this.showSuccess('Testimonial removed successfully');
    } catch (error) {
      this.showError('Failed to remove testimonial');
    } finally {
      this.processingIds.delete(id);
      this.render();
    }
  }
}
