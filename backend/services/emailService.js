const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');
const templates = require('./emailTemplates');

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

const sendEmail = async ({ to, subject, html, text, template, metadata }) => {
  const logEntry = await EmailLog.create({
    to,
    subject,
    template,
    status: 'pending',
    metadata
  });

  const transporter = getTransporter();

  if (!transporter) {
    console.log('\n===== EMAIL SERVICE LOCAL FALLBACK (NO SMTP CONFIGURED) =====');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${text || html}`);
    console.log('=============================================================\n');

    logEntry.status = 'sent';
    logEntry.sentAt = new Date();
    await logEntry.save();
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@ai-powered-interview.com',
      to,
      subject,
      text: text || '',
      html
    });

    logEntry.status = 'sent';
    logEntry.sentAt = new Date();
    await logEntry.save();
  } catch (err) {
    logEntry.status = 'failed';
    logEntry.errorMessage = err.message;
    logEntry.retryCount += 1;
    logEntry.lastAttemptedAt = new Date();
    await logEntry.save();

    console.error(`[EmailService] Failed to send "${template}" to ${to}: ${err.message}`);
    throw err;
  }
};

const sendVerificationEmail = async (email, token, name) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;
  const html = templates.verificationEmail(name, verifyUrl);

  await sendEmail({
    to: email,
    subject: 'Please verify your email address',
    html,
    text: `Welcome to HireMate! Please verify your email by clicking: ${verifyUrl}`,
    template: 'verification',
    metadata: { referenceType: 'verification' }
  });
};

const sendWelcomeEmail = async (email, name) => {
  const html = templates.welcomeEmail(name);

  await sendEmail({
    to: email,
    subject: 'Welcome to HireMate!',
    html,
    text: `Your email has been verified. Welcome to HireMate!`,
    template: 'welcome',
    metadata: { referenceType: 'user' }
  });
};

const sendPasswordResetEmail = async (email, token, name) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;
  const html = templates.passwordReset(name, resetUrl);

  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html,
    text: `Reset your password here: ${resetUrl}`,
    template: 'password_reset',
    metadata: { referenceType: 'password_reset' }
  });
};

const sendApplicationSubmittedEmail = async (email, name, jobTitle, company, userId) => {
  const html = templates.applicationSubmitted(name, jobTitle, company);

  await sendEmail({
    to: email,
    subject: `Application Submitted - ${jobTitle || 'Position'}`,
    html,
    text: `Your application for ${jobTitle || 'the position'} at ${company || 'the company'} has been received.`,
    template: 'application_submitted',
    metadata: { userId, referenceType: 'application' }
  });
};

const sendApplicationAcceptedEmail = async (email, name, jobTitle, company, userId) => {
  const html = templates.applicationAccepted(name, jobTitle, company);

  await sendEmail({
    to: email,
    subject: `Application Shortlisted - ${jobTitle || 'Position'}`,
    html,
    text: `Your application for ${jobTitle || 'the position'} at ${company || 'the company'} has been shortlisted!`,
    template: 'application_accepted',
    metadata: { userId, referenceType: 'application' }
  });
};

const sendApplicationRejectedEmail = async (email, name, jobTitle, company, userId) => {
  const html = templates.applicationRejected(name, jobTitle, company);

  await sendEmail({
    to: email,
    subject: `Application Update - ${jobTitle || 'Position'}`,
    html,
    text: `Your application for ${jobTitle || 'the position'} at ${company || 'the company'} has been reviewed.`,
    template: 'application_rejected',
    metadata: { userId, referenceType: 'application' }
  });
};

const sendInterviewScheduledEmail = async (email, name, jobTitle, dateTime, meetLink, userId) => {
  const html = templates.interviewScheduled(name, jobTitle, dateTime, meetLink);

  await sendEmail({
    to: email,
    subject: `Interview Scheduled - ${jobTitle || 'Position'}`,
    html,
    text: `Your interview for ${jobTitle || 'the position'} has been scheduled on ${dateTime || 'TBD'}.`,
    template: 'interview_scheduled',
    metadata: { userId, referenceType: 'interview' }
  });
};

const sendInterviewReminderEmail = async (email, name, jobTitle, dateTime, meetLink, userId) => {
  const html = templates.interviewReminder(name, jobTitle, dateTime, meetLink);

  await sendEmail({
    to: email,
    subject: `Reminder: Interview Tomorrow - ${jobTitle || 'Position'}`,
    html,
    text: `Reminder: Your interview for ${jobTitle || 'the position'} is scheduled on ${dateTime || 'TBD'}.`,
    template: 'interview_reminder',
    metadata: { userId, referenceType: 'interview' }
  });
};

const sendNotificationEmail = async (email, { title, message, name }) => {
  const text = `Hi ${name || 'User'},\n\n${title}\n\n${message}\n\nThank you for using AI-Powered Interview Platform.`;
  const html = `
    <h2>${title}</h2>
    <p>Hi ${name || 'User'},</p>
    <p>${message}</p>
    <hr />
    <p style="color:#6b7280;font-size:12px;">HireMate - AI-Powered Interview Platform</p>
  `;

  await sendEmail({
    to: email,
    subject: title,
    html,
    text,
    template: 'notification'
  });
};

const retryFailedEmails = async () => {
  const failedEmails = await EmailLog.find({
    status: 'failed',
    retryCount: { $lt: 3 }
  }).limit(20);

  if (failedEmails.length === 0) return 0;

  let retried = 0;
  for (const log of failedEmails) {
    try {
      const transporter = getTransporter();
      if (!transporter) break;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@ai-powered-interview.com',
        to: log.to,
        subject: log.subject,
        html: ''
      });

      log.status = 'sent';
      log.sentAt = new Date();
      log.errorMessage = '';
      await log.save();
      retried++;
    } catch (err) {
      log.retryCount += 1;
      log.lastAttemptedAt = new Date();
      log.errorMessage = err.message;
      await log.save();
    }
  }

  return retried;
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendApplicationSubmittedEmail,
  sendApplicationAcceptedEmail,
  sendApplicationRejectedEmail,
  sendInterviewScheduledEmail,
  sendInterviewReminderEmail,
  sendNotificationEmail,
  retryFailedEmails
};
