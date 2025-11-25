import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [success, setSuccess] = useState(false);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await api.get(`/password-reset/verify/${token}`);
        if (response.data.success) {
          setTokenValid(true);
          setUserEmail(response.data.userEmail);
        } else {
          setError(response.data.message || 'Invalid or expired reset token');
          setTokenValid(false);
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setError(error.response?.data?.message || 'Invalid or expired reset token');
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError('No reset token provided');
      setVerifying(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post(`/password-reset/reset/${token}`, {
        password,
        confirmPassword
      });
      
      if (response.data.success) {
        setMessage(response.data.message);
        setSuccess(true);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Password reset successfully! Please login with your new password.' }
          });
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>🔍 Verifying Reset Token</h2>
            <p>Please wait while we verify your reset link...</p>
          </div>
          <div className="loading-spinner">
            <span className="spinner"></span>
            <p>Verifying...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>❌ Invalid Reset Link</h2>
            <p>This password reset link is invalid or has expired</p>
          </div>

          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>

          <div className="auth-footer">
            <p>
              <Link to="/forgot-password" className="auth-link">Request a new reset link</Link>
            </p>
            <p>
              <Link to="/login" className="auth-link">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>✅ Password Reset Successful</h2>
            <p>Your password has been updated successfully</p>
          </div>

          <div className="success-message">
            <div className="success-icon">🎉</div>
            <p>{message}</p>
            <p className="redirect-note">
              Redirecting to login page in 3 seconds...
            </p>
          </div>

          <div className="auth-footer">
            <p>
              <Link to="/login" className="auth-link">Login Now</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>🔐 Reset Your Password</h2>
          <p>Enter a new password for {userEmail}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">❌</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password (min. 6 characters)"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="password-requirements">
            <p>Password requirements:</p>
            <ul>
              <li className={password.length >= 6 ? 'valid' : ''}>
                At least 6 characters long
              </li>
              <li className={password === confirmPassword && password ? 'valid' : ''}>
                Passwords match
              </li>
            </ul>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || password.length < 6 || password !== confirmPassword}
          >
            {loading ? (
              <span>
                <span className="spinner"></span>
                Resetting Password...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password? <Link to="/login" className="auth-link">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
