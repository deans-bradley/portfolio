// managers/project-manager.js

import { Config } from '../models/index.js';
import { ProjectService } from '../services/index.js';
import { ProjectsComponent } from '../components/index.js';
import { $ } from '../utils/index.js';

/**
 * ProjectManager handles initialization and coordination of project-related components
 */
class ProjectManager {
  /**
   * @param {Config} config
   */
  constructor(config) {
    /** @type {Config} */
    this.config = config;
    /** @type {ProjectService} */
    this.projectService = new ProjectService(config);
    /** @type {ProjectsComponent|null} */
    this.projectsComponent = null;
  }

  /**
   * Initialize the projects component
   */
  init() {
    const $projectsElement = $('#projects-component');
    if ($projectsElement.length) {
      this.projectsComponent = new ProjectsComponent(
        $projectsElement,
        this.projectService,
        this.config
      );
    }
  }

  /**
   * Refresh projects data
   */
  async refresh() {
    if (this.projectsComponent) {
      await this.projectsComponent.loadData();
      this.projectsComponent.render();
    }
  }
}

export { ProjectManager };
