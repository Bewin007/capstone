const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a goal name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['savings', 'debt_repayment', 'investment', 'purchase', 'emergency_fund', 'other'],
    required: true,
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please provide a target amount'],
    min: [0, 'Target amount must be positive'],
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  targetDate: {
    type: Date,
    required: [true, 'Please provide a target date'],
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'paused'],
    default: 'active',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  linkedCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  milestones: [{
    name: String,
    amount: Number,
    date: Date,
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
  }],
  contributions: [{
    amount: Number,
    date: {
      type: Date,
      default: Date.now,
    },
    note: String,
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
    },
  }],
  icon: {
    type: String,
    default: '🎯',
  },
  color: {
    type: String,
    default: '#007bff',
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

// Calculate progress percentage
goalSchema.virtual('progress').get(function () {
  if (this.targetAmount === 0) return 0;
  return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
});

// Validate dates
goalSchema.pre('save', function (next) {
  if (this.targetDate <= this.startDate) {
    next(new Error('Target date must be after start date'));
  }
  this.updatedAt = Date.now();
  next();
});

// Indexes
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, targetDate: 1 });

module.exports = mongoose.model('Goal', goalSchema);
