/**
 * Automation Log Model
 */

const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  automationType: {
    type: String,
    enum: ['linkedin_search', 'job_extraction', 'email_generation', 'email_send', 'application_tracking'],
    required: true,
  },
  status: {
    type: String,
    enum: ['started', 'in_progress', 'completed', 'failed', 'paused'],
    default: 'started',
  },
  jobsProcessed: { type: Number, default: 0 },
  jobsApplied: { type: Number, default: 0 },
  jobsFailed: { type: Number, default: 0 },
  applicationsSent: { type: Number, default: 0 },
  applicationsFailed: { type: Number, default: 0 },
  emailsGenerated: { type: Number, default: 0 },
  emailsSent: { type: Number, default: 0 },
  emailsFailed: { type: Number, default: 0 },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: Date,
  duration: Number, // in milliseconds
  errorMessage: String,
  stackTrace: String,
  details: {
    linkedinSessionActive: Boolean,
    gmailConnected: Boolean,
    openaiConnected: Boolean,
    databaseHealth: String,
  },
  screenshots: [String], // Paths to screenshots taken during automation
  logs: [
    {
      timestamp: Date,
      level: String, // 'info', 'warn', 'error'
      message: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast queries
automationLogSchema.index({ userId: 1, createdAt: -1 });
automationLogSchema.index({ status: 1 });

module.exports = mongoose.model('AutomationLog', automationLogSchema);
