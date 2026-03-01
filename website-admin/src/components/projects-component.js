// components/projects-component.js

import { $ } from '../utils/jquery-helper.js';
import { Component } from './component.js';
import { Config, Project, CreateProject } from '../models/index.js';
import { ProjectService } from '../services/index.js';

/**
 * ProjectsComponent handles CRUD operations for projects
 */
export class ProjectsComponent extends Component {
  /**
   * @param {HTMLElement|jQuery} element
   * @param {ProjectService} projectService
   * @param {Config} config
   */
  constructor(element, projectService, config) {
    super(element, config);
    
    /** @type {Array<Project>} */
    this.projects = [];
    /** @type {ProjectService} */
    this.projectService = projectService;
    /** @type {Project|null} */
    this.editingProject = null;
    /** @type {boolean} */
    this.isSubmitting = false;
    /** @type {Set<string>} */
    this.processingIds = new Set();

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
          <h2>Projects</h2>
          <button id="add-project-btn" class="outline">+ Add Project</button>
        </header>
        <div id="project-form-container" style="display: none;"></div>
        <div id="projects-list"></div>
      </article>
    `;
  }

  /**
   * @override
   * @returns {this}
   */
  cacheElements() {
    this.elements = {
      list: this.element.find('#projects-list'),
      formContainer: this.element.find('#project-form-container'),
      addBtn: this.element.find('#add-project-btn')
    };
    return this;
  }

  /**
   * @override
   * @returns {this}
   */
  bindEvents() {
    // Add project button
    this.elements.addBtn.on('click', () => this.showForm());

    // Event delegation for list actions
    this.elements.list.on('click', '.edit-btn', (e) => {
      const id = $(e.currentTarget).data('id');
      this.handleEdit(id);
    });

    this.elements.list.on('click', '.delete-btn', (e) => {
      const id = $(e.currentTarget).data('id');
      this.handleDelete(id);
    });

    // Form event delegation
    this.elements.formContainer.on('submit', '#project-form', (e) => this.handleFormSubmit(e));
    this.elements.formContainer.on('click', '#cancel-btn', () => this.hideForm());
    this.elements.formContainer.on('change', '#preview-image-input', (e) => this.handleImageUpload(e));

    return this;
  }

  /**
   * @override
   * @returns {Promise<this>}
   */
  async loadData() {
    this.renderLoadingState(true);
    try {
      this.projects = await this.projectService.fetchProjects() || [];
    } catch (error) {
      this.showError('Failed to load projects');
      this.projects = [];
    }
    return this;
  }

  /**
   * Get the project form template
   * @returns {string}
   */
  getFormTemplate() {
    const project = this.editingProject;
    const isEdit = !!project;

    return `
      <article id="project-form-article">
        <header>
          <h3>${isEdit ? 'Edit Project' : 'Add New Project'}</h3>
        </header>
        <form id="project-form">
          <label for="name">
            Project Name *
            <input 
              type="text" 
              id="name" 
              name="name" 
              value="${isEdit ? this.escapeHtml(project.name) : ''}"
              placeholder="Enter project name"
              required
            />
          </label>
          
          <label for="owner">
            Owner *
            <input 
              type="text" 
              id="owner" 
              name="owner" 
              value="${isEdit ? this.escapeHtml(project.owner) : ''}"
              placeholder="Enter project owner"
              required
            />
          </label>
          
          <label for="description">
            Description *
            <textarea 
              id="description" 
              name="description" 
              placeholder="Enter project description"
              rows="4"
              required
            >${isEdit ? this.escapeHtml(project.description) : ''}</textarea>
          </label>
          
          <label for="techStack">
            Tech Stack * (comma separated)
            <input 
              type="text" 
              id="techStack" 
              name="techStack" 
              value="${isEdit ? this.escapeHtml(project.techStack.join(', ')) : ''}"
              placeholder="React, Node.js, MongoDB"
              required
            />
          </label>
          
          <label for="repoUrl">
            Repository URL (optional)
            <input 
              type="url" 
              id="repoUrl" 
              name="repoUrl" 
              value="${isEdit ? this.escapeHtml(project.repoUrl || '') : ''}"
              placeholder="https://github.com/username/repo"
            />
          </label>
          
          <label for="order">
            Display Order *
            <input 
              type="number" 
              id="order" 
              name="order" 
              value="${isEdit ? project.order || '' : ''}"
              placeholder="Enter display order (1, 2, 3...)"
              min="1"
              required
            />
            <small>Lower numbers will display first</small>
          </label>
          
          <label for="preview-image-input">
            Preview Image *
            <input 
              type="file" 
              id="preview-image-input" 
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
              ${isEdit ? '' : 'required'}
            />
          </label>
          <div id="image-preview">
            ${isEdit && project.previewImageUrl 
              ? `<img src="${this.escapeHtml(project.previewImageUrl)}" alt="Preview" style="max-width: 200px; margin: 1rem 0;" />`
              : ''
            }
          </div>
          <input type="hidden" id="previewImageBase64" name="previewImageBase64" value="" />
          
          <div id="form-error"></div>
          
          <footer>
            <div role="group">
              <button type="button" id="cancel-btn" class="secondary">Cancel</button>
              <button type="submit" id="submit-btn">${isEdit ? 'Update' : 'Create'} Project</button>
            </div>
          </footer>
        </form>
      </article>
    `;
  }

  /**
   * Get template for a single project card
   * @param {Project} project
   * @returns {string}
   */
  getProjectCardTemplate(project) {
    const isProcessing = this.processingIds.has(project.id);
    const techStackHtml = project.techStack
      .map(tech => `<kbd>${this.escapeHtml(tech)}</kbd>`)
      .join(' ');

    return `
      <article class="project-card" data-id="${this.escapeHtml(project.id)}">
        <header>
          <hgroup>
            <h4>${this.escapeHtml(project.name)}</h4>
            <p>${this.escapeHtml(project.owner)}</p>
          </hgroup>
        </header>
        ${project.previewImageUrl 
          ? `<img src="${this.escapeHtml(project.previewImageUrl)}" alt="${this.escapeHtml(project.name)}" style="max-width: 100%; height: auto; margin-bottom: 1rem;" />`
          : ''
        }
        <p>${this.truncateDescription(project.description)}</p>
        <p><strong>Tech Stack:</strong> ${techStackHtml}</p>
        ${project.repoUrl 
          ? `<p><strong>Repo:</strong> <a href="${this.escapeHtml(project.repoUrl)}" target="_blank" rel="noopener">${this.escapeHtml(project.repoUrl)}</a></p>`
          : ''
        }
        <footer>
          <small>Order: ${project.order} | Created: ${new Date(project.createdAt).toLocaleDateString()}</small>
          <div role="group">
            <button 
              class="edit-btn outline" 
              data-id="${this.escapeHtml(project.id)}"
              ${isProcessing ? 'disabled' : ''}
            >
              Edit
            </button>
            <button 
              class="delete-btn secondary" 
              data-id="${this.escapeHtml(project.id)}"
              ${isProcessing ? 'disabled aria-busy="true"' : ''}
            >
              Delete
            </button>
          </div>
        </footer>
      </article>
    `;
  }

  /**
   * @override
   * @returns {this}
   */
  render() {
    this.renderLoadingState(false);
    this.clearErrors();

    if (!this.projects || this.projects.length === 0) {
      this.elements.list.html('<p>No projects found. Click "Add Project" to create one.</p>');
      return this;
    }

    const html = this.projects
      .map(p => this.getProjectCardTemplate(p))
      .join('');

    this.elements.list.html(html);
    return this;
  }

  /**
   * Show the project form
   * @param {Project|null} project - Project to edit, or null for new
   */
  showForm(project = null) {
    this.editingProject = project;
    this.elements.formContainer.html(this.getFormTemplate()).show();
    this.elements.addBtn.hide();
    this.elements.list.hide();
    this.elements.formContainer.find('#name').focus();
  }

  /**
   * Hide the project form
   */
  hideForm() {
    this.editingProject = null;
    this.elements.formContainer.hide().empty();
    this.elements.addBtn.show();
    this.elements.list.show();
  }

  /**
   * Handle image file upload
   * @param {Event} e
   */
  handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      this.elements.formContainer.find('#previewImageBase64').val(base64);
      this.elements.formContainer.find('#image-preview').html(
        `<img src="${base64}" alt="Preview" style="max-width: 200px; margin: 1rem 0;" />`
      );
    };
    reader.readAsDataURL(file);
  }

  /**
   * Handle form submission
   * @param {Event} e
   */
  async handleFormSubmit(e) {
    e.preventDefault();

    if (this.isSubmitting) return;

    const $form = this.elements.formContainer.find('#project-form');
    const $errorContainer = this.elements.formContainer.find('#form-error');
    this.clearErrors($errorContainer);

    // Gather form data
    const formData = {
      name: $form.find('#name').val(),
      owner: $form.find('#owner').val(),
      description: $form.find('#description').val(),
      techStack: $form.find('#techStack').val().split(',').map(s => s.trim()).filter(Boolean),
      repoUrl: $form.find('#repoUrl').val() || '',
      order: parseInt($form.find('#order').val()) || 1,
      previewImageBase64: $form.find('#previewImageBase64').val()
    };

    // For edit without new image, use existing URL
    const isEdit = !!this.editingProject;
    const hasNewImage = !!formData.previewImageBase64;
    
    if (isEdit && !hasNewImage) {
      formData.previewImageBase64 = this.editingProject.previewImageUrl;
    }

    // Validate using CreateProject model, but skip image validation for edits without new images
    const createProject = new CreateProject(formData);
    const validation = createProject.validate();

    // For edits without new images, remove image validation errors
    if (isEdit && !hasNewImage && !validation.isValid) {
      if (validation.errors.previewImageBase64) {
        delete validation.errors.previewImageBase64;
        validation.isValid = Object.keys(validation.errors).length === 0;
      }
    }

    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join('. ');
      this.showError(errorMessages, $errorContainer);
      return;
    }

    this.setFormSubmitting(true);

    try {
      if (this.editingProject) {
        await this.projectService.updateProject(this.editingProject.id, createProject);
        this.showSuccess('Project updated successfully');
      } else {
        await this.projectService.createProject(createProject);
        this.showSuccess('Project created successfully');
      }

      // Reload data and hide form
      await this.loadData();
      this.hideForm();
      this.render();
    } catch (error) {
      const errorMessage = this.parseError(error);
      this.showError(errorMessage, $errorContainer);
    } finally {
      this.setFormSubmitting(false);
    }
  }

  /**
   * Set form submitting state
   * @param {boolean} isSubmitting
   */
  setFormSubmitting(isSubmitting) {
    this.isSubmitting = isSubmitting;
    const $form = this.elements.formContainer.find('#project-form');
    $form.find('#submit-btn').attr('aria-busy', isSubmitting ? 'true' : 'false');
    $form.find('input, textarea, button').prop('disabled', isSubmitting);
  }

  /**
   * Handle edit action
   * @param {string} id
   */
  async handleEdit(id) {
    const project = this.projects.find(p => p.id === id);
    if (project) {
      this.showForm(project);
    }
  }

  /**
   * Handle delete action
   * @param {string} id
   */
  async handleDelete(id) {
    if (this.processingIds.has(id)) return;

    const confirmed = confirm('Are you sure you want to delete this project?');
    if (!confirmed) return;

    this.processingIds.add(id);
    this.render();

    try {
      await this.projectService.deleteProject(id);
      this.projects = this.projects.filter(p => p.id !== id);
      this.showSuccess('Project deleted successfully');
    } catch (error) {
      this.showError('Failed to delete project');
    } finally {
      this.processingIds.delete(id);
      this.render();
    }
  }

  /**
   * Truncate description to show max 2 lines (~120 characters)
   * @param {string} description
   * @returns {string}
   */
  truncateDescription(description) {
    if (!description) return '';
    const maxLength = 120;
    if (description.length <= maxLength) {
      return this.escapeHtml(description);
    }
    return this.escapeHtml(description.substring(0, maxLength).trim() + '...');
  }

  /**
   * Parse error response
   * @param {Error} error
   * @returns {string}
   */
  parseError(error) {
    if (error.message) {
      try {
        const parsed = JSON.parse(error.message);
        return parsed.message || 'Operation failed. Please try again.';
      } catch {
        return error.message || 'Operation failed. Please try again.';
      }
    }
    return 'Operation failed. Please try again.';
  }
}