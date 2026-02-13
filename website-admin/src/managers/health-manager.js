// managers/health-manager.js

import { Config } from '../models/index.js';
import { HealthService } from '../services/index.js';
import { HealthComponent } from '../components/index.js';
import { $ } from '../utils/index.js';

/**
 * HealthManager handles initialization and coordination of health-related components.
 * Manages the health monitoring component and service.
 */
class HealthManager {
  /**
   * @param {Config} config
   */
  constructor(config) {
    /** @type {Config} */
    this.config = config;
    /** @type {HealthService} */
    this.healthService = new HealthService(config);
    /** @type {HealthComponent|null} */
    this.healthComponent = null;
  }

  /**
   * Initialize the health component
   */
  init() {
    const $healthElement = $('#health-component');
    if ($healthElement.length) {
      this.healthComponent = new HealthComponent(
        $healthElement,
        this.healthService,
        this.config
      );
    }
  }

  /**
   * Refresh health data
   */
  async refresh() {
    if (this.healthComponent) {
      await this.healthComponent.loadData();
      this.healthComponent.render();
    }
  }

  /**
   * Clean up manager resources
   */
  destroy() {
    if (this.healthComponent) {
      this.healthComponent.destroy();
      this.healthComponent = null;
    }
  }
}

export { HealthManager };
