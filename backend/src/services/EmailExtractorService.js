/**
 * Email Extractor Service
 * Multiple strategies for extracting recruiter emails
 */

const axios = require('axios');
const logger = require('../utils/logger');

class EmailExtractorService {
  /**
   * Extract emails using multiple strategies
   */
  static async extractEmails(recruiterData, postContent) {
    const emailSources = [];

    try {
      // Strategy 1: Direct extraction from post text
      const directEmails = this.extractDirectEmails(postContent);
      if (directEmails.length > 0) {
        emailSources.push({
          source: 'direct',
          emails: directEmails,
          confidence: 0.95,
        });
      }

      // Strategy 2: Domain-based email generation
      const domainEmails = this.generateDomainEmails(recruiterData);
      if (domainEmails) {
        emailSources.push({
          source: 'domain',
          emails: [domainEmails],
          confidence: 0.6,
        });
      }

      // Strategy 3: Hunter.io API
      if (process.env.HUNTER_API_KEY && recruiterData.company) {
        try {
          const hunterEmails = await this.searchHunterIO(recruiterData.name, recruiterData.company);
          if (hunterEmails) {
            emailSources.push({
              source: 'hunter',
              emails: hunterEmails,
              confidence: 0.8,
            });
          }
        } catch (error) {
          logger.warn('Hunter.io API error:', error.message);
        }
      }

      // Strategy 4: Apollo API
      if (process.env.APOLLO_API_KEY && recruiterData.company) {
        try {
          const apolloEmails = await this.searchApollo(recruiterData.name, recruiterData.company);
          if (apolloEmails) {
            emailSources.push({
              source: 'apollo',
              emails: apolloEmails,
              confidence: 0.75,
            });
          }
        } catch (error) {
          logger.warn('Apollo API error:', error.message);
        }
      }

      return {
        success: true,
        emailSources,
        bestEmail: this.selectBestEmail(emailSources),
      };
    } catch (error) {
      logger.error('Error extracting emails:', error);
      throw error;
    }
  }

  /**
   * Extract emails directly from text
   */
  static extractDirectEmails(text) {
    if (!text) return [];

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = text.match(emailRegex) || [];

    return [...new Set(emails)]; // Remove duplicates
  }

  /**
   * Generate email based on company domain
   */
  static generateDomainEmails(recruiterData) {
    try {
      if (!recruiterData.name || !recruiterData.company) {
        return null;
      }

      const firstName = recruiterData.name.split(' ')[0].toLowerCase();
      const lastName = recruiterData.name.split(' ').slice(1).join('').toLowerCase();
      const companyDomain = this.extractDomain(recruiterData.company);

      if (!companyDomain) return null;

      const patterns = [
        `${firstName}.${lastName}@${companyDomain}`,
        `${firstName}@${companyDomain}`,
        `${firstName}${lastName}@${companyDomain}`,
        `${firstName}_${lastName}@${companyDomain}`,
      ];

      // Return the most common pattern
      return patterns[0];
    } catch (error) {
      logger.warn('Error generating domain email:', error);
      return null;
    }
  }

  /**
   * Extract domain from company name
   */
  static extractDomain(company) {
    // This is a simplified version - could be enhanced with actual domain lookup
    const companyLower = company.toLowerCase().replace(/\s+/g, '');
    return `${companyLower}.com`;
  }

  /**
   * Search Hunter.io API
   */
  static async searchHunterIO(name, company) {
    try {
      const response = await axios.get('https://api.hunter.io/v2/email-finder', {
        params: {
          domain: this.extractDomain(company).replace('.com', ''),
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' '),
          api_key: process.env.HUNTER_API_KEY,
        },
      });

      if (response.data.data && response.data.data.email) {
        return [response.data.data.email];
      }

      return null;
    } catch (error) {
      logger.warn('Hunter.io search error:', error.message);
      return null;
    }
  }

  /**
   * Search Apollo API
   */
  static async searchApollo(name, company) {
    try {
      const response = await axios.post('https://api.apollo.io/v1/people/search', {
        q_names: [name],
        organization_name: company,
      });

      if (response.data.people && response.data.people.length > 0) {
        const emails = response.data.people
          .filter((person) => person.email)
          .map((person) => person.email);
        return emails;
      }

      return null;
    } catch (error) {
      logger.warn('Apollo API search error:', error.message);
      return null;
    }
  }

  /**
   * Select best email from sources
   */
  static selectBestEmail(emailSources) {
    if (emailSources.length === 0) {
      return null;
    }

    // Sort by confidence and return the best email
    const sorted = emailSources.sort((a, b) => b.confidence - a.confidence);

    if (sorted[0].emails && sorted[0].emails.length > 0) {
      return {
        email: sorted[0].emails[0],
        source: sorted[0].source,
        confidence: sorted[0].confidence,
      };
    }

    return null;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}

module.exports = EmailExtractorService;
