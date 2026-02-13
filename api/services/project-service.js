import Project from '../schemas/project-schema.js';
import ftpService from './ftp-service.js';

/**
 * @typedef {Object} ProjectData
 * @property {string} name - The project name
 * @property {string} owner - The person/entity that owns the project
 * @property {string} previewImageBase64 - The project preview image in base64 string
 * @property {Array<string>} techStack - The tech stack used to create the project
 * @property {string} description - The project description
 * @property {string} [repoUrl] - The remote repository URL if available
 */

/**
 * @typedef {Object} ProjectDocument
 * @property {string} _id - Project's unique identifier
 * @property {string} name - The project name
 * @property {string} owner - The person/entity that owns the project
 * @property {string} previewImageUrl - The project preview image URL to display on the client
 * @property {Array<string>} techStack - The tech stack used to create the project
 * @property {string} description - The project description
 * @property {string} [repoUrl] - The remote repository URL if available
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Update timestamp
 */

/**
 * Service class for handling project operations.
 * Provides methods for creating and retrieving, projects.
 * @class ProjectService
 */
class ProjectService {
  /**
   * Creates a new project and uploads the preview image to FTP server.
   * @async
   * @param {ProjectData} projectData - The project data to create
   * @returns {Promise<void>}
   * @throws {Error} Throws if validation fails
   */
  async createProject(projectData) {
    try {
      const { name, owner, previewImageBase64, techStack, description, repoUrl } = projectData;
    
      const uploadResult = await ftpService.uploadFromBase64(previewImageBase64);
      
      if (!uploadResult.success) {
        throw new Error(`Failed to upload preview image: ${uploadResult.error}`);
      }
      
      const previewImageUrl = uploadResult.url;

      const project = new Project({
        name,
        owner,
        previewImageUrl,
        techStack,
        description,
        repoUrl
      });

      await project.save();
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        throw new Error(messages.join('. '));
      }
      throw error;
    }
  }

  /**
   * Retrieves all projects sorted by creation date (newest first).
   * @async
   * @returns {Promise<Array<ProjectDocument>>} Array of projects
   */
  async getProjects() {
    const projects = await Project.find()
      .select('-__v')
      .sort({ createdAt: -1 });

    return projects;
  }

  /**
   * Retrieves a single project by ID.
   * @async
   * @param {string} projectId - The project's unique identifier
   * @returns {Promise<ProjectDocument|null>} The project or null if not found
   */
  async getProjectById(projectId) {
    const project = await Project.findById(projectId).select('-__v');
    return project;
  }

  /**
   * Updates an existing project.
   * @async
   * @param {string} projectId - The project's unique identifier
   * @param {Partial<ProjectData>} updateData - The fields to update
   * @returns {Promise<ProjectDocument>} The updated project
   * @throws {Error} Throws if project not found or validation fails
   */
  async updateProject(projectId, updateData) {
    try {
      const existingProject = await Project.findById(projectId);

      if (!existingProject) {
        throw new Error('Project not found');
      }

      const { name, owner, previewImageBase64, techStack, description, repoUrl } = updateData;

      // Handle image update if new image provided
      if (previewImageBase64) {
        const uploadResult = await ftpService.uploadFromBase64(previewImageBase64);

        if (!uploadResult.success) {
          throw new Error(`Failed to upload preview image: ${uploadResult.error}`);
        }

        // Delete old image from FTP server
        if (existingProject.previewImageUrl) {
          await ftpService.deleteFileByUrl(existingProject.previewImageUrl);
        }

        existingProject.previewImageUrl = uploadResult.url;
      }

      // Update other fields if provided
      if (name !== undefined) existingProject.name = name;
      if (owner !== undefined) existingProject.owner = owner;
      if (techStack !== undefined) existingProject.techStack = techStack;
      if (description !== undefined) existingProject.description = description;
      if (repoUrl !== undefined) existingProject.repoUrl = repoUrl;

      await existingProject.save();

      return existingProject;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        throw new Error(messages.join('. '));
      }
      throw error;
    }
  }

  /**
   * Deletes a project and its preview image from the FTP server.
   * @async
   * @param {string} projectId - The project's unique identifier
   * @returns {Promise<void>}
   * @throws {Error} Throws if project not found
   */
  async deleteProject(projectId) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Delete preview image from FTP server
    if (project.previewImageUrl) {
      const deleteResult = await ftpService.deleteFileByUrl(project.previewImageUrl);

      if (!deleteResult.success) {
        console.error(`Failed to delete image from FTP: ${deleteResult.error}`);
      }
    }

    await Project.findByIdAndDelete(projectId);
  }
}

export default new ProjectService();