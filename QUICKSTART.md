# Wealthwise - Quick Start Guide

## Get Started in 5 Minutes

### 1. Start MongoDB
```bash
docker-compose up mongodb -d
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Create Environment File
```bash
cd backend
cp .env.example .env
```

### 4. Seed Database with Sample Data
```bash
cd backend
npm run seed
```

Expected output:
```
✓ Connected to MongoDB
✓ Existing data cleared
✓ Created 20 system categories
✓ Demo user created
  Email: demo@wealthwise.com
  Password: demo123
✓ Created 7 sample expenses
✓ Created 3 sample budgets
✓ Created 3 sample goals
✓ Database seeded successfully!
```

### 5. Start Backend Server
```bash
cd backend
npm run dev
```

Expected output:
```
✓ MongoDB connected successfully
✓ Server running on port 5000 in development mode
```

### 6. Start Categorization Service
Open a new terminal:
```bash
cd categorization-service
npm install
npm run dev
```

Expected output:
```
✓ Categorization Service running on port 5001
```

### 7. Start Frontend (After React Installation Completes)
Open a new terminal:
```bash
cd frontend
npm install
npm start
```

The app will open at http://localhost:3000

### 8. Login with Demo Account
- Email: `demo@wealthwise.com`
- Password: `demo123`

## What's Included in Demo Data

- **Categories**: 20 system categories (Food, Transport, Shopping, etc.)
- **Income**:
  - Monthly Salary: $5,000
  - Freelance Project: $1,500
- **Expenses**:
  - Groceries: $45.99
  - Restaurant: $25.50
  - Gas: $60.00
  - Shopping: $129.99
  - Netflix (recurring): $15.99
- **Budgets**:
  - Food Budget: $500/month (71.49 spent)
  - Transportation: $200/month (60 spent)
  - Shopping: $300/month (129.99 spent)
- **Goals**:
  - Emergency Fund: $15,000 target (3,500 saved)
  - Europe Vacation: $5,000 target (1,200 saved)
  - New Laptop: $2,500 target (800 saved)

## API Testing

Test the API with curl:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@wealthwise.com",
    "password": "demo123"
  }'

# Save the token from response, then:
export TOKEN="your_token_here"

# Get expenses
curl -X GET http://localhost:5000/api/expenses \
  -H "Authorization: Bearer $TOKEN"

# Get budgets
curl -X GET http://localhost:5000/api/budgets \
  -H "Authorization: Bearer $TOKEN"

# Get goals
curl -X GET http://localhost:5000/api/goals \
  -H "Authorization: Bearer $TOKEN"

# Test categorization
curl -X POST http://localhost:5001/api/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "description": "McDonald Breakfast",
    "merchant": "McDonalds",
    "amount": 8.50
  }'
```

## Troubleshooting

**MongoDB not starting?**
```bash
docker-compose down
docker-compose up mongodb -d
```

**Port already in use?**
- Backend (5000): Kill process or change PORT in .env
- Frontend (3000): CRA will offer to use another port
- Categorization (5001): Change PORT in categorization-service/.env
- MongoDB (27017): Change port in docker-compose.yml

**Seed script failing?**
Make sure MongoDB is running first:
```bash
docker ps | grep mongodb
```

## Next Steps

1. Explore the demo data in the frontend
2. Create your own expenses and budgets
3. Test the categorization service
4. Review the API documentation in SETUP_GUIDE.md
5. Check out the codebase structure

## Support

For detailed documentation, see:
- SETUP_GUIDE.md - Complete setup and API documentation
- README.md - Project overview
- CLAUDE.md - Project requirements
