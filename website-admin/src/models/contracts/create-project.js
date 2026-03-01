// contracts/create-project.js

/**
 * @typedef {Object} CreateProjectData
 * @property {string} name - The project name
 * @property {string} owner - The person/entity that owns the project
 * @property {string} previewImageBase64 - The project preview image URL to display on the client
 * @property {Array<string>} techStack - The tech stack used to create the project
 * @property {string} description - The project description
 * @property {string} [repoUrl] - The remote repository URL if available
 * @property {number} order - The display order for the project
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid
 * @property {Object<string, string>} errors - Field name to error message mapping
 */

const BASE64_IMAGE_REGEX = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;

class CreateProject {
  /**
   * Create a new CreateProjectData instance
   * @param {CreateProjectData} data - The create project data
   * @param {boolean} [isEdit=false] - Whether this is an edit operation (makes previewImageBase64 optional)
   */
  constructor(data = {}, isEdit = false) {
    this.name = data.name.trim();
    this.owner = data.owner?.trim();
    this.previewImageBase64 = data.previewImageBase64?.trim() || '';
    this.techStack = data.techStack;
    this.description = data.description.trim() || '';
    this.repoUrl = data.repoUrl?.trim() || '';
    this.order = data.order;
    /** @type {boolean} */
    this.isEdit = isEdit;
  }

  /**
   * Validate the project name
   * @returns {string|null} Error message or null if valid
   */
  validateProjectName() {
    if (!this.name) {
      return 'Project name is required';
    }

    if (this.name.length < 2 || this.name.length > 50) {
      return 'Project name must be between 2 and 50 characters';
    }

    return null;
  }

  /**
   * Validate project owner
   * @returns {string|null} Error message or null if valid
   */
  validateProjectOwner() {
    if (!this.owner) {
      return 'Project owner is required';
    }

    if (this.owner.length < 2 || this.owner.length > 50) {
      return 'Project owner must be between 2 and 50 characters';
    }

    return null;
  }

  /**
   * Validate the base64 string of the preview image
   * @returns {string|null} Error message or null if valid
   */
  validateBase64Image() {
    if (!this.previewImageBase64) {
      return this.isEdit ? null : 'Project preview image is required';
    }

    if (!BASE64_IMAGE_REGEX.test(this.previewImageBase64)) {
      return 'Please provide a valid project preview image';
    }

    return null;
  }

  /**
   * Validate the project tech stack
   * @returns {string|null} Error message or null if valid
   */
  validateTechStack() {
    if (!this.techStack) {
      return 'Project tech stack is required';
    }

    if (this.techStack.length < 1) {
      return 'Project tech stack must contain atleast one technology';
    }

    return null;
  }

  /**
   * Validate project description
   * @returns {string|null} Error message or null if valid
   */
  validateDescription() {
    if (!this.description) {
      return 'Project description is required';
    }

    if (this.description.length > 2000) {
      return 'Project description cannot exceed 2000 characters';
    }

    return null;
  }

  /**
   * Validate project order
   * @returns {string|null} Error message or null if valid
   */
  validateOrder() {
    if (this.order == null) {
      return 'Project display order is required';
    }

    if (typeof this.order !== 'number' || !Number.isInteger(this.order) || this.order < 1) {
      return 'Project order must be a positive integer';
    }

    return null;
  }

  /**
   * Validate all fields and return validation result
   * @returns {ValidationResult} Validation result with errors
   */
  validate() {
    const errors = {};

    const nameError = this.validateProjectName();
    if (nameError) {
      errors.name = nameError;
    }

    const ownerError = this.validateProjectOwner();
    if (ownerError) {
      errors.owner = ownerError;
    }

    const previewImageBase64Error = this.validateBase64Image();
    if (previewImageBase64Error) {
      errors.previewImageBase64 = previewImageBase64Error;
    }

    const techStackError = this.validateTechStack();
    if (techStackError) {
      errors.techStack = techStackError;
    }

    const descriptionError = this.validateDescription();
    if (descriptionError) {
      errors.description = descriptionError;
    }

    const orderError = this.validateOrder();
    if (orderError) {
      errors.order = orderError;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Convert to plain JSON object for serialization
   * @returns {CreateProjectData} Plain object representation
   */
  toJSON() {
    const json = {
      name: this.name,
      owner: this.owner,
      techStack: this.techStack,
      description: this.description,
      repoUrl: this.repoUrl,
      order: this.order
    };

    if (this.previewImageBase64) {
      json.previewImageBase64 = this.previewImageBase64;
    }

    return json;
  }

  /**
   * Create a CreateProject instance from a plain object
   * @param {CreateProjectData} data - Plain object data
   * @returns {CreateProject} CreateProject instance
   */
  static fromJSON(data) {
    return new CreateProject(data);
  }
}

export { CreateProject };
