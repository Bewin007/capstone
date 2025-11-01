const Expense = require('../models/Expense');
const Category = require('../models/Category');
const { CustomError, asyncHandler } = require('../middleware/errorHandler');
const Papa = require('papaparse');
const fs = require('fs').promises;
const axios = require('axios');

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

// Auto-categorization function
const categorizeBankTransaction = (description, merchant, categories) => {
  const desc = description.toLowerCase();
  const merch = merchant ? merchant.toLowerCase() : '';
  
  // Define categorization rules
  const rules = [
    { keywords: ['salary', 'wage', 'payroll', 'income'], type: 'income', category: 'Salary' },
    { keywords: ['freelance', 'consulting', 'contract'], type: 'income', category: 'Freelance' },
    { keywords: ['cashback', 'reward', 'refund'], type: 'income', category: 'Rewards' },
    { keywords: ['grocery', 'supermarket', 'walmart', 'target', 'food'], type: 'expense', category: 'Food & Dining' },
    { keywords: ['restaurant', 'cafe', 'starbucks', 'mcdonald', 'pizza'], type: 'expense', category: 'Food & Dining' },
    { keywords: ['gas', 'fuel', 'shell', 'exxon', 'bp'], type: 'expense', category: 'Transportation' },
    { keywords: ['electric', 'power', 'utility', 'water', 'internet', 'phone'], type: 'expense', category: 'Utilities' },
    { keywords: ['rent', 'mortgage', 'housing'], type: 'expense', category: 'Housing' },
    { keywords: ['insurance', 'health', 'car insurance'], type: 'expense', category: 'Insurance' },
    { keywords: ['netflix', 'spotify', 'subscription', 'entertainment'], type: 'expense', category: 'Entertainment' },
    { keywords: ['amazon', 'shopping', 'purchase', 'store'], type: 'expense', category: 'Shopping' },
    { keywords: ['course', 'education', 'tuition', 'book'], type: 'expense', category: 'Education' }
  ];
  
  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (desc.includes(keyword) || merch.includes(keyword)) {
        const category = categories.find(c => c.name === rule.category);
        return {
          type: rule.type,
          category: category ? category._id : null,
          confidence: 'high'
        };
      }
    }
  }
  
  // Default categorization
  return {
    type: 'expense',
    category: null,
    confidence: 'low'
  };
};

// @desc    Import expenses from bank
// @route   POST /api/import/expenses/bank
// @access  Private
exports.importExpensesFromBank = asyncHandler(async (req, res) => {
  const { bankUserId, startDate, endDate } = req.body;
  
  if (!bankUserId) {
    throw new CustomError('Bank user ID is required', 400);
  }
  
  try {
    // Fetch transactions from bank simulation server
    const bankServerUrl = process.env.BANK_SERVER_URL || 'http://localhost:3001';
    const bankResponse = await axios.get(`${bankServerUrl}/transactions`, {
      params: {
        userId: bankUserId,
        _sort: 'date',
        _order: 'desc'
      }
    });
    
    let bankTransactions = bankResponse.data;
    
    // Filter by date range if provided
    if (startDate && endDate) {
      bankTransactions = bankTransactions.filter(t => 
        t.date >= startDate && t.date <= endDate
      );
    }
    
    // Get all categories for this user
    const categories = await Category.find({
      $or: [
        { owner: 'system', isActive: true },
        { owner: 'user', userId: req.user.id, isActive: true },
      ],
    });
    
    // Get existing expenses to prevent duplicates
    const existingExpenses = await Expense.find({
      userId: req.user.id,
      bankReference: { $exists: true }
    });
    
    const existingReferences = new Set(existingExpenses.map(e => e.bankReference));
    
    const imported = [];
    const failed = [];
    const needsCategorization = [];
    
    for (const bankTxn of bankTransactions) {
      try {
        // Skip if already imported (duplicate prevention)
        if (existingReferences.has(bankTxn.reference)) {
          continue;
        }
        
        // Auto-categorize transaction
        const categorization = categorizeBankTransaction(
          bankTxn.description, 
          bankTxn.merchant, 
          categories
        );
        
        const expenseData = {
          userId: req.user.id,
          type: bankTxn.amount > 0 ? 'income' : 'expense',
          amount: Math.abs(bankTxn.amount),
          description: bankTxn.description,
          date: new Date(bankTxn.date),
          merchant: bankTxn.merchant || '',
          notes: `Imported from bank - ${bankTxn.bankName || 'Demo Bank'}`,
          bankReference: bankTxn.reference,
          source: 'bank_import'
        };
        
        // If we have a category with high confidence, add it
        if (categorization.category && categorization.confidence === 'high') {
          expenseData.category = categorization.category;
          
          const expense = new Expense(expenseData);
          await expense.save();
          imported.push(expense);
        } else {
          // Add to needs categorization list
          needsCategorization.push({
            ...expenseData,
            suggestedCategory: categorization.category,
            confidence: categorization.confidence
          });
        }
        
      } catch (error) {
        failed.push({ 
          transaction: bankTxn, 
          reason: error.message 
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Bank import completed`,
      data: {
        imported: imported.length,
        needsCategorization: needsCategorization.length,
        failed: failed.length,
        importedTransactions: imported,
        transactionsNeedingCategorization: needsCategorization,
        failedTransactions: failed,
      },
    });
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new CustomError('Bank server is not available. Please start the bank simulation server.', 503);
    }
    throw error;
  }
});

// @desc    Categorize pending bank transactions
// @route   POST /api/import/expenses/categorize
// @access  Private
exports.categorizePendingTransactions = asyncHandler(async (req, res) => {
  const { transactions } = req.body;
  
  if (!transactions || !Array.isArray(transactions)) {
    throw new CustomError('Transactions array is required', 400);
  }
  
  const imported = [];
  const failed = [];
  
  for (const txnData of transactions) {
    try {
      const expense = new Expense({
        ...txnData,
        userId: req.user.id
      });
      await expense.save();
      imported.push(expense);
    } catch (error) {
      failed.push({ 
        transaction: txnData, 
        reason: error.message 
      });
    }
  }
  
  res.status(200).json({
    success: true,
    message: `Categorized ${imported.length} transactions`,
    data: {
      imported: imported.length,
      failed: failed.length,
      importedTransactions: imported,
      failedTransactions: failed,
    },
  });
});

module.exports = exports;
