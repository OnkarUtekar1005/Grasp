const { transporter } = require('../config');
const { logger } = require('../utils');

const FROM_EMAIL = process.env.SMTP_FROM || 'noreply@graspelectric.com';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'techviewai@gmail.com').split(',').filter(Boolean);

/**
 * Send an email
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} options.text - Plain text body (optional)
 */
async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    logger.info({ messageId: info.messageId }, 'Email sent successfully');
    return info;
  } catch (error) {
    logger.error({ error: error.message, to, subject }, 'Failed to send email');
    throw error;
  }
}

/**
 * Notify admins about a new inquiry
 * @param {object} inquiry - Inquiry data
 */
async function notifyNewInquiry(inquiry) {
  if (ADMIN_EMAILS.length === 0) {
    logger.warn('No admin emails configured for notifications');
    return;
  }

  const subject = `New Inquiry: ${inquiry.subject || 'General Inquiry'}`;
  const html = `
    <h2>New Inquiry Received</h2>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">From</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${inquiry.contactName}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${inquiry.email}</td>
      </tr>
      ${inquiry.companyName ? `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Company</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${inquiry.companyName}</td>
      </tr>
      ` : ''}
      ${inquiry.phone ? `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${inquiry.phone}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Type</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${inquiry.inquiryType}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Message</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${inquiry.message}</td>
      </tr>
    </table>
    <p style="margin-top: 20px; color: #666;">
      Received at: ${new Date(inquiry.createdAt).toLocaleString()}
    </p>
  `;

  for (const email of ADMIN_EMAILS) {
    try {
      await sendEmail({ to: email.trim(), subject, html });
    } catch (error) {
      // Log but don't throw - we don't want to fail the request if email fails
      logger.error({ error: error.message, to: email }, 'Failed to notify admin');
    }
  }
}

/**
 * Notify admins about a new quote request
 * @param {object} quote - Quote request data with items
 */
async function notifyNewQuoteRequest(quote) {
  if (ADMIN_EMAILS.length === 0) {
    logger.warn('No admin emails configured for notifications');
    return;
  }

  const subject = `New Quote Request: ${quote.requestNumber}`;

  const itemsHtml = quote.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.product?.name || 'Unknown Product'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.variant?.name || '-'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <h2>New Quote Request: ${quote.requestNumber}</h2>
    <h3>Customer Information</h3>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Company</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${quote.companyName}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Contact</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${quote.contactName}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${quote.email}</td>
      </tr>
      ${quote.phone ? `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${quote.phone}</td>
      </tr>
      ` : ''}
    </table>

    <h3 style="margin-top: 20px;">Requested Items</h3>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Product</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Variant</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    ${quote.message ? `
    <h3 style="margin-top: 20px;">Message</h3>
    <p style="padding: 10px; background-color: #f9f9f9; border-radius: 4px;">${quote.message}</p>
    ` : ''}

    <p style="margin-top: 20px; color: #666;">
      Received at: ${new Date(quote.createdAt).toLocaleString()}
    </p>
  `;

  for (const email of ADMIN_EMAILS) {
    try {
      await sendEmail({ to: email.trim(), subject, html });
    } catch (error) {
      logger.error({ error: error.message, to: email }, 'Failed to notify admin');
    }
  }
}

module.exports = {
  sendEmail,
  notifyNewInquiry,
  notifyNewQuoteRequest,
};
