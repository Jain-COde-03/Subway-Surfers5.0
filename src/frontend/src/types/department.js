/**
 * S.A.M.A.Y — Department Dashboard Data Contracts
 * @module types/department
 */

/**
 * @typedef {'Pending Scoring' | 'Awaiting Admin Approval' | 'Confirmed' | 'Rejected'} TaskStatus
 */

/**
 * @typedef {Object} Task
 * @property {string} id - Unique Task identifier (e.g. 'TSK-TRK-101')
 * @property {string} asset - Asset identifier or track section
 * @property {string} defectType - Description or category of the reported defect
 * @property {number} priorityScore - AI-predicted priority score (0-100)
 * @property {TaskStatus} status - Lifecycle status of the maintenance task
 */

/**
 * @typedef {Object} Block
 * @property {string} id - Unique Block identifier (e.g. 'BLK-CR-401')
 * @property {string} track - Track segment / corridor section
 * @property {string} startTime - ISO timestamp or scheduled start time
 * @property {string} endTime - ISO timestamp or scheduled end time
 * @property {boolean} isBundled - Whether this block is bundled across departments
 * @property {string[]} associatedTasks - Array of Task.id references
 * @property {string[]} [bundledWith] - Departments sharing this bundled block
 */

/**
 * @typedef {'approval' | 'rejection' | 'schedule'} NotificationType
 */

/**
 * @typedef {Object} Notification
 * @property {string} id - Unique Notification identifier
 * @property {string} timestamp - Relative or ISO timestamp string
 * @property {string} message - Notification text
 * @property {NotificationType} type - Notification categorization
 * @property {boolean} [read] - Read/unread status
 */

/**
 * @typedef {Object} DepartmentKpis
 * @property {number} activeBacklog - Number of backlog defects needing attention
 * @property {number} awaitingApproval - Number of tasks awaiting admin/central approval
 * @property {number} confirmedBlockHours - Total confirmed maintenance hours for the week
 * @property {number} resourceUtilizationPct - Overall resource utilization percentage (0-100)
 */

/**
 * @typedef {Object} ResourceMetric
 * @property {string} label - Resource name (e.g. 'Crane Utilization', 'Crew Availability')
 * @property {number} percent - Current capacity percentage (0-100)
 */

export {};

