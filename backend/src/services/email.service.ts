import logger from '../utils/logger.js';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

/**
 * Sends an email using the configured email transport.
 * @param options Email options including recipient, subject, template, and data
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // In a real implementation, you would configure nodemailer with your email provider
    // For now, we'll just log the email to the console
    logger.info('Sending email:', {
      to: options.to,
      subject: options.subject,
      template: options.template,
      data: options.data,
    });

    // Example of a real implementation with nodemailer (commented out)
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: options.to,
      subject: options.subject,
      // In a real implementation, you would render an email template here
      text: JSON.stringify(options.data, null, 2),
      html: `<pre>${JSON.stringify(options.data, null, 2)}</pre>`,
    });
    */
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}

export default {
  sendEmail,
};
