const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a budget name'],
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please provide a target amount'],
    min: [0, 'Target amount must be positive'],
  },
  spentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
    required: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date'],
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringConfig: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly'],
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
  },
  alertThreshold: {
    type: Number,
    min: 0,
    max: 100,
    default: 80,
  },
  alertTriggered: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'exceeded', 'completed', 'archived'],
    default: 'active',
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Validate dates
budgetSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  this.updatedAt = Date.now();
  next();
});

// Indexes
budgetSchema.index({ userId: 1, status: 1 });
budgetSchema.index({ userId: 1, period: 1, startDate: -1 });

module.exports = mongoose.model('Budget', budgetSchema);
