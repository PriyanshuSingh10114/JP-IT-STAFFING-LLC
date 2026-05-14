/**
 * Resume Model
 */

const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: [true, 'Filename is required'],
  },
  originalName: String,
  filePath: {
    type: String,
    required: true,
  },
  fileSize: Number,
  mimeType: String,
  title: {
    type: String,
    required: [true, 'Resume title is required'],
  },
  description: String,
  isPrimary: {
    type: Boolean,
    default: false,
  },
  targetRoles: [String], // e.g., ['Java Developer', 'Backend Engineer']
  skills: [String],
  experience: String,
  education: String,
  certifications: [String],
  languages: [String],
  projects: [
    {
      name: String,
      description: String,
      technologies: [String],
    },
  ],
  parsedData: {
    name: String,
    email: String,
    phone: String,
    location: String,
    summary: String,
    workExperience: [
      {
        company: String,
        position: String,
        duration: String,
        description: String,
      },
    ],
    education: [
      {
        school: String,
        degree: String,
        field: String,
        year: String,
      },
    ],
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  usageCount: { type: Number, default: 0 },
  lastUsedAt: Date,
  isActive: {
    type: Boolean,
    default: true,
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

// Index for fast queries
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ userId: 1, isPrimary: 1 });

// Update timestamp on save
resumeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Resume', resumeSchema);
