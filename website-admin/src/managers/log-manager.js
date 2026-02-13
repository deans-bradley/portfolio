// managers/log-manager.js

import { Config } from '../models/index.js';
import { LogService } from '../services/index.js';
import { LogsComponent } from '../components/index.js';
import { $ } from '../utils/index.js';

/**
 * LogManager handles initialization and coordination of log-related components
 */
class LogManager {
  /**
   * @param {Config} config
   */
  constructor(config) {
    /** @type {Config} */
    this.config = config;
    /** @type {LogService} */
    this.logService = new LogService(config);
    /** @type {LogsComponent|null} */
    this.logsComponent = null;
  }

  /**
   * Initialize the logs component
   */
  init() {
    const $logsElement = $('#logs-component');
    if ($logsElement.length) {
      this.logsComponent = new LogsComponent(
        $logsElement,
        this.logService,
        this.config
      );
    }
  }

  /**
   * Refresh logs data
   */
  async refresh() {
    if (this.logsComponent) {
      await this.logsComponent.loadData();
      this.logsComponent.render();
    }
  }
}

export { LogManager };
