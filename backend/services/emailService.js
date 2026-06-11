const nodemailer = require('nodemailer');

/**
 * Creates SMTP transporter if variables exist.
 */
const getTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 2525,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Dispatches emails to recipient. Falls back to terminal logging.
 */
const sendEmail = async (options) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log('\n===== EMAIL SERVICE LOCAL FALLBACK (NO SMTP CONFIGURED) =====');
    console.log(`To:      ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.text}`);
    console.log('=============================================================\n');
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@ai-powered-interview.com',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Sends a welcome/verification URL email.
 */
const sendVerificationEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;

  const text = `Welcome to the AI-Powered Interview platform!\n\nPlease verify your email by clicking the link below:\n\n${verificationUrl}\n\nThis verification link is valid for 10 minutes.`;
  const html = `
    <h2>Welcome to the Platform!</h2>
    <p>Please click the button below to verify your email address:</p>
    <a href="${verificationUrl}" style="background-color:#4f46e5;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;">Verify Email</a>
    <p>Or paste this URL in your browser: <br/> <a href="${verificationUrl}">${verificationUrl}</a></p>
    <p>This verification link is valid for 10 minutes.</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Please verify your email address',
    text,
    html
  });
};

/**
 * Sends a password reset URL email.
 */
const sendPasswordResetEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  const text = `You requested a password reset.\n\nPlease reset your password by clicking the link below:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email. This link is valid for 10 minutes.`;
  const html = `
    <h2>Password Reset Request</h2>
    <p>Please click the button below to reset your account password:</p>
    <a href="${resetUrl}" style="background-color:#ef4444;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;">Reset Password</a>
    <p>Or paste this URL in your browser: <br/> <a href="${resetUrl}">${resetUrl}</a></p>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
    <p>This link is valid for 10 minutes.</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    text,
    html
  });
};

const sendNotificationEmail = async (email, { title, message, name }) => {
  const text = `Hi ${name || 'User'},\n\n${title}\n\n${message}\n\nThank you for using AI-Powered Interview Platform.`;
  const html = `
    <h2>${title}</h2>
    <p>Hi ${name || 'User'},</p>
    <p>${message}</p>
    <hr />
    <p style="color:#6b7280;font-size:12px;">AI-Powered Interview Platform</p>
  `;

  await sendEmail({
    to: email,
    subject: title,
    text,
    html
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNotificationEmail
};
