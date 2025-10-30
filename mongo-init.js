// MongoDB initialization script
db = db.getSiblingDB('wealthwise');

// Create collections
db.createCollection('users');
db.createCollection('categories');
db.createCollection('expenses');
db.createCollection('budgets');
db.createCollection('goals');
db.createCollection('bankimports');
db.createCollection('notifications');

print('Database initialized successfully');
