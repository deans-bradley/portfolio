// components/health-component.js

import { $ } from '../utils/jquery-helper.js';
import { Component } from './component.js';
import { Config, Health } from '../models/index.js';
import { HealthService } from '../services/index.js';

/**
 * HealthComponent displays API health status with service-level details.
 * Shows overall system health and individual service statuses with auto-refresh.
 */
export class HealthComponent extends Component {
  /**
   * @param {HTMLElement|jQuery} element
   * @param {HealthService} healthService
   * @param {Config} config
   */
  constructor(element, healthService, config) {
    super(element, config);

    /** @type {Health|null} */
    this.health = null;
    /** @type {HealthService} */
    this.healthService = healthService;
    /** @type {boolean} */
    this.isLoading = false;
    /** @type {number|null} */
    this.refreshInterval = null;
    /** @type {number} */
    this.refreshIntervalMs = 30000; // 30 seconds

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
    this.startAutoRefresh();
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
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2>API Health Status</h2>
            <div>
              <small id="last-updated" style="margin-right: 1rem; color: var(--muted-color);"></small>
              <button id="refresh-health-btn" class="outline secondary" style="padding: 0.5rem 1rem;">
                ↻ Refresh
              </button>
            </div>
          </div>
        </header>

        <div id="health-overview"></div>
        <div id="health-services"></div>
        <div id="health-details"></div>
      </article>
    `;
  }

  /**
   * @override
   * @returns {this}
   */
  cacheElements() {
    this.elements = {
      $overview: this.element.find('#health-overview'),
      $services: this.element.find('#health-services'),
      $details: this.element.find('#health-details'),
      $lastUpdated: this.element.find('#last-updated'),
      $refreshBtn: this.element.find('#refresh-health-btn')
    };
    return this;
  }

  /**
   * @override
   * @returns {this}
   */
  bindEvents() {
    this.elements.$refreshBtn.on('click', () => this.handleRefresh());
    return this;
  }

  /**
   * @override
   * @returns {Promise<this>}
   */
  async loadData() {
    this.isLoading = true;
    this.renderLoadingState();

    try {
      this.health = await this.healthService.fetchDetailedHealth();
    } catch (error) {
      console.error('Failed to load health data:', error);
      this.health = null;
    }

    this.isLoading = false;
    return this;
  }

  /**
   * Handle refresh button click
   */
  async handleRefresh() {
    this.elements.$refreshBtn.prop('disabled', true);
    await this.loadData();
    this.render();
    this.elements.$refreshBtn.prop('disabled', false);
  }

  /**
   * Start auto-refresh interval
   */
  startAutoRefresh() {
    this.stopAutoRefresh();
    this.refreshInterval = setInterval(async () => {
      await this.loadData();
      this.render();
    }, this.refreshIntervalMs);
  }

  /**
   * Stop auto-refresh interval
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Render loading state
   */
  renderLoadingState() {
    this.elements.$overview.html(`
      <div style="text-align: center; padding: 2rem;">
        <span aria-busy="true">Checking API health...</span>
      </div>
    `);
    this.elements.$services.empty();
    this.elements.$details.empty();
  }

  /**
   * @override
   * @returns {this}
   */
  render() {
    if (this.isLoading) {
      return this;
    }

    this.renderOverview();
    this.renderServices();
    this.renderDetails();
    this.updateLastUpdated();

    return this;
  }

  /**
   * Get status badge HTML
   * @param {string} status - 'healthy', 'unhealthy', or 'degraded'
   * @returns {string}
   */
  getStatusBadge(status) {
    const colors = {
      healthy: 'var(--pico-ins-color, #2ecc71)',
      unhealthy: 'var(--pico-del-color, #e74c3c)',
      degraded: 'var(--pico-mark-background-color, #f39c12)'
    };

    const icons = {
      healthy: '✓',
      unhealthy: '✗',
      degraded: '⚠'
    };

    const color = colors[status] || colors.unhealthy;
    const icon = icons[status] || icons.unhealthy;

    return `<mark style="background-color: ${color}; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-weight: 600;">${icon} ${status.toUpperCase()}</mark>`;
  }

  /**
   * Get status indicator dot HTML
   * @param {string} status - 'healthy', 'unhealthy', or 'degraded'
   * @returns {string}
   */
  getStatusDot(status) {
    const colors = {
      healthy: '#2ecc71',
      unhealthy: '#e74c3c',
      degraded: '#f39c12'
    };

    const color = colors[status] || colors.unhealthy;
    return `<span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${color}; margin-right: 0.5rem;"></span>`;
  }

