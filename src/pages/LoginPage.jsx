import React, { useState } from 'react';
import '../css/login-page.css'
import { login } from '../util-api/api';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [empid, setEmpid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault();
    // In a real application, you would send these credentials to your backend
    if (empid && password) {
      const response = await login(empid, password)
      if(response?.authToken){
        window.localStorage.setItem("authToken", response.authToken)
        navigate('/')
        setError('');
      } else {
        setError('Could Not Log In');
      }
      // Redirect to your main application page here
    } else {
      setError('Invalid employee id or password.');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="empid">Employee ID</label>
            <input
              type="text"
              id="empid"
              value={empid}
              onChange={(e) => setEmpid(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">Log In</button>
        </form>
        <p className="link-text">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;