const express = require('express');
const {
  exportExpenses,
  exportBudgets,
  exportGoals,
  exportExpensesToExcel,
  exportExpensesToPDF,
  exportBudgetsToExcel,
  exportGoalsToExcel,
} = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/expenses', exportExpenses);
router.get('/expenses/excel', exportExpensesToExcel);
router.get('/expenses/pdf', exportExpensesToPDF);
router.get('/budgets', exportBudgets);
router.get('/budgets/excel', exportBudgetsToExcel);
router.get('/goals', exportGoals);
router.get('/goals/excel', exportGoalsToExcel);

module.exports = router;