  /**
   * Render overall health overview
   */
  renderOverview() {
    if (!this.health) {
      this.elements.$overview.html(`
        <div role="alert" style="background: var(--pico-del-color, #e74c3c); color: white; padding: 1rem; border-radius: var(--pico-border-radius); margin-bottom: 1rem;">
          <strong>Unable to fetch API health status.</strong> The API may be unreachable.
        </div>
      `);
      return;
    }

    const statusBadge = this.getStatusBadge(this.health.status);
    const bgColor = this.health.isHealthy()
      ? 'var(--pico-card-background-color)'
      : this.health.isDegraded()
        ? 'rgba(243, 156, 18, 0.1)'
        : 'rgba(231, 76, 60, 0.1)';

    this.elements.$overview.html(`
      <div style="background: ${bgColor}; padding: 1.5rem; border-radius: var(--pico-border-radius); margin-bottom: 1.5rem; border: 1px solid var(--pico-muted-border-color);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="margin: 0;">Overall Status</h3>
            <p style="margin: 0.5rem 0 0 0; color: var(--muted-color);">
              ${this.health.isHealthy() ? 'All systems operational' : this.health.isDegraded() ? 'Some services are experiencing issues' : 'Critical services are down'}
            </p>
          </div>
          <div style="text-align: right;">
            ${statusBadge}
          </div>
        </div>
      </div>
    `);
  }

  /**
   * Render individual service statuses
   */
  renderServices() {
    if (!this.health) {
      this.elements.$services.empty();
      return;
    }

    const services = this.health.getServices();
    const serviceCards = services.map(({ name, status }) => this.renderServiceCard(name, status)).join('');

    this.elements.$services.html(`
      <h4>Service Status</h4>
      <div class="grid">
        ${serviceCards}
      </div>
    `);
  }

  /**
   * Render a single service status card
   * @param {string} name - Service name
   * @param {import('../models/health.js').ServiceStatus} status - Service status
   * @returns {string}
   */
  renderServiceCard(name, status) {
    const statusDot = this.getStatusDot(status.status);
    const latency = status.latency !== undefined ? `${status.latency}ms` : '-';
    const borderColor = status.isHealthy() ? '#2ecc71' : status.status === 'degraded' ? '#f39c12' : '#e74c3c';

    return `
      <article style="margin-bottom: 0; border-left: 4px solid ${borderColor};">
        <header style="padding-bottom: 0.5rem;">
          <strong>${statusDot}${name}</strong>
        </header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>${status.status.charAt(0).toUpperCase() + status.status.slice(1)}</span>
          <small style="color: var(--muted-color);">Latency: ${latency}</small>
        </div>
        ${status.error ? `<small style="color: var(--pico-del-color);">${status.error}</small>` : ''}
      </article>
    `;
  }

  /**
   * Render additional details (uptime, environment, version)
   */
  renderDetails() {
    if (!this.health) {
      this.elements.$details.empty();
      return;
    }

    this.elements.$details.html(`
      <details style="margin-top: 1.5rem;">
        <summary>System Details</summary>
        <div class="grid" style="margin-top: 1rem;">
          <div>
            <strong>Uptime</strong>
            <p style="margin: 0;">${this.health.getUptimeDisplay()}</p>
          </div>
          <div>
            <strong>Environment</strong>
            <p style="margin: 0;">${this.health.environment}</p>
          </div>
          <div>
            <strong>API Version</strong>
            <p style="margin: 0;">v${this.health.version}</p>
          </div>
        </div>
      </details>
    `);
  }

  /**
   * Update last updated timestamp
   */
  updateLastUpdated() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    this.elements.$lastUpdated.text(`Last updated: ${timeStr}`);
  }

  /**
   * Clean up component
   */
  destroy() {
    this.stopAutoRefresh();
  }
}
