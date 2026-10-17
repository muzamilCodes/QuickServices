const nodemailer = require('nodemailer');
require('dotenv').config();

const emailFrom = process.env.EMAIL_FROM || process.env.GMAIL_USER || 'warmuzamil113@gmail.com';
const emailFromName = process.env.EMAIL_FROM_NAME || process.env.EMAIL_SENDER_NAME || 'QuickServices';

// 1. Gmail SMTP Transporter
const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
const gmailTransporter = (gmailUser && gmailPass)
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
    })
  : null;

if (gmailTransporter) {
  gmailTransporter.verify().then(() => {
    console.log('✅ Gmail SMTP verified and ready.');
  }).catch((err) => {
    console.warn('⚠️ Gmail SMTP verify failed:', err?.message || err);
  });
}

// 2. Brevo SMTP Transporter (Fallback)
const brevoHost = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
const brevoPort = Number(process.env.BREVO_SMTP_PORT || 587);
const brevoUser = process.env.BREVO_SMTP_USER || process.env.EMAIL_FROM;
const brevoPass = process.env.BREVO_SMTP_PASS || process.env.BREVO_SMTP_KEY;
const brevoTransporter = (brevoHost && brevoUser && brevoPass)
  ? nodemailer.createTransport({
      host: brevoHost,
      port: brevoPort,
      secure: brevoPort === 465,
      auth: {
        user: brevoUser,
        pass: brevoPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
    })
  : null;

const sendEmail = async (to, subject, html, text) => {
  if (!to) {
    throw new Error('Missing recipient email address');
  }

  const senderAddress = `"${emailFromName}" <${emailFrom}>`;
  const plainText = text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  // Common headers - keep minimal to avoid spam filters
  // NOTE: X-Priority: 1 / "High Importance" headers ironically trigger spam filters.
  const mailHeaders = {
    'List-Unsubscribe': `<mailto:${emailFrom}?subject=unsubscribe>`,
    'X-Mailer': 'QuickServices Mailer',
  };

  // Attempt 1: Gmail SMTP
  if (gmailTransporter) {
    try {
      await gmailTransporter.sendMail({
        from: senderAddress,
        to,
        subject,
        text: plainText,
        html,
        headers: mailHeaders,
      });
      console.log(`✅ Email sent via Gmail to ${to}`);
      return true;
    } catch (gmailErr) {
      console.error('⚠️ Gmail SMTP failed, trying Brevo fallback:', gmailErr?.message || gmailErr);
    }
  }

  // Attempt 2: Brevo HTTP API
  if (process.env.BREVO_API_KEY && typeof fetch === 'function') {
    try {
      const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { email: emailFrom, name: emailFromName },
          to: [{ email: to }],
          subject,
          textContent: plainText,
          htmlContent: html,
        }),
      });

      if (resp.ok) {
        console.log(`✅ Email sent via Brevo API to ${to}`);
        return true;
      }
      const errText = await resp.text();
      console.error('⚠️ Brevo API failed:', resp.status, errText);
    } catch (brevoApiErr) {
      console.error('⚠️ Brevo API call failed:', brevoApiErr?.message || brevoApiErr);
    }
  }

  // Attempt 3: Brevo SMTP
  if (brevoTransporter) {
    try {
      await brevoTransporter.sendMail({
        from: senderAddress,
        to,
        subject,
        text: plainText,
        html,
        headers: mailHeaders,
      });
      console.log(`✅ Email sent via Brevo SMTP to ${to}`);
      return true;
    } catch (brevoSmtpErr) {
      console.error('❌ Brevo SMTP failed:', brevoSmtpErr?.message || brevoSmtpErr);
    }
  }

  throw new Error('All email transports failed to send email.');
};

