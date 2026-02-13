import express from 'express';
import logService from '../services/log-service.js';
import { authenticate, adminOnly } from '../utils/authentication-helper.js';

const router = express.Router();

// @route   GET /v1/logs
// @desc    Get all logs with optional filtering and pagination
// @access  Admin only
router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const {
      level,
      startDate,
      endDate,
      correlationId,
      userId,
      method,
      path,
      page,
      limit
    } = req.query;

    const result = await logService.getLogs({
      level,
      startDate,
      endDate,
      correlationId,
      userId,
      method,
      path,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined
    });

    res.status(200).json({
      success: true,
      message: 'Logs retrieved',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /v1/logs/:id
// @desc    Get a single log by ID
// @access  Admin only
router.get('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const log = await logService.getLogById(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Log retrieved',
      data: log
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
