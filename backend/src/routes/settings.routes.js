/**
 * Settings Routes
 * Handles user settings management
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Settings = require('../models/Settings');
const logger = require('../utils/logger');

/**
 * GET /api/settings
 * Get user settings
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.userId });

    if (!settings) {
      // Create default settings if they don't exist
      settings = new Settings({ userId: req.userId });
      await settings.save();
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /api/settings
 * Update user settings
 */
router.put('/', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.userId });

    if (!settings) {
      settings = new Settings({ userId: req.userId });
    }

    // Update settings
    Object.assign(settings, req.body);
    await settings.save();

    logger.info(`Settings updated for user: ${req.userId}`);

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error('Error updating settings:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/settings/reset
 * Reset settings to defaults
 */
router.post('/reset', authMiddleware, async (req, res) => {
  try {
    await Settings.deleteOne({ userId: req.userId });

    const settings = new Settings({ userId: req.userId });
    await settings.save();

    logger.info(`Settings reset for user: ${req.userId}`);

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error('Error resetting settings:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
