import React, { useState } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import OTPInput from '../components/OTPInput';
import { verifyRegisterOtp, resendOtp } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { MailCheck, AlertCircle, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const email = searchParams.get('email') || '';
  const [devOtp, setDevOtp] = useState(location.state?.devOtp || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async (codeToVerify) => {
    const finalCode = codeToVerify || otp;
    if (!email) {
      setError('Missing email address. Please start registration again.');
      return;
    }
    if (!finalCode || finalCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await verifyRegisterOtp({ email, otp: finalCode });
      if (res.success) {
        if (res.user) {
          login(res.user);
          setSuccessMsg(`Welcome, ${res.user.name}! Your account is verified and you are now logged in.`);
        } else {
          setSuccessMsg('Email verified successfully! Opening chatbot...');
        }
        setTimeout(() => {
          navigate('/chat', { replace: true });
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      setError('');
      const res = await resendOtp({ email, purpose: 'register' });
      if (res.dev_otp) setDevOtp(res.dev_otp);
      setSuccessMsg('A new 6-digit verification code has been dispatched to your email.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Could not resend OTP. Please try again shortly.');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-ambient-glow"></div>

      <div className="auth-card-container animate-fade-in text-center">
        {/* Brand Header */}
        <div className="auth-brand-row justify-center">
          <div className="yellow-square-badge">
            <span className="badge-inner-square"></span>
          </div>
          <span className="brand-title">UniAssist AI</span>
        </div>

        <div className="verify-icon-bubble">
          <MailCheck size={32} className="text-yellow" />
        </div>

        <h1 className="auth-heading">Verify Your Email</h1>
        <p className="auth-subheading">
          We sent a 6-digit verification code to
          <br />
          <strong className="text-white-bold">{email || 'your email address'}</strong>
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
                handleVerify(devOtp);
              }}
            >
              Auto-Fill & Verify
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

        <div className="verify-form-body">
          <OTPInput
            length={6}
            value={otp}
            onChange={(val) => {
              setOtp(val);
              if (error) setError('');
            }}
            onComplete={(code) => handleVerify(code)}
            disabled={loading}
            onResend={handleResend}
            resendCooldown={60}
          />

          <button
            type="button"
            className="auth-primary-btn full-width"
            onClick={() => handleVerify(otp)}
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <span className="btn-spinner"></span>
            ) : (
              <span>Verify OTP</span>
            )}
          </button>
        </div>

        <div className="back-to-login-row">
          <Link to="/register" className="back-link">
            <ArrowLeft size={14} />
            <span>Change registration email</span>
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
          text-align: center;
        }
        .auth-brand-row {
          display: flex;
          align-items: center;
          justify-content: center;
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
        .verify-icon-bubble {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(250, 204, 21, 0.1);
          border: 1px solid rgba(250, 204, 21, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
          box-shadow: 0 0 20px rgba(250, 204, 21, 0.2);
        }
        .text-yellow {
          color: #facc15;
        }
        .text-white-bold {
          color: #facc15;
          font-weight: 700;
        }
        .auth-heading {
          font-size: 1.55rem;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: #ffffff;
        }
        .auth-subheading {
          font-size: 0.88rem;
          color: #d1d5db;
          margin: 0 0 20px 0;
          line-height: 1.5;
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
          text-align: left;
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
          text-align: left;
        }
        .verify-form-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .auth-primary-btn {
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
        .auth-primary-btn.full-width {
          width: 100%;
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
        .back-to-login-row {
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
