import express from 'express';
import projectService from '../services/project-service.js';
import { projectValidation, projectUpdateValidation } from '../utils/validatator.js';
import { validationResult } from 'express-validator';
import { authenticate, adminOnly } from '../utils/authentication-helper.js';

const router = express.Router();

/**
 * Middleware to handle validation errors from express-validator.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @route   POST /v1/projects
// @desc    Create a new project
// @access  Admin only
router.post('/', authenticate, adminOnly, projectValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, owner, previewImageBase64, techStack, description, repoUrl } = req.body;

    await projectService.createProject({
      name,
      owner,
      previewImageBase64,
      techStack,
      description,
      repoUrl
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /v1/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const result = await projectService.getProjects();

    res.status(200).json({
      success: true,
      message: 'Projects retrieved',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /v1/projects/:id
// @desc    Get a single project by ID
// @access  Admin only
router.get('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const result = await projectService.getProjectById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project retrieved',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /v1/projects/:id
// @desc    Update a project
// @access  Admin only
router.put('/:id', authenticate, adminOnly, projectUpdateValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, owner, previewImageBase64, techStack, description, repoUrl } = req.body;

    const result = await projectService.updateProject(req.params.id, {
      name,
      owner,
      previewImageBase64,
      techStack,
      description,
      repoUrl
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'Project not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /v1/projects/:id
// @desc    Delete a project
// @access  Admin only
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await projectService.deleteProject(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Project not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
