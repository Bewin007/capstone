const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const { CustomError, asyncHandler } = require('../middleware/errorHandler');
const { addMonths, addWeeks, addYears, isBefore, startOfMonth, endOfMonth } = require('date-fns');

// @desc    Get all budgets for user
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = asyncHandler(async (req, res) => {
  const { status, period, category } = req.query;

  const filter = { userId: req.user.id };

  if (status) filter.status = status;
  if (period) filter.period = period;
  if (category) filter.category = category;

  const budgets = await Budget.find(filter)
    .populate('category', 'name icon color')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: budgets.length,
    data: budgets,
  });
});

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
exports.getBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id).populate('category', 'name icon color');

  if (!budget) {
    throw new CustomError('Budget not found', 404);
  }

  if (budget.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized to access this budget', 403);
  }

  // Calculate actual spent amount from expenses
  const actualSpent = await Expense.aggregate([
    {
      $match: {
        userId: req.user._id,
        category: budget.category._id,
        type: 'expense',
        date: {
          $gte: budget.startDate,
          $lte: budget.endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  const spentAmount = actualSpent.length > 0 ? actualSpent[0].total : 0;

  // Update budget spent amount if different
  if (budget.spentAmount !== spentAmount) {
    budget.spentAmount = spentAmount;
    await budget.save();
  }

  res.status(200).json({
    success: true,
    data: budget,
  });
});

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
exports.createBudget = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    targetAmount,
    period,
    startDate,
    endDate,
    isRecurring,
    recurringConfig,
    alertThreshold,
    notes,
  } = req.body;

  // Validate required fields
  if (!name || !category || !targetAmount || !period || !startDate || !endDate) {
    throw new CustomError('Please provide all required fields', 400);
  }

  // Validate amount
  if (targetAmount <= 0) {
    throw new CustomError('Target amount must be positive', 400);
  }

  // Validate category exists
  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    throw new CustomError('Category not found', 404);
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (end <= start) {
    throw new CustomError('End date must be after start date', 400);
  }

  // Prevent creating budget for past periods (e.g., monthly budget for last month)
  if (period === 'monthly') {
    const currentMonthStart = startOfMonth(now);
    const budgetMonthEnd = endOfMonth(start);

    if (isBefore(budgetMonthEnd, currentMonthStart)) {
      throw new CustomError('Cannot create a monthly budget for a past month', 400);
    }
  }

  // Check for overlapping budgets
  const overlappingBudget = await Budget.findOne({
    userId: req.user.id,
    category,
    status: { $in: ['active', 'exceeded'] },
    $or: [
      { startDate: { $lte: start }, endDate: { $gte: start } },
      { startDate: { $lte: end }, endDate: { $gte: end } },
      { startDate: { $gte: start }, endDate: { $lte: end } },
    ],
  });

  if (overlappingBudget) {
    throw new CustomError('A budget already exists for this category in the specified period', 400);
  }

  // Calculate current spent amount for this period
  const expenses = await Expense.aggregate([
    {
      $match: {
        userId: req.user._id,
        category: categoryDoc._id,
        type: 'expense',
        date: {
          $gte: start,
          $lte: end,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  const spentAmount = expenses.length > 0 ? expenses[0].total : 0;

  // Create budget
  const budget = await Budget.create({
    userId: req.user.id,
    name: name.trim(),
    category,
    targetAmount,
    spentAmount,
    period,
    startDate: start,
    endDate: end,
    isRecurring: isRecurring || false,
    recurringConfig: isRecurring ? recurringConfig : undefined,
    alertThreshold: alertThreshold || 80,
    notes: notes?.trim(),
  });

  const populatedBudget = await Budget.findById(budget._id).populate('category', 'name icon color');

  res.status(201).json({
    success: true,
    data: populatedBudget,
  });
});

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
exports.updateBudget = asyncHandler(async (req, res) => {
  let budget = await Budget.findById(req.params.id);

  if (!budget) {
    throw new CustomError('Budget not found', 404);
  }

  if (budget.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized to update this budget', 403);
  }

  const {
    name,
    targetAmount,
    alertThreshold,
    notes,
    status,
  } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (targetAmount !== undefined) {
    if (targetAmount <= 0) {
      throw new CustomError('Target amount must be positive', 400);
    }
    updateData.targetAmount = targetAmount;
  }
  if (alertThreshold !== undefined) updateData.alertThreshold = alertThreshold;
  if (notes !== undefined) updateData.notes = notes?.trim();
  if (status !== undefined) updateData.status = status;

  budget = await Budget.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate('category', 'name icon color');

  res.status(200).json({
    success: true,
    data: budget,
  });
});

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id);

  if (!budget) {
    throw new CustomError('Budget not found', 404);
  }

  if (budget.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized to delete this budget', 403);
  }

  await budget.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Budget deleted successfully',
  });
});

