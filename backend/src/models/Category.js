const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    trim: true,
  },
  icon: {
    type: String,
    default: '📁',
  },
  color: {
    type: String,
    default: '#6c757d',
  },
  type: {
    type: String,
    enum: ['expense', 'income', 'both'],
    default: 'expense',
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  owner: {
    type: String,
    enum: ['system', 'user'],
    default: 'system',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.owner === 'user';
    },
  },
  isActive: {
    type: Boolean,
    default: true,
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
categorySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
categorySchema.index({ userId: 1, isActive: 1 });
categorySchema.index({ owner: 1, isActive: 1 });

module.exports = mongoose.model('Category', categorySchema);
