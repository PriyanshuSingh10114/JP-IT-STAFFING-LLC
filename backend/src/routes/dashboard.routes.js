/**
 * Dashboard Routes
 * Handles dashboard statistics and insights
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Recruiter = require('../models/Recruiter');
const User = require('../models/User');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.userId);

    // Get user info
    const user = await User.findById(userId);

    // Get application statistics
    const applications = await Application.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const applicationStats = {};
    let totalApplications = 0;
    applications.forEach((stat) => {
      applicationStats[stat._id] = stat.count;
      totalApplications += stat.count;
    });

    // Get jobs found count
    const totalJobs = await Job.countDocuments({ userId });

    // Get recruiters count
    const totalRecruiters = await Recruiter.countDocuments({ userId });

    // Get emails sent count (from applications)
    const emailsSent = await Application.countDocuments({ userId, status: { $in: ['sent', 'viewed', 'replied'] } });

    // Get recent applications
    const recentApplications = await Application.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('jobId')
      .populate('recruiterId');

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
        overview: {
          totalJobs,
          totalRecruiters,
          totalApplications,
          emailsSent,
          successRate: totalApplications > 0 ? (emailsSent / totalApplications * 100).toFixed(2) : 0,
        },
        applicationBreakdown: applicationStats,
        recentActivities: recentApplications,
        stats: user.stats || {},
      },
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/dashboard/timeline
 * Get activity timeline
 */
router.get('/timeline', authMiddleware, async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.userId);

    const timeline = await Application.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('jobId')
      .populate('recruiterId')
      .select('status createdAt sentAt viewedAt repliedAt jobId recruiterId');

    res.status(200).json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    logger.error('Error fetching timeline:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/dashboard/performance
 * Get performance metrics
 */
router.get('/performance', authMiddleware, async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.userId);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get applications in last 30 days
    const applicationsLast30Days = await Application.countDocuments({
      userId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get successful applications
    const successfulApplications = await Application.countDocuments({
      userId,
      status: { $in: ['viewed', 'replied', 'accepted'] },
    });

    // Get average response time
    const responses = await Application.find({
      userId,
      repliedAt: { $exists: true },
      sentAt: { $exists: true },
    });

    let avgResponseTime = 0;
    if (responses.length > 0) {
      const totalResponseTime = responses.reduce((acc, app) => {
        return acc + (new Date(app.repliedAt) - new Date(app.sentAt));
      }, 0);
      avgResponseTime = totalResponseTime / responses.length / (1000 * 60 * 60 * 24); // Convert to days
    }

    res.status(200).json({
      success: true,
      data: {
        applicationsLast30Days,
        successfulApplications,
        successRate: applicationsLast30Days > 0 ? (successfulApplications / applicationsLast30Days * 100).toFixed(2) : 0,
        avgResponseTimeDays: avgResponseTime.toFixed(2),
        bestResponseDay: getAverageDay(responses),
      },
    });
  } catch (error) {
    logger.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Helper function to get average day of week for responses
 */
function getAverageDay(responses) {
  if (responses.length === 0) return null;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = new Array(7).fill(0);

  responses.forEach((app) => {
    const dayOfWeek = new Date(app.repliedAt).getDay();
    dayCounts[dayOfWeek]++;
  });

  const maxDay = dayCounts.indexOf(Math.max(...dayCounts));
  return dayNames[maxDay];
}

module.exports = router;
