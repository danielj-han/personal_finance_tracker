import React, { useState } from 'react';
import axios from 'axios';
import EditModal from './EditModal';

const TransactionList = ({ 
  transactions = [], 
  onTransactionDeleted, 
  onTransactionUpdated,
  dateRange,
  onDateRangeChange
}) => {
  // Add filter and sort states
  const [filters, setFilters] = useState({
    type: 'All',
    category: 'All'
  });
  const [sortBy, setSortBy] = useState('newest');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Define category groups
  const categoryGroups = {
    Income: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other'],
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
    ]
  };

  // Get categories based on selected type
  const getAvailableCategories = () => {
    if (filters.type === 'All') {
      return [...new Set(transactions.map(t => t.category))];
    }
    return categoryGroups[filters.type] || [];
  };

  // Handle type change
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFilters(prev => ({
      type: newType,
      category: 'All' // Reset category when type changes
    }));
  };

  // Filter and sort transactions
  const filteredAndSortedTransactions = transactions
    .filter(transaction => {
      const typeMatch = filters.type === 'All' || transaction.type === filters.type;
      const categoryMatch = filters.category === 'All' || transaction.category === filters.category;
      return typeMatch && categoryMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        case 'largest':
          return b.amount - a.amount;
        case 'smallest':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

  // Calculate totals with safety check
  const calculateTotals = () => {
    if (!transactions.length) {
      return { income: 0, expenses: 0, balance: 0 };
    }

    const income = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expenses,
      balance: income - expenses
    };
  };

  const totals = calculateTotals();

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('en-US', options);
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

  const deleteButtonStyle = {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5001/api/transactions/${editingTransaction._id}`, {
        description: editingTransaction.description,
        amount: Number(editingTransaction.amount),
        type: editingTransaction.type,
        category: editingTransaction.category,
        date: editingTransaction.date
      });

      setIsEditModalOpen(false);
      setEditingTransaction(null);
      onTransactionUpdated();
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`http://localhost:5001/api/transactions/${id}`);
        onTransactionDeleted();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction');
      }
    }
  };

  const listStyle = {
    backgroundColor: 'white',
    borderRadius: '4px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const itemStyle = {
    padding: '10px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const summaryStyle = {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    textAlign: 'center'
  };

  const amountStyle = (type) => ({
    color: type === 'income' ? '#28a745' : type === 'expense' ? '#dc3545' : '#007bff',
    fontWeight: 'bold'
  });

  const filterStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px'
  };

  const filterGroupStyle = {
    display: 'flex',
    gap: '10px'
  };

  const dateRangeStyle = {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  };

  const dateInputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  };

  const dateInputLabelStyle = {
    fontSize: '14px',
    color: '#666'
  };

  const selectStyle = {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd'
  };

  // Update the date range handlers to use the prop
  const handleDateChange = (type, value) => {
    onDateRangeChange({
      ...dateRange,
      [type]: value
    });
  };

  return (
    <div>
      <div style={summaryStyle}>
        <div>
          <div>Income</div>
          <div style={amountStyle('income')}>${totals.income.toFixed(2)}</div>
        </div>
        <div>
          <div>Expenses</div>
          <div style={amountStyle('expense')}>${totals.expenses.toFixed(2)}</div>
        </div>
        <div>
          <div>Balance</div>
          <div style={amountStyle('balance')}>${totals.balance.toFixed(2)}</div>
        </div>
      </div>

      <div style={filterStyle}>
        <div style={filterGroupStyle}>
          <select 
            style={selectStyle}
            value={filters.type}
            onChange={handleTypeChange}
          >
            <option value="All">All Types</option>
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>

          <select
            style={selectStyle}
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="All">All Categories</option>
            {getAvailableCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            style={selectStyle}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="largest">Largest Amount</option>
            <option value="smallest">Smallest Amount</option>
          </select>
        </div>

        <div style={dateRangeStyle}>
          <div style={dateInputGroupStyle}>
            <label style={dateInputLabelStyle}>Start Date</label>
            <input
              type="date"
              style={selectStyle}
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
          </div>
          <div style={dateInputGroupStyle}>
            <label style={dateInputLabelStyle}>End Date</label>
            <input
              type="date"
              style={selectStyle}
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div style={listStyle}>
        <h2>Transactions</h2>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No transactions yet. Add your first transaction above!
          </div>
        ) : (
          <div>
            {filteredAndSortedTransactions.map((transaction) => (
              <div key={transaction._id} style={itemStyle}>
                <div>
                  <div>{transaction.description}</div>
                  <div style={{ color: '#666' }}>
                    {transaction.type} - {transaction.category} - ${transaction.amount}
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#888' }}>
                    {formatDate(transaction.date)}
                  </div>
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
            {filteredAndSortedTransactions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No transactions found matching your filters
              </div>
            )}
          </div>
        )}
      </div>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTransaction(null);
        }}
        title="Edit Transaction"
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
                type: e.target.value
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
              {/* Add your categories here */}
            </select>
            <input
              type="date"
              value={editingTransaction.date.split('T')[0]}
              onChange={(e) => setEditingTransaction({
                ...editingTransaction,
                date: e.target.value
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

export default TransactionList; 