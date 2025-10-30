const express = require('express');
const {
  exportExpenses,
  exportBudgets,
  exportGoals,
} = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/expenses', exportExpenses);
router.get('/budgets', exportBudgets);
router.get('/goals', exportGoals);

module.exports = router;
