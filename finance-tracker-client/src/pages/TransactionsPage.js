import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import RecurringTransactions from '../components/RecurringTransactions';
import { startOfMonth, endOfMonth } from 'date-fns';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()).toISOString().split('T')[0],
    endDate: endOfMonth(new Date()).toISOString().split('T')[0]
  });

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions based on date range
  const filteredTransactions = transactions.filter(transaction => {
    if (!dateRange.startDate && !dateRange.endDate) return true;
    
    // Convert all dates to YYYY-MM-DD format for consistent comparison
    const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
    const startDate = dateRange.startDate;
    const endDate = dateRange.endDate;

    // If only start date is set
    if (startDate && !endDate) {
      return transactionDate >= startDate;
    }
    
    // If only end date is set
    if (!startDate && endDate) {
      return transactionDate <= endDate;
    }
    
    // If both dates are set
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  return (
    <div>
      <h1>Transactions</h1>
      <TransactionForm onTransactionAdded={fetchTransactions} />
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <RecurringTransactions onTransactionAdded={fetchTransactions} />
      </div>
      <TransactionList 
        transactions={filteredTransactions} 
        onTransactionDeleted={fetchTransactions}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />
    </div>
  );
};

export default TransactionsPage; 