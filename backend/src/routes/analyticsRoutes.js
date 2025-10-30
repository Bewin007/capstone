const express = require('express');
const {
  getOverview,
  getSpendingTrends,
  getCategoryBreakdown,
  getIncomeExpenseComparison,
  getMonthlyComparison,
  getTopMerchants,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/overview', getOverview);
router.get('/trends', getSpendingTrends);
router.get('/categories', getCategoryBreakdown);
router.get('/comparison', getIncomeExpenseComparison);
router.get('/monthly-comparison', getMonthlyComparison);
router.get('/top-merchants', getTopMerchants);

module.exports = router;
