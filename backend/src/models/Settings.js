/**
 * Settings Model
 */

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'dark',
  },
  language: {
    type: String,
    default: 'en',
  },
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    applicationSuccess: { type: Boolean, default: true },
    applicationFailure: { type: Boolean, default: true },
    dailyReport: { type: Boolean, default: true },
    recruiterReply: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: false },
  },
  automation: {
    enabled: { type: Boolean, default: true },
    maxJobsPerRun: { type: Number, default: 20 },
    minDelayBetweenRequests: { type: Number, default: 2000 }, // milliseconds
    maxDelayBetweenRequests: { type: Number, default: 5000 },
    enableProxyRotation: { type: Boolean, default: false },
    enableUserAgentRotation: { type: Boolean, default: true },
    headlessBrowser: { type: Boolean, default: true },
  },
  linkedin: {
    searchKeywords: [String],
    jobTypes: [String],
    locations: [String],
    postedTimeFilter: {
      type: String,
      enum: ['last_24_hours', 'last_week', 'last_month'],
      default: 'last_24_hours',
    },
    excludedCompanies: [String],
    includedCompanies: [String],
    minExperienceLevel: String,
    maxExperienceLevel: String,
  },
  email: {
    signatureTemplate: String,
    defaultTemplate: String,
    enableTracking: { type: Boolean, default: true },
    enableScheduling: { type: Boolean, default: false },
    scheduledSendTime: String,
    attachResume: { type: Boolean, default: true },
    attachCoverLetter: { type: Boolean, default: false },
    includePortfolioLink: { type: Boolean, default: true },
    includeLinkedInLink: { type: Boolean, default: true },
  },
  ai: {
    enablePersonalization: { type: Boolean, default: true },
    emailTone: {
      type: String,
      enum: ['professional', 'casual', 'formal'],
      default: 'professional',
    },
    enableAIReviewBeforeSend: { type: Boolean, default: true },
  },
  privacy: {
    dataRetentionDays: { type: Number, default: 90 },
    deleteScreenshots: { type: Boolean, default: false },
    enableEncryption: { type: Boolean, default: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
settingsSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);
