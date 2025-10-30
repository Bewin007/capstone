const express = require('express');
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetPerformance,
  renewRecurringBudgets,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/renew-recurring', renewRecurringBudgets);

router.route('/')
  .get(getBudgets)
  .post(createBudget);

router.route('/:id')
  .get(getBudget)
  .put(updateBudget)
  .delete(deleteBudget);

router.get('/:id/performance', getBudgetPerformance);

module.exports = router;
