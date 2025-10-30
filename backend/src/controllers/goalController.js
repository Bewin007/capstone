const Goal = require('../models/Goal');
const Expense = require('../models/Expense');
const { CustomError, asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
exports.getGoals = asyncHandler(async (req, res) => {
  const { status, type } = req.query;

  const filter = { userId: req.user.id };
  if (status) filter.status = status;
  if (type) filter.type = type;

  const goals = await Goal.find(filter)
    .populate('linkedCategory', 'name icon color')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: goals.length,
    data: goals,
  });
});

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
exports.getGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id).populate('linkedCategory', 'name icon color');

  if (!goal) {
    throw new CustomError('Goal not found', 404);
  }

  if (goal.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized to access this goal', 403);
  }

  res.status(200).json({
    success: true,
    data: goal,
  });
});

// @desc    Create new goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    type,
    targetAmount,
    currentAmount,
    targetDate,
    priority,
    linkedCategory,
    icon,
    color,
    notes,
  } = req.body;

  if (!name || !type || !targetAmount || !targetDate) {
    throw new CustomError('Please provide all required fields', 400);
  }

  if (targetAmount <= 0) {
    throw new CustomError('Target amount must be positive', 400);
  }

  const target = new Date(targetDate);
  if (target <= new Date()) {
    throw new CustomError('Target date must be in the future', 400);
  }

  const goal = await Goal.create({
    userId: req.user.id,
    name: name.trim(),
    description: description?.trim(),
    type,
    targetAmount,
    currentAmount: currentAmount || 0,
    targetDate: target,
    priority: priority || 'medium',
    linkedCategory,
    icon: icon || '🎯',
    color: color || '#007bff',
    notes: notes?.trim(),
  });

  const populatedGoal = await Goal.findById(goal._id).populate('linkedCategory', 'name icon color');

  res.status(201).json({
    success: true,
    data: populatedGoal,
  });
});

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = asyncHandler(async (req, res) => {
  let goal = await Goal.findById(req.params.id);

  if (!goal) {
    throw new CustomError('Goal not found', 404);
  }

  if (goal.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized to update this goal', 403);
  }

  const {
    name,
    description,
    targetAmount,
    currentAmount,
    targetDate,
    status,
    priority,
    linkedCategory,
    icon,
    color,
    notes,
  } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description?.trim();
  if (targetAmount !== undefined) {
    if (targetAmount <= 0) {
      throw new CustomError('Target amount must be positive', 400);
    }
    updateData.targetAmount = targetAmount;
  }
  if (currentAmount !== undefined) updateData.currentAmount = currentAmount;
  if (targetDate !== undefined) updateData.targetDate = new Date(targetDate);
  if (status !== undefined) updateData.status = status;
  if (priority !== undefined) updateData.priority = priority;
  if (linkedCategory !== undefined) updateData.linkedCategory = linkedCategory;
  if (icon !== undefined) updateData.icon = icon;
  if (color !== undefined) updateData.color = color;
  if (notes !== undefined) updateData.notes = notes?.trim();

  // Auto-complete if target reached
  if (currentAmount && currentAmount >= (targetAmount || goal.targetAmount)) {
    updateData.status = 'completed';
  }

  goal = await Goal.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate('linkedCategory', 'name icon color');

  res.status(200).json({
    success: true,
    data: goal,
  });
});

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    throw new CustomError('Goal not found', 404);
  }

  if (goal.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized to delete this goal', 403);
  }

  await goal.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Goal deleted successfully',
  });
});

// @desc    Add contribution to goal
// @route   POST /api/goals/:id/contribute
// @access  Private
exports.addContribution = asyncHandler(async (req, res) => {
  const { amount, note, createExpense } = req.body;

  if (!amount || amount <= 0) {
    throw new CustomError('Please provide a valid amount', 400);
  }

  const goal = await Goal.findById(req.params.id).populate('linkedCategory', 'name icon color');

  if (!goal) {
    throw new CustomError('Goal not found', 404);
  }

  if (goal.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized to update this goal', 403);
  }

  let expenseId = null;

  // Create an expense transaction to track the money going toward the goal
  if (createExpense !== false) {
    const expense = await Expense.create({
      userId: req.user.id,
      type: 'expense',
      amount,
      description: `Contribution to goal: ${goal.name}`,
      category: goal.linkedCategory || null,
      date: new Date(),
      notes: note?.trim(),
      source: 'goal_contribution',
    });
    expenseId = expense._id;
  }

  // Add contribution
  goal.contributions.push({
    amount,
    note: note?.trim(),
    expenseId,
    date: new Date(),
  });

  // Update current amount
  goal.currentAmount += amount;

  // Check if goal is completed
  if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
    goal.status = 'completed';
  }

  // Check milestones
  goal.milestones.forEach(milestone => {
    if (!milestone.isCompleted && goal.currentAmount >= milestone.amount) {
      milestone.isCompleted = true;
      milestone.completedAt = new Date();
    }
  });

  await goal.save();

  res.status(200).json({
    success: true,
    data: goal,
  });
});

// @desc    Get goal progress
// @route   GET /api/goals/:id/progress
// @access  Private
exports.getGoalProgress = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id).populate('linkedCategory', 'name icon color');

  if (!goal) {
    throw new CustomError('Goal not found', 404);
  }

  if (goal.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized to access this goal', 403);
  }

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;

  const now = new Date();
  const daysRemaining = Math.ceil((goal.targetDate - now) / (1000 * 60 * 60 * 24));
  const dailyTargetToMeet = remaining > 0 && daysRemaining > 0 ? remaining / daysRemaining : 0;

  res.status(200).json({
    success: true,
    data: {
      goal,
      progress: {
        percentage: Math.min(progress, 100).toFixed(2),
        currentAmount: goal.currentAmount,
        targetAmount: goal.targetAmount,
        remaining,
        daysRemaining,
        dailyTargetToMeet: dailyTargetToMeet.toFixed(2),
      },
      milestones: goal.milestones,
      recentContributions: goal.contributions.slice(-10).reverse(),
    },
  });
});

module.exports = exports;
