const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount must be positive'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
    default: Date.now,
  },
  source: {
    type: String,
    enum: ['manual', 'imported', 'recurring', 'goal_contribution', 'bank_import'],
    default: 'manual',
  },
  bankReference: {
    type: String,
    trim: true,
    index: true,
  },
  merchant: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringConfig: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    interval: {
      type: Number,
      min: 1,
    },
    startDate: Date,
    endDate: Date,
    nextDate: Date,
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String,
  }],
  bankImportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankImport',
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

// Update the updatedAt timestamp
expenseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1, date: -1 });
expenseSchema.index({ userId: 1, type: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
