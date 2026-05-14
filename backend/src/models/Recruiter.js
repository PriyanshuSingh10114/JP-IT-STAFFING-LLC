/**
 * Recruiter Model
 */

const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Recruiter name is required'],
  },
  title: String,
  company: String,
  email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  phone: String,
  linkedinProfile: String,
  linkedinId: String,
  profileImage: String,
  bio: String,
  emailSources: {
    direct: { value: String, confidence: Number },
    domain: { value: String, confidence: Number },
    hunter: { value: String, confidence: Number },
    apollo: { value: String, confidence: Number },
    company: { value: String, confidence: Number },
  },
  bestEmail: {
    value: String,
    source: String,
    confidence: Number,
  },
  company: String,
  industry: String,
  location: String,
  responses: [
    {
      messageId: mongoose.Schema.Types.ObjectId,
      timestamp: Date,
      subject: String,
      body: String,
      status: String,
    },
  ],
  applicationCount: { type: Number, default: 0 },
  responseRate: { type: Number, default: 0 },
  avgResponseTime: Number,
  tags: [String],
  blacklisted: {
    type: Boolean,
    default: false,
  },
  blacklistReason: String,
  lastContactedAt: Date,
  notes: String,
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
recruiterSchema.index({ userId: 1, email: 1 }, { unique: true });
recruiterSchema.index({ linkedinId: 1 });
recruiterSchema.index({ blacklisted: 1 });

// Update timestamp on save
recruiterSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Recruiter', recruiterSchema);
