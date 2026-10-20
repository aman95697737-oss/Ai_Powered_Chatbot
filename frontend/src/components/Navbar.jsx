import React from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  LogIn,
  UserPlus
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const handleNavHome = () => {
    navigate('/');
  };

  return (
    <header className="navbar-wrapper glass-panel">
      <div className="nav-container">
        {/* Brand Logo & Name */}
        <div 
          className="brand-logo cursor-pointer" 
          onClick={handleNavHome}
          title="UniAssist AI Student Hub"
        >
          <div className="logo-badge">
            <GraduationCap className="icon-grad" size={22} />
            <Sparkles className="icon-sparkle" size={13} />
          </div>
          <div className="brand-text">
            <span className="brand-title">
              UniAssist <span className="text-yellow-glow">Student Hub</span>
            </span>
            <span className="brand-subtitle">CAMPUS AI ASSISTANT</span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="nav-links hide-on-mobile">
          <button 
            className="nav-link active"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Home
          </button>
          <button 
            className="nav-link"
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Features
          </button>
          <button 
            className="nav-link"
            onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            How It Works
          </button>
        </nav>

        {/* Right Actions: Clean Login & Register buttons or Profile Dropdown */}
        <div className="nav-actions">
          {isAuthenticated && user ? (
            <UserProfile />
          ) : (
            <div className="auth-buttons-group">
              <button 
                className="btn-nav-login"
                onClick={() => navigate('/login')}
                title="Sign In to Your Account"
              >
                <LogIn size={15} />
                <span>Login</span>
              </button>
              <button 
                className="btn-nav-register"
                onClick={() => navigate('/register')}
                title="Create Student Account"
              >
                <UserPlus size={15} />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar-wrapper {
          position: sticky;
          top: 16px;
          margin: 0 auto;
          width: calc(100% - 64px);
          max-width: 1320px;
          z-index: 60;
          padding: 10px 24px;
          border-radius: 9999px;
          background: rgba(10, 10, 14, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(250, 204, 21, 0.25);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.95), 0 0 20px rgba(250, 204, 21, 0.08);
          transition: all 0.3s ease;
        }
        .navbar-wrapper:hover {
          border-color: rgba(250, 204, 21, 0.4);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.98), 0 0 26px rgba(250, 204, 21, 0.12);
        }
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          user-select: none;
        }
        .logo-badge {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #000000;
          border: 1px solid rgba(250, 204, 21, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(250, 204, 21, 0.25);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .brand-logo:hover .logo-badge {
          transform: scale(1.04);
          border-color: #facc15;
          box-shadow: 0 0 16px rgba(250, 204, 21, 0.4);
        }
        .icon-grad {
          color: #facc15;
        }
        .icon-sparkle {
          position: absolute;
          top: 3px;
          right: 3px;
          color: #facc15;
        }
        .brand-text {
          display: flex;
          flex-direction: column;
        }
        .brand-title {
          font-size: 1.02rem;
          font-weight: 800;
          letter-spacing: -0.3px;
          color: #ffffff;
        }
        .text-yellow-glow {
          color: #facc15;
          text-shadow: 0 0 12px rgba(250, 204, 21, 0.4);
        }
        .brand-subtitle {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.8px;
          color: #9ca3af;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 0, 0, 0.4);
          padding: 4px 6px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .nav-link {
          background: transparent;
          border: none;
          color: #9ca3af;
          font-size: 0.86rem;
          font-weight: 600;
          padding: 7px 16px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .nav-link:hover {
          color: #ffffff;
          background: rgba(250, 204, 21, 0.1);
        }
        .nav-link.active {
          color: #000000;
          background: #facc15;
          font-weight: 800;
          box-shadow: 0 2px 10px rgba(250, 204, 21, 0.35);
        }
        .nav-actions {
          display: flex;
          align-items: center;
        }
        .auth-buttons-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn-nav-login {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(250, 204, 21, 0.05);
          border: 1px solid rgba(250, 204, 21, 0.35);
          color: #ffffff;
          padding: 8px 18px;
          border-radius: 9999px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-nav-login:hover {
          border-color: #facc15;
          background: rgba(250, 204, 21, 0.15);
          color: #facc15;
          box-shadow: 0 0 14px rgba(250, 204, 21, 0.25);
          transform: translateY(-1px);
        }
        .btn-nav-register {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #facc15;
          color: #000000;
          border: 1px solid #facc15;
          padding: 8px 20px;
          border-radius: 9999px;
          font-size: 0.84rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(250, 204, 21, 0.35);
        }
        .btn-nav-register:hover {
          background: #fef08a;
          border-color: #fef08a;
          box-shadow: 0 6px 20px rgba(250, 204, 21, 0.5);
          transform: translateY(-1px);
        }
        @media (max-width: 900px) {
          .hide-on-mobile {
            display: none;
          }
          .navbar-wrapper {
            padding: 8px 16px;
            width: calc(100% - 24px);
          }
        }
      `}</style>
    </header>
  );
}
