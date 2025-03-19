import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from '../components/Dashboard';
import DataExport from '../components/DataExport';
import DateRangeFilter from '../components/DateRangeFilter';
import { startOfMonth, endOfMonth } from 'date-fns';

const DashboardPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
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
    const transactionDate = new Date(transaction.date);
    return transactionDate >= dateRange.start && transactionDate <= dateRange.end;
  });

  return (
    <div>
      <h1>Financial Dashboard</h1>
      <DateRangeFilter 
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      <Dashboard transactions={filteredTransactions} dateRange={dateRange} />
      <DataExport transactions={filteredTransactions} />
    </div>
  );
};

export default DashboardPage; 