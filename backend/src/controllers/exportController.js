const Expense = require('../models/Expense');
const { CustomError, asyncHandler } = require('../middleware/errorHandler');
const { format } = require('date-fns');

// @desc    Export expenses to CSV
// @route   GET /api/export/expenses
// @access  Private
exports.exportExpenses = asyncHandler(async (req, res) => {
  const { startDate, endDate, type, category } = req.query;

  if (!startDate || !endDate) {
    throw new CustomError('Start date and end date are required', 400);
  }

  const filter = {
    userId: req.user.id,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  if (type) filter.type = type;
  if (category) filter.category = category;

  const expenses = await Expense.find(filter)
    .populate('category', 'name icon')
    .sort('date');

  // Generate CSV
  const csvHeaders = ['Date', 'Type', 'Description', 'Category', 'Amount', 'Merchant', 'Notes'];
  const csvRows = expenses.map(exp => [
    format(new Date(exp.date), 'yyyy-MM-dd'),
    exp.type,
    exp.description,
    exp.category.name,
    exp.amount.toFixed(2),
    exp.merchant || '',
    exp.notes || '',
  ]);

  const csv = [
    csvHeaders.join(','),
    ...csvRows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="expenses_${startDate}_to_${endDate}.csv"`);
  res.send(csv);
});

// @desc    Export budgets report
// @route   GET /api/export/budgets
// @access  Private
exports.exportBudgets = asyncHandler(async (req, res) => {
  const Budget = require('../models/Budget');

  const budgets = await Budget.find({ userId: req.user.id })
    .populate('category', 'name')
    .sort('-createdAt');

  const csvHeaders = ['Budget Name', 'Category', 'Target Amount', 'Spent Amount', 'Percentage', 'Period', 'Start Date', 'End Date', 'Status'];
  const csvRows = budgets.map(budget => {
    const percentage = ((budget.spentAmount / budget.targetAmount) * 100).toFixed(2);
    return [
      budget.name,
      budget.category.name,
      budget.targetAmount.toFixed(2),
      budget.spentAmount.toFixed(2),
      percentage + '%',
      budget.period,
      format(new Date(budget.startDate), 'yyyy-MM-dd'),
      format(new Date(budget.endDate), 'yyyy-MM-dd'),
      budget.status,
    ];
  });

  const csv = [
    csvHeaders.join(','),
    ...csvRows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="budgets_report.csv"');
  res.send(csv);
});

// @desc    Export goals report
// @route   GET /api/export/goals
// @access  Private
exports.exportGoals = asyncHandler(async (req, res) => {
  const Goal = require('../models/Goal');

  const goals = await Goal.find({ userId: req.user.id }).sort('-createdAt');

  const csvHeaders = ['Goal Name', 'Type', 'Target Amount', 'Current Amount', 'Progress %', 'Start Date', 'Target Date', 'Status', 'Priority'];
  const csvRows = goals.map(goal => {
    const percentage = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2);
    return [
      goal.name,
      goal.type,
      goal.targetAmount.toFixed(2),
      goal.currentAmount.toFixed(2),
      percentage + '%',
      format(new Date(goal.startDate), 'yyyy-MM-dd'),
      format(new Date(goal.targetDate), 'yyyy-MM-dd'),
      goal.status,
      goal.priority,
    ];
  });

  const csv = [
    csvHeaders.join(','),
    ...csvRows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="goals_report.csv"');
  res.send(csv);
});

module.exports = exports;
