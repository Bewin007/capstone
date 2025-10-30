const Category = require('../models/Category');
const { CustomError, asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all categories (system + user's custom)
// @route   GET /api/categories
// @access  Private
exports.getCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;

  const filter = {
    $or: [
      { owner: 'system', isActive: true },
      { owner: 'user', userId: req.user.id, isActive: true },
    ],
  };

  if (type) {
    filter.type = type;
  }

  const categories = await Category.find(filter)
    .populate('parentCategory', 'name icon')
    .sort({ owner: 1, name: 1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
exports.getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate('parentCategory', 'name icon');

  if (!category) {
    throw new CustomError('Category not found', 404);
  }

  // Check if user owns the category or it's a system category
  if (category.owner === 'user' && category.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized to access this category', 403);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Create custom category
// @route   POST /api/categories
// @access  Private
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, icon, color, type, parentCategory } = req.body;

  if (!name) {
    throw new CustomError('Please provide a category name', 400);
  }

  // Check for duplicate category name for this user
  const existingCategory = await Category.findOne({
    name: name.trim(),
    userId: req.user.id,
    owner: 'user',
    isActive: true,
  });

  if (existingCategory) {
    throw new CustomError('You already have a category with this name', 400);
  }

  // Validate parent category if provided
  if (parentCategory) {
    const parent = await Category.findById(parentCategory);
    if (!parent) {
      throw new CustomError('Parent category not found', 404);
    }
  }

  const category = await Category.create({
    name: name.trim(),
    icon: icon || '📁',
    color: color || '#6c757d',
    type: type || 'expense',
    parentCategory: parentCategory || null,
    owner: 'user',
    userId: req.user.id,
  });

  res.status(201).json({
    success: true,
    data: category,
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    throw new CustomError('Category not found', 404);
  }

  // Only allow updating user's own categories
  if (category.owner === 'system') {
    throw new CustomError('Cannot modify system categories', 403);
  }

  if (category.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized to update this category', 403);
  }

  const { name, icon, color, type, parentCategory, isActive } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (icon !== undefined) updateData.icon = icon;
  if (color !== undefined) updateData.color = color;
  if (type !== undefined) updateData.type = type;
  if (parentCategory !== undefined) updateData.parentCategory = parentCategory;
  if (isActive !== undefined) updateData.isActive = isActive;

  category = await Category.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Delete category (soft delete)
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new CustomError('Category not found', 404);
  }

  // Only allow deleting user's own categories
  if (category.owner === 'system') {
    throw new CustomError('Cannot delete system categories', 403);
  }

  if (category.userId.toString() !== req.user.id) {
    throw new CustomError('Not authorized to delete this category', 403);
  }

  // Soft delete - mark as inactive
  category.isActive = false;
  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});
