/**
 * Job Routes
 * Handles job search, filtering, and retrieval
 */

const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const validationHandler = require('../middleware/validationHandler');
const Job = require('../models/Job');
const logger = require('../utils/logger');

/**
 * GET /api/jobs
 * Get all jobs with pagination and filters
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { userId: req.userId };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.isDuplicate !== undefined) {
      filter.isDuplicate = req.query.isDuplicate === 'true';
    }

    if (req.query.searchTerm) {
      filter.$or = [
        { title: { $regex: req.query.searchTerm, $options: 'i' } },
        { company: { $regex: req.query.searchTerm, $options: 'i' } },
        { description: { $regex: req.query.searchTerm, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await Job.countDocuments(filter);

    // Get jobs
    const jobs = await Job.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).populate('recruiterId');

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/jobs/:id
 * Get single job
 */
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.userId }).populate('recruiterId');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    logger.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/jobs
 * Create new job
 */
router.post(
  '/',
  authMiddleware,
  [body('title').notEmpty(), body('company').notEmpty()],
  validationHandler,
  async (req, res, next) => {
    try {
      const job = new Job({
        userId: req.userId,
        ...req.body,
      });

      await job.save();

      logger.info(`Job created: ${job.title}`);

      res.status(201).json({
        success: true,
        data: job,
      });
    } catch (error) {
      logger.error('Error creating job:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * PUT /api/jobs/:id
 * Update job
 */
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const job = await Job.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    logger.info(`Job updated: ${job.title}`);

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    logger.error('Error updating job:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * DELETE /api/jobs/:id
 * Delete job
 */
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    logger.info(`Job deleted: ${job.title}`);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
