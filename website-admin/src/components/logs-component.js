// components/logs-component.js

import { $ } from '../utils/jquery-helper.js';
import { Component } from './component.js';
import { Config, Log } from '../models/index.js';
import { LogService } from '../services/index.js';

/**
 * LogsComponent displays application logs with filtering capabilities
 */
export class LogsComponent extends Component {
  /**
   * @param {HTMLElement|jQuery} element
   * @param {LogService} logService
   * @param {Config} config
   */
  constructor(element, logService, config) {
    super(element, config);
    
    /** @type {Array<Log>} */
    this.logs = [];
    /** @type {LogService} */
    this.logService = logService;
    /** @type {number} */
    this.currentPage = 1;
    /** @type {number} */
    this.totalPages = 0;
    /** @type {number} */
    this.total = 0;
    /** @type {boolean} */
    this.isLoading = false;
    /** @type {Object} */
    this.filters = {
      level: '',
      startDate: '',
      endDate: ''
    };

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
      <article>
        <header>
          <h2>Application Logs</h2>
        </header>
        
        <details open>
          <summary>Filters</summary>
          <form id="logs-filter-form">
            <div class="grid">
              <label>
                Level
                <select id="filter-level">
                  <option value="">All Levels</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                  <option value="debug">Debug</option>
                </select>
              </label>
              <label>
                Start Date
                <input type="datetime-local" id="filter-start-date">
              </label>
              <label>
                End Date
                <input type="datetime-local" id="filter-end-date">
              </label>
            </div>
            <div class="grid">
              <button type="submit">Apply Filters</button>
              <button type="button" id="clear-filters-btn" class="outline secondary">Clear Filters</button>
            </div>
          </form>
        </details>
        
        <div id="logs-summary"></div>
        <div id="logs-list"></div>
        <div id="logs-pagination"></div>
      </article>
    `;
  }

  /**
   * @override
   * @returns {this}
   */
  cacheElements() {
    this.elements = {
      list: this.element.find('#logs-list'),
      summary: this.element.find('#logs-summary'),
      pagination: this.element.find('#logs-pagination'),
      filterForm: this.element.find('#logs-filter-form'),
      levelSelect: this.element.find('#filter-level'),
      startDateInput: this.element.find('#filter-start-date'),
      endDateInput: this.element.find('#filter-end-date'),
      clearFiltersBtn: this.element.find('#clear-filters-btn')
    };
    return this;
  }

  /**
   * @override
   * @returns {this}
   */
  bindEvents() {
    this.elements.filterForm.on('submit', (e) => {
      e.preventDefault();
      this.applyFilters();
    });

    this.elements.clearFiltersBtn.on('click', () => this.clearFilters());

    this.elements.pagination.on('click', '.page-btn', (e) => {
      const page = $(e.currentTarget).data('page');
      if (page && page !== this.currentPage) {
        this.goToPage(page);
      }
    });

    this.elements.list.on('click', '.view-details-btn', (e) => {
      const id = $(e.currentTarget).data('id');
      this.showLogDetails(id);
    });

    return this;
  }

  /**
   * @override
   * @returns {Promise<this>}
   */
  async loadData() {
    this.isLoading = true;
    this.renderLoading();
    
    try {
      const params = {
        page: this.currentPage,
        limit: 25,
        ...this.buildFilterParams()
      };

      const result = await this.logService.fetchLogs(params);
      this.logs = result.logs;
      this.total = result.total;
      this.totalPages = result.totalPages;
      this.currentPage = result.page;
    } catch (error) {
      console.error('Error loading logs:', error);
      this.logs = [];
      this.total = 0;
      this.totalPages = 0;
    } finally {
      this.isLoading = false;
    }
    
    return this;
  }

  /**
   * Builds filter parameters for API call
   * @returns {Object}
   */
  buildFilterParams() {
    const params = {};
    
    if (this.filters.level) {
      params.level = this.filters.level;
    }
    
    if (this.filters.startDate) {
      params.startDate = new Date(this.filters.startDate).toISOString();
    }
    
    if (this.filters.endDate) {
      params.endDate = new Date(this.filters.endDate).toISOString();
    }
    
    return params;
  }

  /**
   * Apply filters from form
   */
  async applyFilters() {
    this.filters.level = this.elements.levelSelect.val();
    this.filters.startDate = this.elements.startDateInput.val();
    this.filters.endDate = this.elements.endDateInput.val();
    this.currentPage = 1;
    
    await this.loadData();
    this.render();
  }

  /**
   * Clear all filters
   */
  async clearFilters() {
    this.filters = {
      level: '',
      startDate: '',
      endDate: ''
    };
    
    this.elements.levelSelect.val('');
    this.elements.startDateInput.val('');
    this.elements.endDateInput.val('');
    this.currentPage = 1;
    
    await this.loadData();
    this.render();
  }

  /**
   * Navigate to a specific page
   * @param {number} page
   */
  async goToPage(page) {
    this.currentPage = page;
    await this.loadData();
    this.render();
  }

  /**
   * Render loading state
   */
  renderLoading() {
    this.elements.list.html('<p aria-busy="true">Loading logs...</p>');
    this.elements.summary.empty();
    this.elements.pagination.empty();
  }

  /**
   * @override
   * @returns {this}
   */
  render() {
    this.renderSummary();
    this.renderLogs();
    this.renderPagination();
    return this;
  }

  /**
   * Render logs summary
   */
  renderSummary() {
    const start = (this.currentPage - 1) * 25 + 1;
    const end = Math.min(this.currentPage * 25, this.total);
    
    const filterInfo = this.getActiveFiltersText();
    
    this.elements.summary.html(`
      <p>
        <small>
          Showing ${this.total > 0 ? start : 0}-${end} of ${this.total} logs
          ${filterInfo ? ` | Filters: ${filterInfo}` : ''}
        </small>
      </p>
    `);
  }

  /**
   * Get active filters as text
   * @returns {string}
   */
  getActiveFiltersText() {
    const parts = [];
    
    if (this.filters.level) {
      parts.push(`Level: ${this.filters.level}`);
    }
    
    if (this.filters.startDate) {
      parts.push(`From: ${new Date(this.filters.startDate).toLocaleString()}`);
    }
    
    if (this.filters.endDate) {
      parts.push(`To: ${new Date(this.filters.endDate).toLocaleString()}`);
    }
    
    return parts.join(', ');
  }

  /**
   * Render logs list
   */
  renderLogs() {
    if (this.logs.length === 0) {
      this.elements.list.html('<p>No logs found.</p>');
      return;
    }

    const rows = this.logs.map(log => this.renderLogRow(log)).join('');
    
    this.elements.list.html(`
      <figure>
        <table role="grid">
          <thead>
            <tr>
              <th scope="col">Level</th>
              <th scope="col">Message</th>
              <th scope="col">Method</th>
              <th scope="col">Path</th>
              <th scope="col">Status</th>
              <th scope="col">Time</th>
              <th scope="col">Timestamp</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </figure>
    `);
  }

  /**
   * Render a single log row
   * @param {Log} log
   * @returns {string}
   */
  renderLogRow(log) {
    const levelBadge = this.getLevelBadge(log.level);
    const truncatedMessage = log.message?.length > 50 
      ? `${log.message.substring(0, 50)}...` 
      : (log.message || '-');
    const truncatedPath = log.path?.length > 30
      ? `${log.path.substring(0, 30)}...`
      : (log.path || '-');
    
    return `
      <tr>
        <td>${levelBadge}</td>
        <td><small>${this.escapeHtml(truncatedMessage)}</small></td>
        <td>${log.method || '-'}</td>
        <td><small>${this.escapeHtml(truncatedPath)}</small></td>
        <td>${log.statusCode || '-'}</td>
        <td>${log.responseTime ? `${log.responseTime}ms` : '-'}</td>
        <td><small>${log.getFormattedDate()}</small></td>
        <td>
          <button class="view-details-btn outline secondary" data-id="${log.id}">
            View
          </button>
        </td>
      </tr>
    `;
  }

  /**
   * Get level badge HTML
   * @param {string} level
   * @returns {string}
   */
  getLevelBadge(level) {
    const colors = {
      info: 'style="background: var(--pico-primary); color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem;"',
      warn: 'style="background: orange; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem;"',
      error: 'style="background: red; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem;"',
      debug: 'style="background: gray; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem;"'
    };
    return `<span ${colors[level] || ''}>${level || 'unknown'}</span>`;
  }

  /**
   * Render pagination controls
   */
  renderPagination() {
    if (this.totalPages <= 1) {
      this.elements.pagination.empty();
      return;
    }

    const pages = this.getPaginationPages();
    const buttons = pages.map(page => {
      if (page === '...') {
        return '<span>...</span>';
      }
      const isActive = page === this.currentPage;
      return `
        <button 
          class="page-btn ${isActive ? '' : 'outline'}" 
          data-page="${page}"
          ${isActive ? 'disabled' : ''}
        >
          ${page}
        </button>
      `;
    }).join('');

    this.elements.pagination.html(`
      <nav style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
        <button 
          class="page-btn outline" 
          data-page="${this.currentPage - 1}"
          ${this.currentPage === 1 ? 'disabled' : ''}
        >
          Previous
        </button>
        ${buttons}
        <button 
          class="page-btn outline" 
          data-page="${this.currentPage + 1}"
          ${this.currentPage >= this.totalPages ? 'disabled' : ''}
        >
          Next
        </button>
      </nav>
    `);
  }

  /**
   * Get pagination page numbers
   * @returns {Array<number|string>}
   */
  getPaginationPages() {
    const pages = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (this.currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (this.currentPage < this.totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(this.totalPages);
    }
    
    return pages;
  }

  /**
   * Show log details in a modal
   * @param {string} logId
   */
  async showLogDetails(logId) {
    const log = this.logs.find(l => l.id === logId);
    if (!log) return;

    const metadataHtml = log.metadata 
      ? `<pre><code>${this.escapeHtml(JSON.stringify(log.metadata, null, 2))}</code></pre>`
      : '<p>No metadata</p>';

    const modalHtml = `
      <dialog id="log-details-modal" open>
        <article>
          <header>
            <button aria-label="Close" rel="prev" class="close-modal-btn"></button>
            <h3>Log Details</h3>
          </header>
          <div class="grid">
            <div>
              <p><strong>Level:</strong> ${this.getLevelBadge(log.level)}</p>
              <p><strong>Message:</strong> ${this.escapeHtml(log.message || '-')}</p>
              <p><strong>Method:</strong> ${log.method || '-'}</p>
              <p><strong>Path:</strong> ${this.escapeHtml(log.path || '-')}</p>
              <p><strong>Status Code:</strong> ${log.statusCode || '-'}</p>
              <p><strong>Response Time:</strong> ${log.responseTime ? `${log.responseTime}ms` : '-'}</p>
            </div>
            <div>
              <p><strong>IP:</strong> ${log.ip || '-'}</p>
              <p><strong>User ID:</strong> ${log.userId || '-'}</p>
              <p><strong>Correlation ID:</strong> <small>${log.correlationId || '-'}</small></p>
              <p><strong>Timestamp:</strong> ${log.getFormattedDate()}</p>
              <p><strong>User Agent:</strong><br><small>${this.escapeHtml(log.userAgent || '-')}</small></p>
            </div>
          </div>
          <details>
            <summary>Metadata</summary>
            ${metadataHtml}
          </details>
          <footer>
            <button class="close-modal-btn">Close</button>
          </footer>
        </article>
      </dialog>
    `;

    $('body').append(modalHtml);

    $('#log-details-modal').on('click', '.close-modal-btn', () => {
      $('#log-details-modal').remove();
    });
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
