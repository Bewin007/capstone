const Expense = require('../models/Expense');
const Category = require('../models/Category');
const Budget = require('../models/Budget');
const { CustomError, asyncHandler } = require('../middleware/errorHandler');
const { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } = require('date-fns');

// @desc    Get all expenses for user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = asyncHandler(async (req, res) => {
  const {
    type,
    category,
    startDate,
    endDate,
    source,
    isRecurring,
    page = 1,
    limit = 50,
    sort = '-date',
  } = req.query;

  const filter = { userId: req.user.id };

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (source) filter.source = source;
  if (isRecurring !== undefined) filter.isRecurring = isRecurring === 'true';

  // Date range filter
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const expenses = await Expense.find(filter)
    .populate('category', 'name icon color')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Expense.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: expenses.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: expenses,
  });
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id).populate('category', 'name icon color');

  if (!expense) {
    throw new CustomError('Expense not found', 404);
  }

  if (expense.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized to access this expense', 403);
  }

  res.status(200).json({
    success: true,
    data: expense,
  });
});

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = asyncHandler(async (req, res) => {
  const {
    type,
    amount,
    description,
    category,
    date,
    merchant,
    notes,
    tags,
    isRecurring,
    recurringConfig,
  } = req.body;

  // Validate required fields
  if (!type || !amount || !description || !category) {
    throw new CustomError('Please provide type, amount, description, and category', 400);
  }

  // Validate amount
  if (amount <= 0) {
    throw new CustomError('Amount must be positive', 400);
  }

  // Validate category exists and user has access
  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    throw new CustomError('Category not found', 404);
  }

  // Validate date is not in future beyond today
  const expenseDate = date ? new Date(date) : new Date();
  if (expenseDate > new Date()) {
    throw new CustomError('Expense date cannot be in the future', 400);
  }

  // Create expense
  const expense = await Expense.create({
    userId: req.user.id,
    type,
    amount,
    description: description.trim(),
    category,
    date: expenseDate,
    merchant: merchant?.trim(),
    notes: notes?.trim(),
    tags,
    isRecurring: isRecurring || false,
    recurringConfig: isRecurring ? recurringConfig : undefined,
    source: 'manual',
  });

  // Update budget if expense
  if (type === 'expense') {
    await updateBudgetSpent(req.user.id, category, expenseDate, amount);
  }

  const populatedExpense = await Expense.findById(expense._id).populate('category', 'name icon color');

  res.status(201).json({
    success: true,
    data: populatedExpense,
  });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = asyncHandler(async (req, res) => {
  let expense = await Expense.findById(req.params.id);

  if (!expense) {
    throw new CustomError('Expense not found', 404);
  }

  if (expense.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized to update this expense', 403);
  }

  const {
    type,
    amount,
    description,
    category,
    date,
    merchant,
    notes,
    tags,
    isRecurring,
    recurringConfig,
  } = req.body;

  // Store old values for budget update
  const oldAmount = expense.amount;
  const oldCategory = expense.category;
  const oldType = expense.type;

  const updateData = {};
  if (type !== undefined) updateData.type = type;
  if (amount !== undefined) {
    if (amount <= 0) {
      throw new CustomError('Amount must be positive', 400);
    }
    updateData.amount = amount;
  }
  if (description !== undefined) updateData.description = description.trim();
  if (category !== undefined) updateData.category = category;
  if (date !== undefined) {
    const expenseDate = new Date(date);
    if (expenseDate > new Date()) {
      throw new CustomError('Expense date cannot be in the future', 400);
    }
    updateData.date = expenseDate;
  }
  if (merchant !== undefined) updateData.merchant = merchant?.trim();
  if (notes !== undefined) updateData.notes = notes?.trim();
  if (tags !== undefined) updateData.tags = tags;
  if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
  if (recurringConfig !== undefined) updateData.recurringConfig = recurringConfig;

  expense = await Expense.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate('category', 'name icon color');

  // Update budgets if necessary
  if (oldType === 'expense') {
    await updateBudgetSpent(req.user.id, oldCategory, expense.date, -oldAmount);
  }
  if (expense.type === 'expense') {
    await updateBudgetSpent(req.user.id, expense.category, expense.date, expense.amount);
  }

  res.status(200).json({
    success: true,
    data: expense,
  });
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id).populate('category');

  if (!expense) {
    throw new CustomError('Expense not found', 404);
  }

  if (expense.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized to delete this expense', 403);
  }

  // Get category ID (handle both populated and non-populated)
  const categoryId = expense.category._id || expense.category;

  // Update budget if expense
  if (expense.type === 'expense') {
    await updateBudgetSpent(req.user.id, categoryId, expense.date, -expense.amount);
  }

  await expense.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Expense deleted successfully',
  });
});

