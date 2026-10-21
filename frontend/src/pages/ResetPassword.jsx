import React, { useState } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import OTPInput from '../components/OTPInput';
import { resetPassword, resendOtp } from '../services/authService';
import { Lock, AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Sparkles } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const email = searchParams.get('email') || '';
  const [devOtp, setDevOtp] = useState(location.state?.devOtp || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Missing email address. Please start password recovery again.');
      return;
    }
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit recovery code.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Confirm password must match new password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await resetPassword({
        email,
        otp,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      if (res.success) {
        setSuccessMsg('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { state: { email, registered: false } });
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Password reset failed. Please check OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      setError('');
      const res = await resendOtp({ email, purpose: 'forgot_password' });
      if (res.dev_otp) setDevOtp(res.dev_otp);
      setSuccessMsg('A new recovery code has been sent to your email.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Could not resend code. Please try again shortly.');
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

        <h1 className="auth-heading">Set New Password</h1>
        <p className="auth-subheading">
          Enter the 6-digit code sent to <strong className="text-yellow">{email}</strong> and choose your new password.
        </p>

        {devOtp && (
          <div className="dev-otp-card animate-fade-in">
            <div className="dev-otp-header">
              <Sparkles size={14} className="text-yellow" />
              <span>Development Mode OTP:</span>
              <strong className="dev-otp-code">{devOtp}</strong>
            </div>
            <button
              type="button"
              className="dev-otp-autofill-btn"
              onClick={() => {
                setOtp(devOtp);
              }}
            >
              Auto-Fill OTP
            </button>
          </div>
        )}

        {error && (
          <div className="auth-error-alert animate-shake">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-success-alert animate-fade-in">
            <CheckCircle2 size={16} className="flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleReset} className="auth-form">
          {/* OTP Section */}
          <div className="form-group">
            <label className="form-label text-center">6-Digit Recovery Code</label>
            <OTPInput
              length={6}
              value={otp}
              onChange={(val) => {
                setOtp(val);
                if (error) setError('');
              }}
              disabled={loading}
              onResend={handleResend}
              resendCooldown={60}
            />
          </div>

          {/* New Password */}
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••••"
                className="form-input"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••••"
                className="form-input"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-primary-btn"
            disabled={loading || otp.length !== 6 || !newPassword}
          >
            {loading ? (
              <span className="btn-spinner"></span>
            ) : (
              <span>Update Password</span>
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
          width: 100%;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
          color: #ffffff;
          overflow-x: hidden;
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
          color: #d1d5db;
          margin: 0 0 20px 0;
          line-height: 1.5;
        }
        .text-yellow {
          color: #facc15;
        }
        .dev-otp-card {
          background: rgba(250, 204, 21, 0.1);
          border: 1px solid rgba(250, 204, 21, 0.5);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          box-shadow: 0 0 16px rgba(250, 204, 21, 0.15);
        }
        .dev-otp-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #ffffff;
        }
        .dev-otp-code {
          color: #facc15;
          font-size: 1.1rem;
          letter-spacing: 2px;
          font-family: monospace;
          font-weight: 700;
        }
        .dev-otp-autofill-btn {
          background: #facc15;
          color: #000000;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .dev-otp-autofill-btn:hover {
          background: #fef08a;
          transform: scale(1.02);
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
          margin-bottom: 16px;
        }
        .auth-success-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.5);
          color: #86efac;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 600;
          margin-bottom: 16px;
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
          color: #d1d5db;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .back-link:hover {
          color: #facc15;
        }
        @media (max-width: 640px) {
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
          .dev-otp-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
