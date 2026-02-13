// app.js

import { config } from './config.js';
import { Config } from './models/index.js';
import { ProjectService, TestimonialService } from './services/index.js';
import { $, handleCopyRight, handleTheme, toggleTheme, handleSmoothScroll, handleTypingAnimation } from './utils/index.js';
import { ProjectsComponent, TestimonialComponent } from './components/index.js';

class App {
  constructor() {
    /** @type {Config} */
    this.config = config;

    /** @type {ProjectService} */
    this.projectService = null;
    /** @type {TestimonialService} */
    this.testimonialService = null;
  }

  init() {
    this.bind();
    this.initServices();
    this.initHelpers();
    this.initComponents();
  }

  bind() {
    $('#theme-toggle').on('click', function() {
      toggleTheme();
    });
  }

  initServices() {
    this.projectService = new ProjectService(this.config);
    this.testimonialService = new TestimonialService(this.config);
  }

  initHelpers() {
    handleTheme();
    handleSmoothScroll();
    handleTypingAnimation();
    handleCopyRight();
  }

  initComponents() {
    if ($('#projects-component').length) {
      const projectsComponent = new ProjectsComponent('#projects-component', this.projectService, this.config);
      projectsComponent.show();
    }

    if ($('#testimonial-component').length) {
      const testimonialComponent = new TestimonialComponent('#testimonial-component', this.testimonialService, this.config);
      testimonialComponent.show();
    }
  }
}

// Initialize app
const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());

export default app;