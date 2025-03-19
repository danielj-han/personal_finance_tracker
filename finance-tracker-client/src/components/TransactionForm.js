import React, { useState } from 'react';
import axios from 'axios';

const TransactionForm = ({ onTransactionAdded }) => {
  const categories = {
    Expense: [
      'Food',
      'Transportation',
      'Housing',
      'Utilities',
      'Healthcare',
      'Entertainment',
      'Clothing',
      'Education',
      'Personal Care',
      'Miscellaneous'
    ],
    Income: [
      'Salary',
      'Freelance',
      'Investments',
      'Gifts',
      'Other'
    ]
  };

  const [transaction, setTransaction] = useState({
    description: '',
    amount: '',
    type: 'Expense',
    category: '',
    userId: '65f7a0000000000000000000', // Temporary userId for testing
    date: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:5001/api/transactions', {
        description: transaction.description,
        amount: Number(transaction.amount),
        type: transaction.type,
        category: transaction.category,
        date: transaction.date
      });
      
      console.log('Server response:', response.data);
      setTransaction({
        description: '',
        amount: '',
        type: 'Expense',
        category: '',
        date: ''
      });
      
      onTransactionAdded();

      // Dispatch event for budget updates
      window.dispatchEvent(new Event('transactionUpdated'));
    } catch (error) {
      console.error('Error details:', error);
    }
  };

  const handleChange = (e) => {
    setTransaction({
      ...transaction,
      [e.target.name]: e.target.value
    });
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setTransaction(prev => ({
      ...prev,
      type: newType,
      category: '', // Reset category when type changes
      date: ''
    }));
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px'
  };

  const inputStyle = {
    padding: '8px',
    marginBottom: '10px'
  };

  const buttonStyle = {
    padding: '10px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <input
        style={inputStyle}
        type="text"
        name="description"
        placeholder="Description"
        value={transaction.description}
        onChange={handleChange}
        required
      />
      <input
        style={inputStyle}
        type="number"
        name="amount"
        placeholder="Amount"
        value={transaction.amount}
        onChange={handleChange}
        required
      />
      <select
        style={inputStyle}
        name="type"
        value={transaction.type}
        onChange={handleTypeChange}
      >
        <option value="Expense">Expense</option>
        <option value="Income">Income</option>
      </select>
      <select
        style={inputStyle}
        name="category"
        value={transaction.category}
        onChange={handleChange}
        required
      >
        <option value="">Select Category</option>
        {categories[transaction.type].map(category => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <input
        style={inputStyle}
        type="date"
        name="date"
        value={transaction.date}
        onChange={handleChange}
        required
      />
      <button type="submit" style={buttonStyle}>
        Add Transaction
      </button>
    </form>
  );
};

export default TransactionForm; 