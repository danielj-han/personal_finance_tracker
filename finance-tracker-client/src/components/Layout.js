import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  };

  const sidebarStyle = {
    width: '250px',
    minHeight: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    backgroundColor: '#1976d2',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
  };

  const sidebarContentStyle = {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto'
  };

  const mainContentStyle = {
    marginLeft: '250px',
    flex: 1,
    padding: '40px',
    maxWidth: '1200px',
    width: '100%',
    boxSizing: 'border-box'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    display: 'block',
    padding: '12px 15px',
    margin: '5px 0',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  };

  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  };

  const logoutButtonStyle = {
    ...linkStyle,
    marginTop: 'auto',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    cursor: 'pointer',
    border: 'none',
    fontSize: '16px',
    textAlign: 'left'
  };

  const headerStyle = {
    marginBottom: '30px'
  };

  const userStyle = {
    padding: '15px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '20px'
  };

  const menuItems = [
    { path: '/', label: 'Transactions' },
    { path: '/budgets', label: 'Budget Goals' },
    { path: '/dashboard', label: 'Financial Dashboard' }
  ];

  return (
    <div style={containerStyle}>
      <div style={sidebarStyle}>
        <div style={sidebarContentStyle}>
          <div style={headerStyle}>
            <h2 style={{ margin: 0, fontSize: '24px' }}>Finance Tracker</h2>
          </div>
          <div style={userStyle}>
            Welcome, {user?.firstName || 'User'}
          </div>
          <nav style={{ flex: 1 }}>
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                style={location.pathname === item.path ? activeLinkStyle : linkStyle}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button onClick={logout} style={logoutButtonStyle}>
            Logout
          </button>
        </div>
      </div>
      <main style={mainContentStyle}>
        {children}
      </main>
    </div>
  );
};

export default Layout; 