# Wealthwise - Complete Setup Guide

## Project Overview

Wealthwise is a comprehensive financial management application with the following features:

### Core Features
- **User Management**: Registration, authentication (JWT), profile management
- **Expense Tracking**: Income/expense tracking with categorization
- **Budget Management**: Set recurring budgets with alerts
- **Financial Goals**: Track savings goals with milestones
- **Bank Statement Import**: CSV/PDF upload with AI categorization (simulated)
- **Analytics & Reports**: Financial insights and spending trends
- **Calendar View**: Financial planning with calendar visualization
- **Recurring Transactions**: Support for subscriptions and regular expenses

## Project Structure

```
capstone/
├── backend/                    # Express.js backend (JavaScript)
│   ├── src/
│   │   ├── config/            # Database & app configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Auth & error handling
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── scripts/           # Seed scripts
│   │   └── index.js           # Main server file
│   ├── uploads/               # File uploads
│   └── package.json
│
├── frontend/                   # React frontend (TypeScript + TSX)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── context/           # React context
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   └── package.json
│
├── categorization-service/    # AI categorization service (JavaScript)
│   ├── src/
│   │   └── index.js           # Categorization logic
│   └── package.json
│
├── docker-compose.yml         # Docker configuration
├── mongo-init.js              # MongoDB initialization
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- npm or yarn

### Step 1: Clone and Install

```bash
# Navigate to project directory
cd /home/bewin/infy/capstone

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (after React creation completes)
cd ../frontend
npm install

# Install categorization service dependencies
cd ../categorization-service
npm install
```

### Step 2: Environment Configuration

Create `.env` files in each directory:

**backend/.env**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://admin:admin123@localhost:27017/wealthwise?authSource=admin
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CATEGORIZATION_SERVICE_URL=http://localhost:5001/api
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CATEGORIZATION_SERVICE_URL=http://localhost:5001/api
```

**categorization-service/.env**
```
PORT=5001
NODE_ENV=development
```

### Step 3: Start MongoDB

```bash
# Start MongoDB with Docker
docker-compose up mongodb -d

# Verify MongoDB is running
docker ps
```

### Step 4: Seed Database

```bash
cd backend
npm run seed
```

This creates:
- System categories (Food, Transportation, Shopping, etc.)
- Demo user account (email: demo@wealthwise.com, password: demo123)
- Sample expenses, budgets, and goals

### Step 5: Start Services

#### Option A: Run services individually (Development)

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Categorization Service
cd categorization-service
npm run dev

# Terminal 3: Frontend
cd frontend
npm start
```

#### Option B: Run with Docker Compose (Production-like)

```bash
docker-compose up
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create custom category
- `GET /api/categories/:id` - Get single category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Expenses
- `GET /api/expenses` - Get all expenses (with filters)
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get single expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats/summary` - Get expense summary

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/:id` - Get single budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/:id/performance` - Get budget performance
- `POST /api/budgets/renew-recurring` - Renew recurring budgets

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `GET /api/goals/:id` - Get single goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/:id/contribute` - Add contribution
- `GET /api/goals/:id/progress` - Get goal progress

### Categorization Service
- `POST /api/categorize` - Categorize single transaction
- `POST /api/categorize/batch` - Batch categorize transactions

## Database Models

### User
- name, email, password (hashed)
- phone, avatar, currency, timezone
- settings (notifications, theme)

### Category
- name, icon, color, type (income/expense)
- owner (system/user), parentCategory
- isActive

### Expense
- userId, type (income/expense), amount
- description, category, date, merchant
- isRecurring, recurringConfig
- source (manual/imported/recurring)
- tags, notes, attachments

### Budget
- userId, name, category
- targetAmount, spentAmount
- period (daily/weekly/monthly/yearly)
- startDate, endDate
- isRecurring, recurringConfig
- alertThreshold, status

### Goal
- userId, name, description, type
- targetAmount, currentAmount
- startDate, targetDate
- status, priority, icon, color
- milestones, contributions

### BankImport
- userId, filename, fileType
- status, transactions
- summary (totalIncome, totalExpense)

### Notification
- userId, type, title, message
- priority, isRead, relatedData

## Testing the Application

### 1. Test Authentication
```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@wealthwise.com",
    "password": "demo123"
  }'
```

### 2. Test Expenses (use token from login)
```bash
curl -X GET http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Test Categorization Service
```bash
curl -X POST http://localhost:5001/api/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Starbucks Coffee",
    "merchant": "Starbucks",
    "amount": 5.50
  }'
```

## Frontend Development

The frontend will be built with:
- **React** with TypeScript
- **React Router** for navigation
- **Bootstrap** for UI components
- **Axios** for API calls
- **Context API** for state management

### Key Pages
1. Login/Signup
2. Dashboard (overview, analytics)
3. Expenses (list, add, edit)
4. Budgets (list, create, track)
5. Goals (list, track progress)
6. Categories (manage custom categories)
7. Reports & Analytics
8. Calendar View
9. Profile & Settings

## Next Steps

1. ✅ Backend API completed
2. ✅ Categorization service completed
3. ⏳ Frontend React app being created
4. 🔜 Build frontend components
5. 🔜 Connect frontend to backend
6. 🔜 Add bank statement import feature
7. 🔜 Add reports and analytics
8. 🔜 Add calendar view
9. 🔜 Add notifications

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB container is running
docker ps

# View MongoDB logs
docker logs wealthwise-mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Backend Issues
```bash
# Check backend logs
cd backend
npm run dev

# Verify environment variables
cat .env
```

### Port Conflicts
- Backend: 5000
- Frontend: 3000
- Categorization Service: 5001
- MongoDB: 27017

If ports are in use, update .env files and docker-compose.yml accordingly.

## Demo Account

**Email**: demo@wealthwise.com
**Password**: demo123

This account comes pre-loaded with sample data including:
- 20 system categories
- Sample income and expenses
- Active budgets
- Financial goals with progress

## Contributing

This is a capstone project. For questions or issues, please refer to the project requirements in CLAUDE.md.
