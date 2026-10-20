import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="protected-loading-screen">
        <div className="yellow-spinner"></div>
        <p className="loading-text">Verifying session...</p>
        <style>{`
          .protected-loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #000000;
            color: #ffffff;
            gap: 16px;
          }
          .yellow-spinner {
            width: 44px;
            height: 44px;
            border: 3px solid rgba(250, 204, 21, 0.2);
            border-top-color: #facc15;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          .loading-text {
            font-size: 0.95rem;
            color: #d1d5db;
            letter-spacing: 0.5px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
