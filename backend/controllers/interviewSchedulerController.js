const InterviewSchedule = require('../models/InterviewSchedule');
const EmailLog = require('../models/EmailLog');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const emailService = require('../services/emailService');

function generateGoogleCalendarUrl({ date, time, title, description, durationMinutes = 60 }) {
  const dateTime = new Date(`${date}T${time}`);
  if (isNaN(dateTime.getTime())) return '';
  const endTime = new Date(dateTime.getTime() + durationMinutes * 60000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'Interview',
    dates: `${dateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    details: description || 'Interview scheduled via HireMate',
    sf: 'true',
    output: 'xml'
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function generateIcsContent({ date, time, title, description, location, organizerName, organizerEmail, durationMinutes = 60 }) {
  const dateTime = new Date(`${date}T${time}`);
  if (isNaN(dateTime.getTime())) return '';
  const endTime = new Date(dateTime.getTime() + durationMinutes * 60000);

  const formatDt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const now = formatDt(new Date());
  const uid = `${now}-${Math.random().toString(36).slice(2, 10)}@hiremate`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HireMate//Interview//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatDt(dateTime)}`,
    `DTEND:${formatDt(endTime)}`,
    `SUMMARY:${title || 'Interview'}`,
    `DESCRIPTION:${(description || 'Interview scheduled via HireMate').replace(/\n/g, '\\n')}`,
    location ? `LOCATION:${location}` : '',
    `ORGANIZER;CN=${organizerName || 'HireMate'}:mailto:${organizerEmail || 'noreply@hiremate.com'}`,
    'SEQUENCE:0',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Interview in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');
}

exports.scheduleInterview = catchAsync(async (req, res, next) => {
  const { candidateName, candidateEmail, date, time, platform } = req.body;
  if (!date || !time) {
    return next(new AppError('Date and time are required to schedule an interview', 400));
  }

  const platformName = platform || 'Google Meet';
  const meetingUrl = platformName === 'Google Meet'
    ? `https://meet.google.com/${Math.random().toString(36).slice(2, 11)}`
    : platformName === 'Zoom'
      ? `https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 9000000000)}`
      : `https://teams.microsoft.com/meeting/${Math.random().toString(36).slice(2, 18)}`;

  const schedule = await InterviewSchedule.create({
    recruiterId: req.user._id,
    candidateName: candidateName || 'Candidate',
    candidateEmail,
    date,
    time,
    platform: platformName,
    meetingUrl
  });

  const googleCalendarUrl = generateGoogleCalendarUrl({
    date, time,
    title: `Interview with ${candidateName}`,
    description: `Platform: ${platformName}\nMeeting Link: ${meetingUrl}`,
    durationMinutes: 60
  });

  const icsContent = generateIcsContent({
    date, time,
    title: `Interview with ${candidateName}`,
    description: `Platform: ${platformName}\nMeeting Link: ${meetingUrl}`,
    location: meetingUrl,
    organizerName: req.user.name || 'HireMate',
    organizerEmail: req.user.email || 'noreply@hiremate.com',
    durationMinutes: 60
  });

  if (candidateEmail) {
    try {
      await emailService.sendEmail({
        to: candidateEmail,
        subject: `Interview Scheduled: ${candidateName} on ${date} at ${time}`,
        text: `Dear ${candidateName},\n\nYour interview has been scheduled on ${date} at ${time} via ${platformName}.\n\nMeeting Link: ${meetingUrl}\nGoogle Calendar: ${googleCalendarUrl}\n\nBest regards,\nHireMate Team`,
        html: `<div style="font-family:sans-serif;padding:20px">
          <h2>Interview Scheduled</h2>
          <p>Dear ${candidateName},</p>
          <p>Your interview has been scheduled on <strong>${date}</strong> at <strong>${time}</strong> via <strong>${platformName}</strong>.</p>
          <p>Meeting Link: <a href="${meetingUrl}">${meetingUrl}</a></p>
          <p><a href="${googleCalendarUrl}" style="background:#4f46e5;color:white;padding:10px 20px;text-decoration:none;border-radius:5px">Add to Google Calendar</a></p>
          <hr><p>Best regards,<br>HireMate Team</p></div>`
      });

      await EmailLog.create({
        to: candidateEmail,
        subject: `Interview Scheduled: ${candidateName}`,
        template: 'interview_scheduled',
        status: 'sent',
        sentAt: new Date(),
        metadata: { referenceType: 'interview_schedule', referenceId: schedule._id }
      });
    } catch (err) {
      console.error(`[interviewScheduler] Email send failed: ${err.message}`);
    }
  }

  res.status(201).json({
    status: 'success',
    data: {
      ...schedule.toObject(),
      googleCalendarUrl,
      icsContent
    }
  });
});

exports.getMyScheduledInterviews = catchAsync(async (req, res, next) => {
  const schedules = await InterviewSchedule.find({
    $or: [{ recruiterId: req.user._id }, { candidateEmail: req.user.email }]
  }).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: schedules.length,
    data: schedules
  });
});