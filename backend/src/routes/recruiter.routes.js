/**
 * Recruiter Routes
 * Handles recruiter information and email extraction
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Recruiter = require('../models/Recruiter');
const logger = require('../utils/logger');

/**
 * GET /api/recruiters
 * Get all recruiters
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const recruiters = await Recruiter.find({ userId: req.userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Recruiter.countDocuments({ userId: req.userId });

    res.status(200).json({
      success: true,
      data: recruiters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching recruiters:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/recruiters/:id
 * Get single recruiter
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ _id: req.params.id, userId: req.userId });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter not found',
      });
    }

    res.status(200).json({
      success: true,
      data: recruiter,
    });
  } catch (error) {
    logger.error('Error fetching recruiter:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/recruiters
 * Create new recruiter
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const recruiter = new Recruiter({
      userId: req.userId,
      ...req.body,
    });

    await recruiter.save();

    logger.info(`Recruiter created: ${recruiter.name}`);

    res.status(201).json({
      success: true,
      data: recruiter,
    });
  } catch (error) {
    logger.error('Error creating recruiter:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /api/recruiters/:id
 * Update recruiter
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const recruiter = await Recruiter.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter not found',
      });
    }

    logger.info(`Recruiter updated: ${recruiter.name}`);

    res.status(200).json({
      success: true,
      data: recruiter,
    });
  } catch (error) {
    logger.error('Error updating recruiter:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * DELETE /api/recruiters/:id
 * Delete recruiter
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const recruiter = await Recruiter.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter not found',
      });
    }

    logger.info(`Recruiter deleted: ${recruiter.name}`);

    res.status(200).json({
      success: true,
      message: 'Recruiter deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting recruiter:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/recruiters/:id/blacklist
 * Blacklist recruiter
 */
router.post('/:id/blacklist', authMiddleware, async (req, res) => {
  try {
    const recruiter = await Recruiter.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        blacklisted: true,
        blacklistReason: req.body.reason,
      },
      { new: true }
    );

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter not found',
      });
    }

    logger.info(`Recruiter blacklisted: ${recruiter.name}`);

    res.status(200).json({
      success: true,
      data: recruiter,
    });
  } catch (error) {
    logger.error('Error blacklisting recruiter:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
