/**
 * User Model
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  linkedinEmail: {
    type: String,
    trim: true,
  },
  linkedinPassword: {
    type: String,
    select: false,
  },
  gmailEmail: {
    type: String,
    trim: true,
  },
  gmailRefreshToken: {
    type: String,
    select: false,
  },
  openaiApiKey: {
    type: String,
    select: false,
  },
  hunterApiKey: {
    type: String,
    select: false,
  },
  apolloApiKey: {
    type: String,
    select: false,
  },
  linkedinSessionPath: {
    type: String,
  },
  automationEnabled: {
    type: Boolean,
    default: false,
  },
  automationSchedule: {
    enabled: Boolean,
    intervalMinutes: Number,
    lastRun: Date,
    nextRun: Date,
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark',
    },
    notifications: {
      email: { type: Boolean, default: true },
      telegram: { type: Boolean, default: false },
      slack: { type: Boolean, default: false },
    },
    searchKeywords: [String],
    jobTypes: [String],
    locations: [String],
    maxJobsPerRun: { type: Number, default: 20 },
  },
  profile: {
    linkedinProfile: String,
    portfolio: String,
    github: String,
    leetcode: String,
    experience: String,
    skills: [String],
  },
  stats: {
    totalJobsSearched: { type: Number, default: 0 },
    totalJobsApplied: { type: Number, default: 0 },
    totalEmailsSent: { type: Number, default: 0 },
    totalReplies: { type: Number, default: 0 },
    failedApplications: { type: Number, default: 0 },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update timestamp on save
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
