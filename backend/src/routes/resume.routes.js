/**
 * Resume Routes
 * Handles resume uploads and management
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Resume = require('../models/Resume');
const logger = require('../utils/logger');

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../resumes'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/msword'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/**
 * GET /api/resumes
 * Get all resumes for user
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    logger.error('Error fetching resumes:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/resumes/:id
 * Get single resume
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    logger.error('Error fetching resume:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/resumes/upload
 * Upload resume
 */
router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const resume = new Resume({
      userId: req.userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      title: req.body.title || req.file.originalname,
      description: req.body.description,
      isPrimary: req.body.isPrimary === 'true',
      targetRoles: req.body.targetRoles ? JSON.parse(req.body.targetRoles) : [],
      skills: req.body.skills ? JSON.parse(req.body.skills) : [],
    });

    await resume.save();

    logger.info(`Resume uploaded: ${resume.filename}`);

    res.status(201).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    logger.error('Error uploading resume:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /api/resumes/:id
 * Update resume metadata
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    logger.info(`Resume updated: ${resume.title}`);

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    logger.error('Error updating resume:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * DELETE /api/resumes/:id
 * Delete resume
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    logger.info(`Resume deleted: ${resume.title}`);

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/resumes/:id/set-primary
 * Set resume as primary
 */
router.post('/:id/set-primary', authMiddleware, async (req, res) => {
  try {
    // Set all user's resumes to not primary
    await Resume.updateMany({ userId: req.userId }, { isPrimary: false });

    // Set this resume as primary
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isPrimary: true },
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    logger.error('Error setting primary resume:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
