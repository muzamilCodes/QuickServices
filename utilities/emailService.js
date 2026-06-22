const nodemailer = require('nodemailer');
require('dotenv').config();

const emailFrom = process.env.EMAIL_FROM || process.env.BREVO_SMTP_USER;
const emailFromName = process.env.EMAIL_FROM_NAME || 'QuickServices';
const smtpPort = Number(process.env.BREVO_SMTP_PORT || 587);
const useSecure = smtpPort === 465 || process.env.BREVO_SMTP_SECURE === 'true';
const hasSmtpConfig = Boolean(
  process.env.BREVO_SMTP_HOST &&
  process.env.BREVO_SMTP_USER &&
  process.env.BREVO_SMTP_PASS
);
const hasBrevoApi = Boolean(process.env.BREVO_API_KEY);

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

// Verify transporter connectivity early and log helpful info.
// In serverless environments, SMTP may be blocked or time out, so this is best-effort only.
if (hasSmtpConfig) {
  transporter.verify().then(() => {
    console.log('SMTP transporter verified (can send emails).');
  }).catch((err) => {
    console.error('SMTP transporter verification failed:', err && err.message ? err.message : err);
  });
} else {
  console.warn('SMTP config is incomplete; SMTP fallback will be skipped.');
}

// Optional: shorten SMTP timeouts so failures don't hang request.
// (Brevo API path will still be attempted when BREVO_API_KEY is set.)
transporter.options = {
  ...(transporter.options || {}),
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 8000,
  // Nodemailer uses these internally depending on adapter
  debug: false,
};


const sendEmail = async (to, subject, html) => {
  if (!to) {
    throw new Error('Missing recipient email address');
  }

  if (!emailFrom) {
    throw new Error('Missing EMAIL_FROM or BREVO_SMTP_USER sender address');
  }

  // Prefer Brevo HTTP API when API key is provided.
  // This is more reliable than SMTP on Vercel/serverless deployments.
  if (hasBrevoApi && typeof fetch === 'function') {
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
  } else if (hasBrevoApi && typeof fetch !== 'function') {
    console.warn('BREVO_API_KEY set but global fetch is unavailable; skipping Brevo HTTP API and falling back to SMTP.');
  }

  if (!hasSmtpConfig) {
    throw new Error('SMTP config missing and Brevo API unavailable');
  }

  const msg = {
    from: `${emailFromName} <${emailFrom}>`,
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
