const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true,
  },
  accountName: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true,
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true,
  },
  accountType: {
    type: String,
    enum: ['checking', 'savings', 'credit'],
    required: true,
  },
  bankUserId: {
    type: String,
    required: [true, 'Bank user ID is required'],
    trim: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastSyncDate: {
    type: Date,
    default: null,
  },
  balance: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  connectionStatus: {
    type: String,
    enum: ['connected', 'disconnected', 'error'],
    default: 'connected',
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
bankAccountSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
bankAccountSchema.index({ userId: 1, isActive: 1 });
bankAccountSchema.index({ bankUserId: 1 });

module.exports = mongoose.model('BankAccount', bankAccountSchema);