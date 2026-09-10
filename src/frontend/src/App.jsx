import React, { useState, useEffect } from 'react';
import LoginPage from './components/auth/LoginPage';
import AdminDashboard from './components/dashboards/AdminDashboard';
import DepartmentDashboard from './components/department/DepartmentDashboard';
import { getMe, logout as apiLogout } from './services/authApi';

/**
 * Loading spinner shown while we probe the session cookie on startup.
 */
function SplashLoader() {
  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
      <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">
        Verifying RailNet session…
      </p>
    </div>
  );
}

export default function App() {
  // null  → not checked yet (show splash)
  // false → checked, no valid session (show login)
  // obj   → authenticated user
  const [currentUser, setCurrentUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // ── On mount: probe the httpOnly cookie via /api/auth/me ──────────────────
  useEffect(() => {
    getMe()
      .then((user) => {
        setCurrentUser(user || false);
      })
      .finally(() => setChecking(false));
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogin = (user) => setCurrentUser(user);

  const handleLogout = async () => {
    await apiLogout();
    setCurrentUser(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (checking) {
    return <SplashLoader />;
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentUser.id !== 'admin') {
    return (
      <DepartmentDashboard
        user={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <AdminDashboard
      user={currentUser}
      onLogout={handleLogout}
    />
  );
}
