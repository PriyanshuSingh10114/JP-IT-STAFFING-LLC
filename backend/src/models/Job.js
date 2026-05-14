/**
 * Job Model
 */

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruiter',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
  },
  description: {
    type: String,
  },
  keywords: [String],
  jobType: {
    type: String,
    enum: ['Fulltime', 'Contract', 'Part Time', 'Internship', 'Freelance'],
  },
  location: String,
  isRemote: Boolean,
  isHybrid: Boolean,
  salary: {
    min: Number,
    max: Number,
    currency: String,
  },
  linkedinPostUrl: String,
  linkedinPostId: String,
  linkedinCompanyPage: String,
  requiredSkills: [String],
  preferredSkills: [String],
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Manager'],
  },
  postedDate: Date,
  extractedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDuplicate: {
    type: Boolean,
    default: false,
  },
  duplicateOf: mongoose.Schema.Types.ObjectId,
  matchScore: Number,
  appliedAt: Date,
  status: {
    type: String,
    enum: ['new', 'shortlisted', 'applied', 'rejected', 'accepted'],
    default: 'new',
  },
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
jobSchema.index({ userId: 1, createdAt: -1 });
jobSchema.index({ linkedinPostId: 1 }, { unique: true });
jobSchema.index({ isDuplicate: 1 });

// Update timestamp on save
jobSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Job', jobSchema);