// @desc    Get budget performance/analytics
// @route   GET /api/budgets/:id/performance
// @access  Private
exports.getBudgetPerformance = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id).populate('category', 'name icon color');

  if (!budget) {
    throw new CustomError('Budget not found', 404);
  }

  if (budget.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized to access this budget', 403);
  }

  // Get daily breakdown of expenses
  const dailyBreakdown = await Expense.aggregate([
    {
      $match: {
        userId: req.user._id,
        category: budget.category._id,
        type: 'expense',
        date: {
          $gte: budget.startDate,
          $lte: budget.endDate,
        },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const percentage = (budget.spentAmount / budget.targetAmount) * 100;
  const remaining = budget.targetAmount - budget.spentAmount;

  res.status(200).json({
    success: true,
    data: {
      budget,
      performance: {
        spentAmount: budget.spentAmount,
        targetAmount: budget.targetAmount,
        remaining,
        percentage: percentage.toFixed(2),
        status: budget.status,
      },
      dailyBreakdown,
    },
  });
});

// @desc    Renew recurring budgets
// @route   POST /api/budgets/renew-recurring
// @access  Private
exports.renewRecurringBudgets = asyncHandler(async (req, res) => {
  const now = new Date();
  const budgetsToRenew = await Budget.find({
    userId: req.user.id,
    isRecurring: true,
    'recurringConfig.autoRenew': true,
    endDate: { $lte: now },
    status: { $in: ['completed', 'exceeded', 'active'] },
  });

  const renewedBudgets = [];

  for (const oldBudget of budgetsToRenew) {
    let newStartDate = oldBudget.endDate;
    let newEndDate;

    switch (oldBudget.recurringConfig.frequency) {
      case 'weekly':
        newStartDate = addWeeks(oldBudget.startDate, 1);
        newEndDate = addWeeks(oldBudget.endDate, 1);
        break;
      case 'monthly':
        newStartDate = addMonths(oldBudget.startDate, 1);
        newEndDate = addMonths(oldBudget.endDate, 1);
        break;
      case 'yearly':
        newStartDate = addYears(oldBudget.startDate, 1);
        newEndDate = addYears(oldBudget.endDate, 1);
        break;
    }

    // Archive old budget
    oldBudget.status = 'archived';
    await oldBudget.save();

    // Create new budget
    const newBudget = await Budget.create({
      userId: oldBudget.userId,
      name: oldBudget.name,
      category: oldBudget.category,
      targetAmount: oldBudget.targetAmount,
      spentAmount: 0,
      period: oldBudget.period,
      startDate: newStartDate,
      endDate: newEndDate,
      isRecurring: true,
      recurringConfig: oldBudget.recurringConfig,
      alertThreshold: oldBudget.alertThreshold,
      notes: oldBudget.notes,
    });

    renewedBudgets.push(newBudget);
  }

  res.status(200).json({
    success: true,
    message: `${renewedBudgets.length} recurring budgets renewed`,
    data: renewedBudgets,
  });
});

module.exports = exports;
