import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  startOfWeek, 
  startOfMonth, 
  startOfQuarter, 
  startOfYear,
  endOfWeek,
  endOfMonth,
  endOfQuarter,
  endOfYear
} from 'date-fns';
import EditModal from './EditModal';

const BudgetManager = () => {
  // Predefined color options
  const colorOptions = {
    blue: '#1976d2',
    green: '#2e7d32',
    purple: '#7b1fa2',
    orange: '#ed6c02',
    red: '#d32f2f',
    teal: '#0d7377',
  };

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    color: '#1976d2'
  });
  const [editingBudget, setEditingBudget] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Define fetch functions first
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, []);

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/budgets');
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/categories');
      const expenseCategories = response.data.Expense;
      setCategories(expenseCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Then define refreshData
  const refreshData = useCallback(() => {
    fetchTransactions();
    fetchBudgets();
  }, [fetchTransactions, fetchBudgets]);

  // Initial data fetch
  useEffect(() => {
    fetchBudgets();
    fetchCategories();
    fetchTransactions();
  }, [fetchBudgets, fetchCategories, fetchTransactions]);

  // Listen for transaction updates
  useEffect(() => {
    window.addEventListener('transactionUpdated', refreshData);
    return () => {
      window.removeEventListener('transactionUpdated', refreshData);
    };
  }, [refreshData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add startDate if not present
      const budgetData = {
        ...newBudget,
        amount: Number(newBudget.amount),
        startDate: new Date(), // Add current date as startDate
      };

      await axios.post('http://localhost:5001/api/budgets', budgetData);
      fetchBudgets();
      setNewBudget({
        category: '',
        amount: '',
        period: 'monthly',
        color: '#1976d2',
        startDate: new Date()
      });
    } catch (error) {
      console.error('Error creating budget:', error.response?.data?.message || error.message);
      alert(error.response?.data?.message || 'Error creating budget');
    }
  };

  const calculateProgress = (budget) => {
    const now = new Date();
    let periodStart, periodEnd;

    switch (budget.period) {
      case 'weekly':
        periodStart = startOfWeek(now);
        periodEnd = endOfWeek(now);
        break;
      case 'monthly':
        periodStart = startOfMonth(now);
        periodEnd = endOfMonth(now);
        break;
      case 'quarterly':
        periodStart = startOfQuarter(now);
        periodEnd = endOfQuarter(now);
        break;
      case 'yearly':
        periodStart = startOfYear(now);
        periodEnd = endOfYear(now);
        break;
      default:
        periodStart = startOfMonth(now);
        periodEnd = endOfMonth(now);
    }

    // Now transactions is defined from the state
    const spending = transactions
      .filter(t => 
        t.category === budget.category &&
        new Date(t.date) >= periodStart &&
        new Date(t.date) <= periodEnd &&
        t.type === 'Expense' // Only count expenses towards budget
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return (spending / budget.amount) * 100;
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#dc3545'; // Red
    if (progress >= 80) return '#ffc107';  // Yellow
    return '#28a745'; // Green
  };

  const BudgetProgressBar = ({ budget }) => {
    const progress = calculateProgress(budget);
    const progressColor = getProgressColor(progress);

    return (
      <div style={{ marginTop: '10px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '5px'
        }}>
          <span>{Math.min(progress, 100).toFixed(1)}% used</span>
          {progress > 100 && (
            <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
              Over budget!
            </span>
          )}
        </div>
        <div style={{
          height: '10px',
          backgroundColor: '#e9ecef',
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(progress, 100)}%`,
            height: '100%',
            backgroundColor: progressColor,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
    );
  };

  const formStyle = {
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  // Add function to delete a budget
  const handleDelete = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget goal?')) {
      try {
        await axios.delete(`http://localhost:5001/api/budgets/${budgetId}`);
        fetchBudgets(); // Refresh the budgets list
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  // Add edit handler
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5001/api/budgets/${editingBudget._id}`, {
        category: editingBudget.category,
        amount: Number(editingBudget.amount),
        period: editingBudget.period,
        color: editingBudget.color
      });

      setIsEditModalOpen(false);
      setEditingBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Failed to update budget');
    }
  };

  return (
    <div>
      <h2>Budget Goals</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '10px',
          width: '100%'
        }}>
          <select
            value={newBudget.category}
            onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
            required
            style={{ ...inputStyle, flex: '3' }}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={newBudget.color}
            onChange={(e) => setNewBudget({ ...newBudget, color: e.target.value })}
            style={{ ...inputStyle, flex: '1' }}
          >
            {Object.entries(colorOptions).map(([name, value]) => (
              <option key={value} value={value} style={{ backgroundColor: value }}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <input
          type="number"
          value={newBudget.amount}
          onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
          placeholder="Budget Amount"
          required
          style={inputStyle}
        />

        <select
          value={newBudget.period}
          onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value })}
          style={inputStyle}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>

        <button type="submit" style={buttonStyle}>
          Add Budget
        </button>
      </form>

      <div>
        {budgets.map(budget => (
          <div 
            key={budget._id} 
            style={{
              ...formStyle,
              borderLeft: `4px solid ${budget.color}`,
              borderRadius: '8px',
              position: 'relative',
              marginBottom: '10px',
              padding: '15px'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              gap: '10px'
            }}>
              <button
                onClick={() => {
                  setEditingBudget(budget);
                  setIsEditModalOpen(true);
                }}
                style={{
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(budget._id)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            <div>
              <h3 style={{ margin: 0, color: budget.color }}>{budget.category}</h3>
              <p style={{ margin: '5px 0' }}>
                Budget: ${budget.amount} ({budget.period})
              </p>
            </div>
            <BudgetProgressBar budget={budget} />
          </div>
        ))}
      </div>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBudget(null);
        }}
        title="Edit Budget Goal"
      >
        {editingBudget && (
          <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <select
              value={editingBudget.category}
              onChange={(e) => setEditingBudget({
                ...editingBudget,
                category: e.target.value
              })}
              required
              style={inputStyle}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={editingBudget.color}
              onChange={(e) => setEditingBudget({
                ...editingBudget,
                color: e.target.value
              })}
              style={inputStyle}
            >
              {Object.entries(colorOptions).map(([name, value]) => (
                <option key={value} value={value} style={{ backgroundColor: value }}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={editingBudget.amount}
              onChange={(e) => setEditingBudget({
                ...editingBudget,
                amount: e.target.value
              })}
              placeholder="Budget Amount"
              required
              style={inputStyle}
            />

            <select
              value={editingBudget.period}
              onChange={(e) => setEditingBudget({
                ...editingBudget,
                period: e.target.value
              })}
              style={inputStyle}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>

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

export default BudgetManager; 