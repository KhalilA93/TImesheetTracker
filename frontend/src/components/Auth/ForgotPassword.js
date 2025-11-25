import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/password-reset/request', { email });
      
      if (response.data.success) {
        setMessage(response.data.message);
        setSent(true);
      } else {
        setError(response.data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>📧 Check Your Email</h2>
            <p>Password reset instructions sent</p>
          </div>

          <div className="success-message">
            <div className="success-icon">✅</div>
            <p>{message}</p>
            <p className="email-note">
              Please check your email inbox (and spam folder) for the password reset link.
            </p>
          </div>

          <div className="auth-footer">
            <p>
              Remember your password? <Link to="/login" className="auth-link">Back to Login</Link>
            </p>
            <p>
              Didn't receive the email? 
              <button 
                type="button" 
                className="link-button"
                onClick={() => {
                  setSent(false);
                  setEmail('');
                  setMessage('');
                }}
              >
                Try again
              </button>
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
          <h2>🔐 Forgot Password</h2>
          <p>Enter your email address and we'll send you a link to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">❌</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <span>
                <span className="spinner"></span>
                Sending Reset Link...
              </span>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password? <Link to="/login" className="auth-link">Back to Login</Link>
          </p>
          <p>
            Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
