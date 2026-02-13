// services/project-service.js

import { Config, Project } from '../models/index.js';
import { HttpClient } from '../utils/index.js';

class ProjectService {
  /**
   * @param {Config} config 
   */
  constructor(config) {
    /** @type {Config} */
    this.config = config;
    /** @type {HttpClient} */
    this.http = new HttpClient();
  }

  /**
   * Fetches the project data from the API
   * @returns {Promise<Array<Project>>} - The project data
   */
  async fetchProjects() {
    try {
      const response = await this.http.get(`${this.config.apiUrl}/projects`);

      if (response.success && response.data) {
        return Project.fromJSONArray(response.data);
      } else {
        console.error('Failed to fetch projects:', response.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }
}

export { ProjectService };