import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { User, Mail, Lock, AlertCircle, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirm_password } = formData;

    // Validation
    if (!name.trim()) {
      setError('Full Name cannot be empty');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm_password) {
      setError('Confirm password must match password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        confirm_password
      });

      if (res.success) {
        // Redirect to OTP verification page
        navigate(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
          state: { devOtp: res.dev_otp }
        });
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Background radial glow */}
      <div className="auth-ambient-glow"></div>

      {/* Top Floating Back Button to Home */}
      <button 
        type="button" 
        className="top-floating-back-btn"
        onClick={() => navigate('/')}
        title="Return to Home Page"
      >
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </button>

      <div className="auth-card-container animate-fade-in">
        {/* Brand header & Back Button */}
        <div className="auth-brand-row">
          <div className="brand-logo-group">
            <div className="yellow-square-badge">
              <span className="badge-inner-square"></span>
            </div>
            <span className="brand-title">UniAssist AI</span>
          </div>

          <button
            type="button"
            className="auth-back-pill-btn"
            onClick={() => navigate('/')}
            title="Return to Home"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>
        </div>

        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-subheading">
          Join the AI university student assistant portal
        </p>

        {error && (
          <div className="auth-error-alert animate-shake">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Aman Yadav"
                className="form-input"
                autoComplete="name"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className="form-input"
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••"
                className="form-input"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="••••••••••"
                className="form-input"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-primary-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-spinner"></span>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-row">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-link">Login</Link>
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
          overflow: hidden;
          color: #ffffff;
        }
        .auth-ambient-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(250, 204, 21, 0.08) 0%, rgba(0, 0, 0, 0) 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
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
        .top-floating-back-btn {
          position: absolute;
          top: 24px;
          left: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(17, 17, 22, 0.85);
          border: 1px solid rgba(250, 204, 21, 0.4);
          color: #f3f4f6;
          padding: 8px 16px;
          border-radius: 9999px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.8), 0 0 10px rgba(250, 204, 21, 0.15);
          backdrop-filter: blur(8px);
          z-index: 50;
        }
        .top-floating-back-btn:hover {
          background: #facc15;
          color: #000000;
          border-color: #facc15;
          box-shadow: 0 0 20px rgba(250, 204, 21, 0.45);
          transform: translateY(-1px);
        }
        .auth-brand-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .brand-logo-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .auth-back-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(250, 204, 21, 0.08);
          border: 1px solid rgba(250, 204, 21, 0.35);
          border-radius: 9999px;
          padding: 5px 12px;
          color: #d1d5db;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .auth-back-pill-btn:hover {
          background: #facc15;
          color: #000000;
          border-color: #facc15;
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
          letter-spacing: 0.5px;
          color: #ffffff;
        }
        .auth-heading {
          font-size: 1.55rem;
          font-weight: 800;
          margin: 0 0 6px 0;
          color: #ffffff;
          letter-spacing: -0.5px;
        }
        .auth-subheading {
          font-size: 0.85rem;
          color: #d1d5db;
          margin: 0 0 24px 0;
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
          font-size: 0.85rem;
          font-weight: 700;
          color: #ffffff;
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
          box-shadow: 0 6px 20px rgba(250, 204, 21, 0.5);
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
          text-align: center;
          font-size: 0.86rem;
          color: #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .auth-link {
          color: #facc15;
          font-weight: 700;
          text-decoration: underline;
          transition: color 0.15s ease;
        }
        .auth-link:hover {
          color: #fef08a;
        }
        @media (max-width: 640px) {
          .top-floating-back-btn {
            display: none;
          }
          .auth-card-container {
            padding: 24px 18px;
            border-radius: 16px;
            width: 100%;
          }
          .auth-heading {
            font-size: 1.35rem;
          }
          .form-input {
            font-size: 16px;
            padding: 10px 12px 10px 38px;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
