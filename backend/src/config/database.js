/**
 * Database Configuration
 */

module.exports = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/job_automation_db',
    dbName: process.env.MONGODB_DB_NAME || 'job_automation_db',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    },
  },
  collections: {
    users: 'users',
    jobs: 'jobs',
    recruiters: 'recruiters',
    applications: 'applications',
    emailLogs: 'email_logs',
    resumes: 'resumes',
    settings: 'settings',
    automationLogs: 'automation_logs',
  },
};
