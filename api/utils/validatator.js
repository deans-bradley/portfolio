import { body } from 'express-validator';

/**
 * @typedef {import('express-validator').ValidationChain} ValidationChain
 */

/**
 * Validation rules for user registration endpoint.
 * Validates email, password strength, first name, last name, and optional role.
 * @type {Array<ValidationChain>}
 * @constant
 */
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin')
];

/**
 * Validation rules for user login endpoint.
 * Validates email format and password presence.
 * @type {Array<ValidationChain>}
 * @constant
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for password change endpoint.
 * Validates current password presence and new password strength.
 * @type {Array<ValidationChain>}
 * @constant
 */
export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

/**
 * Validation rules for testimonial submission endpoint.
 * Validates required fields (firstName, lastName, email, message) and optional fields
 * (linkedinProfileUrl, company, jobTitle) with appropriate formats and length limits.
 * @type {Array<ValidationChain>}
 * @constant
 */
export const testimonialValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Email must be at least 5 characters')
    .matches(/^[^@]+@[^@]+\.[^@]+$/)
    .withMessage('Please provide a valid email'),
  body('linkedinProfileUrl')
    .optional({ values: 'falsy' })
    .matches(/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i)
    .withMessage('Please provide a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)'),
  body('company')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('jobTitle')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Job title cannot exceed 100 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Testimonial message is required')
    .isLength({ max: 250 })
    .withMessage('Testimonial message cannot exceed 250 characters')
];

/**
 * Validation rules for project creation endpoint.
 * Validates required fields (name, owner, previewImageBase64, techStack, description, order)
 * and optional repoUrl field.
 * @type {Array<ValidationChain>}
 * @constant
 */
export const projectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 50 })
    .withMessage('Project name cannot exceed 50 characters'),
  body('owner')
    .trim()
    .notEmpty()
    .withMessage('Project owner is required')
    .isLength({ max: 50 })
    .withMessage('Project owner name cannot exceed 50 characters'),
  body('previewImageBase64')
    .notEmpty()
    .withMessage('Preview image is required')
    .matches(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/)
    .withMessage('Preview image must be a valid base64 image string'),
  body('techStack')
    .isArray({ min: 1 })
    .withMessage('Tech stack must be an array with at least one technology'),
  body('techStack.*')
    .trim()
    .notEmpty()
    .withMessage('Each technology in tech stack must be a non-empty string'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required'),
  body('order')
    .notEmpty()
    .withMessage('Display order is required')
    .isInt({ min: 1 })
    .withMessage('Display order must be a positive integer'),
  body('repoUrl')
    .optional({ values: 'falsy' })
    .isURL()
    .withMessage('Repository URL must be a valid URL')
];

/**
 * Validation rules for project update endpoint.
 * All fields are optional, but validated if provided.
 * @type {Array<ValidationChain>}
 * @constant
 */
export const projectUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Project name cannot exceed 50 characters'),
  body('owner')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project owner cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Project owner name cannot exceed 50 characters'),
  body('previewImageBase64')
    .optional()
    .matches(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/)
    .withMessage('Preview image must be a valid base64 image string'),
  body('techStack')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Tech stack must be an array with at least one technology'),
  body('techStack.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Each technology in tech stack must be a non-empty string'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project description cannot be empty'),
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Display order must be a positive integer'),
  body('repoUrl')
    .optional({ values: 'falsy' })
    .isURL()
    .withMessage('Repository URL must be a valid URL')
];

