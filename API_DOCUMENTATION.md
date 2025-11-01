# Wealthwise Backend API Documentation

## Overview

The Wealthwise Backend API is a RESTful API built with Node.js and Express.js for managing personal finances. It provides endpoints for user authentication, expense tracking, budget management, goal setting, and financial analytics.

**Base URL:** `http://localhost:5000`  
**API Version:** v1  
**Content-Type:** `application/json`

## Table of Contents

1. [Authentication](#authentication)
2. [Error Handling](#error-handling) 
3. [Common Response Formats](#common-response-formats)
4. [API Endpoints](#api-endpoints)
   - [Authentication Endpoints](#authentication-endpoints)
   - [Category Endpoints](#category-endpoints)
   - [Expense Endpoints](#expense-endpoints)
   - [Budget Endpoints](#budget-endpoints)
   - [Goal Endpoints](#goal-endpoints)
   - [Analytics Endpoints](#analytics-endpoints)
   - [Import/Export Endpoints](#importexport-endpoints)
   - [Notification Endpoints](#notification-endpoints)
5. [Data Models](#data-models)

---

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require an `Authorization` header with a Bearer token.

**Header Format:**
```
Authorization: Bearer <jwt_token>
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "stack": "Error stack trace (development only)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": <response_data>,
  "message": "Optional success message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [<array_of_items>],
  "pagination": {
    "page": 1,
    "pages": 5,
    "total": 50,
    "limit": 10
  }
}
```

---

## API Endpoints

### Authentication Endpoints

#### Register User
**POST** `/api/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123"
}
```

**Validation Rules:**
- `name`: Required, non-empty string
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

**Error Responses:**
- `400` - Validation errors, email already exists
- `500` - Server error

---

#### Login User
**POST** `/api/auth/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required, non-empty

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe", 
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

**Error Responses:**
- `400` - Validation errors
- `401` - Invalid credentials
- `500` - Server error

---

#### Get Current User
**GET** `/api/auth/me`

Returns current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Invalid/missing token
- `404` - User not found
- `500` - Server error

---

#### Update Profile
**PUT** `/api/auth/profile`

Updates user profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation errors, email already taken
- `401` - Invalid/missing token
- `500` - Server error

---

#### Change Password
**PUT** `/api/auth/change-password`

Changes user's password.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `400` - Current password incorrect, validation errors
- `401` - Invalid/missing token
- `500` - Server error

---

### Health Check
**GET** `/health`

Returns API health status.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Wealthwise API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Category Endpoints

All category endpoints require authentication.

#### Get Categories
**GET** `/api/categories`

Retrieves all categories for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `type` (optional): Filter by category type (`income`, `expense`, `both`)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "category_id",
      "name": "Food & Dining",
      "type": "expense",
      "icon": "🍽️",
      "color": "#FF6B6B",
      "owner": "system",
      "userId": "user_id",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### Get Single Category
**GET** `/api/categories/:id`

Retrieves a specific category by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Category ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "category_id",
    "name": "Food & Dining",
    "type": "expense",
    "icon": "🍽️",
    "color": "#FF6B6B",
    "owner": "user",
    "userId": "user_id"
  }
}
```

**Error Responses:**
- `404` - Category not found
- `401` - Unauthorized
- `500` - Server error

---

#### Create Category
**POST** `/api/categories`

Creates a new category.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Custom Category",
  "type": "expense",
  "icon": "💰",
  "color": "#4ECDC4"
}
```

**Validation Rules:**
- `name`: Required, 1-50 characters, unique per user
- `type`: Required, must be 'income', 'expense', or 'both'
- `icon`: Optional, single emoji character
- `color`: Optional, valid hex color code

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "new_category_id",
    "name": "Custom Category",
    "type": "expense",
    "icon": "💰",
    "color": "#4ECDC4",
    "owner": "user",
    "userId": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation errors, duplicate category name
- `401` - Unauthorized
- `500` - Server error

---

#### Update Category
**PUT** `/api/categories/:id`

Updates an existing category.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Category ObjectId

**Request Body:**
```json
{
  "name": "Updated Category Name",
  "icon": "🏷️",
  "color": "#FF9F43"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "category_id",
    "name": "Updated Category Name",
    "type": "expense",
    "icon": "🏷️",
    "color": "#FF9F43",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation errors, cannot update system categories
- `401` - Unauthorized
- `404` - Category not found
- `500` - Server error

---

#### Delete Category
**DELETE** `/api/categories/:id`

Deletes a category. Cannot delete system categories or categories with associated expenses.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Category ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error Responses:**
- `400` - Cannot delete system category, category has associated expenses
- `401` - Unauthorized
- `404` - Category not found
- `500` - Server error

---

### Expense Endpoints

All expense endpoints require authentication.

#### Get Expenses
**GET** `/api/expenses`

Retrieves expenses for the authenticated user with pagination and filtering.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `type` (optional): Filter by type (`income`, `expense`)
- `category` (optional): Filter by category ID
- `startDate` (optional): Filter expenses from this date (ISO string)
- `endDate` (optional): Filter expenses to this date (ISO string)
- `search` (optional): Search in description and merchant
- `sort` (optional): Sort field (default: `-date`)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "expense_id",
      "type": "expense",
      "amount": 25.50,
      "description": "Lunch at cafe",
      "category": {
        "_id": "category_id",
        "name": "Food & Dining",
        "icon": "🍽️",
        "color": "#FF6B6B"
      },
      "date": "2024-01-01T12:00:00.000Z",
      "source": "manual",
      "merchant": "Downtown Cafe",
      "notes": "Business lunch",
      "tags": ["work", "meal"],
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 5,
    "total": 100,
    "limit": 20
  }
}
```

**Error Responses:**
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

#### Get Single Expense
**GET** `/api/expenses/:id`

Retrieves a specific expense by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Expense ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "expense_id",
    "type": "expense",
    "amount": 25.50,
    "description": "Lunch at cafe",
    "category": {
      "_id": "category_id",
      "name": "Food & Dining",
      "icon": "🍽️"
    },
    "date": "2024-01-01T12:00:00.000Z",
    "source": "manual",
    "merchant": "Downtown Cafe",
    "notes": "Business lunch",
    "tags": ["work", "meal"],
    "attachments": [],
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `404` - Expense not found
- `401` - Unauthorized
- `500` - Server error

---

#### Create Expense
**POST** `/api/expenses`

Creates a new expense or income record.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "expense",
  "amount": 25.50,
  "description": "Lunch at cafe",
  "category": "category_id",
  "date": "2024-01-01T12:00:00.000Z",
  "merchant": "Downtown Cafe",
  "notes": "Business lunch",
  "tags": ["work", "meal"]
}
```

**Validation Rules:**
- `type`: Required, must be 'income' or 'expense'
- `amount`: Required, positive number
- `description`: Required, non-empty string
- `category`: Required, valid category ObjectId
- `date`: Optional, defaults to current date
- `merchant`: Optional string
- `notes`: Optional string
- `tags`: Optional array of strings

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "new_expense_id",
    "type": "expense", 
    "amount": 25.50,
    "description": "Lunch at cafe",
    "category": "category_id",
    "date": "2024-01-01T12:00:00.000Z",
    "source": "manual",
    "merchant": "Downtown Cafe",
    "notes": "Business lunch",
    "tags": ["work", "meal"],
    "userId": "user_id",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation errors, invalid category
- `401` - Unauthorized
- `500` - Server error

---

#### Update Expense
**PUT** `/api/expenses/:id`

Updates an existing expense.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Expense ObjectId

**Request Body:**
```json
{
  "amount": 30.00,
  "description": "Updated lunch expense",
  "merchant": "New Cafe"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "expense_id",
    "amount": 30.00,
    "description": "Updated lunch expense",
    "merchant": "New Cafe",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation errors
- `401` - Unauthorized
- `404` - Expense not found
- `500` - Server error

---

#### Delete Expense
**DELETE** `/api/expenses/:id`

Deletes an expense.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Expense ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Expense not found
- `500` - Server error

---

#### Get Expense Summary
**GET** `/api/expenses/stats/summary`

Retrieves expense summary statistics.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `period` (optional): Time period (`week`, `month`, `year`) - default: `month`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalIncome": 5000.00,
    "totalExpenses": 3500.00,
    "netAmount": 1500.00,
    "transactionCount": 45,
    "averageExpense": 77.78,
    "topCategory": {
      "name": "Food & Dining",
      "amount": 800.00
    },
    "period": "month"
  }
}
```

**Error Responses:**
- `400` - Invalid period parameter
- `401` - Unauthorized
- `500` - Server error

---

### Budget Endpoints

All budget endpoints require authentication.

#### Get Budgets
**GET** `/api/budgets`

Retrieves all budgets for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `exceeded`, `completed`, `archived`)
- `period` (optional): Filter by period (`daily`, `weekly`, `monthly`, `yearly`, `custom`)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "budget_id",
      "name": "Monthly Food Budget",
      "category": {
        "_id": "category_id",
        "name": "Food & Dining",
        "icon": "🍽️",
        "color": "#FF6B6B"
      },
      "targetAmount": 500.00,
      "spentAmount": 325.50,
      "period": "monthly",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z",
      "isRecurring": true,
      "recurringConfig": {
        "frequency": "monthly",
        "autoRenew": true
      },
      "alertThreshold": 80,
      "alertTriggered": false,
      "status": "active",
      "notes": "Monthly food allowance",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

#### Get Single Budget
**GET** `/api/budgets/:id`

Retrieves a specific budget by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Budget ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "budget_id",
    "name": "Monthly Food Budget",
    "category": {
      "_id": "category_id",
      "name": "Food & Dining",
      "icon": "🍽️"
    },
    "targetAmount": 500.00,
    "spentAmount": 325.50,
    "period": "monthly",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "status": "active",
    "notes": "Monthly food allowance"
  }
}
```

**Error Responses:**
- `404` - Budget not found
- `401` - Unauthorized
- `500` - Server error

---

#### Create Budget
**POST** `/api/budgets`

Creates a new budget.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Monthly Food Budget",
  "category": "category_id",
  "targetAmount": 500.00,
  "period": "monthly",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.999Z",
  "isRecurring": true,
  "recurringConfig": {
    "frequency": "monthly",
    "autoRenew": true
  },
  "alertThreshold": 80,
  "notes": "Monthly food allowance"
}
```

**Validation Rules:**
- `name`: Required, non-empty string
- `category`: Required, valid category ObjectId
- `targetAmount`: Required, positive number
- `period`: Required, must be 'daily', 'weekly', 'monthly', 'yearly', or 'custom'
- `startDate`: Required, valid date
- `endDate`: Required, valid date, must be after startDate
- `isRecurring`: Optional boolean
- `recurringConfig`: Required if isRecurring is true
- `alertThreshold`: Optional, 0-100 (default: 80)
- `notes`: Optional string

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "new_budget_id",
    "name": "Monthly Food Budget",
    "category": "category_id",
    "targetAmount": 500.00,
    "spentAmount": 0,
    "period": "monthly",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "isRecurring": true,
    "recurringConfig": {
      "frequency": "monthly",
      "autoRenew": true
    },
    "alertThreshold": 80,
    "status": "active",
    "userId": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation errors, invalid category, invalid date range
- `401` - Unauthorized
- `500` - Server error

---

#### Update Budget
**PUT** `/api/budgets/:id`

Updates an existing budget.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Budget ObjectId

**Request Body:**
```json
{
  "name": "Updated Food Budget",
  "targetAmount": 600.00,
  "alertThreshold": 85
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "budget_id",
    "name": "Updated Food Budget",
    "targetAmount": 600.00,
    "alertThreshold": 85,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation errors
- `401` - Unauthorized
- `404` - Budget not found
- `500` - Server error

---

#### Delete Budget
**DELETE** `/api/budgets/:id`

Deletes a budget.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Budget ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "message": "Budget deleted successfully"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Budget not found
- `500` - Server error

---

#### Get Budget Performance
**GET** `/api/budgets/:id/performance`

Retrieves performance analytics for a specific budget.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Budget ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "budget": {
      "_id": "budget_id",
      "name": "Monthly Food Budget",
      "targetAmount": 500.00,
      "spentAmount": 325.50
    },
    "performance": {
      "percentage": 65.1,
      "remaining": 174.50,
      "status": "on_track",
      "daysRemaining": 15,
      "averageDailySpending": 21.7,
      "projectedTotal": 434.0
    }
  }
}
```

**Error Responses:**
- `404` - Budget not found
- `401` - Unauthorized
- `500` - Server error

---

#### Renew Recurring Budgets
**POST** `/api/budgets/renew-recurring`

Manually trigger renewal of recurring budgets that are due.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "renewed": 3,
    "budgets": [
      {
        "_id": "new_budget_id_1",
        "name": "Monthly Food Budget"
      },
      {
        "_id": "new_budget_id_2", 
        "name": "Weekly Transportation"
      }
    ]
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

### Goal Endpoints

All goal endpoints require authentication.

#### Get Goals
**GET** `/api/goals`

Retrieves all goals for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `completed`, `paused`)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "goal_id",
      "name": "Emergency Fund",
      "description": "Build emergency fund for 6 months expenses",
      "targetAmount": 10000.00,
      "currentAmount": 2500.00,
      "linkedCategory": {
        "_id": "category_id",
        "name": "Savings",
        "icon": "💰"
      },
      "targetDate": "2024-12-31T23:59:59.999Z",
      "priority": "high",
      "status": "active",
      "milestones": [
        {
          "amount": 2500.00,
          "description": "First milestone",
          "achievedDate": "2024-01-15T00:00:00.000Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

#### Get Single Goal
**GET** `/api/goals/:id`

Retrieves a specific goal by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Goal ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "goal_id",
    "name": "Emergency Fund",
    "description": "Build emergency fund for 6 months expenses",
    "targetAmount": 10000.00,
    "currentAmount": 2500.00,
    "targetDate": "2024-12-31T23:59:59.999Z",
    "priority": "high",
    "status": "active"
  }
}
```

**Error Responses:**
- `404` - Goal not found
- `401` - Unauthorized
- `500` - Server error

---

#### Create Goal
**POST** `/api/goals`

Creates a new goal.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Emergency Fund",
  "description": "Build emergency fund for 6 months expenses",
  "targetAmount": 10000.00,
  "targetDate": "2024-12-31T23:59:59.999Z",
  "linkedCategory": "category_id",
  "priority": "high"
}
```

**Validation Rules:**
- `name`: Required, non-empty string
- `description`: Optional string
- `targetAmount`: Required, positive number
- `targetDate`: Optional, future date
- `linkedCategory`: Optional, valid category ObjectId
- `priority`: Optional, must be 'low', 'medium', or 'high'

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "new_goal_id",
    "name": "Emergency Fund",
    "description": "Build emergency fund for 6 months expenses",
    "targetAmount": 10000.00,
    "currentAmount": 0,
    "targetDate": "2024-12-31T23:59:59.999Z",
    "priority": "high",
    "status": "active",
    "userId": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation errors
- `401` - Unauthorized
- `500` - Server error

---

#### Update Goal
**PUT** `/api/goals/:id`

Updates an existing goal.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Goal ObjectId

**Request Body:**
```json
{
  "name": "Updated Emergency Fund",
  "targetAmount": 12000.00,
  "priority": "high"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "goal_id",
    "name": "Updated Emergency Fund",
    "targetAmount": 12000.00,
    "priority": "high",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation errors
- `401` - Unauthorized
- `404` - Goal not found
- `500` - Server error

---

#### Delete Goal
**DELETE** `/api/goals/:id`

Deletes a goal.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Goal ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "message": "Goal deleted successfully"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Goal not found
- `500` - Server error

---

#### Add Goal Contribution
**POST** `/api/goals/:id/contribute`

Adds a contribution to a goal and optionally creates an expense transaction.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Goal ObjectId

**Request Body:**
```json
{
  "amount": 500.00,
  "note": "Monthly contribution",
  "createExpense": true
}
```

**Validation Rules:**
- `amount`: Required, positive number
- `note`: Optional string
- `createExpense`: Optional boolean (default: false)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "goal": {
      "_id": "goal_id",
      "name": "Emergency Fund",
      "currentAmount": 3000.00,
      "targetAmount": 10000.00
    },
    "contribution": {
      "amount": 500.00,
      "note": "Monthly contribution",
      "date": "2024-01-01T00:00:00.000Z"
    },
    "expenseCreated": true
  }
}
```

**Error Responses:**
- `400` - Validation errors, goal already completed
- `401` - Unauthorized
- `404` - Goal not found
- `500` - Server error

---

#### Get Goal Progress
**GET** `/api/goals/:id/progress`

Retrieves detailed progress information for a goal.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Goal ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "goal": {
      "_id": "goal_id",
      "name": "Emergency Fund",
      "targetAmount": 10000.00,
      "currentAmount": 3000.00
    },
    "progress": {
      "percentage": 30.0,
      "remaining": 7000.00,
      "monthsToTarget": 14,
      "averageMonthlyContribution": 214.29,
      "recommendedMonthlyContribution": 500.00
    },
    "recentContributions": [
      {
        "amount": 500.00,
        "date": "2024-01-01T00:00:00.000Z",
        "note": "Monthly contribution"
      }
    ]
  }
}
```

**Error Responses:**
- `404` - Goal not found
- `401` - Unauthorized
- `500` - Server error

---

### Analytics Endpoints

All analytics endpoints require authentication and provide financial insights and reporting.

#### Get Overview
**GET** `/api/analytics/overview`

Retrieves dashboard overview with key financial metrics.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `period` (optional): Time period (`month`, `quarter`, `year`) - default: `month`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalIncome": 5000.00,
    "totalExpenses": 3500.00,
    "netIncome": 1500.00,
    "savingsRate": 30.0,
    "transactionCount": 125,
    "activeBudgets": 5,
    "activeGoals": 3,
    "budgetUtilization": 72.5,
    "topSpendingCategory": {
      "name": "Food & Dining",
      "amount": 800.00
    },
    "period": "month"
  }
}
```

**Error Responses:**
- `400` - Invalid period parameter
- `401` - Unauthorized
- `500` - Server error

---

#### Get Spending Trends
**GET** `/api/analytics/trends`

Retrieves spending trends over time.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `period` (optional): `day`, `week`, `month`, `year` - default: `month`
- `limit` (optional): Number of periods to return (default: 12)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "period": "2024-01",
        "income": 5000.00,
        "expenses": 3500.00,
        "net": 1500.00,
        "transactionCount": 45
      },
      {
        "period": "2024-02",
        "income": 5200.00,
        "expenses": 3200.00,
        "net": 2000.00,
        "transactionCount": 42
      }
    ],
    "growth": {
      "incomeGrowth": 4.0,
      "expenseGrowth": -8.6,
      "savingsGrowth": 33.3
    }
  }
}
```

**Error Responses:**
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

#### Get Category Breakdown
**GET** `/api/analytics/categories`

Retrieves spending breakdown by categories.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `type` (optional): `income`, `expense` - default: `expense`
- `startDate` (optional): Filter from date (ISO string)
- `endDate` (optional): Filter to date (ISO string)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "category": {
          "_id": "category_id",
          "name": "Food & Dining",
          "icon": "🍽️",
          "color": "#FF6B6B"
        },
        "amount": 800.00,
        "percentage": 22.9,
        "transactionCount": 15,
        "avgTransactionAmount": 53.33
      }
    ],
    "total": 3500.00,
    "topCategory": {
      "name": "Food & Dining",
      "amount": 800.00
    }
  }
}
```

**Error Responses:**
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

#### Get Income vs Expense Comparison
**GET** `/api/analytics/comparison`

Retrieves income vs expense comparison with savings rate.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `period` (optional): Time grouping (`day`, `week`, `month`) - default: `month`
- `months` (optional): Number of months to include (default: 6)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "comparison": [
      {
        "period": "2024-01",
        "income": 5000.00,
        "expenses": 3500.00,
        "savings": 1500.00,
        "savingsRate": 30.0
      }
    ],
    "averages": {
      "avgIncome": 5100.00,
      "avgExpenses": 3350.00,
      "avgSavings": 1750.00,
      "avgSavingsRate": 34.3
    }
  }
}
```

**Error Responses:**
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

#### Get Monthly Comparison
**GET** `/api/analytics/monthly-comparison`

Compares current month with previous months.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `months` (optional): Number of months to compare (default: 3)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "currentMonth": {
      "period": "2024-03",
      "income": 5200.00,
      "expenses": 3100.00,
      "savings": 2100.00
    },
    "previousMonths": [
      {
        "period": "2024-02",
        "income": 5000.00,
        "expenses": 3500.00,
        "savings": 1500.00
      }
    ],
    "changes": {
      "incomeChange": 4.0,
      "expenseChange": -11.4,
      "savingsChange": 40.0
    }
  }
}
```

