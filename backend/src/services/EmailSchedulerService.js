/**
 * Email Scheduler Service
 * Handles scheduled email sending using Bull queue
 */

const Queue = require('bull');
const GmailService = require('./GmailService');
const EmailLog = require('../models/EmailLog');
const Application = require('../models/Application');
const logger = require('../utils/logger');

// Create Bull queue
const emailQueue = new Queue('email-jobs', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

class EmailSchedulerService {
  /**
   * Initialize queue processors
   */
  static initialize() {
    // Process queued emails
    emailQueue.process(10, async (job) => {
      logger.info(`Processing email job ${job.id}`);
      return this.processEmailJob(job.data);
    });

    // Queue event handlers
    emailQueue.on('completed', (job) => {
      logger.info(`Email job ${job.id} completed`);
    });

    emailQueue.on('failed', (job, err) => {
      logger.error(`Email job ${job.id} failed:`, err.message);
    });

    logger.info('Email scheduler initialized');
  }

  /**
   * Add email to queue
   */
  static async scheduleEmail(emailData, delay = 0) {
    try {
      const job = await emailQueue.add(emailData, {
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      });

      logger.info(`Email scheduled with job ID: ${job.id}`);

      return {
        jobId: job.id,
        scheduled: true,
      };
    } catch (error) {
      logger.error('Error scheduling email:', error);
      throw error;
    }
  }

  /**
   * Process email job
   */
  static async processEmailJob(emailData) {
    const { to, subject, body, userId, applicationId, htmlContent } = emailData;

    try {
      // Send email
      const result = await GmailService.sendEmailViaGmail(to, subject, body, {
        htmlContent,
        userId,
        applicationId,
      });

      // Update email log
      const emailLog = await EmailLog.findById(result.emailLogId);
      if (emailLog) {
        emailLog.status = 'sent';
        emailLog.gmailMessageId = result.messageId;
        await emailLog.save();
      }

      // Update application status
      if (applicationId) {
        await Application.findByIdAndUpdate(applicationId, {
          status: 'sent',
          emailLogId: result.emailLogId,
        });
      }

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      logger.error(`Error sending email to ${to}:`, error);

      // Update email log with error
      if (emailData.emailLogId) {
        await EmailLog.findByIdAndUpdate(emailData.emailLogId, {
          status: 'failed',
          errorMessage: error.message,
        });
      }

      throw error;
    }
  }

  /**
   * Schedule batch emails
   */
  static async scheduleBatchEmails(emails, delayMs = 5000) {
    try {
      const jobs = [];
      let delay = 0;

      for (const email of emails) {
        const job = await this.scheduleEmail(email, delay);
        jobs.push(job);
        delay += delayMs; // Stagger emails
      }

      logger.info(`Scheduled ${jobs.length} emails for sending`);

      return {
        success: true,
        count: jobs.length,
        jobs,
      };
    } catch (error) {
      logger.error('Error scheduling batch emails:', error);
      throw error;
    }
  }

  /**
   * Get queue status
   */
  static async getQueueStatus() {
    try {
      const counts = await emailQueue.getJobCounts();

      return {
        active: counts.active,
        waiting: counts.waiting,
        completed: counts.completed,
        failed: counts.failed,
        delayed: counts.delayed,
      };
    } catch (error) {
      logger.error('Error getting queue status:', error);
      return null;
    }
  }

  /**
   * Retry failed emails
   */
  static async retryFailedEmails(limit = 10) {
    try {
      const failedJobs = await emailQueue.getFailed(limit);
      let retryCount = 0;

      for (const job of failedJobs) {
        await job.retry();
        retryCount++;
      }

      logger.info(`Retried ${retryCount} failed email jobs`);

      return {
        success: true,
        retried: retryCount,
      };
    } catch (error) {
      logger.error('Error retrying failed emails:', error);
      throw error;
    }
  }

  /**
   * Pause email queue
   */
  static async pauseQueue() {
    try {
      await emailQueue.pause();
      logger.info('Email queue paused');
      return { success: true, status: 'paused' };
    } catch (error) {
      logger.error('Error pausing queue:', error);
      throw error;
    }
  }

  /**
   * Resume email queue
   */
  static async resumeQueue() {
    try {
      await emailQueue.resume();
      logger.info('Email queue resumed');
      return { success: true, status: 'resumed' };
    } catch (error) {
      logger.error('Error resuming queue:', error);
      throw error;
    }
  }

  /**
   * Clear queue
   */
  static async clearQueue() {
    try {
      await emailQueue.clean(0, 'completed');
      await emailQueue.clean(0, 'failed');
      logger.info('Email queue cleared');
      return { success: true };
    } catch (error) {
      logger.error('Error clearing queue:', error);
      throw error;
    }
  }

  /**
   * Close queue connection
   */
  static async closeQueue() {
    try {
      await emailQueue.close();
      logger.info('Email queue closed');
    } catch (error) {
      logger.error('Error closing queue:', error);
    }
  }
}

module.exports = EmailSchedulerService;
