import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../util-api/api';
import '../css/login-page.css'
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    empid: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!credentials.empid || !credentials.password) {
      setError('Both fields are required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(credentials.empid, credentials.password);
      
      if (response?.authToken) {
        window.localStorage.setItem("authToken", response.authToken);
        toast.success('Login successful!', {
          style: {
            background: '#333',
            color: '#fff',
            border: '1px solid #444'
          }
        });
        navigate('/home');
      } else {
        setError('Invalid credentials');
        toast.error('Could not log in', {
          style: {
            background: '#333',
            color: '#fff',
            border: '1px solid #444'
          }
        });
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      toast.error('Login failed', {
        style: {
          background: '#333',
          color: '#fff',
          border: '1px solid #444'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark-theme-container">
      <div className="dark-login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access your account</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className={`input-group ${error ? 'error' : ''}`}>
            <div className="input-icon">
              <FiUser />
            </div>
            <input
              type="text"
              name="empid"
              placeholder="Employee ID"
              value={credentials.empid}
              onChange={handleChange}
              className="dark-input"
              autoFocus
            />
          </div>

          <div className={`input-group ${error ? 'error' : ''}`}>
            <div className="input-icon">
              <FiLock />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              className="dark-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-btn"
            disabled={isLoading}
          >
            <FiLogIn className="btn-icon" />
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <a href="/register" className="register-link">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;