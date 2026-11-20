# Personal Expense & Budget Tracker

A modern, responsive, full-stack personal finance web application built to help individuals track their income and expenses, set monthly category budgets, analyze visual spending patterns with interactive charts, and export financial records in multiple formats (CSV, Excel, JSON).

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Technology Stack](#3-technology-stack)
4. [Installation](#4-installation)
5. [MySQL Database Setup](#5-mysql-database-setup)
6. [Environment Variable Configuration](#6-environment-variable-configuration)
7. [How to Start Backend](#7-how-to-start-backend)
8. [How to Start Frontend](#8-how-to-start-frontend)
9. [API Documentation](#9-api-documentation)
10. [Database Schema](#10-database-schema)
11. [Dataset Download & Sample Data](#11-dataset-download--sample-data)
12. [Demo Login Credentials](#12-demo-login-credentials)
13. [Screenshots & UI Showcase](#13-screenshots--ui-showcase)
14. [Future Improvements](#14-future-improvements)

---

## 1. Project Overview

Managing personal finances often involves fragmented spreadsheets and cumbersome tracking tools. **Personal Expense & Budget Tracker** provides an intuitive, high-performance financial management dashboard designed with a SaaS-grade user experience:

- **Security & User Isolation**: Built with JWT authentication, bcrypt password hashing, and complete data isolation per user.
- **Accurate Real-Time Math**: Dynamic database aggregation for net balance, monthly cash flows, remaining budgets, and savings rates.
- **Proactive Budget Warnings**: Visual alerts and threshold indicators when spending approaches or exceeds budgeted allocations.
- **Comprehensive Reports**: Instant downloads of transaction data in CSV, Excel (.xlsx), and JSON, alongside a pre-packaged benchmark dataset.

---

## 2. Features

### Authentication & User Management
- Secure user registration and login with form validations.
- Bcrypt password encryption (10 salt rounds).
- JSON Web Token (JWT) session handling with "Remember Me" support.
- Protected frontend client routes and backend API middleware.
- Profile management (name editing, secure password changing).

### Financial Dashboard
- **5 Dynamic Summary Cards**:
  - **Total Balance**: Real-time Net Capital (`Total Income - Total Expenses`).
  - **Total Income**: Sum of all recorded earnings.
  - **Total Expenses**: Sum of all recorded outflows.
  - **Remaining Budget**: Current month's allocated budget minus actual expenses.
  - **Savings**: Net savings and calculated savings rate percentage.
- **Recent Transactions Feed**: Quick table of the latest transactions with category color badges, payment methods, and instant edit/delete actions.
- Over-budget warning banner when monthly limits are exceeded.

### Transaction Management (Full CRUD)
- Add, view, edit, and delete transactions with amount validation (`> 0`).
- Multi-field classification:
  - **Types**: `Income` or `Expense`.
  - **Expense Categories**: Food, Transport, Shopping, Bills, Education, Entertainment, Healthcare, Rent, Travel, Other.
  - **Income Categories**: Salary, Freelance, Business, Investment, Gift, Other.
  - **Payment Methods**: UPI, Credit Card, Debit Card, Net Banking, Cash.
  - Date picker, description, and optional notes.
- **Powerful Filtering & Search**:
  - Search by keyword across description and notes.
  - Filter by Type, Category, Payment Method, Date Range (`From` & `To`), and Amount Range (`Min` & `Max`).
  - Sort by Date, Amount, Category, or Description (Ascending / Descending).
  - One-click filter reset.
- Responsive pagination controls.

### Monthly Budget Management
- Create, view, edit, and delete category-specific monthly budgets (`YYYY-MM`).
- Month-by-month pager to navigate past and future budget allocations.
- Visual progress bars showing:
  - Category, Budget Limit, Actual Spent, Remaining Balance, and exact Progress Percentage (e.g. `68.75%`).
  - Visual status chips: **Safe / On Track** (`< 70%`), **Approaching Limit** (`70% - 99%`), and **Budget Exceeded** (`>= 100%`).

### Interactive Financial Analytics (Recharts)
- **Expense by Category**: Donut chart with category shares and hover tooltips.
- **Income vs Expense**: Grouped bar chart comparing inflows against outflows month-by-month.
- **Monthly Spending Trajectory**: Multi-line chart illustrating monthly expense velocity and net savings trends.
- **Budget vs Actual**: Comparative bar chart juxtaposing target budget allocations against real-world spending.

### Data Export & Dataset Download
- **Export Formats**:
  - **CSV**: Download personal transactions in `.csv` format.
  - **Excel**: Generate and download formatted `.xlsx` spreadsheets using SheetJS.
  - **JSON**: Raw structured data for backups or developer APIs.
- **Sample Dataset**: Built-in download for `sample_expense_dataset.csv` containing 120+ realistic dummy transactions.

### User Interface & Experience
- Fully responsive on Desktop, Tablet, and Mobile.
- Professional financial SaaS theme with light and dark mode toggle.
- Collapsible responsive sidebar drawer and top navigation bar with user profile.
- Toast notifications for success, warning, and error states.
- Confirmation dialogs for destructive actions.

---

## 3. Technology Stack

### Frontend
- **Framework**: React.js (Vite 5)
- **Styling**: Tailwind CSS (with custom scrollbars and full Dark Mode)
- **Charts**: Recharts
- **Icons**: Lucide React
- **API Client**: Axios (with Bearer token interceptor and 401 handling)

### Backend
- **Runtime**: Node.js
- **Server**: Express.js
- **Database**: MySQL 8.0 (via `mysql2/promise` connection pool)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`
- **Spreadsheet Generation**: `xlsx` (SheetJS)
- **Configuration**: `dotenv`

---

## 4. Installation

Clone or navigate to the project directory:

```bash
cd expense-tracker
```

### Install Backend Dependencies
```bash
cd backend
npm install
```

### Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 5. MySQL Database Setup

Ensure MySQL Server (8.0+) is installed and running on your machine.

### Automatic Database Initialization & Seeding
From the `backend` directory, run:

```bash
# 1. Ensure the database and schema tables exist
npm run db:init

# 2. Populate the demo account, 120+ dummy transactions, and category budgets
npm run db:seed
```

Or from the root directory:
```bash
npm run db:init
npm run db:seed
```

---

## 6. Environment Variable Configuration

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=expense_tracker
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

> **Note**: Update `DB_PASSWORD` with your local MySQL password.

---

## 7. How to Start Backend

From the `backend` folder:
```bash
npm start
# or with file watching during development:
npm run dev
```

The backend server will start at: `http://localhost:5000`
Health check endpoint: `http://localhost:5000/api/health`

---

## 8. How to Start Frontend

From the `frontend` folder:
```bash
npm run dev
```

The Vite dev server will start at: `http://localhost:5173`
Open `http://localhost:5173` in your browser.

---

## 9. API Documentation

All protected routes require the `Authorization: Bearer <token>` header.

### Authentication Endpoints
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT | No |
| `GET` | `/api/auth/profile` | Retrieve authenticated user profile | Yes |
| `PUT` | `/api/auth/profile` | Update profile name or password | Yes |

### Transaction Endpoints
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/api/transactions` | List transactions with filters, search, & pagination | Yes |
| `POST` | `/api/transactions` | Create a new transaction | Yes |
| `GET` | `/api/transactions/:id` | Get details of a single transaction | Yes |
| `PUT` | `/api/transactions/:id` | Update an existing transaction | Yes |
| `DELETE` | `/api/transactions/:id` | Delete a transaction | Yes |

#### Query Parameters for `GET /api/transactions`:
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `type` (`Income` | `Expense` | `all`)
- `category` (category string or `all`)
- `payment_method` (method string or `all`)
- `startDate` (`YYYY-MM-DD`)
- `endDate` (`YYYY-MM-DD`)
- `minAmount` (number)
- `maxAmount` (number)
- `search` (keyword in description or notes)
- `sortBy` (`transaction_date` | `amount` | `category` | `description`)
- `sortOrder` (`ASC` | `DESC`)

### Budget Endpoints
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/api/budgets?month=YYYY-MM` | Get category budgets, spent amounts, & progress | Yes |
| `POST` | `/api/budgets` | Set or update a category monthly budget | Yes |
| `PUT` | `/api/budgets/:id` | Edit budget amount or category | Yes |
| `DELETE` | `/api/budgets/:id` | Delete a budget limit | Yes |

### Analytics Endpoints
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/api/analytics/summary` | Balance, income, expense, savings, & budget status | Yes |
| `GET` | `/api/analytics/category-expenses?month=YYYY-MM` | Expense breakdown by category | Yes |
| `GET` | `/api/analytics/monthly-expenses` | Monthly expense & savings history | Yes |
| `GET` | `/api/analytics/income-vs-expense` | Comparative income and expense data | Yes |
| `GET` | `/api/analytics/budget-vs-actual?month=YYYY-MM` | Budget limit vs actual spending | Yes |

### Data Export Endpoints
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/api/export/csv` | Stream user transactions as CSV | Yes |
| `GET` | `/api/export/excel` | Download transactions as `.xlsx` file | Yes |
| `GET` | `/api/export/json` | Download transactions as JSON file | Yes |
| `GET` | `/api/export/sample-csv` | Download pre-packaged sample dataset | No |

---

## 10. Database Schema

### Table: `users`
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `transactions`
```sql
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('Income', 'Expense') NOT NULL,
  category VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_date DATE NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_trans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, transaction_date),
  INDEX idx_user_type (user_id, type),
  INDEX idx_user_category (user_id, category)
);
```

### Table: `budgets`
```sql
CREATE TABLE budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  month VARCHAR(7) NOT NULL COMMENT 'Format: YYYY-MM',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_budget_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_cat_month (user_id, category, month),
  INDEX idx_user_month (user_id, month)
);
```

---

## 11. Dataset Download & Sample Data

The application includes a clean sample dataset containing **120 realistic transactions** spanning across 2026:

- Located at: `dataset/sample_expense_dataset.csv`
- Downloadable directly from the UI on the **Reports / Data** page via the **"Download Sample Dataset"** button.

### Sample CSV Columns:
```csv
transaction_id,date,type,category,description,amount,payment_method,notes
1,2026-01-01,Income,Salary,"Monthly salary credit",85000,Net Banking,"Regular monthly direct deposit"
2,2026-01-02,Expense,Rent,"Apartment monthly rent",22000,Net Banking,"Jan apartment rent"
3,2026-01-03,Expense,Food,"Supermarket monthly grocery",4250,UPI,"Monthly groceries and household items"
4,2026-01-04,Expense,Bills,"High-speed broadband bill",1199,Credit Card,"Fiber internet renewal"
```

---

## 12. Demo Login Credentials

For quick evaluation and testing, you can use the pre-configured demo account populated with 120+ transactions and budgets:

- **Email**: `demo@tracker.com`
- **Password**: `Password123!`

*(You can also click the **"Auto-fill"** button directly on the Login screen to fill these credentials automatically).*

---

## 13. Screenshots & UI Showcase

| Screen | Description |
|---|---|
| **Dashboard** | 5 Financial summary cards, recent transactions feed, quick action triggers |
| **Transactions** | Complete CRUD data table, filter drawer, search, and pagination |
| **Budgets** | Category budget cards, visual progress indicators, and warning alerts |
| **Analytics** | Category Donut, Monthly Income vs Expense Bar, and Spending Trend charts |
| **Reports** | CSV, Excel, JSON exports, and sample dataset download |
| **Dark Mode** | Full dark theme support across all dashboards and modals |

---

## 14. Future Improvements

- Recurring transactions automation (subscriptions, rent, monthly salary).
- Receipt image attachment and OCR extraction using AI.
- Multi-currency conversion support with real-time exchange rates.
- Split expense functionality for roommates and group travel.
- Push notification & email alerts for budget limits.

---

## License

This project is open source and available under the [MIT License](LICENSE).
