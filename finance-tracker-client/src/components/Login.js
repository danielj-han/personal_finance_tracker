import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasCapital = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!minLength) return 'Password must be at least 8 characters long';
    if (!hasCapital) return 'Password must contain at least one capital letter';
    if (!hasSpecial) return 'Password must contain at least one special character';
    return null;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username) => {
    return !/\s/.test(username); // No spaces allowed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      // Registration validation
      if (!formData.firstName || !formData.lastName) {
        setError('First name and last name are required');
        return;
      }

      if (!validateUsername(formData.username)) {
        setError('Username cannot contain spaces');
        return;
      }

      if (!validateEmail(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formStyle = {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd'
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px'
  };

  const toggleStyle = {
    textAlign: 'center',
    color: '#1976d2',
    cursor: 'pointer',
    textDecoration: 'underline'
  };

  const passwordContainerStyle = {
    position: 'relative',
    width: '100%',
    marginBottom: '10px'
  };

  const passwordToggleStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    fontSize: '18px',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // Eye icon components
  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      {!isLogin && (
        <>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            style={inputStyle}
            required={!isLogin}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            style={inputStyle}
            required={!isLogin}
          />
          <input
            type="text"
            name="username"
            placeholder="Username (no spaces)"
            value={formData.username}
            onChange={handleChange}
            style={inputStyle}
            required={!isLogin}
          />
        </>
      )}

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        style={inputStyle}
        required
      />

      <div style={passwordContainerStyle}>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder={isLogin ? "Password" : "Password (8+ chars, 1 capital, 1 special)"}
          value={formData.password}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={passwordToggleStyle}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      <button type="submit" style={buttonStyle}>
        {isLogin ? 'Login' : 'Register'}
      </button>

      <div 
        style={toggleStyle}
        onClick={() => {
          setIsLogin(!isLogin);
          setError('');
          setShowPassword(false);
          setFormData({
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            password: ''
          });
        }}
      >
        {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
      </div>
    </form>
  );
};

export default Login; 