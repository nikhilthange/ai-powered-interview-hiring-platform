const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

exports.getMyNotifications = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Notification.countDocuments({ recipientId: req.user._id }),
    Notification.countDocuments({ recipientId: req.user._id, isRead: false })
  ]);

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    totalPages: Math.ceil(total / parseInt(limit)),
    unreadCount,
    data: { notifications }
  });
});

exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipientId: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError('Notification not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { notification }
  });
});

exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { recipientId: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read.'
  });
});