// Helper: Generates beautiful Inbox-optimized OTP email
const generateOtpTemplate = (otp, title = 'Security Verification') => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f8; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
              <tr>
                <td style="background: linear-gradient(135deg, #0f62c9, #ff8a3d); padding: 24px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">QuickServices</h1>
                  <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.9); font-size: 13px;">Home support, faster & reliable</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px 30px;">
                  <h2 style="margin: 0 0 12px 0; color: #1e293b; font-size: 20px; font-weight: 600;">${title}</h2>
                  <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                    Please use the following single-use verification code to complete your request.
                  </p>
                  <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #0f62c9; font-family: monospace;">${otp}</span>
                    <p style="margin: 8px 0 0 0; color: #64748b; font-size: 13px;">Valid for the next 10 minutes</p>
                  </div>
                  <p style="margin: 0 0 12px 0; color: #475569; font-size: 14px; line-height: 1.5;">
                    If you did not request this verification code, no action is needed. Your account remains secure.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f8fafc; padding: 18px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} QuickServices Platform. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  const text = `QuickServices Verification Code: ${otp}\n\nYour single-use code is: ${otp}\nValid for 10 minutes.\n\nIf you did not request this code, please ignore this email.`;
  return { html, text };
};

// Helper: Generates Booking Confirmation Email
const generateBookingTemplate = (booking, isForAdmin = false) => {
  const serviceName = (booking.serviceType || 'Service').toUpperCase();
  const title = isForAdmin
    ? `🔔 New Booking Alert: ${serviceName}`
    : `🎉 Booking Confirmed: ${serviceName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f8; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
              <tr>
                <td style="background: linear-gradient(135deg, #0f62c9, #10b981); padding: 24px 30px; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 22px;">${title}</h1>
                  <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">Booking ID: #${(booking._id || '').toString().slice(-6)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 30px;">
                  <table border="0" cellpadding="8" cellspacing="0" width="100%" style="font-size: 14px; color: #334155;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="color: #64748b; width: 40%;">Service Requested:</td>
                      <td style="font-weight: 600; color: #0f62c9;">${serviceName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="color: #64748b;">Customer Name:</td>
                      <td style="font-weight: 600;">${booking.customerName || 'N/A'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="color: #64748b;">Customer Phone:</td>
                      <td style="font-weight: 600;"><a href="tel:${booking.customerPhone}" style="color: #0f62c9; text-decoration: none;">${booking.customerPhone || 'N/A'}</a></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="color: #64748b;">Service Address:</td>
                      <td>${booking.address?.fullAddress || ''}, ${booking.address?.city || ''} ${booking.address?.pincode || ''}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="color: #64748b;">Preferred Schedule:</td>
                      <td>${booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString() : 'Immediate'} (${booking.preferredTime || 'Standard hours'})</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="color: #64748b;">Amount:</td>
                      <td style="font-weight: 700; color: #10b981;">₹${booking.amount || booking.originalAmount || 0}</td>
                    </tr>
                    ${booking.provider ? `
                    <tr style="background-color: #f0fdf4;">
                      <td style="color: #166534; font-weight: 600;">Assigned Specialist:</td>
                      <td style="color: #166534; font-weight: 700;">${booking.provider.name} (<a href="tel:${booking.provider.phone}" style="color: #166534;">${booking.provider.phone}</a>)</td>
                    </tr>
                    ` : ''}
                  </table>
                  <p style="margin: 20px 0 0 0; color: #64748b; font-size: 13px;">
                    Track live status anytime in your QuickServices account dashboard.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `${title}\n\nBooking ID: #${(booking._id || '').toString().slice(-6)}\nService: ${serviceName}\nCustomer: ${booking.customerName}\nPhone: ${booking.customerPhone}\nAddress: ${booking.address?.fullAddress}\nAmount: ₹${booking.amount || 0}\n\nStatus: ${booking.status}`;
  return { html, text };
};

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
module.exports.generateOtpTemplate = generateOtpTemplate;
module.exports.generateBookingTemplate = generateBookingTemplate;
