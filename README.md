# Personal Expense & Budget Tracker

A full-stack personal finance web app to track income and expenses, set monthly category budgets, see spending patterns on an interactive dashboard, and export records as CSV, Excel, or JSON.

## Features

- **Secure login** – registration and login with JWT authentication and bcrypt password hashing; each user sees only their own data
- **Transactions** – add, edit, delete, and filter income and expenses by category, date, and payment method
- **Budgets** – set monthly budgets per category, track remaining amount, and get over-budget warnings
- **Dashboard** – 5 summary cards (balance, income, expenses, remaining budget, savings) with charts of spending patterns
- **Reports** – export transactions as CSV, Excel (.xlsx), or JSON

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React.js (Vite), Tailwind CSS, Recharts |
| Backend | Node.js, Express.js, REST APIs |
| Auth | JWT, bcrypt |
| Database | MySQL (falls back to embedded SQLite if MySQL isn't running) |

## Project structure

```
expense-tracker/expense-tracker/
├── backend/     # Express API: routes, controllers, middleware, database setup
├── frontend/    # React app: pages, components, context, services
├── dataset/     # Sample expense dataset (CSV)
└── README.md    # Full documentation: setup, API reference, database schema
```

## Quick start

```bash
cd expense-tracker/expense-tracker
cp .env.example backend/.env      # then set your DB password and JWT secret
npm install --prefix backend
npm install --prefix frontend
npm run dev                        # starts backend and frontend together
```

The frontend runs at http://localhost:5173 and the API at http://localhost:5000.

See the [full documentation](expense-tracker/expense-tracker/README.md) for MySQL setup, the API reference, and the database schema.

## Author

**Karthick V** – B.Tech Artificial Intelligence & Machine Learning, Hindusthan College of Engineering and Technology
[LinkedIn](https://www.linkedin.com/in/karthick-venkatesh-8720b4273/) · [Portfolio](https://karthick285.github.io)
