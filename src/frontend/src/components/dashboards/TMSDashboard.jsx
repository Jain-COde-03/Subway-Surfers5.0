import React from 'react';
import DepartmentDashboard from '../department/DepartmentDashboard';

/**
 * TMSDashboard (Track Management System / Civil Engineering)
 * Renders the Department Dashboard scoped to Civil / Track P-Way.
 */
export default function TMSDashboard({ user }) {
  return (
    <div className="flex-1 overflow-y-auto w-full">
      <DepartmentDashboard
        user={user}
        department="Civil"
        division="Moradabad Division (Northern Railway)"
      />
    </div>
  );
}
