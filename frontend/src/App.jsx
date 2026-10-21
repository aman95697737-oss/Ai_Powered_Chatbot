import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import VerifyLogin from './pages/VerifyLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { fetchHealth, fetchDemoMode, toggleDemoFailure } from './services/api';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const [backendStatus, setBackendStatus] = useState({
    status: 'checking',
    dataset_entries: 52,
    ai_status: 'ready'
  });
  const [demoMode, setDemoMode] = useState({
    simulate_ai_failure: false,
    mode: 'AI Mode'
  });
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    async function initStatus() {
      const health = await fetchHealth();
      setBackendStatus(health);

      const demo = await fetchDemoMode();
      setDemoMode(demo);
    }
    initStatus();
  }, []);

  const handleToggleDemo = async () => {
    const nextState = !demoMode?.simulate_ai_failure;
    const res = await toggleDemoFailure(nextState);
    if (res.success) {
      setDemoMode(prev => ({
        ...prev,
        simulate_ai_failure: nextState,
        mode: nextState ? 'Simulated Fallback Mode' : 'AI Mode'
      }));
      showNotification(
        nextState 
          ? '◈ Switched to Campus Guide: using verified university answers.'
          : '✦ Switched to Smart Assistant: using helpful conversational answers.'
      );
    }
  };

  // Only show top navigation bar on Home page
  const isHomePage = location.pathname === '/';

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      {notification && (
        <div className="toast-notification animate-fade-in glass-panel-elevated">
          <span>{notification}</span>
        </div>
      )}

      {/* Top Navbar only on landing home page */}
      {isHomePage && (
        <Navbar 
          currentPage="home"
          backendStatus={backendStatus}
          demoMode={demoMode}
          onToggleDemo={handleToggleDemo}
        />
      )}

      {/* Main Page Content */}
      <main className="main-content">
        <Routes>
          {/* Public Home Landing Page */}
          <Route 
            path="/" 
            element={
              <Home 
                onStartChat={() => navigate('/chat')}
                demoMode={demoMode}
                onToggleDemo={handleToggleDemo}
              />
            } 
          />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-login" element={<VerifyLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes - require verified authentication */}
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <Chat 
                  backendInfo={backendStatus}
                  demoMode={demoMode}
                  onToggleDemo={handleToggleDemo}
                  onNavigateHome={() => navigate('/')}
                />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <style>{`
        .app-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #000000;
        }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #000000;
        }
        .toast-notification {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          padding: 12px 20px;
          border-radius: var(--radius-md);
          background: #111116;
          border: 1px solid rgba(250, 204, 21, 0.6);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.95), 0 0 16px rgba(250, 204, 21, 0.2);
          font-size: 0.85rem;
          font-weight: 700;
          color: #ffffff;
          max-width: 420px;
        }
        @media (max-width: 640px) {
          .toast-notification {
            left: 16px;
            right: 16px;
            bottom: 16px;
            max-width: none;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
