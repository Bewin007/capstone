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

  // Both (for goal contributions and savings)
  { name: 'Savings', icon: '🏦', color: '#3498DB', type: 'both', owner: 'system' },
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

    // Get all categories for easier access
    const billsCategory = categories.find(c => c.name === 'Bills & Utilities');
    const healthcareCategory = categories.find(c => c.name === 'Healthcare');
    const subscriptionsCategory = categories.find(c => c.name === 'Subscriptions');
    const housingCategory = categories.find(c => c.name === 'Housing');
    const travelCategory = categories.find(c => c.name === 'Travel');
    const bonusCategory = categories.find(c => c.name === 'Bonus');

    // Create sample expenses for the last 12 months
    console.log('Creating sample expenses for the last 12 months...');
    const now = new Date();
    const expenses = [];

    // Generate data for each of the last 12 months
    for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();

      // Monthly Salary (always on the 1st)
      expenses.push({
        userId: demoUser._id,
        type: 'income',
        amount: 5000 + Math.random() * 500, // 5000-5500
        description: 'Monthly Salary',
        category: salaryCategory._id,
        date: new Date(year, month, 1),
        source: 'manual',
        merchant: 'ABC Company',
      });

      // Occasional freelance income (50% chance each month)
      if (Math.random() > 0.5) {
        expenses.push({
          userId: demoUser._id,
          type: 'income',
          amount: 800 + Math.random() * 1200, // 800-2000
          description: 'Freelance Project',
          category: freelanceCategory._id,
          date: new Date(year, month, 10 + Math.floor(Math.random() * 10)),
          source: 'manual',
          merchant: 'Client ' + (Math.floor(Math.random() * 5) + 1),
        });
      }

      // Bonus (only in certain months)
      if (monthOffset === 11 || monthOffset === 5 || monthOffset === 0) {
        expenses.push({
          userId: demoUser._id,
          type: 'income',
          amount: 1000 + Math.random() * 2000, // 1000-3000
          description: 'Performance Bonus',
          category: bonusCategory._id,
          date: new Date(year, month, 25),
          source: 'manual',
        });
      }

      // EXPENSES - Recurring monthly expenses

      // Rent/Housing (1st of month)
      expenses.push({
        userId: demoUser._id,
        type: 'expense',
        amount: 1200,
        description: 'Monthly Rent',
        category: housingCategory._id,
        date: new Date(year, month, 1),
        merchant: 'Apartment Complex',
        source: 'manual',
      });

      // Utilities (5th of month)
      expenses.push({
        userId: demoUser._id,
        type: 'expense',
        amount: 80 + Math.random() * 40, // 80-120
        description: 'Electric Bill',
        category: billsCategory._id,
        date: new Date(year, month, 5),
        merchant: 'Power Company',
        source: 'manual',
      });

      // Internet (10th)
      expenses.push({
        userId: demoUser._id,
        type: 'expense',
        amount: 60,
        description: 'Internet Service',
        category: billsCategory._id,
        date: new Date(year, month, 10),
        merchant: 'ISP Provider',
        source: 'manual',
      });

      // Phone bill (15th)
      expenses.push({
        userId: demoUser._id,
        type: 'expense',
        amount: 55,
        description: 'Mobile Phone Bill',
        category: billsCategory._id,
        date: new Date(year, month, 15),
        merchant: 'AT&T',
        source: 'manual',
      });

      // Netflix subscription
      expenses.push({
        userId: demoUser._id,
        type: 'expense',
        amount: 15.99,
        description: 'Netflix Subscription',
        category: subscriptionsCategory._id,
        date: new Date(year, month, 1),
        merchant: 'Netflix',
        source: 'manual',
      });

      // Spotify subscription
      expenses.push({
        userId: demoUser._id,
        type: 'expense',
        amount: 9.99,
        description: 'Spotify Premium',
        category: subscriptionsCategory._id,
        date: new Date(year, month, 1),
        merchant: 'Spotify',
        source: 'manual',
      });

      // Gym membership
      expenses.push({
        userId: demoUser._id,
        type: 'expense',
        amount: 50,
        description: 'Gym Membership',
        category: healthcareCategory._id,
        date: new Date(year, month, 1),
        merchant: 'Fitness Plus',
        source: 'manual',
      });

      // Variable expenses - Food & Dining (3-5 times per month)
      const foodCount = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < foodCount; i++) {
        expenses.push({
          userId: demoUser._id,
          type: 'expense',
          amount: 20 + Math.random() * 80, // 20-100
          description: ['Grocery Shopping', 'Restaurant Dinner', 'Lunch Out', 'Coffee', 'Fast Food'][Math.floor(Math.random() * 5)],
          category: foodCategory._id,
          date: new Date(year, month, 5 + Math.floor(Math.random() * 20)),
          merchant: ['Whole Foods', 'Walmart', 'Target', 'Starbucks', 'Chipotle', 'Olive Garden'][Math.floor(Math.random() * 6)],
          source: 'manual',
        });
      }

      // Transportation (2-4 times per month)
      const transportCount = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < transportCount; i++) {
        expenses.push({
          userId: demoUser._id,
          type: 'expense',
          amount: 40 + Math.random() * 30, // 40-70
          description: 'Gas',
          category: transportCategory._id,
          date: new Date(year, month, 3 + i * 7),
          merchant: ['Shell', 'Chevron', 'BP', 'Exxon'][Math.floor(Math.random() * 4)],
          source: 'manual',
        });
      }

      // Shopping (1-3 times per month)
      const shoppingCount = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < shoppingCount; i++) {
        expenses.push({
          userId: demoUser._id,
          type: 'expense',
          amount: 30 + Math.random() * 170, // 30-200
          description: ['Clothing', 'Electronics', 'Home Goods', 'Online Shopping'][Math.floor(Math.random() * 4)],
          category: shoppingCategory._id,
          date: new Date(year, month, 8 + Math.floor(Math.random() * 15)),
          merchant: ['Amazon', 'Target', 'Best Buy', 'Nike Store', 'H&M'][Math.floor(Math.random() * 5)],
          source: 'manual',
        });
      }

      // Entertainment (1-2 times per month)
      const entertainmentCount = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < entertainmentCount; i++) {
        expenses.push({
          userId: demoUser._id,
          type: 'expense',
          amount: 15 + Math.random() * 85, // 15-100
          description: ['Movie Tickets', 'Concert', 'Video Games', 'Sports Event'][Math.floor(Math.random() * 4)],
          category: entertainmentCategory._id,
          date: new Date(year, month, 10 + Math.floor(Math.random() * 15)),
          merchant: ['AMC Theaters', 'Steam', 'Ticketmaster', 'Live Nation'][Math.floor(Math.random() * 4)],
          source: 'manual',
        });
      }

      // Healthcare (occasional)
      if (Math.random() > 0.7) {
        expenses.push({
          userId: demoUser._id,
          type: 'expense',
          amount: 50 + Math.random() * 150, // 50-200
          description: ['Doctor Visit', 'Pharmacy', 'Dental Checkup'][Math.floor(Math.random() * 3)],
          category: healthcareCategory._id,
          date: new Date(year, month, 15 + Math.floor(Math.random() * 10)),
          merchant: ['CVS Pharmacy', 'Walgreens', 'Medical Center'][Math.floor(Math.random() * 3)],
          source: 'manual',
        });
      }

      // Travel (occasional - 20% chance)
      if (Math.random() > 0.8) {
        expenses.push({
          userId: demoUser._id,
          type: 'expense',
          amount: 300 + Math.random() * 700, // 300-1000
          description: ['Weekend Trip', 'Flight Tickets', 'Hotel Booking'][Math.floor(Math.random() * 3)],
          category: travelCategory._id,
          date: new Date(year, month, 10 + Math.floor(Math.random() * 15)),
          merchant: ['Expedia', 'Hotels.com', 'Airbnb', 'United Airlines'][Math.floor(Math.random() * 4)],
          source: 'manual',
        });
      }
    }

    await Expense.insertMany(expenses);
    console.log(`✓ Created ${expenses.length} sample expenses across 12 months`);

    // Create sample budgets
    console.log('Creating sample budgets...');
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Calculate actual spent amounts for current month
    const currentMonthExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === now.getMonth() &&
             expenseDate.getFullYear() === now.getFullYear() &&
             e.type === 'expense';
    });

    const foodSpent = currentMonthExpenses
      .filter(e => e.category.toString() === foodCategory._id.toString())
      .reduce((sum, e) => sum + e.amount, 0);

    const transportSpent = currentMonthExpenses
      .filter(e => e.category.toString() === transportCategory._id.toString())
      .reduce((sum, e) => sum + e.amount, 0);

    const shoppingSpent = currentMonthExpenses
      .filter(e => e.category.toString() === shoppingCategory._id.toString())
      .reduce((sum, e) => sum + e.amount, 0);

    const entertainmentSpent = currentMonthExpenses
      .filter(e => e.category.toString() === entertainmentCategory._id.toString())
      .reduce((sum, e) => sum + e.amount, 0);

    const budgets = [
      {
        userId: demoUser._id,
        name: 'Monthly Food Budget',
        category: foodCategory._id,
        targetAmount: 500,
        spentAmount: foodSpent,
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
        targetAmount: 300,
        spentAmount: transportSpent,
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
        targetAmount: 400,
        spentAmount: shoppingSpent,
        period: 'monthly',
        startDate: startOfMonth,
        endDate: endOfMonth,
        alertThreshold: 75,
      },
      {
        userId: demoUser._id,
        name: 'Entertainment Budget',
        category: entertainmentCategory._id,
        targetAmount: 200,
        spentAmount: entertainmentSpent,
        period: 'monthly',
        startDate: startOfMonth,
        endDate: endOfMonth,
        isRecurring: true,
        recurringConfig: {
          frequency: 'monthly',
          autoRenew: true,
        },
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
