/**
 * Email Log Model
 */

const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
  },
  recipientEmail: {
    type: String,
    required: [true, 'Recipient email is required'],
  },
  recipientName: String,
  subject: String,
  body: String,
  htmlBody: String,
  attachments: [
    {
      filename: String,
      path: String,
      mimetype: String,
    },
  ],
  status: {
    type: String,
    enum: ['draft', 'queued', 'sent', 'failed', 'bounced'],
    default: 'draft',
  },
  sentAt: Date,
  failureReason: String,
  sendMethod: {
    type: String,
    enum: ['gmail_api', 'nodemailer', 'linkedin_message'],
    default: 'gmail_api',
  },
  messageId: String,
  gmailMessageId: String,
  threadId: String,
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  openCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  trackingEnabled: {
    type: Boolean,
    default: false,
  },
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },
  nextRetryAt: Date,
  tags: [String],
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
emailLogSchema.index({ userId: 1, createdAt: -1 });
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ recipientEmail: 1 });

// Update timestamp on save
emailLogSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('EmailLog', emailLogSchema);
