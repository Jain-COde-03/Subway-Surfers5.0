import React from 'react';
import DepartmentDashboard from '../department/DepartmentDashboard';

/**
 * SMMSDashboard (Signaling Maintenance Management System)
 * Renders the Department Dashboard scoped to Signal & Telecom.
 */
export default function SMMSDashboard({ user }) {
  return (
    <div className="flex-1 overflow-y-auto w-full">
      <DepartmentDashboard
        user={user}
        department="Signal"
        division="Moradabad Division (Northern Railway)"
      />
    </div>
  );
}
