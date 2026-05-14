/**
 * Gmail Service
 * Handles Gmail API operations for sending emails
 */

const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class GmailService {
  constructor(userCredentials) {
    this.userCredentials = userCredentials;
    this.gmail = null;
    this.auth = null;
  }

  /**
   * Initialize Gmail client with OAuth
   */
  async initializeGmailClient() {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        'http://localhost:5000/api/auth/gmail/callback'
      );

      oauth2Client.setCredentials({
        refresh_token: this.userCredentials.gmailRefreshToken,
      });

      this.auth = oauth2Client;
      this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      logger.info('Gmail client initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing Gmail client:', error);
      throw error;
    }
  }

  /**
   * Send email via Gmail API
   */
  async sendEmailViaGmail(recipientEmail, subject, body, attachments = []) {
    try {
      if (!this.gmail) {
        await this.initializeGmailClient();
      }

      const emailContent = this.buildEmailMessage(recipientEmail, subject, body, attachments);

      const result = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: emailContent,
        },
      });

      logger.info(`Email sent successfully via Gmail API to ${recipientEmail}, Message ID: ${result.data.id}`);

      return {
        success: true,
        messageId: result.data.id,
        threadId: result.data.threadId,
        method: 'gmail_api',
      };
    } catch (error) {
      logger.error('Error sending email via Gmail API:', error);
      throw error;
    }
  }

  /**
   * Build email message for Gmail API
   */
  buildEmailMessage(recipientEmail, subject, body, attachments = []) {
    const nodemailer = require('nodemailer');
    const boundary = '----' + Math.random().toString(36).substring(2);

    let message = `To: ${recipientEmail}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset="UTF-8"\r\n\r\n${body}`;

    // Add attachments if any
    if (attachments && attachments.length > 0) {
      message = `MIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
      message += `--${boundary}\r\nContent-Type: text/html; charset="UTF-8"\r\n\r\n${body}\r\n`;

      // Add each attachment
      for (const attachment of attachments) {
        message += `--${boundary}\r\n`;
        message += `Content-Type: ${attachment.mimeType}\r\n`;
        message += `Content-Transfer-Encoding: base64\r\n`;
        message += `Content-Disposition: attachment; filename="${attachment.filename}"\r\n\r\n`;
        message += attachment.data + '\r\n';
      }

      message += `--${boundary}--`;
    }

    // Encode the message
    return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  }

  /**
   * Send email via Nodemailer (fallback method)
   */
  async sendEmailViaNodemailer(recipientEmail, subject, body, attachments = []) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER_EMAIL,
          pass: process.env.GMAIL_USER_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.GMAIL_USER_EMAIL,
        to: recipientEmail,
        subject,
        html: body,
        attachments: attachments || [],
      };

      const result = await transporter.sendMail(mailOptions);

      logger.info(`Email sent successfully via Nodemailer to ${recipientEmail}, Message ID: ${result.messageId}`);

      return {
        success: true,
        messageId: result.messageId,
        method: 'nodemailer',
      };
    } catch (error) {
      logger.error('Error sending email via Nodemailer:', error);
      throw error;
    }
  }

  /**
   * Get email from user (for verification)
   */
  async getEmailFromUser(messageId) {
    try {
      if (!this.gmail) {
        await this.initializeGmailClient();
      }

      const message = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      return {
        success: true,
        message: message.data,
      };
    } catch (error) {
      logger.error('Error retrieving email:', error);
      throw error;
    }
  }

  /**
   * Get sent emails
   */
  async getSentEmails(maxResults = 10) {
    try {
      if (!this.gmail) {
        await this.initializeGmailClient();
      }

      const result = await this.gmail.users.messages.list({
        userId: 'me',
        q: 'in:sent',
        maxResults,
      });

      return {
        success: true,
        messages: result.data.messages || [],
      };
    } catch (error) {
      logger.error('Error retrieving sent emails:', error);
      throw error;
    }
  }

  /**
   * Get email thread
   */
  async getEmailThread(threadId) {
    try {
      if (!this.gmail) {
        await this.initializeGmailClient();
      }

      const thread = await this.gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        format: 'full',
      });

      return {
        success: true,
        thread: thread.data,
      };
    } catch (error) {
      logger.error('Error retrieving email thread:', error);
      throw error;
    }
  }

  /**
   * Search emails
   */
  async searchEmails(query, maxResults = 20) {
    try {
      if (!this.gmail) {
        await this.initializeGmailClient();
      }

      const result = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });

      return {
        success: true,
        messages: result.data.messages || [],
      };
    } catch (error) {
      logger.error('Error searching emails:', error);
      throw error;
    }
  }

  /**
   * Create draft email
   */
  async createDraftEmail(recipientEmail, subject, body) {
    try {
      if (!this.gmail) {
        await this.initializeGmailClient();
      }

      const message = this.buildEmailMessage(recipientEmail, subject, body);

      const result = await this.gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw: message,
          },
        },
      });

      logger.info(`Draft email created successfully, Draft ID: ${result.data.id}`);

      return {
        success: true,
        draftId: result.data.id,
      };
    } catch (error) {
      logger.error('Error creating draft email:', error);
      throw error;
    }
  }
}

module.exports = GmailService;
