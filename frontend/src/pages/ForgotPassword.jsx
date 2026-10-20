import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import { Mail, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await forgotPassword({ email: email.trim().toLowerCase() });
      if (res.success) {
        navigate(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
          state: { devOtp: res.dev_otp }
        });
      }
    } catch (err) {
      setError(err.message || 'Could not send reset code. Please verify email and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-ambient-glow"></div>

      <div className="auth-card-container animate-fade-in">
        <div className="auth-brand-row">
          <div className="yellow-square-badge">
            <span className="badge-inner-square"></span>
          </div>
          <span className="brand-title">UniAssist AI</span>
        </div>

        <h1 className="auth-heading">Forgot Password</h1>
        <p className="auth-subheading">
          Enter your registered email address and we'll send you a 6-digit recovery code.
        </p>

        {error && (
          <div className="auth-error-alert animate-shake">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="student@gmail.com"
                className="form-input"
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-primary-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-spinner"></span>
            ) : (
              <>
                <span>Send Reset Code</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-row">
          <Link to="/login" className="back-link">
            <ArrowLeft size={14} />
            <span>Back to login</span>
          </Link>
        </div>
      </div>

      <style>{`
        .auth-page-wrapper {
          min-height: 100vh;
          width: 100vw;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          color: #ffffff;
        }
        .auth-ambient-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(250, 204, 21, 0.08) 0%, rgba(0, 0, 0, 0) 70%);
          pointer-events: none;
        }
        .auth-card-container {
          width: 100%;
          max-width: 440px;
          background: #0d0d12;
          border: 1px solid rgba(250, 204, 21, 0.4);
          border-radius: 20px;
          padding: 36px 32px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.95), 0 0 30px rgba(250, 204, 21, 0.15);
          position: relative;
          z-index: 10;
        }
        .auth-brand-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .yellow-square-badge {
          width: 24px;
          height: 24px;
          background: #facc15;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(250, 204, 21, 0.6);
        }
        .badge-inner-square {
          width: 8px;
          height: 8px;
          background: #000000;
          border-radius: 2px;
        }
        .brand-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #ffffff;
        }
        .auth-heading {
          font-size: 1.55rem;
          font-weight: 800;
          margin: 0 0 6px 0;
          color: #ffffff;
        }
        .auth-subheading {
          font-size: 0.85rem;
          color: #9ca3af;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }
        .auth-error-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.5);
          color: #fca5a5;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: #d1d5db;
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: #facc15;
          pointer-events: none;
        }
        .form-input {
          width: 100%;
          background: #14141c;
          border: 1px solid rgba(250, 204, 21, 0.3);
          border-radius: 10px;
          padding: 11px 14px 11px 40px;
          font-size: 0.9rem;
          color: #ffffff;
          outline: none;
          transition: all 0.2s ease;
        }
        .form-input:focus {
          border-color: #facc15;
          background: #181822;
          box-shadow: 0 0 14px rgba(250, 204, 21, 0.25);
        }
        .auth-primary-btn {
          margin-top: 8px;
          background: #facc15;
          color: #000000;
          border: none;
          border-radius: 10px;
          padding: 12px 20px;
          font-size: 0.95rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(250, 204, 21, 0.35);
        }
        .auth-primary-btn:hover:not(:disabled) {
          background: #fef08a;
          transform: translateY(-1px);
        }
        .auth-primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0, 0, 0, 0.3);
          border-top-color: #000000;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .auth-footer-row {
          margin-top: 24px;
          display: flex;
          justify-content: center;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.84rem;
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .back-link:hover {
          color: #facc15;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
