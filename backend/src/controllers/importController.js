const Expense = require('../models/Expense');
const Category = require('../models/Category');
const { CustomError, asyncHandler } = require('../middleware/errorHandler');
const Papa = require('papaparse');
const fs = require('fs').promises;

// @desc    Import expenses from CSV
// @route   POST /api/import/expenses/csv
// @access  Private
exports.importExpensesFromCSV = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new CustomError('Please upload a CSV file', 400);
  }

  try {
    // Read the CSV file
    const fileContent = await fs.readFile(req.file.path, 'utf8');

    // Parse CSV
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      throw new CustomError('Error parsing CSV file', 400);
    }

    const transactions = parseResult.data;
    const imported = [];
    const failed = [];

    // Get all categories for this user
    const categories = await Category.find({
      $or: [
        { owner: 'system', isActive: true },
        { owner: 'user', userId: req.user.id, isActive: true },
      ],
    });

    for (const row of transactions) {
      try {
        // Expected CSV format: Date, Type, Description, Category, Amount, Merchant, Notes
        const { Date: dateStr, Type, Description, Category: categoryName, Amount, Merchant, Notes } = row;

        if (!dateStr || !Type || !Description || !Amount) {
          failed.push({ row, reason: 'Missing required fields' });
          continue;
        }

        // Find category by name
        let category = categories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase());

        // If not found, use default miscellaneous
        if (!category) {
          category = categories.find(c => c.name.toLowerCase() === 'miscellaneous');
        }

        if (!category) {
          failed.push({ row, reason: 'Category not found' });
          continue;
        }

        // Create expense
        const expense = await Expense.create({
          userId: req.user.id,
          type: Type.toLowerCase(),
          amount: parseFloat(Amount),
          description: Description,
          category: category._id,
          date: new Date(dateStr),
          merchant: Merchant || undefined,
          notes: Notes || undefined,
          source: 'imported',
        });

        imported.push(expense);
      } catch (error) {
        failed.push({ row, reason: error.message });
      }
    }

    // Delete uploaded file
    await fs.unlink(req.file.path);

    res.status(200).json({
      success: true,
      message: `Imported ${imported.length} transactions, ${failed.length} failed`,
      data: {
        imported: imported.length,
        failed: failed.length,
        failedTransactions: failed,
      },
    });
  } catch (error) {
    // Clean up file if error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    throw error;
  }
});

module.exports = exports;
