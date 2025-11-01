const jsonServer = require('json-server');
const path = require('path');
require('dotenv').config();

// Load environment variables with defaults
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const DB_FILE = process.env.DB_FILE || 'db.json';
const API_PREFIX = process.env.API_PREFIX || '';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Create server
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, DB_FILE));
const middlewares = jsonServer.defaults({
  static: './public'
});

// Configure CORS
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Add custom middleware
server.use(middlewares);

// Add body parser
server.use(jsonServer.bodyParser);

// Custom routes and middleware
server.use((req, res, next) => {
  // Log requests
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
server.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Bank Simulation Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Custom endpoint for user balance updates
server.post('/users/:id/update-balance', (req, res) => {
  const userId = req.params.id;
  const { balance } = req.body;
  
  const db = router.db; // Get the database
  const user = db.get('users').find({ id: userId }).value();
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Update balance
  db.get('users')
    .find({ id: userId })
    .assign({ balance: parseFloat(balance) })
    .write();
  
  res.json({
    success: true,
    message: 'Balance updated successfully',
    user: db.get('users').find({ id: userId }).value()
  });
});

// Use API prefix if specified
if (API_PREFIX) {
  server.use(API_PREFIX, router);
} else {
  server.use(router);
}

// Start server
server.listen(PORT, HOST, () => {
  console.log('🏦 Bank Simulation Server is running!');
  console.log(`📍 Server: http://${HOST}:${PORT}`);
  console.log(`💾 Database: ${DB_FILE}`);
  console.log(`🔗 API Prefix: ${API_PREFIX || 'None'}`);
  console.log(`🌐 CORS Origin: ${CORS_ORIGIN}`);
  console.log('📋 Available endpoints:');
  console.log(`   GET  /users - List all bank users`);
  console.log(`   GET  /users/:id - Get specific user`);
  console.log(`   GET  /transactions - List all transactions`);
  console.log(`   GET  /transactions?userId=:id - Get user transactions`);
  console.log(`   POST /users/:id/update-balance - Update user balance`);
  console.log(`   GET  /health - Health check`);
  console.log('===============================================');
});