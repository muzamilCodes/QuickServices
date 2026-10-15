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
    console.log('✅ Gmail SMTP verified and ready to send emails.');
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

const sendEmail = async (to, subject, html) => {
  if (!to) {
    throw new Error('Missing recipient email address');
  }

  const senderAddress = `"${emailFromName}" <${emailFrom}>`;

  // Attempt 1: Gmail SMTP
  if (gmailTransporter) {
    try {
      await gmailTransporter.sendMail({
        from: senderAddress,
        to,
        subject,
        html,
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
        html,
      });
      console.log(`✅ Email sent via Brevo SMTP to ${to}`);
      return true;
    } catch (brevoSmtpErr) {
      console.error('❌ Brevo SMTP failed:', brevoSmtpErr?.message || brevoSmtpErr);
    }
  }

  throw new Error('All email transports (Gmail, Brevo API, Brevo SMTP) failed to send email.');
};

module.exports = sendEmail;
