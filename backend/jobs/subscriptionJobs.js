const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');

const EXPIRY_CHECK_SCHEDULE = '0 0 * * *';
const NOTIFICATION_CLEANUP_SCHEDULE = '0 0 * * 0';

const startSubscriptionJobs = () => {
  cron.schedule(EXPIRY_CHECK_SCHEDULE, async () => {
    console.log('[Cron] Checking expired subscriptions...');
    try {
      const result = await Subscription.updateMany(
        {
          status: 'Active',
          planId: { $ne: 'Free' },
          currentPeriodEnd: { $lte: new Date() }
        },
        {
          $set: { status: 'Expired', planId: 'Free' }
        }
      );
      if (result.modifiedCount > 0) {
        console.log(`[Cron] Downgraded ${result.modifiedCount} expired subscription(s) to Free.`);
      }
    } catch (err) {
      console.error('[Cron] Subscription expiry check failed:', err.message);
    }
  });

  cron.schedule(NOTIFICATION_CLEANUP_SCHEDULE, async () => {
    console.log('[Cron] Cleaning up old read notifications...');
    try {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await Notification.deleteMany({
        isRead: true,
        createdAt: { $lt: cutoff }
      });
      if (result.deletedCount > 0) {
        console.log(`[Cron] Deleted ${result.deletedCount} old read notification(s).`);
      }
    } catch (err) {
      console.error('[Cron] Notification cleanup failed:', err.message);
    }
  });

  console.log('[Cron] Subscription jobs initialized.');
};

module.exports = { startSubscriptionJobs };
