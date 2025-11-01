const BankAccount = require('../models/BankAccount');
const { CustomError, asyncHandler } = require('../middleware/errorHandler');
const axios = require('axios');

// @desc    Get all bank accounts for user
// @route   GET /api/bank-accounts
// @access  Private
exports.getBankAccounts = asyncHandler(async (req, res) => {
  const bankAccounts = await BankAccount.find({ 
    userId: req.user.id,
    isActive: true 
  }).sort('-createdAt');

  res.status(200).json({
    success: true,
    data: bankAccounts,
  });
});

// @desc    Add new bank account
// @route   POST /api/bank-accounts
// @access  Private
exports.addBankAccount = asyncHandler(async (req, res) => {
  const { bankName, accountName, accountNumber, accountType, bankUserId } = req.body;

  if (!bankName || !accountName || !accountNumber || !accountType || !bankUserId) {
    throw new CustomError('All fields are required', 400);
  }

  // Check if account already exists for this user
  const existingAccount = await BankAccount.findOne({
    userId: req.user.id,
    bankUserId: bankUserId,
    isActive: true,
  });

  if (existingAccount) {
    throw new CustomError('This bank account is already connected', 400);
  }

  try {
    // Verify bank account exists in the bank server
    const bankServerUrl = process.env.BANK_SERVER_URL || 'http://localhost:3001';
    const bankResponse = await axios.get(`${bankServerUrl}/users/${bankUserId}`);
    const bankUser = bankResponse.data;

    if (!bankUser) {
      throw new CustomError('Bank account not found. Please check your credentials.', 404);
    }

    // Create bank account record
    const bankAccount = await BankAccount.create({
      userId: req.user.id,
      bankName,
      accountName,
      accountNumber,
      accountType,
      bankUserId,
      balance: bankUser.balance || 0,
      lastSyncDate: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Bank account connected successfully',
      data: bankAccount,
    });

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new CustomError('Bank server is not available. Please try again later.', 503);
    }
    if (error.response && error.response.status === 404) {
      throw new CustomError('Bank account not found. Please check your credentials.', 404);
    }
    throw error;
  }
});

// @desc    Update bank account
// @route   PUT /api/bank-accounts/:id
// @access  Private
exports.updateBankAccount = asyncHandler(async (req, res) => {
  const { bankName, accountName, accountType } = req.body;

  const bankAccount = await BankAccount.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!bankAccount) {
    throw new CustomError('Bank account not found', 404);
  }

  // Update fields
  if (bankName) bankAccount.bankName = bankName;
  if (accountName) bankAccount.accountName = accountName;
  if (accountType) bankAccount.accountType = accountType;

  await bankAccount.save();

  res.status(200).json({
    success: true,
    message: 'Bank account updated successfully',
    data: bankAccount,
  });
});

// @desc    Delete bank account
// @route   DELETE /api/bank-accounts/:id
// @access  Private
exports.deleteBankAccount = asyncHandler(async (req, res) => {
  const bankAccount = await BankAccount.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!bankAccount) {
    throw new CustomError('Bank account not found', 404);
  }

  // Soft delete
  bankAccount.isActive = false;
  bankAccount.connectionStatus = 'disconnected';
  await bankAccount.save();

  res.status(200).json({
    success: true,
    message: 'Bank account disconnected successfully',
  });
});

// @desc    Sync bank account balance
// @route   POST /api/bank-accounts/:id/sync
// @access  Private
exports.syncBankAccount = asyncHandler(async (req, res) => {
  const bankAccount = await BankAccount.findOne({
    _id: req.params.id,
    userId: req.user.id,
    isActive: true,
  });

  if (!bankAccount) {
    throw new CustomError('Bank account not found', 404);
  }

  try {
    // Fetch updated balance from bank server
    const bankResponse = await axios.get(`http://localhost:3001/users/${bankAccount.bankUserId}`);
    const bankUser = bankResponse.data;

    if (!bankUser) {
      throw new CustomError('Unable to connect to bank. Account may be inactive.', 400);
    }

    // Update balance and sync date
    bankAccount.balance = bankUser.balance || 0;
    bankAccount.lastSyncDate = new Date();
    bankAccount.connectionStatus = 'connected';
    await bankAccount.save();

    res.status(200).json({
      success: true,
      message: 'Bank account synced successfully',
      data: bankAccount,
    });

  } catch (error) {
    // Update connection status on error
    bankAccount.connectionStatus = 'error';
    await bankAccount.save();

    if (error.code === 'ECONNREFUSED') {
      throw new CustomError('Bank server is not available. Please try again later.', 503);
    }
    throw error;
  }
});

// @desc    Get available banks for connection
// @route   GET /api/bank-accounts/available-banks
// @access  Private
exports.getAvailableBanks = asyncHandler(async (req, res) => {
  try {
    // Fetch available users from bank server
    const bankResponse = await axios.get('http://localhost:3001/users');
    const bankUsers = bankResponse.data;

    // Filter out already connected accounts
    const connectedAccounts = await BankAccount.find({ 
      userId: req.user.id,
      isActive: true 
    }).select('bankUserId');
    
    const connectedBankUserIds = connectedAccounts.map(acc => acc.bankUserId);
    
    const availableBanks = bankUsers
      .filter(user => !connectedBankUserIds.includes(user.id))
      .map(user => ({
        bankUserId: user.id,
        accountNumber: user.accountNumber,
        accountHolder: user.name,
        bankName: user.bankName || 'Demo Bank',
        balance: user.balance,
      }));

    res.status(200).json({
      success: true,
      data: availableBanks,
    });

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new CustomError('Bank server is not available. Please try again later.', 503);
    }
    throw error;
  }
});

module.exports = exports;