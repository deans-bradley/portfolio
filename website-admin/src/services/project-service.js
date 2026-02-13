// services/project-service.js

import { Config, Project, CreateProject } from '../models/index.js';
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
    this.projectsEndpoint = `${config.apiUrl}/projects`;
  }

  /**
   * Fetches the project data from the API
   * @returns {Promise<Array<Project>>} - The project data
   */
  async fetchProjects() {
    try {
      const response = await this.http.get(this.projectsEndpoint, false);

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

  /**
   * Fetches a single project by ID
   * @param {string} projectId
   * @returns {Promise<Project|null>}
   */
  async getProjectById(projectId) {
    try {
      const response = await this.http.get(`${this.projectsEndpoint}/${projectId}`);

      if (response.success && response.data) {
        return Project.fromJSON(response.data);
      } else {
        console.error('Failed to fetch project:', response.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  /**
   * Creates a new project
   * @param {CreateProject} createProject
   * @returns {Promise<void>}
   */
  async createProject(createProject) {
    try {
      const response = await this.http.post(this.projectsEndpoint, createProject.toJSON());

      if (!response.success) {
        throw new Error(response.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Updates an existing project
   * @param {string} projectId
   * @param {CreateProject} updateProject
   * @returns {Promise<Project|null>}
   */
  async updateProject(projectId, updateProject) {
    try {
      const response = await this.http.put(
        `${this.projectsEndpoint}/${projectId}`,
        updateProject.toJSON()
      );

      if (response.success && response.data) {
        return Project.fromJSON(response.data);
      } else {
        throw new Error(response.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Deletes a project
   * @param {string} projectId
   * @returns {Promise<void>}
   */
  async deleteProject(projectId) {
    try {
      const response = await this.http.delete(`${this.projectsEndpoint}/${projectId}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
}

export { ProjectService };