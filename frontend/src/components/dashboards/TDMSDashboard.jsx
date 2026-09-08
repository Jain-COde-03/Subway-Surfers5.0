import React from 'react';
import DepartmentDashboard from '../department/DepartmentDashboard';

/**
 * TDMSDashboard (Traction Distribution Management System)
 * Renders the Department Dashboard scoped to Electrical TRD / 25kV OHE.
 */
export default function TDMSDashboard({ user }) {
  return (
    <div className="flex-1 overflow-y-auto w-full">
      <DepartmentDashboard
        user={user}
        department="Electrical"
        division="Moradabad Division (Northern Railway)"
      />
    </div>
  );
}
