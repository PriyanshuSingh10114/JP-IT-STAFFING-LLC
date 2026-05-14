/**
 * Automation Routes
 * Handles automation workflow triggers
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const logger = require('../utils/logger');
const AutomationLog = require('../models/AutomationLog');

/**
 * POST /api/automation/start-search
 * Start LinkedIn job search automation
 */
router.post('/start-search', authMiddleware, async (req, res) => {
  try {
    logger.info(`Starting job search automation for user: ${req.userId}`);

    // Create automation log
    const automationLog = new AutomationLog({
      userId: req.userId,
      automationType: 'linkedin_search',
      status: 'started',
    });

    await automationLog.save();

    // Trigger actual automation in background
    const AutomationOrchestrationService = require('../services/AutomationOrchestrationService');
    
    // We don't await this as we want it to run in background
    AutomationOrchestrationService.runCompleteAutomation(req.userId, {
      keywords: req.body.keywords,
      maxJobs: req.body.maxJobs
    }).catch(err => {
      logger.error(`Background automation failed for user ${req.userId}:`, err);
    });

    res.status(200).json({
      success: true,
      message: 'Job search automation started',
      automationId: automationLog._id,
    });
  } catch (error) {
    logger.error('Error starting job search:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/automation/status/:automationId
 * Get automation status
 */
router.get('/status/:automationId', authMiddleware, async (req, res) => {
  try {
    const automation = await AutomationLog.findOne({
      _id: req.params.automationId,
      userId: req.userId,
    });

    if (!automation) {
      return res.status(404).json({
        success: false,
        message: 'Automation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: automation,
    });
  } catch (error) {
    logger.error('Error fetching automation status:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/automation/logs
 * Get automation logs
 */
router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await AutomationLog.find({ userId: req.userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await AutomationLog.countDocuments({ userId: req.userId });

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching automation logs:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/automation/pause
 * Pause automation
 */
router.post('/pause', authMiddleware, async (req, res) => {
  try {
    logger.info(`Pausing automation for user: ${req.userId}`);

    // TODO: Implement pause logic

    res.status(200).json({
      success: true,
      message: 'Automation paused',
    });
  } catch (error) {
    logger.error('Error pausing automation:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
