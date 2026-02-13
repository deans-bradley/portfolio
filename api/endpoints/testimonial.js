import express from 'express';
import testimonialService from '../services/testimonial-service.js';
import { testimonialValidation } from '../utils/validatator.js';
import { validationResult } from 'express-validator';
import { authenticate, adminOnly } from '../utils/authentication-helper.js';

const router = express.Router();

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

// @route   POST /v1/testimonial
// @desc    Create a new testimonial
// @access  Public
router.post('/', testimonialValidation, handleValidationErrors, async (req, res) => {
  try {
    const { firstName, lastName, email, linkedinProfileUrl, company, jobTitle, avatar, message } = req.body;
    
    await testimonialService.createTestimonial({
      firstName,
      lastName,
      email,
      linkedinProfileUrl,
      company,
      jobTitle,
      avatar,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /v1/testimonials
// @desc    Get testimonials
// @access  Public
router.get('/', async (req, res) => {
  try {
    const result = await testimonialService.getTestimonials();

    res.status(200).json({
      success: true,
      message: 'Testimonials retrieved',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /v1/testimonials/all
// @desc    Get all testimonials (including unapproved)
// @access  Admin only
router.get('/all', authenticate, adminOnly, async (req, res) => {
  try {
    const result = await testimonialService.getAllTestimonials();

    res.status(200).json({
      success: true,
      message: 'All testimonials retrieved',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PATCH /v1/testimonials/:id/approve
// @desc    Approve a testimonial
// @access  Admin only
router.patch('/:id/approve', authenticate, adminOnly, async (req, res) => {
  try {
    const result = await testimonialService.approveTestimonial(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Testimonial approved successfully',
      data: result
    });
  } catch (error) {
    const statusCode = error.message === 'Testimonial not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /v1/testimonials/:id
// @desc    Delete/reject a testimonial
// @access  Admin only
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await testimonialService.deleteTestimonial(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    const statusCode = error.message === 'Testimonial not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