**Error Responses:**
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

#### Get Top Merchants
**GET** `/api/analytics/top-merchants`

Retrieves top merchants by spending amount.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of merchants to return (default: 10)
- `startDate` (optional): Filter from date (ISO string)
- `endDate` (optional): Filter to date (ISO string)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "merchants": [
      {
        "merchant": "Amazon",
        "amount": 450.00,
        "transactionCount": 8,
        "avgAmount": 56.25,
        "categories": ["Shopping", "Electronics"]
      },
      {
        "merchant": "Starbucks",
        "amount": 120.00,
        "transactionCount": 15,
        "avgAmount": 8.00,
        "categories": ["Food & Dining"]
      }
    ],
    "totalMerchants": 25
  }
}
```

**Error Responses:**
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

#### Get Transactions (Analytics)
**GET** `/api/analytics/transactions`

Retrieves paginated transactions for analytics purposes.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `startDate` (optional): Filter from date (ISO string)
- `endDate` (optional): Filter to date (ISO string)
- `type` (optional): `income`, `expense`
- `category` (optional): Category ID

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "transaction_id",
      "type": "expense",
      "amount": 25.50,
      "description": "Lunch",
      "category": {
        "name": "Food & Dining",
        "icon": "🍽️"
      },
      "date": "2024-01-01T12:00:00.000Z",
      "merchant": "Downtown Cafe"
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 10,
    "total": 100,
    "limit": 10
  }
}
```

