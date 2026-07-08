const cron = require('node-cron');
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const { retryFailedEmails, sendInterviewReminderEmail } = require('../services/emailService');

const RETRY_SCHEDULE = '*/15 * * * *';
const REMINDER_SCHEDULE = '0 8 * * *';

const startEmailJobs = () => {
  cron.schedule(RETRY_SCHEDULE, async () => {
    console.log('[EmailCron] Retrying failed emails...');
    try {
      const retried = await retryFailedEmails();
      if (retried > 0) {
        console.log(`[EmailCron] Successfully retried ${retried} failed email(s).`);
      }
    } catch (err) {
      console.error('[EmailCron] Email retry failed:', err.message);
    }
  });

  cron.schedule(REMINDER_SCHEDULE, async () => {
    console.log('[EmailCron] Checking for upcoming interviews...');
    try {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const dayAfter = new Date(tomorrow.getTime() + 86400000);

      const interviews = await Interview.find({
        status: 'Scheduled',
        scheduledAt: { $gte: tomorrow, $lt: dayAfter }
      });

      if (interviews.length === 0) return;

      let sentCount = 0;
      for (const interview of interviews) {
        try {
          const [candidate, profile, app] = await Promise.all([
            User.findById(interview.candidateId).select('email name'),
            Profile.findOne({ userId: interview.candidateId }).select('fullName'),
            Application.findById(interview.applicationId).select('jobId').lean()
          ]);

          let jobTitle = 'the position';
          if (app?.jobId) {
            const job = await Job.findById(app.jobId).select('title').lean();
            jobTitle = job?.title || 'the position';
          }

          const candidateName = profile?.fullName || candidate?.name || 'Candidate';
          const dateTime = interview.scheduledAt.toLocaleString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
          });
          const meetLink = interview.meetLink;

          if (candidate?.email) {
            await sendInterviewReminderEmail(
              candidate.email, candidateName, jobTitle, dateTime, meetLink, interview.candidateId
            );
            sentCount++;
          }
        } catch (err) {
          console.error(`[EmailCron] Failed to send reminder for interview ${interview._id}:`, err.message);
        }
      }

      console.log(`[EmailCron] Sent ${sentCount} interview reminder(s).`);
    } catch (err) {
      console.error('[EmailCron] Interview reminder check failed:', err.message);
    }
  });

  console.log('[EmailCron] Email jobs initialized.');
};

module.exports = { startEmailJobs };
