import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../util-api/api';
import '../css/signup-page.css'
import { FiUser, FiLock, FiCreditCard, FiCheck, FiX } from 'react-icons/fi';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Password strength calculation
    if (formData.password) {
      let strength = 0;
      if (formData.password.length >= 8) strength += 1;
      if (/[A-Z]/.test(formData.password)) strength += 1;
      if (/[0-9]/.test(formData.password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        emp_id: formData.employeeId,
        full_name: formData.fullName,
        password: formData.password,
        privilege: formData.role,
      };

      const response = await register(payload);

      if (response.status === 201 || response.status === 200) {
        toast.success(`${formData.fullName} registered successfully!`, {
          style: {
            background: '#333',
            color: '#fff',
            border: '1px solid #444'
          }
        });
        setFormData({
          employeeId: '',
          fullName: '',
          password: '',
          confirmPassword: '',
          role: 'user'
        });
      } else if (response.status === 409) {
        setErrors({ employeeId: 'User already exists' });
      } else if (response.status === 403) {
        toast.error("Admin privilege required", {
          style: {
            background: '#333',
            color: '#fff',
            border: '1px solid #444'
          }
        });
      } else {
        toast.error("Registration failed", {
          style: {
            background: '#333',
            color: '#fff',
            border: '1px solid #444'
          }
        });
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.", {
        style: {
          background: '#333',
          color: '#fff',
          border: '1px solid #444'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dark-theme-container">
      <div className="dark-signup-card">
        <div className="signup-header">
          <h2>Create Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className={`input-group ${errors.employeeId ? 'error' : ''}`}>
            <div className="input-icon">
              <FiCreditCard />
            </div>
            <input
              type="text"
              name="employeeId"
              placeholder="Employee ID"
              value={formData.employeeId}
              onChange={handleChange}
              className="dark-input"
            />
            {errors.employeeId && <span className="error-message">{errors.employeeId}</span>}
          </div>

          <div className={`input-group ${errors.fullName ? 'error' : ''}`}>
            <div className="input-icon">
              <FiUser />
            </div>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="dark-input"
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          <div className={`input-group ${errors.password ? 'error' : ''}`}>
            <div className="input-icon">
              <FiLock />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="dark-input"
            />
            {formData.password && (
              <div className="password-strength">
                <div className={`strength-bar ${passwordStrength > 0 ? 'active' : ''}`}></div>
                <div className={`strength-bar ${passwordStrength > 1 ? 'active' : ''}`}></div>
                <div className={`strength-bar ${passwordStrength > 2 ? 'active' : ''}`}></div>
                <div className={`strength-bar ${passwordStrength > 3 ? 'active' : ''}`}></div>
              </div>
            )}
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className={`input-group ${errors.confirmPassword ? 'error' : ''}`}>
            <div className="input-icon">
              <FiLock />
            </div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="dark-input"
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="role-selection">
            <label>Account Type</label>
            <div className="role-options">
              <button
                type="button"
                className={`role-btn ${formData.role === 'user' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'user' })}
              >
                <FiUser /> User
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'admin' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'admin' })}
              >
                <FiUser /> Admin
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="signup-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;