// @desc    Get expense summary/stats
// @route   GET /api/expenses/stats/summary
// @access  Private
exports.getExpenseSummary = asyncHandler(async (req, res) => {
  const { period = 'month', startDate, endDate } = req.query;

  let dateFilter = {};
  const now = new Date();

  if (startDate && endDate) {
    dateFilter = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else {
    switch (period) {
      case 'day':
        dateFilter = { $gte: startOfDay(now), $lte: endOfDay(now) };
        break;
      case 'week':
        dateFilter = { $gte: startOfWeek(now), $lte: endOfWeek(now) };
        break;
      case 'month':
        dateFilter = { $gte: startOfMonth(now), $lte: endOfMonth(now) };
        break;
      default:
        dateFilter = { $gte: startOfMonth(now), $lte: endOfMonth(now) };
    }
  }

  const summary = await Expense.aggregate([
    {
      $match: {
        userId: req.user._id,
        date: dateFilter,
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const categoryBreakdown = await Expense.aggregate([
    {
      $match: {
        userId: req.user._id,
        date: dateFilter,
        type: 'expense',
      },
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    {
      $unwind: '$categoryInfo',
    },
    {
      $sort: { total: -1 },
    },
  ]);

  const result = {
    totalIncome: 0,
    totalExpense: 0,
    transactionCount: 0,
    netBalance: 0,
  };

  summary.forEach(item => {
    if (item._id === 'income') {
      result.totalIncome = item.total;
    } else if (item._id === 'expense') {
      result.totalExpense = item.total;
    }
    result.transactionCount += item.count;
  });

  result.netBalance = result.totalIncome - result.totalExpense;

  res.status(200).json({
    success: true,
    data: {
      ...result,
      categoryBreakdown,
    },
  });
});

// Helper function to update budget spent amount
async function updateBudgetSpent(userId, categoryId, date, amountChange) {
  const Notification = require('../models/Notification');

  const budgets = await Budget.find({
    userId,
    category: categoryId,
    startDate: { $lte: date },
    endDate: { $gte: date },
  }).populate('category');

  for (const budget of budgets) {
    const oldSpent = budget.spentAmount;
    budget.spentAmount = Math.max(0, budget.spentAmount + amountChange);

    // Update status based on spent amount
    if (budget.spentAmount >= budget.targetAmount) {
      budget.status = 'exceeded';

      // Create notification for exceeded budget
      if (oldSpent < budget.targetAmount) {
        await Notification.create({
          userId,
          type: 'budget_exceeded',
          title: 'Budget Exceeded!',
          message: `Your ${budget.name} budget has been exceeded. Spent: $${budget.spentAmount.toFixed(2)} / $${budget.targetAmount.toFixed(2)}`,
          priority: 'high',
          relatedData: { budgetId: budget._id },
        });
      }
    } else {
      budget.status = 'active';
    }

    // Check if alert threshold is reached
    const percentage = (budget.spentAmount / budget.targetAmount) * 100;
    if (percentage >= budget.alertThreshold && !budget.alertTriggered && oldSpent < (budget.targetAmount * budget.alertThreshold / 100)) {
      budget.alertTriggered = true;

      // Create notification for budget alert
      await Notification.create({
        userId,
        type: 'budget_alert',
        title: 'Budget Alert',
        message: `You've reached ${percentage.toFixed(0)}% of your ${budget.name} budget ($${budget.spentAmount.toFixed(2)} / $${budget.targetAmount.toFixed(2)})`,
        priority: 'medium',
        relatedData: { budgetId: budget._id },
      });
    }

    await budget.save();
  }
}

module.exports = exports;
