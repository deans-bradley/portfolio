// components/projects-component.js

import { $ } from '../utils/jquery-helper.js';
import { Component } from './component.js';
import { Config, Project } from '../models/index.js';
import { ProjectService } from '../services/index.js';

export class ProjectsComponent extends Component {
  /**
   * @param {HTMLElement|jQuery} element
   * @param {ProjectService} projectService
   * @param {Config} config
   */
  constructor(element, projectService, config) {
    super(element, config);
    
    /** @type {Array<Project>} */
    this.projects = [];
    this.isAnimating = false;

    /** @type {ProjectService} */
    this.projectService = projectService;

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
      <h2 class="section-title">Projects</h2>
      <div id="projects-grid" class="projects-grid"></div>
    `;
  }

  /**
   * @override
   * @returns {this}
   */
  cacheElements() {
    this.elements = {
      projectsGrid: this.element.find('#projects-grid')
    };
    return this;
  }

  /**
   * @override
   * @returns {this}
   */
  bindEvents() {
    const $grid = this.elements.projectsGrid;

    // Use event delegation for dynamically added content
    $grid.on('click', '.project-preview', (e) => {
      if (this.isAnimating) return;
      const $card = $(e.currentTarget).closest('.project-card');
      this.expandProject($card);
    });

    $grid.on('click', '.project-close-btn', (e) => {
      e.stopPropagation();
      if (this.isAnimating) return;
      const $card = $(e.currentTarget).closest('.project-card');
      this.collapseProject($card);
    });

    // Close on escape key
    $(document).on('keydown', (e) => {
      if (e.key === 'Escape' && !this.isAnimating) {
        const $expandedCard = $('.project-card.expanded');
        if ($expandedCard.length) {
          this.collapseProject($expandedCard);
        }
      }
    });

    return this;
  }

  /**
   * @override
   * @returns {Promise<this>}
   */
  async loadData() {
    this.renderLoadingState(true);
    this.projects = await this.projectService.fetchProjects() || [];
    return this;
  }

  /**
   * Generates HTML template for a single project card
   * @param {Project} project
   * @returns {string}
   */
  getProjectCardTemplate(project) {
    const techStackHtml = project.techStack
      .map(tech => `<span class="tech-tag">${this.escapeHtml(tech)}</span>`)
      .join('');

    const repoLinkHtml = project.repoUrl 
      ? `<a href="${this.escapeHtml(project.repoUrl)}" target="_blank" rel="noopener noreferrer" class="project-repo-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
          View Repository
        </a>`
      : '';

    return `
      <div class="project-card" data-project-id="${this.escapeHtml(project.id)}">
        <div class="project-preview">
          <div class="project-image">
            <img src="${this.escapeHtml(project.previewImageUrl)}" alt="${this.escapeHtml(project.name)}" onerror="this.style.display='none'; this.parentElement.classList.add('no-image');" />
          </div>
          <div class="project-info">
            <h3 class="project-name">${this.escapeHtml(project.name)}</h3>
            <span class="project-location">${this.escapeHtml(project.owner)}</span>
            <div class="project-stack">
              ${techStackHtml}
            </div>
          </div>
        </div>
        <div class="project-details">
          <button class="project-close-btn" aria-label="Close project details">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="project-details-content">
            <div class="project-details-header">
              <h3 class="project-details-name">${this.escapeHtml(project.name)}</h3>
              <span class="project-details-location">${this.escapeHtml(project.owner)}</span>
            </div>
            <div class="project-details-stack">
              ${techStackHtml}
            </div>
            <div class="project-details-description">
              ${project.description || '<p>No description available.</p>'}
            </div>
            ${repoLinkHtml}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Escapes HTML special characters to prevent XSS
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * @override
   * @returns {this}
   */
  render() {
    this.renderLoadingState(false);
    const $grid = this.elements.projectsGrid;

    if (!this.projects || this.projects.length === 0) {
      $grid.html('<p class="no-projects">No projects available.</p>');
      return this;
    }

    const projectsHtml = this.projects
      .map(project => this.getProjectCardTemplate(project))
      .join('');

    $grid.html(projectsHtml);
    this.element.append($grid);

    return this;
  }

  /**
   * @param {jQuery} $card
   * @returns {this}
   */
  expandProject($card) {
    const $grid = this.elements.projectsGrid;
    this.isAnimating = true;

    // Capture starting position and size
    const gridRect = $grid[0].getBoundingClientRect();
    const cardRect = $card[0].getBoundingClientRect();

    const startTop = cardRect.top - gridRect.top;
    const startLeft = cardRect.left - gridRect.left;
    const startWidth = cardRect.width;
    const startHeight = cardRect.height;

    // Preserve grid height to prevent content jump when card becomes absolute
    $grid.css('min-height', gridRect.height + 'px');

    // Set initial absolute position (same as current position)
    $card.css({
      position: 'absolute',
      top: startTop + 'px',
      left: startLeft + 'px',
      width: startWidth + 'px',
      height: startHeight + 'px'
    });

    // Force reflow
    $card[0].offsetHeight;

    // Add expanding class and start fade out of other cards
    $grid.addClass('is-expanding');
    $card.addClass('expanding');

    // Animate to full width
    requestAnimationFrame(function() {
      $card.css({
        top: '0',
        left: '0',
        width: '100%',
        height: 'auto',
        minHeight: '400px'
      });
    });

    // Finalize expanded state
    setTimeout(() => {
      $grid.removeClass('is-expanding').addClass('has-expanded');
      $card.removeClass('expanding').addClass('expanded');
      $card.css({
        position: '',
        top: '',
        left: '',
        width: '',
        height: '',
        minHeight: ''
      });
      // Clear grid min-height now that expanded card is back in flow
      $grid.css('min-height', '');
      this.isAnimating = false;
    }, 450);

    // Scroll to projects section
    $('html, body').animate({
      scrollTop: $('#projects').offset().top - 20
    }, 300);

    return this;
  }

  collapseProject($card) {
    const $grid = this.elements.projectsGrid;
    const projectId = $card.data('project-id');

    this.isAnimating = true;

    // Preserve grid height to prevent content jump during collapse
    const expandedHeight = $grid[0].getBoundingClientRect().height;
    $grid.css('min-height', expandedHeight + 'px');

    // Calculate the original position based on project index
    const $allCards = $grid.find('.project-card');
    const cardIndex = $allCards.index($card);
    const gridRect = $grid[0].getBoundingClientRect();
    const gridWidth = gridRect.width;
    const gap = 32; // 2rem gap

    // Calculate columns based on viewport
    let columns = 3;
    if (window.innerWidth <= 768) columns = 1;
    else if (window.innerWidth <= 968) columns = 2;

    const cardWidth = (gridWidth - (gap * (columns - 1))) / columns;
    const row = Math.floor(cardIndex / columns);
    const col = cardIndex % columns;
    const targetTop = row * (280 + gap); // approximate card height + gap
    const targetLeft = col * (cardWidth + gap);

    // Set current position as absolute
    $card.css({
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      minHeight: '400px'
    });

    // Force reflow
    $card[0].offsetHeight;

    // Start collapse
    $card.removeClass('expanded').addClass('collapsing');
    $grid.removeClass('has-expanded').addClass('is-collapsing');

    // Animate to original position
    requestAnimationFrame(function() {
      $card.css({
        top: targetTop + 'px',
        left: targetLeft + 'px',
        width: cardWidth + 'px',
        minHeight: 'auto'
      });
    });

    // Trigger fade in of other cards
    setTimeout(() => {
      $grid.addClass('fade-in');
    }, 100);

    // Clean up all animation classes and inline styles
    setTimeout(() => {
      $card.removeClass('collapsing');
      $card.css({
        position: '',
        top: '',
        left: '',
        width: '',
        minHeight: ''
      });
      $grid.removeClass('is-collapsing fade-in');
      // Clear grid min-height now that cards are back in flow
      $grid.css('min-height', '');
      this.isAnimating = false;
    }, 400);

    return this;
  }
}