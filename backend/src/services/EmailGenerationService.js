/**
 * OpenAI Email Generation Service
 * Generates personalized job application emails using OpenAI API
 */

const { OpenAI } = require('openai');
const logger = require('../utils/logger');

class EmailGenerationService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate personalized job application email
   */
  async generateApplicationEmail(jobData, recruiterData, userProfile, emailTemplate = 'professional') {
    try {
      logger.info(`Generating email for job: ${jobData.title} at ${jobData.company}`);

      const prompt = this.buildEmailPrompt(jobData, recruiterData, userProfile, emailTemplate);

      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional job application email writer. Write concise, personalized, and ATS-friendly emails that stand out to recruiters. Keep emails to 150-200 words.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const emailBody = response.choices[0].message.content;

      // Extract email subject and body
      const emailStructure = this.parseEmailResponse(emailBody);

      return {
        success: true,
        subject: emailStructure.subject,
        body: emailStructure.body,
        htmlBody: this.convertToHtmlEmail(emailStructure.body),
        tokens: response.usage.total_tokens,
      };
    } catch (error) {
      logger.error('Error generating email with OpenAI:', error);
      throw new Error(`Email generation failed: ${error.message}`);
    }
  }

  /**
   * Build prompt for email generation
   */
  buildEmailPrompt(jobData, recruiterData, userProfile, emailTemplate) {
    return `
Generate a ${emailTemplate} job application email with the following information:

JOB DETAILS:
- Title: ${jobData.title}
- Company: ${jobData.company}
- Description: ${jobData.description?.substring(0, 300) || 'Not provided'}
- Required Skills: ${jobData.requiredSkills?.join(', ') || 'Not specified'}

RECRUITER DETAILS:
- Name: ${recruiterData.name || 'Hiring Manager'}
- Title: ${recruiterData.title || 'Recruiter'}

CANDIDATE PROFILE:
- Name: ${userProfile.firstName} ${userProfile.lastName}
- Skills: ${userProfile.profile?.skills?.join(', ') || 'Not provided'}
- Experience: ${userProfile.profile?.experience || 'Not provided'}
- LinkedIn: linkedin.com/in/${userProfile.profile?.linkedinProfile || 'yourprofile'}

Format the response as:
SUBJECT: [Email subject line]
BODY:
[Email body text - professional, concise, personalized]

Requirements:
- Mention the specific job title
- Reference the company
- Highlight 2-3 relevant skills from the job description
- Keep it professional but personable
- Include a clear call to action
- Avoid generic greetings if recruiter name is available
- Make it feel like you've researched the company
    `;
  }

  /**
   * Parse email response from OpenAI
   */
  parseEmailResponse(response) {
    const subjectMatch = response.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
    const bodyMatch = response.match(/BODY:\s*([\s\S]+?)$/i);

    const subject = subjectMatch ? subjectMatch[1].trim() : 'Job Application - Your Name';
    let body = bodyMatch ? bodyMatch[1].trim() : response;

    // Clean up body
    body = body.replace(/^#+\s+/gm, '').trim();

    return { subject, body };
  }

  /**
   * Convert email body to HTML format
   */
  convertToHtmlEmail(emailBody) {
    // Convert line breaks to <br>
    let html = emailBody.replace(/\n/g, '<br>');

    // Wrap paragraphs
    html = html
      .split(/<br><br>/g)
      .map((para) => `<p>${para}</p>`)
      .join('');

    // Add basic styling
    html = `
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            p { margin: 12px 0; }
            a { color: #0066cc; text-decoration: none; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    return html;
  }

  /**
   * Generate email subject line
   */
  async generateEmailSubject(jobData, recruiterData) {
    try {
      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'user',
            content: `Generate a compelling email subject line for a job application to the ${jobData.title} position at ${jobData.company}. The recruiter is ${recruiterData.name}. Only output the subject line, no quotes or explanation.`,
          },
        ],
        max_tokens: 50,
        temperature: 0.8,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      logger.error('Error generating email subject:', error);
      return `Application for ${jobData.title} Position`;
    }
  }

  /**
   * Generate multiple email variations
   */
  async generateEmailVariations(jobData, recruiterData, userProfile, count = 3) {
    try {
      const variations = [];

      for (let i = 0; i < count; i++) {
        const email = await this.generateApplicationEmail(jobData, recruiterData, userProfile);
        variations.push(email);
      }

      return {
        success: true,
        variations,
      };
    } catch (error) {
      logger.error('Error generating email variations:', error);
      throw error;
    }
  }

  /**
   * Refine email content
   */
  async refineEmail(emailBody, feedback) {
    try {
      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'user',
            content: `Please refine this job application email based on the feedback provided:\n\nOriginal Email:\n${emailBody}\n\nFeedback:\n${feedback}\n\nProvide the improved email:`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return {
        success: true,
        refinedEmail: response.choices[0].message.content,
      };
    } catch (error) {
      logger.error('Error refining email:', error);
      throw error;
    }
  }

  /**
   * Analyze job description for key skills
   */
  async analyzeJobDescription(jobDescription) {
    try {
      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'user',
            content: `Analyze this job description and extract key information in JSON format with fields: requiredSkills (array), preferredSkills (array), seniority (string), technologies (array), responsibilities (array). Job Description:\n${jobDescription}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const analysisText = response.choices[0].message.content;
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return {
          success: true,
          analysis: JSON.parse(jsonMatch[0]),
        };
      }

      return {
        success: false,
        message: 'Could not parse job analysis',
      };
    } catch (error) {
      logger.error('Error analyzing job description:', error);
      throw error;
    }
  }
}

module.exports = new EmailGenerationService();
