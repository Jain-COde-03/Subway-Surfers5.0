/**
 * S.A.M.A.Y — Department Dashboard Data Contracts
 * TypeScript Interfaces
 */

export type TaskStatus =
  | 'Pending Scoring'
  | 'Awaiting Admin Approval'
  | 'Confirmed'
  | 'Rejected';

export interface Task {
  id: string;
  asset: string;
  defectType: string;
  priorityScore: number;
  status: TaskStatus;
}

export interface Block {
  id: string;
  track: string;
  startTime: string;
  endTime: string;
  isBundled: boolean;
  associatedTasks: string[];   // array of Task.id references, not full Task objects
  bundledWith?: string[];      // department names sharing this bundled corridor block
}

export type NotificationType = 'approval' | 'rejection' | 'schedule';

export interface Notification {
  id: string;
  timestamp: string;
  message: string;
  type: NotificationType;
  read?: boolean;
}

export interface DepartmentKpis {
  activeBacklog: number;
  awaitingApproval: number;
  confirmedBlockHours: number;
  resourceUtilizationPct: number;
}

export interface ResourceMetric {
  label: string;    // e.g. "Crane Utilization", "Crew Availability"
  percent: number;
}

