const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const { CustomError, asyncHandler } = require('../middleware/errorHandler');
const mongoose = require('mongoose');

// @desc    Get dashboard overview
// @route   GET /api/analytics/overview
// @access  Private
exports.getOverview = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = { userId: req.user.id };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Get total income and expenses
  const expenses = await Expense.find(filter);

  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = expenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const balance = totalIncome - totalExpenses;
  const transactionCount = expenses.length;

  // Get budget utilization
  const budgets = await Budget.find({ userId: req.user.id })
    .populate('category', 'name icon color');

  const budgetUtilization = budgets.map(budget => ({
    name: budget.name,
    category: budget.category?.name || 'Unknown',
    target: budget.targetAmount,
    spent: budget.spentAmount,
    percentage: ((budget.spentAmount / budget.targetAmount) * 100).toFixed(2),
  }));

  // Get goal progress
  const goals = await Goal.find({ userId: req.user.id, status: 'active' });
  const goalProgress = goals.map(goal => ({
    name: goal.name,
    current: goal.currentAmount,
    target: goal.targetAmount,
    percentage: ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2),
  }));

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalIncome,
        totalExpenses,
        balance,
        transactionCount,
      },
      budgetUtilization,
      goalProgress,
    },
  });
});

// @desc    Get spending trends by month/week/day
// @route   GET /api/analytics/trends
// @access  Private
exports.getSpendingTrends = asyncHandler(async (req, res) => {
  const { period, startDate, endDate } = req.query;

  const filter = { userId: new mongoose.Types.ObjectId(req.user.id) };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  let groupBy;
  switch (period) {
    case 'day':
      groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
      break;
    case 'week':
      groupBy = { $dateToString: { format: '%Y-W%U', date: '$date' } };
      break;
    case 'year':
      groupBy = { $dateToString: { format: '%Y', date: '$date' } };
      break;
    case 'month':
    default:
      groupBy = { $dateToString: { format: '%Y-%m', date: '$date' } };
  }

  const trends = await Expense.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          period: groupBy,
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.period': 1 } },
  ]);

  // Transform data for easier consumption
  const trendMap = {};
  trends.forEach(item => {
    const period = item._id.period;
    if (!trendMap[period]) {
      trendMap[period] = { period, income: 0, expense: 0 };
    }
    trendMap[period][item._id.type] = item.total;
  });

  const trendData = Object.values(trendMap);

  res.status(200).json({
    success: true,
    data: trendData,
  });
});

// @desc    Get category breakdown
// @route   GET /api/analytics/categories
// @access  Private
exports.getCategoryBreakdown = asyncHandler(async (req, res) => {
  const { type, startDate, endDate } = req.query;

  const filter = { userId: new mongoose.Types.ObjectId(req.user.id) };
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const breakdown = await Expense.aggregate([
    { $match: filter },
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
    { $unwind: '$categoryInfo' },
    {
      $project: {
        _id: 1,
        total: 1,
        count: 1,
        name: '$categoryInfo.name',
        icon: '$categoryInfo.icon',
        color: '$categoryInfo.color',
      },
    },
    { $sort: { total: -1 } },
  ]);

  // Calculate percentages
  const totalAmount = breakdown.reduce((sum, item) => sum + item.total, 0);
  const breakdownWithPercentage = breakdown.map(item => ({
    ...item,
    percentage: totalAmount > 0 ? ((item.total / totalAmount) * 100).toFixed(2) : '0.00',
  }));

  res.status(200).json({
    success: true,
    data: breakdownWithPercentage,
  });
});

// @desc    Get income vs expense comparison
// @route   GET /api/analytics/comparison
// @access  Private
exports.getIncomeExpenseComparison = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = { userId: new mongoose.Types.ObjectId(req.user.id) };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const comparison = await Expense.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        average: { $avg: '$amount' },
      },
    },
  ]);

  const result = {
    income: { total: 0, count: 0, average: 0 },
    expense: { total: 0, count: 0, average: 0 },
  };

  comparison.forEach(item => {
    result[item._id] = {
      total: item.total,
      count: item.count,
      average: item.average.toFixed(2),
    };
  });

  result.netSavings = result.income.total - result.expense.total;
  result.savingsRate = result.income.total > 0
    ? ((result.netSavings / result.income.total) * 100).toFixed(2)
    : 0;

  res.status(200).json({
    success: true,
    data: result,
  });
});

// @desc    Get monthly comparison (compare with previous months/years)
// @route   GET /api/analytics/monthly-comparison
// @access  Private
exports.getMonthlyComparison = asyncHandler(async (req, res) => {
  const { months } = req.query;
  const monthsToCompare = parseInt(months) || 12;

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsToCompare);

  const monthlyData = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user.id),
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Transform data
  const monthMap = {};
  monthlyData.forEach(item => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    if (!monthMap[key]) {
      monthMap[key] = { month: key, income: 0, expense: 0, net: 0 };
    }
    monthMap[key][item._id.type] = item.total;
  });

  // Calculate net for each month
  Object.values(monthMap).forEach(month => {
    month.net = month.income - month.expense;
  });

  res.status(200).json({
    success: true,
    data: Object.values(monthMap),
  });
});

// @desc    Get top spending merchants
// @route   GET /api/analytics/top-merchants
// @access  Private
exports.getTopMerchants = asyncHandler(async (req, res) => {
  const { limit, startDate, endDate } = req.query;
  const topLimit = parseInt(limit) || 10;

  const filter = {
    userId: new mongoose.Types.ObjectId(req.user.id),
    type: 'expense',
    merchant: { $exists: true, $ne: null, $ne: '' },
  };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const topMerchants = await Expense.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$merchant',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    { $limit: topLimit },
  ]);

  res.status(200).json({
    success: true,
    data: topMerchants.map(m => ({
      merchant: m._id,
      total: m.total,
      count: m.count,
    })),
  });
});

module.exports = exports;
