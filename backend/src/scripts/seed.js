const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Category = require('../models/Category');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

const mongoURI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/wealthwise?authSource=admin';

const systemCategories = [
  // Expense categories
  { name: 'Food & Dining', icon: '🍔', color: '#FF6B6B', type: 'expense', owner: 'system' },
  { name: 'Transportation', icon: '🚗', color: '#4ECDC4', type: 'expense', owner: 'system' },
  { name: 'Shopping', icon: '🛍️', color: '#95E1D3', type: 'expense', owner: 'system' },
  { name: 'Entertainment', icon: '🎬', color: '#F38181', type: 'expense', owner: 'system' },
  { name: 'Bills & Utilities', icon: '💡', color: '#F8B500', type: 'expense', owner: 'system' },
  { name: 'Healthcare', icon: '🏥', color: '#AA96DA', type: 'expense', owner: 'system' },
  { name: 'Education', icon: '📚', color: '#5DADE2', type: 'expense', owner: 'system' },
  { name: 'Travel', icon: '✈️', color: '#48C9B0', type: 'expense', owner: 'system' },
  { name: 'Subscriptions', icon: '📱', color: '#AF7AC5', type: 'expense', owner: 'system' },
  { name: 'Housing', icon: '🏠', color: '#EC7063', type: 'expense', owner: 'system' },
  { name: 'Personal Care', icon: '💅', color: '#F7DC6F', type: 'expense', owner: 'system' },
  { name: 'Insurance', icon: '🛡️', color: '#85C1E2', type: 'expense', owner: 'system' },
  { name: 'Gifts & Donations', icon: '🎁', color: '#F1948A', type: 'expense', owner: 'system' },
  { name: 'Miscellaneous', icon: '📦', color: '#BDC3C7', type: 'expense', owner: 'system' },

  // Income categories
  { name: 'Salary', icon: '💰', color: '#27AE60', type: 'income', owner: 'system' },
  { name: 'Freelance', icon: '💼', color: '#16A085', type: 'income', owner: 'system' },
  { name: 'Investment', icon: '📈', color: '#229954', type: 'income', owner: 'system' },
  { name: 'Business', icon: '🏢', color: '#1E8449', type: 'income', owner: 'system' },
  { name: 'Bonus', icon: '🎉', color: '#28B463', type: 'income', owner: 'system' },
  { name: 'Other Income', icon: '💵', color: '#52BE80', type: 'income', owner: 'system' },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Expense.deleteMany({});
    await Budget.deleteMany({});
    await Goal.deleteMany({});
    console.log('✓ Existing data cleared');

    // Create system categories
    console.log('Creating system categories...');
    const categories = await Category.insertMany(systemCategories);
    console.log(`✓ Created ${categories.length} system categories`);

    // Create demo user
    console.log('Creating demo user...');
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@wealthwise.com',
      password: 'demo123',
      phone: '+1234567890',
      currency: 'USD',
      timezone: 'America/New_York',
    });
    console.log('✓ Demo user created');
    console.log(`  Email: demo@wealthwise.com`);
    console.log(`  Password: demo123`);

    // Get category IDs
    const foodCategory = categories.find(c => c.name === 'Food & Dining');
    const transportCategory = categories.find(c => c.name === 'Transportation');
    const shoppingCategory = categories.find(c => c.name === 'Shopping');
    const entertainmentCategory = categories.find(c => c.name === 'Entertainment');
    const salaryCategory = categories.find(c => c.name === 'Salary');
    const freelanceCategory = categories.find(c => c.name === 'Freelance');

    // Create sample expenses
    console.log('Creating sample expenses...');
    const now = new Date();
    const expenses = [];

    // Income
    expenses.push({
      userId: demoUser._id,
      type: 'income',
      amount: 5000,
      description: 'Monthly Salary',
      category: salaryCategory._id,
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      source: 'manual',
    });

    expenses.push({
      userId: demoUser._id,
      type: 'income',
      amount: 1500,
      description: 'Freelance Project',
      category: freelanceCategory._id,
      date: new Date(now.getFullYear(), now.getMonth(), 15),
      source: 'manual',
    });

    // Expenses
    expenses.push({
      userId: demoUser._id,
      type: 'expense',
      amount: 45.99,
      description: 'Grocery Shopping',
      category: foodCategory._id,
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      merchant: 'Whole Foods',
      source: 'manual',
    });

    expenses.push({
      userId: demoUser._id,
      type: 'expense',
      amount: 25.50,
      description: 'Lunch at Restaurant',
      category: foodCategory._id,
      date: new Date(now.getFullYear(), now.getMonth(), 10),
      merchant: 'Local Restaurant',
      source: 'manual',
    });

    expenses.push({
      userId: demoUser._id,
      type: 'expense',
      amount: 60.00,
      description: 'Gas Station',
      category: transportCategory._id,
      date: new Date(now.getFullYear(), now.getMonth(), 7),
      merchant: 'Shell',
      source: 'manual',
    });

    expenses.push({
      userId: demoUser._id,
      type: 'expense',
      amount: 129.99,
      description: 'New Shoes',
      category: shoppingCategory._id,
      date: new Date(now.getFullYear(), now.getMonth(), 12),
      merchant: 'Nike Store',
      source: 'manual',
    });

    expenses.push({
      userId: demoUser._id,
      type: 'expense',
      amount: 15.99,
      description: 'Netflix Subscription',
      category: entertainmentCategory._id,
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      merchant: 'Netflix',
      source: 'manual',
      isRecurring: true,
      recurringConfig: {
        frequency: 'monthly',
        interval: 1,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      },
    });

    await Expense.insertMany(expenses);
    console.log(`✓ Created ${expenses.length} sample expenses`);

    // Create sample budgets
    console.log('Creating sample budgets...');
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const budgets = [
      {
        userId: demoUser._id,
        name: 'Monthly Food Budget',
        category: foodCategory._id,
        targetAmount: 500,
        spentAmount: 71.49,
        period: 'monthly',
        startDate: startOfMonth,
        endDate: endOfMonth,
        isRecurring: true,
        recurringConfig: {
          frequency: 'monthly',
          autoRenew: true,
        },
        alertThreshold: 80,
      },
      {
        userId: demoUser._id,
        name: 'Transportation Budget',
        category: transportCategory._id,
        targetAmount: 200,
        spentAmount: 60,
        period: 'monthly',
        startDate: startOfMonth,
        endDate: endOfMonth,
        isRecurring: true,
        recurringConfig: {
          frequency: 'monthly',
          autoRenew: true,
        },
        alertThreshold: 80,
      },
      {
        userId: demoUser._id,
        name: 'Shopping Budget',
        category: shoppingCategory._id,
        targetAmount: 300,
        spentAmount: 129.99,
        period: 'monthly',
        startDate: startOfMonth,
        endDate: endOfMonth,
        alertThreshold: 75,
      },
    ];

    await Budget.insertMany(budgets);
    console.log(`✓ Created ${budgets.length} sample budgets`);

    // Create sample goals
    console.log('Creating sample goals...');
    const goals = [
      {
        userId: demoUser._id,
        name: 'Emergency Fund',
        description: 'Save 6 months of expenses',
        type: 'emergency_fund',
        targetAmount: 15000,
        currentAmount: 3500,
        startDate: new Date(now.getFullYear(), 0, 1),
        targetDate: new Date(now.getFullYear() + 1, 11, 31),
        priority: 'high',
        icon: '🏦',
        color: '#E74C3C',
        status: 'active',
        milestones: [
          { name: '25% Complete', amount: 3750, isCompleted: false },
          { name: '50% Complete', amount: 7500, isCompleted: false },
          { name: '75% Complete', amount: 11250, isCompleted: false },
        ],
        contributions: [
          { amount: 1000, date: new Date(now.getFullYear(), 0, 15), note: 'Initial deposit' },
          { amount: 500, date: new Date(now.getFullYear(), 1, 15), note: 'Monthly savings' },
          { amount: 500, date: new Date(now.getFullYear(), 2, 15), note: 'Monthly savings' },
          { amount: 1500, date: new Date(now.getFullYear(), 3, 15), note: 'Tax refund' },
        ],
      },
      {
        userId: demoUser._id,
        name: 'Vacation to Europe',
        description: 'Summer vacation trip',
        type: 'purchase',
        targetAmount: 5000,
        currentAmount: 1200,
        startDate: new Date(now.getFullYear(), 0, 1),
        targetDate: new Date(now.getFullYear(), 6, 1),
        priority: 'medium',
        icon: '✈️',
        color: '#3498DB',
        status: 'active',
      },
      {
        userId: demoUser._id,
        name: 'New Laptop',
        description: 'MacBook Pro for work',
        type: 'purchase',
        targetAmount: 2500,
        currentAmount: 800,
        startDate: new Date(now.getFullYear(), 1, 1),
        targetDate: new Date(now.getFullYear(), 5, 30),
        priority: 'medium',
        icon: '💻',
        color: '#9B59B6',
        status: 'active',
      },
    ];

    await Goal.insertMany(goals);
    console.log(`✓ Created ${goals.length} sample goals`);

    console.log('\n========================================');
    console.log('✓ Database seeded successfully!');
    console.log('========================================');
    console.log('\nDemo Account Credentials:');
    console.log('Email: demo@wealthwise.com');
    console.log('Password: demo123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
