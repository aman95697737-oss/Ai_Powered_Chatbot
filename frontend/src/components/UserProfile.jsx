import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, ShieldCheck, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserProfile({ onOpenProfileModal }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    setDropdownOpen(false);
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
    <div className="user-profile-menu-wrapper" ref={dropdownRef}>
      {/* Trigger pill */}
      <button
        type="button"
        className={`user-profile-pill ${dropdownOpen ? 'active' : ''}`}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        title="Account Options"
      >
        <div className="user-avatar-badge">
          {getInitials(user.name)}
        </div>
        <span className="user-display-name">
          {user.name}
        </span>
        <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'rotated' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="profile-dropdown-card animate-fade-in">
          <div className="dropdown-user-header">
            <div className="dropdown-avatar-large">
              {getInitials(user.name)}
            </div>
            <div className="dropdown-user-info">
              <div className="user-full-name">{user.name}</div>
              <div className="user-email-text" title={user.email}>{user.email}</div>
              <div className="user-status-tag">
                <ShieldCheck size={12} className="text-yellow" />
                <span>Verified Student</span>
              </div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-actions">
            <button
              type="button"
              className="dropdown-menu-item"
              onClick={() => {
                setDropdownOpen(false);
                if (onOpenProfileModal) {
                  onOpenProfileModal();
                } else {
                  navigate('/profile');
                }
              }}
            >
              <User size={15} className="item-icon" />
              <span>Student Profile</span>
            </button>

            <button
              type="button"
              className="dropdown-menu-item logout-item"
              onClick={handleLogout}
            >
              <LogOut size={15} className="item-icon text-yellow" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .user-profile-menu-wrapper {
          position: relative;
          display: inline-block;
          z-index: 120;
        }
        .user-profile-pill {
          display: flex;
          align-items: center;
          gap: 9px;
          background: #111116;
          border: 1px solid rgba(250, 204, 21, 0.4);
          padding: 5px 12px 5px 6px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #ffffff;
        }
        .user-profile-pill:hover,
        .user-profile-pill.active {
          border-color: #facc15;
          background: #1a1a24;
          box-shadow: 0 0 14px rgba(250, 204, 21, 0.25);
        }
        .user-avatar-badge {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #facc15;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.78rem;
          letter-spacing: 0.5px;
          box-shadow: 0 0 8px rgba(250, 204, 21, 0.5);
        }
        .user-display-name {
          font-size: 0.86rem;
          font-weight: 700;
          color: #ffffff;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .chevron-icon {
          color: #facc15;
          transition: transform 0.2s ease;
        }
        .chevron-icon.rotated {
          transform: rotate(180deg);
        }
        .profile-dropdown-card {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 260px;
          max-width: 90vw;
          background: #0f1015;
          border: 1px solid rgba(250, 204, 21, 0.5);
          border-radius: 14px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.95), 0 0 20px rgba(250, 204, 21, 0.2);
          padding: 14px;
          z-index: 200;
        }
        @media (max-width: 480px) {
          .user-display-name {
            max-width: 80px;
            font-size: 0.8rem;
          }
          .user-profile-pill {
            padding: 4px 8px 4px 4px;
            gap: 6px;
          }
        }
        .dropdown-user-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 4px 10px 4px;
        }
        .dropdown-avatar-large {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #facc15;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.1rem;
          flex-shrink: 0;
          box-shadow: 0 0 12px rgba(250, 204, 21, 0.4);
        }
        .dropdown-user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .user-full-name {
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-email-text {
          font-size: 0.78rem;
          color: #9ca3af;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-status-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #facc15;
          margin-top: 4px;
        }
        .dropdown-divider {
          height: 1px;
          background: rgba(250, 204, 21, 0.2);
          margin: 6px 0 10px 0;
        }
        .dropdown-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .dropdown-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: #e5e7eb;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }
        .dropdown-menu-item:hover {
          background: rgba(250, 204, 21, 0.12);
          color: #ffffff;
        }
        .dropdown-menu-item.logout-item:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
        }
        .item-icon {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
