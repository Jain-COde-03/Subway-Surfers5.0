import React, { createContext, useContext, useMemo } from 'react';

const DepartmentContext = createContext({
  department: 'Civil',
  division: 'Moradabad Division (Northern Railway)',
  departmentCode: 'TMS',
});

/**
 * Normalizes input department to standard department name & division info
 */
export function resolveDepartmentInfo(rawDept = 'Civil') {
  const str = String(rawDept).toLowerCase();

  if (str.includes('signal') || str.includes('smms') || str.includes('s&t')) {
    return {
      department: 'Signal & Telecom',
      departmentKey: 'Signal',
      departmentCode: 'SMMS',
      division: 'Moradabad Division (NR)',
      fullDesignation: 'Signaling Maintenance Management System',
    };
  }

  if (str.includes('elect') || str.includes('tdms') || str.includes('trd') || str.includes('traction')) {
    return {
      department: 'Traction Distribution (TRD)',
      departmentKey: 'Electrical',
      departmentCode: 'TDMS',
      division: 'Moradabad Division (NR)',
      fullDesignation: 'Traction Distribution Management System',
    };
  }

  // Default to Civil / Track Management System
  return {
    department: 'Civil Engineering (Track)',
    departmentKey: 'Civil',
    departmentCode: 'TMS',
    division: 'Moradabad Division (NR)',
    fullDesignation: 'Track Management System (P-Way)',
  };
}

export function DepartmentProvider({ department = 'Civil', division, children }) {
  const resolved = useMemo(() => {
    const info = resolveDepartmentInfo(department);
    return {
      ...info,
      division: division || info.division,
    };
  }, [department, division]);

  return (
    <DepartmentContext.Provider value={resolved}>
      {children}
    </DepartmentContext.Provider>
  );
}

export function useDepartment() {
  const ctx = useContext(DepartmentContext);
  if (!ctx) {
    throw new Error('useDepartment must be used within a DepartmentProvider');
  }
  return ctx;
}

export default DepartmentContext;

