/**
 * Application Constants
 */

module.exports = {
  // Job Types
  JOB_TYPES: {
    FULLTIME: 'Fulltime',
    CONTRACT: 'Contract',
    PART_TIME: 'Part Time',
    INTERNSHIP: 'Internship',
    FREELANCE: 'Freelance',
  },

  // Application Status
  APPLICATION_STATUS: {
    PENDING: 'pending',
    SENT: 'sent',
    VIEWED: 'viewed',
    REPLIED: 'replied',
    REJECTED: 'rejected',
    ACCEPTED: 'accepted',
    FAILED: 'failed',
  },

  // Email Status
  EMAIL_STATUS: {
    DRAFT: 'draft',
    QUEUED: 'queued',
    SENT: 'sent',
    FAILED: 'failed',
    BOUNCED: 'bounced',
  },

  // Automation Status
  AUTOMATION_STATUS: {
    IDLE: 'idle',
    RUNNING: 'running',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    ERROR: 'error',
  },

  // LinkedIn Settings
  LINKEDIN: {
    BASE_URL: 'https://www.linkedin.com',
    SEARCH_ENDPOINT: '/search/results/people/',
    POSTS_ENDPOINT: '/feed/posts/',
    MESSAGE_ENDPOINT: '/messaging/compose/',
    HEADLESS: process.env.LINKEDIN_HEADLESS !== 'false',
    TIMEOUT: parseInt(process.env.LINKEDIN_TIMEOUT) || 30000,
    VIEWPORT: {
      width: 1920,
      height: 1080,
    },
  },

  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
  },

  // Validation Rules
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 50,
  },

  // Error Messages
  ERRORS: {
    UNAUTHORIZED: 'Unauthorized access',
    NOT_FOUND: 'Resource not found',
    INVALID_INPUT: 'Invalid input provided',
    DATABASE_ERROR: 'Database operation failed',
    LINKEDIN_ERROR: 'LinkedIn automation error',
    GMAIL_ERROR: 'Gmail operation failed',
    OPENAI_ERROR: 'OpenAI API error',
  },

  // Retry Settings
  RETRY: {
    MAX_ATTEMPTS: parseInt(process.env.AUTO_RETRY_ATTEMPTS) || 3,
    DELAY_MS: parseInt(process.env.AUTO_RETRY_DELAY_MS) || 5000,
    BACKOFF_MULTIPLIER: 1.5,
  },

  // Search Keywords
  DEFAULT_KEYWORDS: [
    'Java Developer',
    'Backend Engineer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Cloud Architect',
  ],
};
