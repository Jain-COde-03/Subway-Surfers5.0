import React, { useState } from 'react';
import LoginPage from './components/auth/LoginPage';
import AdminDashboard from './components/dashboards/AdminDashboard';
import DepartmentDashboard from './components/department/DepartmentDashboard';

export default function App() {
  // null shows LoginPage. Defaults to null so user experiences the authentication flow
  const [currentUser, setCurrentUser] = useState(null);

  // If not authenticated, render Login Page
  if (!currentUser) {
    return <LoginPage onLogin={(role) => setCurrentUser(role)} />;
  }

  // If authenticated as a single department (TMS, SMMS, TDMS), render Department Dashboard directly
  if (currentUser.id !== 'admin') {
    return (
      <DepartmentDashboard
        user={currentUser}
        onLogout={() => setCurrentUser(null)}
      />
    );
  }

  // If authenticated as Master Admin, render AdminDashboard Control Room directly
  return (
    <AdminDashboard
      user={currentUser}
      onLogout={() => setCurrentUser(null)}
    />
  );
}


