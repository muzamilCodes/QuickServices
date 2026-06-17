const nodemailer = require('nodemailer');
require('dotenv').config();

// Brevo SMTP settings are already in your .env:
// BREVO_SMTP_HOST / PORT / USER / PASS
const smtpPort = Number(process.env.BREVO_SMTP_PORT || 587);
const useSecure = smtpPort === 465 || process.env.BREVO_SMTP_SECURE === 'true';

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: smtpPort,
  secure: useSecure,
  auth: process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS ? {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  } : undefined,
  tls: {
    // allow self-signed / internal certs when running locally
    rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false,
  },
});

// Verify transporter connectivity early and log helpful info
transporter.verify().then(() => {
  console.log('SMTP transporter verified (can send emails).');
}).catch((err) => {
  console.error('SMTP transporter verification failed:', err && err.message ? err.message : err);
});

const sendEmail = async (to, subject, html) => {
  // Prefer Brevo HTTP API when API key is provided (more reliable than SMTP).
  // Some Node environments (older Node versions) don't provide a global `fetch`.
  // Avoid attempting the API call if `fetch` is unavailable to prevent crashes.
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
          sender: { email: process.env.EMAIL_FROM || process.env.BREVO_SMTP_USER, name: process.env.EMAIL_FROM_NAME || 'QuickServices' },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        console.error('Brevo API send failed', resp.status, resp.statusText, txt);
        throw new Error(`Brevo API send failed: ${resp.status}`);
      }

      console.log(`✅ Email sent via Brevo API to ${to}`);
      return true;
    } catch (err) {
      console.error('Brevo API error:', err && err.message ? err.message : err);
      // fall through to SMTP fallback
    }
  } else if (process.env.BREVO_API_KEY && typeof fetch !== 'function') {
    console.warn('BREVO_API_KEY set but global fetch is unavailable; skipping Brevo HTTP API and falling back to SMTP.');
  }

  const msg = {
    from: process.env.EMAIL_FROM || process.env.BREVO_SMTP_USER,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(msg);
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('SMTP Email error:', {
      message: error && error.message,
      code: error && error.code,
      response: error && error.response,
    });
    // Re-throw with original error so caller can inspect
    throw error;
  }
};

module.exports = sendEmail;

