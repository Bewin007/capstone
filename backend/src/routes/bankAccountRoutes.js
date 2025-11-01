const express = require('express');
const {
  getBankAccounts,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  syncBankAccount,
  getAvailableBanks,
} = require('../controllers/bankAccountController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getBankAccounts);
router.post('/', addBankAccount);
router.get('/available-banks', getAvailableBanks);
router.put('/:id', updateBankAccount);
router.delete('/:id', deleteBankAccount);
router.post('/:id/sync', syncBankAccount);

module.exports = router;