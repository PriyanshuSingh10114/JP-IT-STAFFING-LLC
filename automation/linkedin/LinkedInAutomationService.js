/**
 * LinkedIn Automation Service
 * Handles browser automation for LinkedIn job search
 */

const { chromium } = require('playwright');
const logger = require('../../backend/src/utils/logger');
const path = require('path');
const fs = require('fs');

class LinkedInAutomationService {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.sessionPath = process.env.LINKEDIN_SESSION_PATH || './sessions/linkedin';
  }

  /**
   * Initialize browser and load session
   */
  async initializeBrowser() {
    try {
      logger.info('Initializing Playwright browser for LinkedIn');

      const launchOptions = {
        headless: process.env.LINKEDIN_HEADLESS !== 'false',
      };

      // Add proxy if configured
      if (process.env.LINKEDIN_PROXY) {
        launchOptions.proxy = {
          server: process.env.LINKEDIN_PROXY,
        };
      }

      this.browser = await chromium.launch(launchOptions);

      // Load saved session if it exists
      if (fs.existsSync(this.sessionPath)) {
        logger.info('Loading saved LinkedIn session');
        this.context = await this.browser.createBrowserContext({
          storageState: this.sessionPath,
        });
      } else {
        logger.info('Creating new LinkedIn browser context');
        this.context = await this.browser.createBrowserContext();
      }

      this.page = await this.context.newPage();

      // Set viewport
      await this.page.setViewportSize({
        width: 1920,
        height: 1080,
      });

      logger.info('Browser initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing browser:', error);
      throw error;
    }
  }

  /**
   * Login to LinkedIn
   */
  async loginToLinkedIn(email, password) {
    try {
      logger.info(`Attempting to login to LinkedIn with email: ${email}`);

      await this.page.goto('https://www.linkedin.com/login', {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Enter email
      await this.page.fill('input[name="session_key"]', email);
      await this.delay(1000);

      // Enter password
      await this.page.fill('input[name="session_password"]', password);
      await this.delay(1000);

      // Click login button
      await this.page.click('button[type="submit"]');

      // Wait for navigation to complete
      await this.page.waitForLoadState('networkidle', { timeout: 30000 });

      logger.info('LinkedIn login successful');

      // Save session for future use
      await this.saveSession();

      return { success: true };
    } catch (error) {
      logger.error('Error logging into LinkedIn:', error);

      // Take screenshot on error for debugging
      await this.takeScreenshot('linkedin_login_error');

      throw error;
    }
  }

  /**
   * Search for job posts
   */
  async searchJobPosts(keywords, filters = {}) {
    try {
      logger.info(`Searching LinkedIn posts for keywords: ${keywords}`);

      // Navigate to LinkedIn feed
      await this.page.goto('https://www.linkedin.com/feed/', {
        waitUntil: 'domcontentloaded',
      });

      await this.delay(2000);

      // Click on search box
      await this.page.click('input[placeholder*="Search"]');
      await this.delay(1000);

      // Type keywords
      await this.page.type('input[placeholder*="Search"]', keywords);
      await this.delay(1000);

      // Click search
      await this.page.keyboard.press('Enter');

      // Wait for results
      await this.page.waitForLoadState('networkidle');

      // Filter to posts
      await this.filterToPosts();

      // Scroll and extract job posts
      const jobs = await this.extractJobPosts(filters);

      logger.info(`Found ${jobs.length} job posts`);

      return jobs;
    } catch (error) {
      logger.error('Error searching job posts:', error);
      throw error;
    }
  }

  /**
   * Search and extract jobs (Combined method for orchestrator)
   */
  async searchAndExtractJobs(keywords, maxJobs = 20) {
    try {
      logger.info(`Searching and extracting up to ${maxJobs} jobs for: ${keywords}`);
      
      const jobs = await this.searchJobPosts(keywords);
      return jobs.slice(0, maxJobs);
    } catch (error) {
      logger.error('Error in searchAndExtractJobs:', error);
      throw error;
    }
  }

  /**
   * Filter results to Posts only
   */
  async filterToPosts() {
    try {
      // Look for "Posts" filter button
      const buttons = await this.page.$$('button');
      for (const button of buttons) {
        const text = await button.textContent();
        if (text && text.includes('Posts')) {
          await button.click();
          await this.delay(1000);
          break;
        }
      }
    } catch (error) {
      logger.warn('Could not filter to posts:', error);
    }
  }

  /**
   * Extract job posts from page
   */
  async extractJobPosts(filters = {}) {
    try {
      const jobs = [];
      const postedTimeFilter = filters.postedTimeFilter || 'last_24_hours';

      // Scroll to load more posts
      for (let i = 0; i < 5; i++) {
        await this.page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await this.delay(2000);
      }

      // Extract job posts
      const postElements = await this.page.$$('[data-id*="activity"]');

      for (const post of postElements) {
        try {
          const jobData = await this.extractJobFromPost(post, postedTimeFilter);
          if (jobData) {
            jobs.push(jobData);
          }
        } catch (error) {
          logger.warn('Error extracting job from post:', error);
        }
      }

      return jobs;
    } catch (error) {
      logger.error('Error extracting job posts:', error);
      throw error;
    }
  }

  /**
   * Extract job data from a single post
   */
  async extractJobFromPost(postElement, timeFilter) {
    try {
      const text = await postElement.textContent();

      // Check if this is a job posting
      if (!this.isJobPosting(text)) {
        return null;
      }

      // Extract information
      const recruiterName = await postElement.$eval('[class*="name"]', (el) => el.textContent).catch(() => null);
      const company = await postElement
        .$eval('[class*="company"]', (el) => el.textContent)
        .catch(() => null);
      const postUrl = await postElement
        .$eval('a[href*="/feed/"]', (el) => el.href)
        .catch(() => null);

      const jobData = {
        title: this.extractJobTitle(text),
        company,
        recruiter: recruiterName,
        description: text,
        postUrl,
        postedAt: new Date(),
        extractedAt: new Date(),
      };

      logger.info(`Extracted job: ${jobData.title} at ${jobData.company}`);

      return jobData;
    } catch (error) {
      logger.warn('Error extracting job from post:', error);
      return null;
    }
  }

  /**
   * Check if text contains job posting keywords
   */
  isJobPosting(text) {
    const jobKeywords = [
      'job',
      'hiring',
      'we are hiring',
      'apply',
      'position',
      'opening',
      'role',
      'developer',
      'engineer',
    ];

    const lowerText = text.toLowerCase();
    return jobKeywords.some((keyword) => lowerText.includes(keyword));
  }

  /**
   * Extract job title from text
   */
  extractJobTitle(text) {
    const titlePatterns = [/looking for|hiring a|now hiring|opening for\s+([^,\.]+)/i, /^([^-,\.]+)(?:\s*[-–]|$)/];

    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'Job Opening';
  }

  /**
   * Extract recruiter email strategies
   */
  async extractRecruiterEmail(recruiterProfile) {
    try {
      logger.info(`Extracting email for recruiter: ${recruiterProfile.name}`);

      const emails = [];

      // Strategy 1: Check profile page for email
      if (recruiterProfile.linkedinProfile) {
        await this.page.goto(recruiterProfile.linkedinProfile, { timeout: 30000 });
        const pageEmail = await this.page.$eval('[href*="mailto:"]', (el) => {
          const match = el.href.match(/mailto:([^\?]+)/);
          return match ? match[1] : null;
        }).catch(() => null);

        if (pageEmail) {
          emails.push({ email: pageEmail, source: 'profile', confidence: 0.9 });
        }
      }

      // Strategy 2: Use company domain matching
      if (recruiterProfile.company) {
        const companyEmail = this.generateCompanyEmail(recruiterProfile.name, recruiterProfile.company);
        if (companyEmail) {
          emails.push({ email: companyEmail, source: 'domain', confidence: 0.6 });
        }
      }

      return {
        success: true,
        emails,
        bestEmail: emails.length > 0 ? emails[0] : null,
      };
    } catch (error) {
      logger.error('Error extracting recruiter email:', error);
      throw error;
    }
  }

  /**
   * Generate email based on company domain
   */
  generateCompanyEmail(name, company) {
    try {
      const firstName = name.split(' ')[0].toLowerCase();
      const lastName = name.split(' ')[1]?.toLowerCase() || '';

      // Common email patterns
      const patterns = [
        `${firstName}.${lastName}@${company}`,
        `${firstName}@${company}`,
        `${firstName}${lastName}@${company}`,
      ];

      return patterns[0]; // Return most likely pattern
    } catch (error) {
      return null;
    }
  }

  /**
   * Save session for reuse
   */
  async saveSession() {
    try {
      const sessionDir = path.dirname(this.sessionPath);
      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
      }

      await this.context.storageState({ path: this.sessionPath });
      logger.info('Session saved successfully');
    } catch (error) {
      logger.error('Error saving session:', error);
    }
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name = 'screenshot') {
    try {
      const screenshotDir = path.join(__dirname, '../../screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const timestamp = Date.now();
      const filename = `${name}_${timestamp}.png`;
      const filepath = path.join(screenshotDir, filename);

      await this.page.screenshot({ path: filepath });
      logger.info(`Screenshot saved: ${filepath}`);

      return filepath;
    } catch (error) {
      logger.error('Error taking screenshot:', error);
    }
  }

  /**
   * Delay execution
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Close browser
   */
  async closeBrowser() {
    try {
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      logger.info('Browser closed');
    } catch (error) {
      logger.error('Error closing browser:', error);
    }
  }
}

module.exports = LinkedInAutomationService;
