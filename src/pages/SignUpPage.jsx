import React, { useEffect, useState } from 'react';
import '../css/login-page.css'; // Reuse the same styles
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../util-api/api';
// import { register } from '../util-api/api'; // Uncomment when your API is ready

const SignupPage = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setError('')
  }, [employeeId, fullName, password, confirmPassword, role, setError])

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!employeeId || !fullName || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const payload = {
      emp_id: employeeId,
      full_name: fullName,
      password: password,
      privilege: role,
    };

    try {
      // const response = await register(payload);
      const response = await register(payload)

      console.log("registration result", response)

      if(response.status === 201 || response.status === 200){
        setError('')
        toast.success(`${fullName} is registered`)
        setTimeout(() => {
          setEmployeeId('')
          setFullName('')
          setPassword('')
          setConfirmPassword('')
        }, 2000)
      } else if(response.status === 409){
        setError('User Already Exists')
      } else if (response.status === 403){
        toast.error("Admin Privilege Required")
      }else {
        setError('Cannot Register')
      }
    } catch (err) {
      setError('Something went wrong.');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form">
        <h2 className="login-title">Register</h2>
        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label htmlFor="employeeId">Employee ID</label>
            <input
              type="text"
              id="employeeId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Role</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={() => setRole('user')}
                /> User
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                /> Admin
              </label>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">Register</button>
        </form>
        <p className="link-text">
          Already have an account? <a href="/login">Log In</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
