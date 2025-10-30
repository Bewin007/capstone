const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'budget_alert',
      'budget_exceeded',
      'goal_achieved',
      'goal_milestone',
      'import_completed',
      'import_failed',
      'recurring_reminder',
      'weekly_report',
      'monthly_report',
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  relatedData: {
    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Budget',
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
    },
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
    },
    bankImportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankImport',
    },
  },
  actionUrl: String,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = Date.now();
  return this.save();
};

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
