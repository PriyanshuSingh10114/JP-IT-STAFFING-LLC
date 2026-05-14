/**
 * Application Routes
 * Handles job applications tracking
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Application = require('../models/Application');
const logger = require('../utils/logger');

/**
 * GET /api/applications
 * Get all applications
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { userId: req.userId };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const applications = await Application.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('jobId')
      .populate('recruiterId')
      .populate('resumeId');

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/applications/:id
 * Get single application
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.userId,
    })
      .populate('jobId')
      .populate('recruiterId')
      .populate('resumeId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    logger.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/applications
 * Create new application
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Check for duplicate application
    const existingApplication = await Application.findOne({
      userId: req.userId,
      jobId: req.body.jobId,
      recruiterId: req.body.recruiterId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job',
      });
    }

    const application = new Application({
      userId: req.userId,
      ...req.body,
    });

    await application.save();

    logger.info(`Application created for job: ${application.jobId}`);

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    logger.error('Error creating application:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /api/applications/:id
 * Update application
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    logger.info(`Application updated: ${application._id}`);

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    logger.error('Error updating application:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/applications/stats/overview
 * Get application statistics
 */
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusBreakdown = {};
    stats.forEach((stat) => {
      statusBreakdown[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: statusBreakdown,
    });
  } catch (error) {
    logger.error('Error fetching application stats:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
