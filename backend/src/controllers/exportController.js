const Expense = require('../models/Expense');
const { CustomError, asyncHandler } = require('../middleware/errorHandler');
const { format } = require('date-fns');
const ExcelJS = require('exceljs');
const jsPDF = require('jspdf').jsPDF;
require('jspdf-autotable');

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

// @desc    Export expenses to Excel
// @route   GET /api/export/expenses/excel
// @access  Private
exports.exportExpensesToExcel = asyncHandler(async (req, res) => {
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

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Expenses');

  // Add headers
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Type', key: 'type', width: 10 },
    { header: 'Description', key: 'description', width: 25 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Amount', key: 'amount', width: 12 },
    { header: 'Merchant', key: 'merchant', width: 20 },
    { header: 'Notes', key: 'notes', width: 30 },
  ];

  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add data
  expenses.forEach(exp => {
    worksheet.addRow({
      date: format(new Date(exp.date), 'yyyy-MM-dd'),
      type: exp.type,
      description: exp.description,
      category: exp.category.name,
      amount: exp.amount,
      merchant: exp.merchant || '',
      notes: exp.notes || '',
    });
  });

  // Format amount column as currency
  worksheet.getColumn('amount').numFmt = '$#,##0.00';

  // Add summary
  const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  
  worksheet.addRow({});
  worksheet.addRow({ date: 'SUMMARY:', type: '', description: '', category: '', amount: '', merchant: '', notes: '' });
  worksheet.addRow({ date: 'Total Income:', type: '', description: '', category: '', amount: totalIncome, merchant: '', notes: '' });
  worksheet.addRow({ date: 'Total Expenses:', type: '', description: '', category: '', amount: totalExpenses, merchant: '', notes: '' });
  worksheet.addRow({ date: 'Net Amount:', type: '', description: '', category: '', amount: totalIncome - totalExpenses, merchant: '', notes: '' });

  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="expenses_${startDate}_to_${endDate}.xlsx"`);

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export expenses to PDF
// @route   GET /api/export/expenses/pdf
// @access  Private
exports.exportExpensesToPDF = asyncHandler(async (req, res) => {
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

  // Create PDF
  const doc = new jsPDF();
  
  // Verify autoTable is available
  if (typeof doc.autoTable !== 'function') {
    console.error('autoTable function not available on jsPDF instance');
    throw new CustomError('PDF generation failed - autoTable not available', 500);
  }
  
  // Add title
  doc.setFontSize(20);
  doc.text('Expense Report', 20, 20);
  
  // Add date range
  doc.setFontSize(12);
  doc.text(`Period: ${startDate} to ${endDate}`, 20, 35);
  
  // Prepare table data
  const tableData = expenses.map(exp => [
    format(new Date(exp.date), 'yyyy-MM-dd'),
    exp.type,
    exp.description,
    exp.category.name,
    `$${exp.amount.toFixed(2)}`,
    exp.merchant || '',
  ]);

  // Add table
  doc.autoTable({
    head: [['Date', 'Type', 'Description', 'Category', 'Amount', 'Merchant']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [71, 85, 105] },
    columnStyles: {
      4: { halign: 'right' }, // Amount column
    },
  });

  // Add summary
  const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text('Summary:', 20, finalY);
  doc.text(`Total Income: $${totalIncome.toFixed(2)}`, 20, finalY + 10);
  doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 20, finalY + 20);
  doc.text(`Net Amount: $${(totalIncome - totalExpenses).toFixed(2)}`, 20, finalY + 30);

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="expenses_${startDate}_to_${endDate}.pdf"`);

  // Output PDF
  res.send(Buffer.from(doc.output('arraybuffer')));
});

// @desc    Export budgets to Excel
// @route   GET /api/export/budgets/excel
// @access  Private
exports.exportBudgetsToExcel = asyncHandler(async (req, res) => {
  const Budget = require('../models/Budget');

  const budgets = await Budget.find({ userId: req.user.id })
    .populate('category', 'name')
    .sort('-createdAt');

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Budgets');

  // Add headers
  worksheet.columns = [
    { header: 'Budget Name', key: 'name', width: 20 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Target Amount', key: 'targetAmount', width: 15 },
    { header: 'Spent Amount', key: 'spentAmount', width: 15 },
    { header: 'Remaining', key: 'remaining', width: 15 },
    { header: 'Progress %', key: 'percentage', width: 12 },
    { header: 'Period', key: 'period', width: 10 },
    { header: 'Start Date', key: 'startDate', width: 12 },
    { header: 'End Date', key: 'endDate', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
  ];

  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add data
  budgets.forEach(budget => {
    const percentage = ((budget.spentAmount / budget.targetAmount) * 100).toFixed(2);
    const remaining = budget.targetAmount - budget.spentAmount;
    
    worksheet.addRow({
      name: budget.name,
      category: budget.category.name,
      targetAmount: budget.targetAmount,
      spentAmount: budget.spentAmount,
      remaining: remaining,
      percentage: parseFloat(percentage),
      period: budget.period,
      startDate: format(new Date(budget.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(budget.endDate), 'yyyy-MM-dd'),
      status: budget.status,
    });
  });

  // Format currency columns
  ['targetAmount', 'spentAmount', 'remaining'].forEach(col => {
    worksheet.getColumn(col).numFmt = '$#,##0.00';
  });
  
  // Format percentage column
  worksheet.getColumn('percentage').numFmt = '0.00%';

  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="budgets_report.xlsx"');

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export goals to Excel
// @route   GET /api/export/goals/excel
// @access  Private
exports.exportGoalsToExcel = asyncHandler(async (req, res) => {
  const Goal = require('../models/Goal');

  const goals = await Goal.find({ userId: req.user.id }).sort('-createdAt');

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Goals');

  // Add headers
  worksheet.columns = [
    { header: 'Goal Name', key: 'name', width: 20 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Target Amount', key: 'targetAmount', width: 15 },
    { header: 'Current Amount', key: 'currentAmount', width: 15 },
    { header: 'Remaining', key: 'remaining', width: 15 },
    { header: 'Progress %', key: 'percentage', width: 12 },
    { header: 'Target Date', key: 'targetDate', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Priority', key: 'priority', width: 10 },
  ];

  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add data
  goals.forEach(goal => {
    const percentage = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2);
    const remaining = goal.targetAmount - goal.currentAmount;
    
    worksheet.addRow({
      name: goal.name,
      description: goal.description || '',
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      remaining: remaining,
      percentage: parseFloat(percentage),
      targetDate: goal.targetDate ? format(new Date(goal.targetDate), 'yyyy-MM-dd') : '',
      status: goal.status,
      priority: goal.priority || 'medium',
    });
  });

  // Format currency columns
  ['targetAmount', 'currentAmount', 'remaining'].forEach(col => {
    worksheet.getColumn(col).numFmt = '$#,##0.00';
  });
  
  // Format percentage column
  worksheet.getColumn('percentage').numFmt = '0.00%';

  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="goals_report.xlsx"');

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
});

module.exports = exports;
