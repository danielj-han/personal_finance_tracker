import React from 'react';
import axios from 'axios';

const DataExport = ({ transactions }) => {
  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category'];
    const csvData = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.amount,
      t.type,
      t.category
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5001/api/transactions/export/pdf', {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  return (
    <div>
      <h3>Export Data</h3>
      <button onClick={exportToCSV}>Export to CSV</button>
      <button onClick={exportToPDF}>Export to PDF</button>
    </div>
  );
};

export default DataExport; 