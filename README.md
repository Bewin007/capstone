# Wealthwise - Financial Management Application

A comprehensive financial management application with expense tracking, budget management, financial goals, and bank statement import capabilities.

## Features

- **User Management**: Registration, authentication, profile management
- **Expense Tracking**: Track income and expenses with categorization
- **Budget Management**: Set budgets for categories with recurring budget support
- **Bank Statement Import**: Upload CSV/PDF bank statements with AI-based categorization
- **Financial Goals**: Set and track savings and financial goals
- **Calendar View**: Plan finances with calendar visualization
- **Reporting & Analytics**: Custom reports, spending trends, and data export
- **Notifications**: Budget alerts, goal achievements, and reminders
- **Recurring Transactions**: Support for subscriptions, rent, and regular expenses

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript, MongoDB
- **Frontend**: React, TypeScript, Bootstrap
- **Authentication**: JWT
- **Database**: MongoDB (Docker)
- **File Parsing**: papaparse, pdf-parse

## Project Structure

```
capstone/
├── backend/              # Express.js backend API
├── frontend/             # React frontend application
├── categorization-service/  # Simulated AI categorization service
├── docker-compose.yml    # Docker configuration
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository
2. Start MongoDB with Docker:
   ```bash
   docker-compose up mongodb -d
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

4. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

5. Install categorization service dependencies:
   ```bash
   cd categorization-service
   npm install
   ```

### Running the Application

#### Development Mode

1. Start MongoDB:
   ```bash
   docker-compose up mongodb -d
   ```

2. Start backend:
   ```bash
   cd backend
   npm run dev
   ```

3. Start categorization service:
   ```bash
   cd categorization-service
   npm run dev
   ```

4. Start frontend:
   ```bash
   cd frontend
   npm start
   ```

#### Using Docker Compose

```bash
docker-compose up
```

This will start all services (MongoDB, Backend, Categorization Service, Frontend)

### Environment Variables

Create `.env` files in respective directories:

**Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb://admin:admin123@localhost:27017/wealthwise?authSource=admin
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CATEGORIZATION_SERVICE_URL=http://localhost:5001/api
```

**Categorization Service (.env)**
```
PORT=5001
```

### Data Seeding

To seed the database with sample data:

```bash
cd backend
npm run seed
```

## API Documentation

API documentation will be available at `http://localhost:5000/api-docs` when the backend is running.

## License

MIT
