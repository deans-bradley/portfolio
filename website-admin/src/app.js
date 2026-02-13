// app.js

import { config } from './config.js';
import { Config } from './models/index.js';
import { $ } from './utils/index.js';
import { AuthenticationService } from './services/index.js';
import { LoginComponent } from './components/index.js';
import { AuthManager, ProjectManager, TestimonialManager, LogManager, HealthManager } from './managers/index.js';

class App {
  constructor() {
    /** @type {Config} */
    this.config = config;
    /** @type {AuthManager} */
    this.auth = new AuthManager();
    /** @type {AuthenticationService} */
    this.authService = new AuthenticationService(config);
    /** @type {ProjectManager|null} */
    this.projectManager = null;
    /** @type {TestimonialManager|null} */
    this.testimonialManager = null;
    /** @type {LogManager|null} */
    this.logManager = null;
    /** @type {HealthManager|null} */
    this.healthManager = null;
    /** @type {LoginComponent|null} */
    this.loginComponent = null;
  }

  init() {
    this.renderApp();
  }

  /**
   * Render the appropriate view based on auth state
   */
  renderApp() {
    const $main = $('main');
    const $header = $('header');
    
    if (this.auth.isAuthenticated() && this.auth.isAdmin()) {
      this.renderAdminView($main, $header);
    } else {
      this.renderLoginView($main, $header);
    }
  }

  /**
   * Render the login view
   * @param {jQuery} $main
   * @param {jQuery} $header
   */
  renderLoginView($main, $header) {
    $header.html(`
      <nav class="container">
        <ul>
          <li><strong>Portfolio Admin</strong></li>
        </ul>
      </nav>
    `);

    $main.html(`
      <div class="container">
        <div id="login-component" style="max-width: 400px; margin: 2rem auto;"></div>
      </div>
    `);

    this.loginComponent = new LoginComponent(
      $('#login-component'),
      this.authService,
      this.config,
      () => this.handleLoginSuccess()
    );
  }

  /**
   * Handle successful login
   */
  handleLoginSuccess() {
    this.loginComponent = null;
    this.renderApp();
  }

  /**
   * Render the admin dashboard view
   * @param {jQuery} $main
   * @param {jQuery} $header
   */
  renderAdminView($main, $header) {
    const user = this.auth.getCurrentUser();
    
    $header.html(`
      <nav class="container">
        <ul>
          <li><strong>Portfolio Admin</strong></li>
        </ul>
        <ul>
          <li><small>${user?.email || 'Admin'}</small></li>
          <li><button id="logout-btn" class="outline secondary">Logout</button></li>
        </ul>
      </nav>
    `);

    // Bind logout
    $('#logout-btn').on('click', () => this.handleLogout());

    $main.html(`
      <div class="container">
        <nav aria-label="Dashboard navigation" style="margin-bottom: 2rem;">
          <ul>
            <li><a href="#projects" class="nav-link" data-target="projects">Projects</a></li>
            <li><a href="#testimonials" class="nav-link" data-target="testimonials">Testimonials</a></li>
            <li><a href="#logs" class="nav-link" data-target="logs">Logs</a></li>
            <li><a href="#health" class="nav-link" data-target="health">Health</a></li>
          </ul>
        </nav>
        <section id="projects-component" style="display: none;"></section>
        <section id="testimonials-component" style="display: none;"></section>
        <section id="logs-component" style="display: none;"></section>
        <section id="health-component" style="display: none;"></section>
      </div>
    `);

    // Bind navigation
    $('.nav-link').on('click', (e) => {
      e.preventDefault();
      const target = $(e.currentTarget).data('target');
      this.showSection(target);
    });

    // Initialize managers
    this.initComponents();

    // Show projects by default
    this.showSection('projects');
  }

  /**
   * Initialize component managers
   */
  initComponents() {
    this.projectManager = new ProjectManager(this.config);
    this.testimonialManager = new TestimonialManager(this.config);
    this.logManager = new LogManager(this.config);
    this.healthManager = new HealthManager(this.config);
  }

  /**
   * Show a specific section
   * @param {string} section - 'projects', 'testimonials', or 'logs'
   */
  showSection(section) {
    // Hide all sections
    $('#projects-component, #testimonials-component, #logs-component, #health-component').hide();

    // Update nav active state
    $('.nav-link').attr('aria-current', false);
    $(`.nav-link[data-target="${section}"]`).attr('aria-current', 'page');

    // Show and initialize the selected section
    if (section === 'projects') {
      $('#projects-component').show();
      if (!this.projectManager?.projectsComponent) {
        this.projectManager?.init();
      }
    } else if (section === 'testimonials') {
      $('#testimonials-component').show();
      if (!this.testimonialManager?.testimonialsComponent) {
        this.testimonialManager?.init();
      }
    } else if (section === 'logs') {
      $('#logs-component').show();
      if (!this.logManager?.logsComponent) {
        this.logManager?.init();
      }
    } else if (section === 'health') {
      $('#health-component').show();
      if (!this.healthManager?.healthComponent) {
        this.healthManager?.init();
      }
    }
  }

  /**
   * Handle logout
   */
  handleLogout() {
    this.auth.logout();
    this.projectManager = null;
    this.testimonialManager = null;
    this.logManager = null;
    this.healthManager?.destroy();
    this.healthManager = null;
    this.renderApp();
  }
}

// Initialize app
const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());

export default app;