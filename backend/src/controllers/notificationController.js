const Notification = require('../models/Notification');
const { CustomError, asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const { isRead, limit = 50 } = req.query;

  const filter = { userId: req.user.id };
  if (isRead !== undefined) filter.isRead = isRead === 'true';

  const notifications = await Notification.find(filter)
    .sort('-createdAt')
    .limit(parseInt(limit));

  const unreadCount = await Notification.countDocuments({
    userId: req.user.id,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: notifications,
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new CustomError('Notification not found', 404);
  }

  if (notification.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized', 403);
  }

  await notification.markAsRead();

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new CustomError('Notification not found', 404);
  }

  if (notification.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized', 403);
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notification deleted',
  });
});

// Helper function to create notification
exports.createNotification = async (userId, type, title, message, relatedData = {}) => {
  try {
    await Notification.create({
      userId,
      type,
      title,
      message,
      relatedData,
      priority: type.includes('exceeded') ? 'high' : 'medium',
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = exports;
