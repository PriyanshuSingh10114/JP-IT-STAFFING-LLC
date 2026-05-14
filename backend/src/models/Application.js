/**
 * Application Model
 */

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruiter',
    required: true,
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
  },
  emailLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailLog',
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'viewed', 'replied', 'rejected', 'accepted', 'failed'],
    default: 'pending',
  },
  emailSubject: String,
  emailBody: String,
  emailTemplate: String,
  personalizationData: {
    recruiterName: String,
    company: String,
    jobTitle: String,
    skills: [String],
  },
  sentAt: Date,
  viewedAt: Date,
  repliedAt: Date,
  replyContent: String,
  replyAttachments: [String],
  failureReason: String,
  retryCount: { type: Number, default: 0 },
  lastRetryAt: Date,
  automationMethod: String, // 'linkedin', 'email', 'manual'
  trackingPixel: String,
  openCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  notes: String,
  linkedinMessageId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast queries
applicationSchema.index({ userId: 1, createdAt: -1 });
applicationSchema.index({ jobId: 1, recruiterId: 1 }, { unique: true });
applicationSchema.index({ status: 1 });

// Update timestamp on save
applicationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
