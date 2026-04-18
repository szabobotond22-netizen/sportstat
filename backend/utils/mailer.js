const nodemailer = require('nodemailer');

function isDevEmailFallbackEnabled() {
  return String(process.env.ENABLE_DEV_EMAIL_LOG || 'true') === 'true';
}

function getEmailMode() {
  return String(process.env.EMAIL_MODE || 'dev').toLowerCase();
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

async function sendEmail({ to, subject, text, html }) {
  const emailMode = getEmailMode();

  // In dev mode we never attempt SMTP; this keeps local auth flow simple.
  if (emailMode !== 'smtp') {
    if (isDevEmailFallbackEnabled()) {
      console.warn('[MAILER_FALLBACK] EMAIL_MODE=dev, email logged to console.');
      console.warn(`[MAILER_FALLBACK] To: ${to}`);
      console.warn(`[MAILER_FALLBACK] Subject: ${subject}`);
      console.warn(`[MAILER_FALLBACK] Text: ${text}`);
    }

    return {
      sent: false,
      fallback: true,
      error: 'EMAIL_MODE=dev',
    };
  }

  try {
    const transporter = createTransporter();
    const from = process.env.SMTP_FROM || getRequiredEnv('SMTP_USER');

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    return {
      sent: true,
      fallback: false,
      info,
    };
  } catch (error) {
    if (!isDevEmailFallbackEnabled()) {
      throw error;
    }

    console.warn('[MAILER_FALLBACK] SMTP unavailable, email logged to console.');
    console.warn(`[MAILER_FALLBACK] To: ${to}`);
    console.warn(`[MAILER_FALLBACK] Subject: ${subject}`);
    console.warn(`[MAILER_FALLBACK] Text: ${text}`);

    return {
      sent: false,
      fallback: true,
      error: error.message,
    };
  }
}

module.exports = {
  sendEmail,
};
