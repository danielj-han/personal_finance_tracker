import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditModal from './EditModal';

const RecurringTransactions = ({ onTransactionAdded }) => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [categories, setCategories] = useState({ Expense: [], Income: [] });
  const [newRecurring, setNewRecurring] = useState({
    description: '',
    amount: '',
    type: 'Expense',
    category: '',
    frequency: 'monthly',
    startDate: ''
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const frequencyOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'bi-weekly', label: 'Bi-Weekly' },
    { value: 'weekly', label: 'Weekly' }
  ];

  const containerStyle = {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  const recurringItemStyle = {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '10px',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const deleteButtonStyle = {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '10px'
  };

  const editButtonStyle = {
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  useEffect(() => {
    fetchRecurringTransactions();
    fetchCategories();
  }, []);

  const fetchRecurringTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/recurring-transactions');
      setRecurringTransactions(response.data);
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // The date from the input is already in YYYY-MM-DD format
      const selectedDate = newRecurring.startDate;
      console.log('Selected date:', selectedDate);

      await axios.post('http://localhost:5001/api/recurring-transactions', {
        ...newRecurring,
        amount: Number(newRecurring.amount),
        startDate: selectedDate
      });
      
      setNewRecurring({
        description: '',
        amount: '',
        type: 'Expense',
        category: '',
        frequency: 'monthly',
        startDate: ''
      });

      await fetchRecurringTransactions();
      await onTransactionAdded();
      window.location.reload();
    } catch (error) {
      console.error('Error creating recurring transaction:', error);
      alert('Failed to create recurring transaction. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      try {
        console.log('Transaction ID to delete:', id);
        console.log('Full transaction object:', recurringTransactions.find(t => t._id === id));

        const response = await axios.delete(`http://localhost:5001/api/recurring-transactions/${id}`);
        if (response.status === 200) {
          fetchRecurringTransactions();
          onTransactionAdded();
        }
      } catch (error) {
        console.error('Full error object:', error);
        console.error('Error response:', error.response);
        console.error('Error deleting recurring transaction:', error.response?.data?.message || error.message);
        alert('Failed to delete recurring transaction. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'No date set';
      // Handle both ISO string and YYYY-MM-DD formats
      const date = dateString.includes('T') 
        ? dateString.split('T')[0] // Handle ISO string format
        : dateString; // Already in YYYY-MM-DD format
      
      // Split the YYYY-MM-DD format
      const [year, month, day] = date.split('-');
      
      // Format as MM/DD/YYYY
      return `${parseInt(month)}/${parseInt(day)}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5001/api/recurring-transactions/${editingTransaction._id}`, {
        description: editingTransaction.description,
        amount: Number(editingTransaction.amount),
        type: editingTransaction.type,
        category: editingTransaction.category,
        frequency: editingTransaction.frequency,
        startDate: editingTransaction.startDate
      });

      setIsEditModalOpen(false);
      setEditingTransaction(null);
      await fetchRecurringTransactions();
      await onTransactionAdded();
    } catch (error) {
      console.error('Error updating recurring transaction:', error);
      alert('Failed to update recurring transaction');
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Recurring Transactions</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newRecurring.description}
          onChange={(e) => setNewRecurring({ ...newRecurring, description: e.target.value })}
          placeholder="Description"
          required
          style={{ marginRight: '10px' }}
        />
        <input
          type="number"
          value={newRecurring.amount}
          onChange={(e) => setNewRecurring({ ...newRecurring, amount: e.target.value })}
          placeholder="Amount"
          required
          style={{ marginRight: '10px' }}
        />
        <select
          value={newRecurring.type}
          onChange={(e) => setNewRecurring({ ...newRecurring, type: e.target.value })}
          style={{ marginRight: '10px' }}
        >
          <option value="Expense">Expense</option>
          <option value="Income">Income</option>
        </select>
        <select
          value={newRecurring.category}
          onChange={(e) => setNewRecurring({ ...newRecurring, category: e.target.value })}
          style={{ marginRight: '10px' }}
        >
          <option value="">Select Category</option>
          {categories[newRecurring.type]?.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={newRecurring.frequency}
          onChange={(e) => setNewRecurring({ ...newRecurring, frequency: e.target.value })}
          style={{ marginRight: '10px' }}
        >
          {frequencyOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={newRecurring.startDate}
          onChange={(e) => setNewRecurring({ ...newRecurring, startDate: e.target.value })}
          required
          style={{ marginRight: '10px' }}
        />
        <button type="submit">Add Recurring Transaction</button>
      </form>

      <div>
        {recurringTransactions.map(transaction => (
          <div key={transaction._id} style={recurringItemStyle}>
            <div>
              <strong>{transaction.description}</strong>
              <div>${transaction.amount} - {transaction.type}</div>
              <div>{transaction.category} ({transaction.frequency})</div>
              <div>Starting: {formatDate(transaction.startDate)}</div>
            </div>
            <div style={buttonContainerStyle}>
              <button
                onClick={() => {
                  setEditingTransaction(transaction);
                  setIsEditModalOpen(true);
                }}
                style={editButtonStyle}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(transaction._id)}
                style={deleteButtonStyle}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTransaction(null);
        }}
        title="Edit Recurring Transaction"
      >
        {editingTransaction && (
          <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              value={editingTransaction.description}
              onChange={(e) => setEditingTransaction({
                ...editingTransaction,
                description: e.target.value
              })}
              placeholder="Description"
              required
            />
            <input
              type="number"
              value={editingTransaction.amount}
              onChange={(e) => setEditingTransaction({
                ...editingTransaction,
                amount: e.target.value
              })}
              placeholder="Amount"
              required
            />
            <select
              value={editingTransaction.type}
              onChange={(e) => setEditingTransaction({
                ...editingTransaction,
                type: e.target.value,
                category: ''
              })}
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
            <select
              value={editingTransaction.category}
              onChange={(e) => setEditingTransaction({
                ...editingTransaction,
                category: e.target.value
              })}
              required
            >
              <option value="">Select Category</option>
              {categories[editingTransaction.type]?.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={editingTransaction.frequency}
              onChange={(e) => setEditingTransaction({
                ...editingTransaction,
                frequency: e.target.value
              })}
            >
              {frequencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={editingTransaction.startDate}
              onChange={(e) => setEditingTransaction({
                ...editingTransaction,
                startDate: e.target.value
              })}
              required
            />
            <button type="submit" style={{
              padding: '10px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Save Changes
            </button>
          </form>
        )}
      </EditModal>
    </div>
  );
};

export default RecurringTransactions; 