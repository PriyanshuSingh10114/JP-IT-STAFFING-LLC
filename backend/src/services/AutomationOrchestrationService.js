/**
 * Automation Orchestration Service
 * Orchestrates the complete automation workflow
 */

const LinkedInAutomationService = require('../../automation/linkedin/LinkedInAutomationService');
const EmailGenerationService = require('./EmailGenerationService');
const GmailService = require('./GmailService');
const EmailExtractorService = require('./EmailExtractorService');
const JobFilteringService = require('./JobFilteringService');
const Job = require('../models/Job');
const Recruiter = require('../models/Recruiter');
const Application = require('../models/Application');
const AutomationLog = require('../models/AutomationLog');
const User = require('../models/User');
const logger = require('../utils/logger');

class AutomationOrchestrationService {
  /**
   * Run complete automation workflow
   */
  static async runCompleteAutomation(userId, options = {}) {
    const automationId = require('crypto').randomUUID();
    const startTime = Date.now();
    const automationLog = new AutomationLog({
      userId,
      automationType: 'linkedin_search',
      status: 'running',
      startTime,
    });

    try {
      logger.info(`Starting automation for user ${userId} (ID: ${automationId})`);

      // Fetch user and settings
      const user = await User.findById(userId);
      const settings = await require('../models/Settings').findOne({ userId });

      if (!user || !user.linkedinEmail || !user.linkedinPassword) {
        throw new Error('LinkedIn credentials not configured');
      }

      // Initialize LinkedIn Service
      const linkedInService = new LinkedInAutomationService();

      // Step 1: Login to LinkedIn
      logger.info('Step 1: Logging into LinkedIn...');
      await linkedInService.initializeBrowser();
      const loginSuccess = await linkedInService.loginToLinkedIn(user.linkedinEmail, user.linkedinPassword);

      if (!loginSuccess) {
        throw new Error('LinkedIn login failed');
      }

      // Step 2: Search and extract jobs
      logger.info('Step 2: Searching for jobs...');
      const keywords = settings?.automation?.searchKeywords || options.keywords || ['Developer'];
      const maxJobs = options.maxJobs || 20;

      const extractedJobs = await linkedInService.searchAndExtractJobs(
        keywords.join(', '),
        maxJobs
      );

      automationLog.details.jobsExtracted = extractedJobs.length;

      // Step 3: Filter jobs
      logger.info('Step 3: Filtering jobs...');
      const filteredJobs = JobFilteringService.filterJobs(extractedJobs, settings?.automation || {});
      automationLog.details.jobsFiltered = filteredJobs.length;

      let appliedCount = 0;
      const errors = [];

      // Step 4: Process each job
      logger.info(`Step 4: Processing ${filteredJobs.length} jobs...`);

      for (const jobData of filteredJobs) {
        try {
          // Check if already applied
          const existingJob = await Job.findOne({
            userId,
            linkedinPostId: jobData.linkedinPostId,
          });

          if (existingJob && existingJob.isDuplicate) {
            logger.info(`Skipping duplicate job: ${jobData.title}`);
            continue;
          }

          // Save job
          const job = new Job({
            ...jobData,
            userId,
          });
          await job.save();

          // Extract recruiter emails
          logger.info(`Extracting recruiter info for: ${jobData.title}`);
          const emailData = await EmailExtractorService.extractEmails(
            jobData.recruiter,
            jobData.description
          );

          // Save recruiter
          const recruiter = new Recruiter({
            userId,
            ...jobData.recruiter,
            emailSources: emailData.emailSources,
            bestEmail: emailData.bestEmail,
          });
          await recruiter.save();

          // Generate email
          logger.info(`Generating email for: ${jobData.title}`);
          const emailContent = await EmailGenerationService.generateApplicationEmail({
            job,
            recruiter: jobData.recruiter,
            user,
            tone: settings?.ai?.emailTone || 'professional',
          });

          // Send email
          logger.info(`Sending email to: ${emailData.bestEmail?.email}`);
          const emailResult = await GmailService.sendEmailViaGmail(
            emailData.bestEmail?.email,
            emailContent.subject,
            emailContent.body,
            {
              userId,
              jobId: job._id,
              recruiterId: recruiter._id,
            }
          );

          // Save application
          const application = new Application({
            userId,
            jobId: job._id,
            recruiterId: recruiter._id,
            status: 'sent',
            emailSubject: emailContent.subject,
            emailBody: emailContent.body,
            emailLogId: emailResult.emailLogId,
            personalizationData: emailContent.personalizationData,
          });
          await application.save();

          appliedCount++;
          automationLog.counters.applied++;

          logger.info(`Successfully applied to: ${jobData.title}`);
        } catch (jobError) {
          errors.push({
            job: jobData.title,
            error: jobError.message,
          });
          automationLog.counters.failed++;
          logger.error(`Error processing job ${jobData.title}:`, jobError);
        }
      }

      // Step 5: Cleanup
      await linkedInService.closeBrowser();

      // Log results
      automationLog.status = 'completed';
      automationLog.duration = Date.now() - startTime;
      automationLog.counters.jobsProcessed = appliedCount;
      automationLog.logs.push({
        timestamp: new Date(),
        level: 'info',
        message: `Automation completed. Applied to ${appliedCount} jobs.`,
      });

      if (errors.length > 0) {
        automationLog.logs.push({
          timestamp: new Date(),
          level: 'warn',
          message: `${errors.length} jobs had errors`,
        });
      }

      await automationLog.save();

      logger.info(`Automation completed: ${appliedCount} applications sent`);

      return {
        success: true,
        automationId,
        applied: appliedCount,
        extracted: extractedJobs.length,
        filtered: filteredJobs.length,
        errors,
        duration: automationLog.duration,
      };
    } catch (error) {
      logger.error('Automation error:', error);

      automationLog.status = 'failed';
      automationLog.duration = Date.now() - startTime;
      automationLog.logs.push({
        timestamp: new Date(),
        level: 'error',
        message: error.message,
      });

      await automationLog.save();

      throw error;
    }
  }

  /**
   * Get automation status
   */
  static async getAutomationStatus(automationId) {
    const log = await AutomationLog.findById(automationId);
    return log
      ? {
          status: log.status,
          progress: {
            jobsProcessed: log.counters.jobsProcessed,
            applied: log.counters.applied,
            failed: log.counters.failed,
          },
          duration: log.duration,
          startTime: log.startTime,
          logs: log.logs.slice(-10), // Last 10 logs
        }
      : null;
  }

  /**
   * Get automation logs
   */
  static async getAutomationLogs(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const logs = await AutomationLog.find({ userId })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AutomationLog.countDocuments({ userId });

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Pause running automation
   */
  static async pauseAutomation(automationId) {
    const log = await AutomationLog.findById(automationId);
    if (log && log.status === 'running') {
      log.status = 'paused';
      await log.save();
      return true;
    }
    return false;
  }
}

module.exports = AutomationOrchestrationService;