**Error Responses:**
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

#### Get Budget Analysis
**GET** `/api/analytics/budget-analysis`

Retrieves budget performance analysis.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `startDate` (optional): Filter from date (ISO string)
- `endDate` (optional): Filter to date (ISO string)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "budgets": [
      {
        "_id": "budget_id",
        "name": "Monthly Food Budget",
        "category": {
          "name": "Food & Dining",
          "icon": "🍽️"
        },
        "targetAmount": 500.00,
        "spentAmount": 325.50,
        "remaining": 174.50,
        "percentage": "65.1",
        "isOverBudget": false,
        "status": "active"
      }
    ],
    "summary": {
      "totalBudgeted": 2000.00,
      "totalSpent": 1450.00,
      "totalRemaining": 550.00,
      "overallPercentage": "72.5",
      "totalBudgets": 5,
      "onTrackCount": 3,
      "nearLimitCount": 1,
      "exceededCount": 1
    }
  }
}
```

**Error Responses:**
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

### Import/Export Endpoints

#### Import Expenses from CSV
**POST** `/api/import/expenses/csv`

Imports expense data from a CSV file.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `file`: CSV file (required, max 5MB)

**CSV Format Requirements:**
```csv
date,amount,description,category,merchant,notes
2024-01-01,25.50,"Lunch at cafe","Food & Dining","Downtown Cafe","Business lunch"
2024-01-02,45.00,"Gas","Transportation","Shell Station",""
```

**Expected CSV Columns:**
- `date`: Date in YYYY-MM-DD format (required)
- `amount`: Positive number (required)
- `description`: Transaction description (required)
- `category`: Category name (optional, will try to match existing)
- `merchant`: Merchant name (optional)
- `notes`: Additional notes (optional)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "imported": 25,
    "failed": 2,
    "total": 27,
    "errors": [
      {
        "row": 3,
        "error": "Invalid date format",
        "data": {
          "date": "invalid-date",
          "amount": "50.00"
        }
      }
    ]
  }
}
```

