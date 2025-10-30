const mongoose = require('mongoose');

const bankImportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['csv', 'pdf'],
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  totalTransactions: {
    type: Number,
    default: 0,
  },
  processedTransactions: {
    type: Number,
    default: 0,
  },
  categorizedTransactions: {
    type: Number,
    default: 0,
  },
  failedTransactions: {
    type: Number,
    default: 0,
  },
  transactions: [{
    rawData: mongoose.Schema.Types.Mixed,
    parsed: {
      date: Date,
      description: String,
      amount: Number,
      type: {
        type: String,
        enum: ['income', 'expense'],
      },
      merchant: String,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    categorizedBy: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'auto',
    },
    confidence: Number,
    status: {
      type: String,
      enum: ['pending', 'categorized', 'imported', 'failed', 'duplicate'],
      default: 'pending',
    },
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
    },
    error: String,
  }],
  summary: {
    totalIncome: {
      type: Number,
      default: 0,
    },
    totalExpense: {
      type: Number,
      default: 0,
    },
    dateRange: {
      start: Date,
      end: Date,
    },
    categoriesUsed: [{
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
      count: Number,
      totalAmount: Number,
    }],
  },
  errorLog: [{
    timestamp: {
      type: Date,
      default: Date.now,
    },
    message: String,
    details: mongoose.Schema.Types.Mixed,
  }],
  processingStartedAt: Date,
  processingCompletedAt: Date,
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
bankImportSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
bankImportSchema.index({ userId: 1, createdAt: -1 });
bankImportSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('BankImport', bankImportSchema);
