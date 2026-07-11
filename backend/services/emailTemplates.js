const baseLayout = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <h1 style="margin:0;font-size:24px;color:#4f46e5;font-weight:700;">HireMate</h1>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
              ${content}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 0 0;font-size:12px;color:#9ca3af;">
              <p style="margin:0 0 4px;">AI-Powered Interview Platform</p>
              <p style="margin:0;">If you did not expect this email, please ignore it.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const buttonStyle = 'display:inline-block;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;';

exports.verificationEmail = (name, verifyUrl) => baseLayout(`
  <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Welcome to HireMate!</h2>
  <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">Hi ${name || 'there'},</p>
  <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">Thanks for joining! Please verify your email address to get started.</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:0 0 20px;">
        <a href="${verifyUrl}" style="${buttonStyle}background-color:#4f46e5;color:#ffffff;">Verify Email Address</a>
      </td>
    </tr>
  </table>
  <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.5;">Or copy this link into your browser:</p>
  <p style="margin:0;color:#4f46e5;font-size:13px;word-break:break-all;">${verifyUrl}</p>
  <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb;" />
  <p style="margin:0;color:#9ca3af;font-size:13px;">This link expires in 10 minutes. If you didn't create an account, you can safely ignore this email.</p>
`);

exports.welcomeEmail = (name) => baseLayout(`
  <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Email Verified!</h2>
  <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">Hi ${name || 'there'},</p>
  <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">Your email has been successfully verified. You now have full access to all HireMate features.</p>
  <p style="margin:0 0 8px;color:#6b7280;font-size:15px;line-height:1.6;">Get started by:</p>
  <ul style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.8;padding-left:20px;">
    <li>Completing your <strong>profile</strong> to stand out to recruiters</li>
    <li>Browsing <strong>job listings</strong> that match your skills</li>
    <li>Practicing with <strong>AI mock interviews</strong></li>
  </ul>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:8px 0 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="${buttonStyle}background-color:#4f46e5;color:#ffffff;">Go to Dashboard</a>
      </td>
    </tr>
  </table>
`);

exports.passwordReset = (name, resetUrl) => baseLayout(`
  <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Reset Your Password</h2>
  <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">Hi ${name || 'there'},</p>
  <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">We received a request to reset your password. Click the button below to create a new one.</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:0 0 20px;">
        <a href="${resetUrl}" style="${buttonStyle}background-color:#ef4444;color:#ffffff;">Reset Password</a>
      </td>
    </tr>
  </table>
  <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.5;">Or copy this link into your browser:</p>
  <p style="margin:0;color:#4f46e5;font-size:13px;word-break:break-all;">${resetUrl}</p>
  <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb;" />
  <p style="margin:0;color:#9ca3af;font-size:13px;">This link expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
`);

exports.applicationSubmitted = (name, jobTitle, company) => baseLayout(`
  <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Application Submitted</h2>
  <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">Hi ${name || 'there'},</p>
  <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">Your application for <strong>${jobTitle || 'the position'}</strong> at <strong>${company || 'the company'}</strong> has been received.</p>
  <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">The recruiter will review your application and get back to you soon. You can track your application status from your dashboard.</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:8px 0 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-applications" style="${buttonStyle}background-color:#4f46e5;color:#ffffff;">Track Application</a>
      </td>
    </tr>
  </table>
`);

exports.applicationAccepted = (name, jobTitle, company) => baseLayout(`
  <h2 style="margin:0 0 8px;font-size:20px;color:#059669;">Application Accepted!</h2>
  <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">Hi ${name || 'there'},</p>
  <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">Great news! Your application for <strong>${jobTitle || 'the position'}</strong> at <strong>${company || 'the company'}</strong> has been shortlisted.</p>
  <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">The recruiter will reach out to schedule an interview. Keep an eye on your inbox and dashboard for updates.</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:8px 0 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-applications" style="${buttonStyle}background-color:#059669;color:#ffffff;">View Details</a>
      </td>
    </tr>
  </table>
`);

exports.applicationRejected = (name, jobTitle, company) => baseLayout(`
  <h2 style="margin:0 0 8px;font-size:20px;color:#dc2626;">Application Update</h2>
  <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">Hi ${name || 'there'},</p>
  <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">Thank you for your interest in <strong>${jobTitle || 'the position'}</strong> at <strong>${company || 'the company'}</strong>.</p>
  <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">After careful review, the recruiter has decided to move forward with other candidates. Don't be discouraged — there are many more opportunities waiting for you.</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:8px 0 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/jobs" style="${buttonStyle}background-color:#4f46e5;color:#ffffff;">Browse Jobs</a>
      </td>
    </tr>
  </table>
`);

exports.interviewScheduled = (name, jobTitle, dateTime, meetLink) => baseLayout(`
  <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Interview Scheduled</h2>
  <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">Hi ${name || 'there'},</p>
  <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">Your interview for <strong>${jobTitle || 'the position'}</strong> has been scheduled.</p>
  <table width="100%" cellpadding="12" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;margin:0 0 20px;">
    <tr>
      <td style="padding:12px 16px;font-size:14px;color:#374151;"><strong>Date & Time:</strong></td>
      <td style="padding:12px 16px;font-size:14px;color:#374151;">${dateTime || 'To be confirmed'}</td>
    </tr>
    <tr>
      <td style="padding:12px 16px;font-size:14px;color:#374151;"><strong>Meeting Link:</strong></td>
      <td style="padding:12px 16px;font-size:14px;color:#374151;">${meetLink ? `<a href="${meetLink}" style="color:#4f46e5;">${meetLink}</a>` : 'Will be shared soon'}</td>
    </tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:8px 0 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/interviews" style="${buttonStyle}background-color:#4f46e5;color:#ffffff;">View Interview</a>
      </td>
    </tr>
  </table>
`);

exports.interviewReminder = (name, jobTitle, dateTime, meetLink) => baseLayout(`
  <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Interview Reminder</h2>
  <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">Hi ${name || 'there'},</p>
  <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">This is a friendly reminder that your interview for <strong>${jobTitle || 'the position'}</strong> is coming up soon.</p>
  <table width="100%" cellpadding="12" cellspacing="0" style="background-color:#fef3c7;border-radius:8px;margin:0 0 20px;border:1px solid #fde68a;">
    <tr>
      <td style="padding:12px 16px;font-size:14px;color:#92400e;"><strong>Date & Time:</strong></td>
      <td style="padding:12px 16px;font-size:14px;color:#92400e;">${dateTime || 'To be confirmed'}</td>
    </tr>
    <tr>
      <td style="padding:12px 16px;font-size:14px;color:#92400e;"><strong>Meeting Link:</strong></td>
      <td style="padding:12px 16px;font-size:14px;color:#92400e;">${meetLink ? `<a href="${meetLink}" style="color:#4f46e5;">${meetLink}</a>` : 'Will be shared soon'}</td>
    </tr>
  </table>
  <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.5;">Make sure you have a stable internet connection and a quiet environment. Good luck!</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:16px 0 0;">
        <a href="${meetLink || '#'}" style="${buttonStyle}background-color:#4f46e5;color:#ffffff;">Join Meeting</a>
      </td>
    </tr>
  </table>
`);
