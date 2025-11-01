const User = require('../models/User');
const { CustomError, asyncHandler } = require('../middleware/errorHandler');
const { generateToken } = require('../utils/token');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, phone, currency, timezone } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new CustomError('User already exists with this email', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    currency,
    timezone,
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        timezone: user.timezone,
        createdAt: user.createdAt,
      },
      token,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new CustomError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new CustomError('Invalid email or password', 401);
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        timezone: user.timezone,
        settings: user.settings,
      },
      token,
    },
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, currency, timezone, settings } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (currency) updateData.currency = currency;
  if (timezone) updateData.timezone = timezone;
  if (settings) updateData.settings = settings;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new CustomError('Please provide current and new password', 400);
  }

  const user = await User.findById(req.user.id).select('+password');

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new CustomError('Current password is incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

// In-memory store for OTPs (in production, use Redis or database)
const otpStore = new Map();

// @desc    Request password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    throw new CustomError('Please provide an email address', 400);
  }
  
  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError('No user found with this email address', 404);
  }
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Store OTP with expiration (5 minutes)
  otpStore.set(resetToken, {
    email: user.email,
    otp: otp,
    userId: user._id,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    verified: false
  });
  
  // In a real application, you would send this OTP via email
  // For simulation, we'll return the OTP and reset token
  res.status(200).json({
    success: true,
    message: 'Password reset OTP generated successfully',
    data: {
      resetToken,
      otp, // In production, this would be sent via email
      expiresIn: 300, // 5 minutes in seconds
    }
  });
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = asyncHandler(async (req, res) => {
  const { resetToken, otp } = req.body;
  
  if (!resetToken || !otp) {
    throw new CustomError('Please provide reset token and OTP', 400);
  }
  
  // Check if reset token exists
  const resetData = otpStore.get(resetToken);
  if (!resetData) {
    throw new CustomError('Invalid or expired reset token', 400);
  }
  
  // Check if OTP has expired
  if (Date.now() > resetData.expiresAt) {
    otpStore.delete(resetToken);
    throw new CustomError('OTP has expired. Please request a new one.', 400);
  }
  
  // Check if OTP matches
  if (resetData.otp !== otp) {
    throw new CustomError('Invalid OTP. Please check and try again.', 400);
  }
  
  // Mark as verified
  resetData.verified = true;
  otpStore.set(resetToken, resetData);
  
  res.status(200).json({
    success: true,
    message: 'OTP verified successfully. You can now reset your password.',
    data: {
      resetToken,
      verified: true
    }
  });
});

// @desc    Reset password with verified token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  
  if (!resetToken || !newPassword) {
    throw new CustomError('Please provide reset token and new password', 400);
  }
  
  if (newPassword.length < 6) {
    throw new CustomError('Password must be at least 6 characters long', 400);
  }
  
  // Check if reset token exists and is verified
  const resetData = otpStore.get(resetToken);
  if (!resetData) {
    throw new CustomError('Invalid or expired reset token', 400);
  }
  
  if (!resetData.verified) {
    throw new CustomError('OTP not verified. Please verify OTP first.', 400);
  }
  
  // Check if token has expired
  if (Date.now() > resetData.expiresAt) {
    otpStore.delete(resetToken);
    throw new CustomError('Reset token has expired. Please request a new one.', 400);
  }
  
  // Find user and update password
  const user = await User.findById(resetData.userId);
  if (!user) {
    throw new CustomError('User not found', 404);
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  // Clean up OTP store
  otpStore.delete(resetToken);
  
  res.status(200).json({
    success: true,
    message: 'Password reset successfully. You can now login with your new password.',
  });
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = asyncHandler(async (req, res) => {
  const { resetToken } = req.body;
  
  if (!resetToken) {
    throw new CustomError('Please provide reset token', 400);
  }
  
  // Check if reset token exists
  const resetData = otpStore.get(resetToken);
  if (!resetData) {
    throw new CustomError('Invalid reset token', 400);
  }
  
  // Generate new OTP
  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Update stored data
  resetData.otp = newOtp;
  resetData.expiresAt = Date.now() + 5 * 60 * 1000; // Reset expiration to 5 minutes
  resetData.verified = false; // Reset verification status
  otpStore.set(resetToken, resetData);
  
  res.status(200).json({
    success: true,
    message: 'New OTP generated successfully',
    data: {
      otp: newOtp, // In production, this would be sent via email
      expiresIn: 300, // 5 minutes in seconds
    }
  });
});