**Error Responses:**
- `400` - No file uploaded, invalid file format, validation errors
- `401` - Unauthorized
- `413` - File too large (>5MB)
- `500` - Server error

---

#### Export Expenses
**GET** `/api/export/expenses`

Exports expense data to CSV format.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `startDate` (optional): Export from date (ISO string)
- `endDate` (optional): Export to date (ISO string)
- `category` (optional): Filter by category ID
- `type` (optional): `income`, `expense`

**Success Response (200):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="expenses-2024-01-01-to-2024-12-31.csv"

Date,Type,Amount,Description,Category,Merchant,Notes
2024-01-01,expense,25.50,Lunch at cafe,Food & Dining,Downtown Cafe,Business lunch
2024-01-02,expense,45.00,Gas,Transportation,Shell Station,
```

**Error Responses:**
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

#### Export Budgets
**GET** `/api/export/budgets`

Exports budget data to CSV format.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by status
- `period` (optional): Filter by period

**Success Response (200):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="budgets-2024.csv"

Name,Category,Target Amount,Spent Amount,Period,Start Date,End Date,Status
Monthly Food Budget,Food & Dining,500.00,325.50,monthly,2024-01-01,2024-01-31,active
```

**Error Responses:**
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

#### Export Goals
**GET** `/api/export/goals`

