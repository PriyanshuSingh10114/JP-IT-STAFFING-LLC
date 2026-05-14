/**
 * Job Filtering Service
 * Handles job filtering, deduplication, and matching
 */

const logger = require('../utils/logger');

class JobFilteringService {
  /**
   * Filter jobs based on user preferences
   */
  static filterJobs(jobs, userSettings) {
    try {
      let filtered = [...jobs];

      // Filter by keywords
      if (userSettings.searchKeywords && userSettings.searchKeywords.length > 0) {
        filtered = this.filterByKeywords(filtered, userSettings.searchKeywords);
      }

      // Filter by job type
      if (userSettings.jobTypes && userSettings.jobTypes.length > 0) {
        filtered = this.filterByJobType(filtered, userSettings.jobTypes);
      }

      // Filter by location
      if (userSettings.locations && userSettings.locations.length > 0) {
        filtered = this.filterByLocation(filtered, userSettings.locations);
      }

      // Filter by experience level
      if (userSettings.minExperienceLevel) {
        filtered = this.filterByExperience(filtered, userSettings.minExperienceLevel);
      }

      // Exclude blacklisted companies
      if (userSettings.excludedCompanies && userSettings.excludedCompanies.length > 0) {
        filtered = this.excludeCompanies(filtered, userSettings.excludedCompanies);
      }

      // Include whitelisted companies only
      if (userSettings.includedCompanies && userSettings.includedCompanies.length > 0) {
        filtered = this.includeOnlyCompanies(filtered, userSettings.includedCompanies);
      }

      // Calculate match scores
      filtered = filtered.map((job) => ({
        ...job,
        matchScore: this.calculateMatchScore(job, userSettings),
      }));

      // Sort by match score
      filtered.sort((a, b) => b.matchScore - a.matchScore);

      logger.info(`Filtered ${jobs.length} jobs to ${filtered.length} matches`);

      return filtered;
    } catch (error) {
      logger.error('Error filtering jobs:', error);
      throw error;
    }
  }

  /**
   * Filter jobs by keywords
   */
  static filterByKeywords(jobs, keywords) {
    return jobs.filter((job) => {
      const jobText = `${job.title} ${job.company} ${job.description}`.toLowerCase();
      return keywords.some((keyword) => jobText.includes(keyword.toLowerCase()));
    });
  }

  /**
   * Filter jobs by job type
   */
  static filterByJobType(jobs, jobTypes) {
    return jobs.filter((job) => jobTypes.includes(job.jobType));
  }

  /**
   * Filter jobs by location
   */
  static filterByLocation(jobs, locations) {
    return jobs.filter((job) => {
      if (job.isRemote) return true;
      return locations.some((location) => job.location?.includes(location));
    });
  }

  /**
   * Filter jobs by experience level
   */
  static filterByExperience(jobs, minLevel) {
    const levels = ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Manager'];
    const minIndex = levels.indexOf(minLevel);

    return jobs.filter((job) => {
      if (!job.experienceLevel) return true;
      const jobIndex = levels.indexOf(job.experienceLevel);
      return jobIndex >= minIndex;
    });
  }

  /**
   * Exclude blacklisted companies
   */
  static excludeCompanies(jobs, excludedCompanies) {
    return jobs.filter((job) => !excludedCompanies.includes(job.company));
  }

  /**
   * Include only whitelisted companies
   */
  static includeOnlyCompanies(jobs, includedCompanies) {
    return jobs.filter((job) => includedCompanies.includes(job.company));
  }

  /**
   * Calculate match score for a job
   */
  static calculateMatchScore(job, userSettings) {
    let score = 0;

    // Keyword match (0-40 points)
    if (userSettings.searchKeywords) {
      const jobText = `${job.title} ${job.description}`.toLowerCase();
      const matchCount = userSettings.searchKeywords.filter((keyword) =>
        jobText.includes(keyword.toLowerCase())
      ).length;
      score += Math.min((matchCount / userSettings.searchKeywords.length) * 40, 40);
    }

    // Job type match (0-20 points)
    if (userSettings.jobTypes && userSettings.jobTypes.includes(job.jobType)) {
      score += 20;
    }

    // Location preference (0-20 points)
    if (job.isRemote && userSettings.locations?.includes('Remote')) {
      score += 20;
    }

    // Skill match (0-20 points)
    if (job.requiredSkills && userSettings.skills) {
      const matchedSkills = job.requiredSkills.filter((skill) => userSettings.skills.includes(skill));
      score += (matchedSkills.length / job.requiredSkills.length) * 20;
    }

    return Math.round(score);
  }

  /**
   * Check if job is duplicate
   */
  static isDuplicate(job, existingJobs) {
    return existingJobs.some(
      (existing) =>
        existing.title.toLowerCase() === job.title.toLowerCase() &&
        existing.company.toLowerCase() === job.company.toLowerCase() &&
        existing.linkedinPostId === job.linkedinPostId
    );
  }

  /**
   * Remove duplicate jobs
   */
  static removeDuplicates(jobs) {
    const unique = [];
    const seen = new Set();

    jobs.forEach((job) => {
      const key = `${job.title}::${job.company}::${job.linkedinPostId}`;
      if (!seen.has(key)) {
        unique.push(job);
        seen.add(key);
      }
    });

    return unique;
  }
}

module.exports = JobFilteringService;
