# Personal Finance Tracker

A full-stack web application that helps users manage their personal finances, track expenses, set budgets, and monitor recurring transactions. Built with React.js and Node.js, this application provides a comprehensive solution for personal financial management.

## Features

### Transaction Management
- Create, read, update, and delete financial transactions
- Categorize transactions as Income or Expense
- Filter transactions by type, category, and date range
- Sort transactions by date, amount, and other criteria
- Real-time transaction updates

### Budget Management
- Set and track budget goals for different expense categories
- Visual progress bars for budget tracking
- Support for multiple budget periods:
  - Weekly
  - Monthly
  - Quarterly
  - Yearly
- Color-coded indicators for budget status

### Recurring Transactions
- Set up automated recurring transactions
- Multiple frequency options:
  - Weekly
  - Bi-weekly
  - Monthly
- Automatic transaction generation

### Data Export
- Export transactions to CSV format
- Generate detailed PDF reports
- Transaction summaries with totals

## Technology Stack

### Frontend
- React.js
- JavaScript (ES6+)
- Axios for HTTP requests
- date-fns for date manipulation

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication

## Usage

1. Create an account or log in
2. Add transactions through the transaction form
3. Set up budget goals in the budget manager
4. Configure recurring transactions if needed
5. Use filters and sorting to analyze your spending
6. Export data as needed in CSV or PDF format

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