Exports goal data to CSV format.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="goals-2024.csv"

Name,Description,Target Amount,Current Amount,Progress %,Target Date,Status
Emergency Fund,Build emergency fund,10000.00,2500.00,25.0,2024-12-31,active
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

### Notification Endpoints

All notification endpoints require authentication.

#### Get Notifications
**GET** `/api/notifications`

Retrieves notifications for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `read` (optional): Filter by read status (`true`, `false`)
- `type` (optional): Filter by type (`budget_alert`, `goal_milestone`, `import_complete`)
- `limit` (optional): Number of notifications (default: 20, max: 100)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "notification_id",
      "type": "budget_alert",
      "title": "Budget Alert",
      "message": "You've spent 85% of your Food & Dining budget",
      "data": {
        "budgetId": "budget_id",
        "budgetName": "Monthly Food Budget",
        "percentage": 85
      },
      "read": false,
      "createdAt": "2024-01-01T12:00:00.000Z"
    },
    {
      "_id": "notification_id_2",
      "type": "goal_milestone",
      "title": "Goal Milestone Reached",
      "message": "Congratulations! You've reached 25% of your Emergency Fund goal",
      "data": {
        "goalId": "goal_id",
        "goalName": "Emergency Fund",
        "milestone": 25
      },
      "read": true,
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "unreadCount": 5
}
```

**Error Responses:**
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

#### Mark Notification as Read
**PUT** `/api/notifications/:id/read`

Marks a specific notification as read.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Notification ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "notification_id",
    "read": true,
    "readAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `404` - Notification not found
- `401` - Unauthorized
- `500` - Server error

---

#### Mark All Notifications as Read
**PUT** `/api/notifications/read-all`

Marks all notifications as read for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "modifiedCount": 5,
    "message": "All notifications marked as read"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

#### Delete Notification
**DELETE** `/api/notifications/:id`

Deletes a specific notification.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Notification ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

**Error Responses:**
- `404` - Notification not found
- `401` - Unauthorized
- `500` - Server error

---

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Category Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  type: String (enum: ['income', 'expense', 'both']),
  icon: String,
  color: String,
  owner: String (enum: ['system', 'user']),
  userId: ObjectId (ref: User, required if owner='user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Expense Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  type: String (enum: ['income', 'expense']),
  amount: Number (required, min: 0),
  description: String (required),
  category: ObjectId (ref: Category, required),
  date: Date (required),
  source: String (enum: ['manual', 'imported', 'recurring', 'goal_contribution']),
  merchant: String,
  notes: String,
  tags: [String],
  isRecurring: Boolean,
  recurringConfig: {
    frequency: String (enum: ['daily', 'weekly', 'monthly', 'yearly']),
    interval: Number,
    startDate: Date,
    endDate: Date,
    nextDate: Date
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Budget Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  name: String (required),
  category: ObjectId (ref: Category, required),
  targetAmount: Number (required, min: 0),
  spentAmount: Number (default: 0, min: 0),
  period: String (enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom']),
  startDate: Date (required),
  endDate: Date (required),
  isRecurring: Boolean,
  recurringConfig: {
    frequency: String (enum: ['weekly', 'monthly', 'yearly']),
    autoRenew: Boolean
  },
  alertThreshold: Number (min: 0, max: 100, default: 80),
  alertTriggered: Boolean,
  status: String (enum: ['active', 'exceeded', 'completed', 'archived']),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Goal Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  name: String (required),
  description: String,
  targetAmount: Number (required, min: 0),
  currentAmount: Number (default: 0, min: 0),
  linkedCategory: ObjectId (ref: Category),
  targetDate: Date,
  priority: String (enum: ['low', 'medium', 'high']),
  status: String (enum: ['active', 'completed', 'paused']),
  milestones: [{
    amount: Number,
    description: String,
    achievedDate: Date
  }],
  contributions: [{
    amount: Number,
    date: Date,
    note: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  type: String (enum: ['budget_alert', 'goal_milestone', 'import_complete', 'system']),
  title: String (required),
  message: String (required),
  data: Object,
  read: Boolean (default: false),
  readAt: Date,
  createdAt: Date
}
```

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **File upload endpoints**: 3 requests per minute per user
- **General API endpoints**: 100 requests per minute per user

---

## File Upload Limits

- **CSV Import**: Maximum 5MB file size
- **Attachments**: Maximum 10MB per file, 5 files per expense

---

## Security Notes

1. All passwords are hashed using bcrypt
2. JWT tokens expire after 30 days
3. CORS is enabled for frontend domains
4. Request logging is implemented for monitoring
5. Input validation on all endpoints
6. File type validation for uploads
7. User data isolation (users can only access their own data)

---

## Getting Started

1. **Authentication**: Register or login to get a JWT token
2. **Setup Categories**: Get system categories or create custom ones
3. **Add Expenses**: Create income and expense records
4. **Set Budgets**: Create budgets to track spending limits
5. **Set Goals**: Create financial goals and track progress
6. **Import Data**: Use CSV import for bulk data entry
7. **Analytics**: Use analytics endpoints for insights and reporting

---

**Last Updated**: November 1, 2024  
**API Version**: 1.0.0