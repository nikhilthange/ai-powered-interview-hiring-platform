const { sendSocketNotification } = require('../sockets/socketManager');
const { sendNotificationEmail } = require('../services/emailService');
const User = require('../models/User');
const Profile = require('../models/Profile');

exports.createAndSend = async ({ recipientId, type, title, message, sendEmail = false }) => {
  const notif = await sendSocketNotification({ userId: recipientId, type, title, message });

  if (sendEmail) {
    try {
      const user = await User.findById(recipientId).select('email');
      const profile = await Profile.findOne({ userId: recipientId }).select('fullName');
      const userName = profile?.fullName || 'User';
      if (user?.email) {
        await sendNotificationEmail(user.email, { title, message, name: userName });
      }
    } catch (err) {
      console.error('Failed to send notification email:', err.message);
    }
  }

  return notif;
};
