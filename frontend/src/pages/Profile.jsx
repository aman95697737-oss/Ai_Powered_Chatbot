import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldCheck, ArrowLeft, LogOut, Calendar } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-card-container text-center">
          <p>Please log in to view your profile.</p>
          <Link to="/login" className="auth-link">Go to Login</Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-ambient-glow"></div>

      <div className="auth-card-container animate-fade-in">
        <div className="profile-header-card">
          <div className="profile-avatar-circle">
            {getInitials(user.name)}
          </div>
          <h1 className="profile-name-title">{user.name}</h1>
          <span className="profile-status-badge">
            <ShieldCheck size={14} />
            <span>Verified Student Account</span>
          </span>
        </div>

        <div className="profile-details-grid">
          <div className="detail-item">
            <div className="detail-label">
              <Mail size={14} className="text-yellow" />
              <span>Email Address</span>
            </div>
            <div className="detail-value">{user.email}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <User size={14} className="text-yellow" />
              <span>Full Name</span>
            </div>
            <div className="detail-value">{user.name}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <Calendar size={14} className="text-yellow" />
              <span>Account Status</span>
            </div>
            <div className="detail-value text-green">Active & Authenticated</div>
          </div>
        </div>

        <div className="profile-actions-column">
          <button
            type="button"
            className="auth-primary-btn full-width"
            onClick={() => navigate('/chat')}
          >
            Open Chatbot
          </button>

          <button
            type="button"
            className="logout-outline-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>

        <div className="auth-footer-row">
          <button
            type="button"
            className="back-link btn-as-link"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
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
        .profile-header-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
        }
        .profile-avatar-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #facc15;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: 900;
          box-shadow: 0 0 20px rgba(250, 204, 21, 0.5);
          margin-bottom: 12px;
        }
        .profile-name-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 6px 0;
        }
        .profile-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(250, 204, 21, 0.12);
          border: 1px solid rgba(250, 204, 21, 0.4);
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 0.76rem;
          font-weight: 700;
          color: #facc15;
        }
        .profile-details-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        .detail-item {
          background: #14141c;
          border: 1px solid rgba(250, 204, 21, 0.2);
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .detail-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #d1d5db;
          font-weight: 600;
        }
        .detail-value {
          font-size: 0.92rem;
          font-weight: 700;
          color: #ffffff;
          word-break: break-all;
        }
        .text-yellow {
          color: #facc15;
        }
        .text-green {
          color: #4ade80;
        }
        .profile-actions-column {
          display: flex;
          flex-direction: column;
          gap: 10px;
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
        }
        .auth-primary-btn.full-width {
          width: 100%;
        }
        .auth-primary-btn:hover {
          background: #fef08a;
          transform: translateY(-1px);
        }
        .logout-outline-btn {
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fca5a5;
          border-radius: 10px;
          padding: 11px 20px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .logout-outline-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: #ef4444;
          color: #ffffff;
        }
        .auth-footer-row {
          margin-top: 20px;
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
        .btn-as-link {
          background: none;
          border: none;
          cursor: pointer;
        }
        @media (max-width: 640px) {
          .auth-card-container {
            padding: 24px 18px;
            border-radius: 16px;
            width: 100%;
          }
          .profile-avatar-circle {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
