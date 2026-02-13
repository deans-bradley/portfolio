import nodemailer from 'nodemailer';
import config from '../config/config.js';

/**
 * @typedef {Object} EmailOptions
 * @property {string} to - Recipient email address
 * @property {string} subject - Email subject line
 * @property {string} html - HTML content of the email
 * @property {string} [text] - Plain text fallback content
 */

/**
 * @typedef {Object} SendEmailResult
 * @property {boolean} success - Whether the email was sent successfully
 * @property {string} [messageId] - The message ID from the mail server
 * @property {string} [error] - Error message if sending failed
 */

/**
 * Service class for handling email operations.
 * Uses nodemailer with Titan SMTP for sending transactional emails.
 * @class EmailService
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.emailConfig.host,
      port: config.emailConfig.port,
      secure: config.emailConfig.port === 465,
      auth: {
        user: config.emailConfig.from,
        pass: config.emailConfig.password
      }
    });
  }

  /**
   * Sends an email using the configured SMTP transporter.
   * @async
   * @param {EmailOptions} options - The email options
   * @returns {Promise<SendEmailResult>} Result of the send operation
   */
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `"Bradley Deans" <${config.emailConfig.from}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Email send error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sends a confirmation email to a user who submitted a testimonial.
   * @async
   * @param {string} recipientEmail - The recipient's email address
   * @param {string} firstName - The recipient's first name
   * @returns {Promise<SendEmailResult>} Result of the send operation
   */
  async sendTestimonialConfirmation(recipientEmail, firstName) {
    const subject = 'Thank you for your testimonial!';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Thank You, ${firstName}!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #eee; border-top: none;">
          <p style="margin-top: 0;">I really appreciate you taking the time to share your experience working with me.</p>
          <p>Your testimonial has been received and is pending review. Once approved, it will be displayed on my portfolio website.</p>
          <p>If you have any questions or need to make changes to your testimonial, feel free to reach out.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="margin-bottom: 0; color: #666; font-size: 14px;">
            Best regards,<br>
            <strong>Bradley Deans</strong><br>
            <a href="https://deansbrad.com" style="color: #667eea;">deansbrad.com</a>
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
Thank You, ${firstName}!

I really appreciate you taking the time to share your experience working with me.

Your testimonial has been received and is pending review. Once approved, it will be displayed on my portfolio website.

If you have any questions or need to make changes to your testimonial, feel free to reach out.

Best regards,
Bradley Deans
https://deansbrad.com
    `.trim();

    return this.sendEmail({
      to: recipientEmail,
      subject,
      html,
      text
    });
  }

  /**
   * Sends a notification email when a testimonial is approved.
   * @async
   * @param {string} recipientEmail - The recipient's email address
   * @param {string} firstName - The recipient's first name
   * @returns {Promise<SendEmailResult>} Result of the send operation
   */
  async sendTestimonialApproved(recipientEmail, firstName) {
    const subject = 'Your testimonial is now live!';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Testimonial Approved</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Great News, ${firstName}!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #eee; border-top: none;">
          <p style="margin-top: 0;">Your testimonial has been approved and is now live on my portfolio website!</p>
          <p>Thank you once again for sharing your kind words. Your support means a lot to me.</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://deansbrad.com/#testimonials" style="display: inline-block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold;">View Your Testimonial</a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="margin-bottom: 0; color: #666; font-size: 14px;">
            Best regards,<br>
            <strong>Bradley Deans</strong><br>
            <a href="https://deansbrad.com" style="color: #11998e;">deansbrad.com</a>
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
Great News, ${firstName}!

Your testimonial has been approved and is now live on my portfolio website!

Thank you once again for sharing your kind words. Your support means a lot to me.

View your testimonial at: https://deansbrad.com/#testimonials

Best regards,
Bradley Deans
https://deansbrad.com
    `.trim();

    return this.sendEmail({
      to: recipientEmail,
      subject,
      html,
      text
    });
  }

  /**
   * Verifies the SMTP connection is working.
   * @async
   * @returns {Promise<boolean>} True if connection is successful
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connected successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error.message);
      return false;
    }
  }
}

export default new EmailService();
