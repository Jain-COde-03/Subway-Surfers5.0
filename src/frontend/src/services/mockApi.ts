/**
 * S.A.M.A.Y — Mock API Service Layer (TypeScript)
 * Simulates backend REST endpoints with asynchronous delays (600-800ms).
 */
import {
  Task,
  Block,
  Notification,
  DepartmentKpis,
  ResourceMetric,
} from '../types/department';

// Re-export JavaScript functions with TypeScript signature compatibility
export {
  getDepartmentTasks,
  getConfirmedBlocks,
  getDepartmentNotifications,
  getDepartmentResources,
  getDepartmentKpis,
  postDefect,
} from './mockApi.js';

