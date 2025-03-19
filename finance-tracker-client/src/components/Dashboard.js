import React from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { format, eachDayOfInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = ({ transactions, dateRange }) => {
  // Prepare data for spending over time chart
  const prepareSpendingData = () => {
    const days = eachDayOfInterval({
      start: dateRange.start,
      end: dateRange.end
    });

    const dailyTotals = days.map(day => {
      const dayTransactions = transactions.filter(t => 
        new Date(t.date).toDateString() === day.toDateString()
      );
      
      return {
        date: format(day, 'MMM dd'),
        expenses: dayTransactions
          .filter(t => t.type === 'Expense')
          .reduce((sum, t) => sum + t.amount, 0),
        income: dayTransactions
          .filter(t => t.type === 'Income')
          .reduce((sum, t) => sum + t.amount, 0)
      };
    });

    return {
      labels: dailyTotals.map(d => d.date),
      datasets: [
        {
          label: 'Expenses',
          data: dailyTotals.map(d => d.expenses),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Income',
          data: dailyTotals.map(d => d.income),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }
      ]
    };
  };

  // Prepare data for category distribution chart
  const prepareCategoryData = () => {
    const categoryTotals = transactions
      .filter(t => t.type === 'Expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    return {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }]
    };
  };

  const chartStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  return (
    <div>
      <h2>Financial Dashboard</h2>
      
      <div style={chartStyle}>
        <h3>Spending Over Time</h3>
        <Line data={prepareSpendingData()} />
      </div>

      <div style={chartStyle}>
        <h3>Expense Distribution by Category</h3>
        <Pie data={prepareCategoryData()} />
      </div>
    </div>
  );
};

export default Dashboard; 