/**
 * @typedef {Object} ProjectData
 * @property {string} id
 * @property {string} name
 * @property {string} owner
 * @property {string} previewImageUrl
 * @property {string[]} techStack
 * @property {string} description
 * @property {string} [repoUrl]
 * @property {number} order
 * @property {string} createdAt
 * @property {string} updatedAt
 */

class Project {
  /**
   * Create a new Project instance
   * @param {ProjectData} data - The project data
   */
  constructor(data = {}) {
    this.id = data.id || data._id;
    this.name = data.name;
    this.owner = data.owner;
    this.previewImageUrl = data.previewImageUrl;
    this.techStack = data.techStack || [];
    this.description = data.description;
    this.repoUrl = data.repoUrl;
    this.order = data.order;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Validate the project object
   * @throws {Error} When project is invalid
   */
  validate() {
    if (!this.id || typeof this.id !== 'string') {
      throw new Error('ID is not a valid string');
    }

    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Name is not a valid string');
    }

    if (!this.owner || typeof this.owner !== 'string') {
      throw new Error('Owner is not a valid string');
    }

    if (!this.previewImageUrl || typeof this.previewImageUrl !== 'string') {
      throw new Error('Preview image URL is not a valid string');
    }

    if (!Array.isArray(this.techStack)) {
      throw new Error('Tech stack is not a valid array');
    }

    if (this.techStack.some(item => typeof item !== 'string')) {
      throw new Error('Tech stack contains invalid items');
    }

    if (!this.description || typeof this.description !== 'string') {
      throw new Error('Description is not a valid string');
    }

    if (this.repoUrl && typeof this.repoUrl !== 'string') {
      throw new Error('Repo URL is not a valid string');
    }

    if (this.order == null || typeof this.order !== 'number') {
      throw new Error('Order is not a valid number');
    }

    if (this.createdAt && typeof this.createdAt !== 'string') {
      throw new Error('Created at is not a valid string');
    }

    if (this.updatedAt && typeof this.updatedAt !== 'string') {
      throw new Error('Updated at is not a valid string');
    }
  }

  /**
   * Convert to plain JSON object for serialization
   * @returns {ProjectData} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      owner: this.owner,
      previewImageUrl: this.previewImageUrl,
      techStack: this.techStack,
      description: this.description,
      repoUrl: this.repoUrl,
      order: this.order,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create a Project instance from a plain object
   * @param {ProjectData} data - Plain object data
   * @returns {Project} Project instance
   */
  static fromJSON(data) {
    const project = new Project(data);
    project.validate();
    return project;
  }

  /**
   * Creates an array of Project instances from an array of plain objects
   * @param {ProjectData[]} data - Array of plain objects
   * @returns {Project[]} Array of Project instances
   */
  static fromJSONArray(data) {
    const projects = [];

    data.forEach(project => {
      projects.push(Project.fromJSON(project));
    });

    return projects;
  }
}

export { Project };
