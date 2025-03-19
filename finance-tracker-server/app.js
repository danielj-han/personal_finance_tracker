const express = require('express');
const app = express();
const transactionsRouter = require('./routes/transactions');

// ... other middleware and routes ...

// Make sure this line exists and is not commented out
app.use('/api/transactions', transactionsRouter); 