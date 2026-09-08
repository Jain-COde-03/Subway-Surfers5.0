import React, { useState } from 'react';
import {
  ListOrdered,
  AlertCircle,
  RotateCw,
  Edit3,
  PlusCircle,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  X,
  Info,
  Sparkles,
  Cpu,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Link2,
  Calendar,
} from 'lucide-react';

/**
 * Status Badge Configuration matching strict specifications:
 * - Pending Scoring = gray
 * - Awaiting Admin Approval = amber
 * - Confirmed = green
 * - Rejected = red
 */
const STATUS_STYLES = {
  'Pending Scoring': {
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: HelpCircle,
  },
  'Awaiting Admin Approval': {
    badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-700/80',
    icon: Clock,
  },
  'Confirmed': {
    badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-700/80',
    icon: CheckCircle2,
  },
  'Rejected': {
    badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300/80 dark:border-rose-800/80',
    icon: XCircle,
  },
};

/**
 * Generates engineering telemetry for any department task
 */
function getTaskTelemetry(task) {
  const id = task.id || '';

  if (id === 'TSK-SIG-201') {
    return {
      chainage: 'Km 15/4 - 15/8 (Ghaziabad West Yard)',
      trackLine: 'UP Mainline Junction Points',
      severityLevel: 'Level 1 Critical (Hazardous)',
      stallingMargin: '5.8 Amps (Rated Max: 4.2A) · +38% Stalling Overcurrent',
      operationalImpact: 'Point machine throws with severe mechanical friction. Switch rails fail to detect full normal lock within 4.5s timeout, creating risk of signal dropout & train halting.',
      equipmentNeeded: 'Digital Multimeter, Throw Rod Overhaul Kit & 110V DC Test Rig',
      crewGang: '4 S&T Signal Maintainers + 1 Section Engineer (Signal)',
      recommendedWindow: '2.5 Hours Block Required',
      xgboostMetrics: {
        score: task.priorityScore ?? 92.4,
        failureProbability: '88.4% within 48 hours',
        tsrAvoidance: 'Prevents mandatory 15 km/h Caution Order through junction points',
        derailmentFactor: 'High risk of facing-point split if not overhauled',
      },
      schedulingHorizon: 'Confirmed & Bundled in Tuesday Gazetted Corridor Block BLK-SIG-501 (01:30 - 05:00 hrs with Civil & Electrical).',
    };
  }

  if (id === 'TSK-SIG-202') {
    return {
      chainage: 'Km 11/8 - 12/2 (Sahibabad Outer Track)',
      trackLine: 'DN Fast Corridor',
      severityLevel: 'Level 2 Major (Intermittent)',
      stallingMargin: 'Spurious count drift: 4 counts pulse jitter per 100 axles',
      operationalImpact: 'Dual-channel High-Availability Axle Counter (HAC-DAC) experiencing intermittent false occupancy indications during early morning dew condensation.',
      equipmentNeeded: 'DAC Sensor Alignment Jig, High-Frequency Oscilloscope & Cable Analyzer',
      crewGang: '3 S&T Electronics Technicians + 1 SSE (Telecom)',
      recommendedWindow: '2.0 Hours Block Required',
      xgboostMetrics: {
        score: task.priorityScore ?? 86.0,
        failureProbability: '74.2% within 72 hours',
        tsrAvoidance: 'Prevents automatic signal red clamping on DN fast track',
        derailmentFactor: 'Low derailment risk; high traffic puncture risk (saves 45 min delay)',
      },
      schedulingHorizon: 'Submitted to Central Traffic Control. Queued in CP-SAT MIP optimizer pool awaiting train headway slot resolution.',
    };
  }

  if (id === 'TSK-SIG-203') {
    return {
      chainage: 'Km 03/6 - 04/0 (Tilak Bridge Approach)',
      trackLine: 'UP Slow Suburban Line',
      severityLevel: 'Level 3 Moderate (Degraded)',
      stallingMargin: 'Ballast resistance: 1.6 ohm/km (Minimum threshold: 2.0 ohm/km)',
      operationalImpact: 'Track circuit voltage dropping near drop-away value due to wet muck accumulation at sleeper seatings, causing sporadic signal flicker during rain.',
      equipmentNeeded: 'DC Shunt Resistance Bridge, Insulated Joint Tester & Ballast Cleaner Kit',
      crewGang: '4 S&T Gangmen + 1 JE (Signal)',
      recommendedWindow: '1.5 Hours Block Required',
      xgboostMetrics: {
        score: task.priorityScore ?? 78.5,
        failureProbability: '58.0% within 7 days',
        tsrAvoidance: 'Prevents suburban EMU transit delays',
        derailmentFactor: 'Negligible derailment risk; localized signaling fail-safe',
      },
      schedulingHorizon: 'Telemetry pending final ML scoring validation. Cross-checking ballast clearance with Civil P-Way division.',
    };
  }

  if (id === 'TSK-SIG-204') {
    return {
      chainage: 'Km 08/2 (Anand Vihar Terminal Approach)',
      trackLine: 'Down Branch Chord',
      severityLevel: 'Level 2 Major (Rejected)',
      stallingMargin: 'ECR relay chatter: 120ms debounce spike during aspect transition',
      operationalImpact: 'Lamp Proving Relay experiencing contact bounce when switching green to yellow. Chief Controller rejected requested window because it directly conflicted with the high-priority Vande Bharat Express departure slot.',
      equipmentNeeded: 'Plug-in Q-style Relay Replacement Unit & Optical Contact Scope',
      crewGang: '2 S&T Signal Technicians',
      recommendedWindow: '1.0 Hour Block Required',
      xgboostMetrics: {
        score: task.priorityScore ?? 91.0,
        failureProbability: '82.5% within 36 hours',
        tsrAvoidance: 'Prevents signal dark aspect failure at terminal entry',
        derailmentFactor: 'Zero physical track hazard; signal aspect continuity risk',
      },
      schedulingHorizon: 'REJECTED by Chief Controller: Timetable conflict with Vande Bharat Express slot. Click "Edit & Resubmit" to modify the requested window.',
    };
  }

  return {
    chainage: task.location || 'Corridor Km 18/4 - 20/0',
    trackLine: 'Mainline Corridor',
    severityLevel: (task.priorityScore ?? 80) >= 90 ? 'Level 1 Critical' : (task.priorityScore ?? 80) >= 75 ? 'Level 2 Major' : 'Level 3 Moderate',
    stallingMargin: 'Telemetry recorded via departmental field inspection',
    operationalImpact: task.defectType || 'Infrastructure anomaly recorded during routine inspection.',
    equipmentNeeded: 'Standard departmental inspection & overhaul toolkit',
    crewGang: '4 Dedicated Technicians + Section Engineer',
    recommendedWindow: '2.0 - 3.5 Hours Block Required',
    xgboostMetrics: {
      score: task.priorityScore ?? 85.0,
      failureProbability: `${Math.round(task.priorityScore ?? 85)}% risk factor`,
      tsrAvoidance: 'Prevents Temporary Speed Restriction on mainline',
      derailmentFactor: 'Managed under Indian Railways Safety Standards',
    },
    schedulingHorizon: task.status === 'Confirmed'
      ? 'Confirmed in Gazetted Possession Schedule.'
      : task.status === 'Rejected'
      ? 'Rejected by Central Operations. Please revise parameters.'
      : 'Under evaluation by CRIS CP-SAT engine.',
  };
}

/**
 * Task Detail Modal Overlay: Expands when clicking any task entry
 */
function TaskDetailOverlayModal({ task, onClose, onEditResubmit }) {
  if (!task) return null;

  const telemetry = getTaskTelemetry(task);
  const statusMeta = STATUS_STYLES[task.status] || STATUS_STYLES['Pending Scoring'];
  const StatusIcon = statusMeta.icon;
  const isRejected = task.status === 'Rejected';
  const isConfirmed = task.status === 'Confirmed';
  const isAwaiting = task.status === 'Awaiting Admin Approval';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl shadow-slate-900/40 dark:shadow-black/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Minimalist Slate Header */}
        <div className="px-6 py-4 rounded-t-xl bg-slate-100 dark:bg-slate-800/40 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-950 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-slate-200 dark:border-slate-800 flex-shrink-0 shadow-xs">
              <ListOrdered className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  DEFECT TELEMETRY · {task.id}
                </h3>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase inline-flex items-center space-x-1 ${statusMeta.badge}`}>
                  <StatusIcon className="w-2.5 h-2.5" />
                  <span>{task.status}</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                CRIS AI Priority Scoring Matrix &amp; Sectional Possession Profile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Telemetry"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vanishing Dark Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-transparent dark:from-slate-600 dark:via-slate-700/50 dark:to-transparent opacity-90 flex-shrink-0"></div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
          {/* Top 4 Metric Micro-Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
                Asset &amp; Section
              </span>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate" title={task.asset}>
                {task.asset}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                {telemetry.chainage}
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
                Defect Severity
              </span>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate" title={task.defectType}>
                {task.defectType}
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block font-semibold">
                {telemetry.severityLevel}
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
                AI Priority Score
              </span>
              <div className="font-black font-mono text-xs flex items-center space-x-1">
                <span
                  className={
                    (task.priorityScore ?? 0) >= 90
                      ? 'text-rose-600 dark:text-rose-400'
                      : (task.priorityScore ?? 0) >= 75
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }
                >
                  {task.priorityScore ? task.priorityScore.toFixed(1) : '78.5'}
                </span>
                <span className="text-slate-400">/ 100</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                XGBoost ML Weight
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
                Possession Needed
              </span>
              <div className="font-bold font-mono text-slate-900 dark:text-slate-100 text-xs">
                {telemetry.recommendedWindow.split(' ')[0]} {telemetry.recommendedWindow.split(' ')[1]}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                {telemetry.trackLine}
              </span>
            </div>
          </div>

          {/* Section 1: Engineering Telemetry & Operational Impact */}
          <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
              <span className="uppercase flex items-center space-x-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-500" />
                <span>Field Telemetry &amp; Ground Diagnostics</span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-normal">
                Line: {telemetry.trackLine}
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-xs">
              {telemetry.operationalImpact}
            </p>
            <div className="p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Sensor Margin / Parameter Deviation:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{telemetry.stallingMargin}</span>
            </div>
          </div>

          {/* Section 2: Machine & Crew Requisition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase font-mono text-slate-500 dark:text-slate-400 block">
                Required Equipment &amp; Test Kit
              </span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                {telemetry.equipmentNeeded}
              </p>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Calibrated per CRIS maintenance standards
              </p>
            </div>

            <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase font-mono text-slate-500 dark:text-slate-400 block">
                Gang Deployment Quota
              </span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                {telemetry.crewGang}
              </p>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Division field personnel assigned
              </p>
            </div>
          </div>

          {/* Section 3: Scheduling Horizon & Coordination Status */}
          <div
            className={`p-3.5 rounded-lg border shadow-xs space-y-2 ${
              isConfirmed
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-300'
                : isRejected
                ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 text-rose-900 dark:text-rose-300'
                : isAwaiting
                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-300'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono font-bold">
              <span className="uppercase flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Central Operations Scheduling Status</span>
              </span>
              <span className="text-[10px] uppercase">{task.status}</span>
            </div>
            <p className="text-xs font-medium leading-relaxed font-sans">
              {telemetry.schedulingHorizon}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px] border-t border-current/20">
              <div>
                <span className="opacity-75">Failure Likelihood: </span>
                <span className="font-bold">{telemetry.xgboostMetrics.failureProbability}</span>
              </div>
              <div>
                <span className="opacity-75">Speed Order: </span>
                <span className="font-bold">{telemetry.xgboostMetrics.tsrAvoidance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isConfirmed ? 'bg-emerald-500' : isRejected ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
              }`}
            ></span>
            <span>Task ID: {task.id} · Section Maintenance Registry</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            {isRejected && onEditResubmit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditResubmit(task);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase text-xs rounded-lg shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit &amp; Resubmit</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors shadow-xs"
            >
              Close Telemetry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Component 3: DepartmentTaskQueue
 * Renders department maintenance tasks with priority scores, status badges,
 * click-to-expand overlay telemetry cards, and "Edit & Resubmit" for rejected rows.
 */
export default function DepartmentTaskQueue({
  tasks = [],
  isLoading = false,
  error = null,
  onRetry,
  onEditResubmit,
  onOpenNewDefect,
}) {
  const [selectedTask, setSelectedTask] = useState(null);
  // Error state
  if (error) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden">
        <div className="px-5 py-4 rounded-t-lg bg-slate-100 dark:bg-slate-800/40 flex items-center space-x-2">
          <ListOrdered className="w-4 h-4 text-amber-500" />
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
            DEPARTMENT TASK QUEUE
          </h2>
        </div>
        {/* Vanishing Dark Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-transparent dark:from-slate-600 dark:via-slate-700/50 dark:to-transparent opacity-90"></div>
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>Failed to load department task queue: {error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center space-x-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 text-white rounded-md text-xs font-semibold cursor-pointer shadow-xs transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden transition-colors duration-300">
      {/* Minimalist Slate Header */}
      <div className="px-5 py-4 rounded-t-lg bg-slate-100 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-950 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-slate-200 dark:border-slate-800 flex-shrink-0">
            <ListOrdered className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 leading-tight">
                DEPARTMENT TASK QUEUE
              </h2>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-700 text-white uppercase font-mono">
                {tasks.length} {tasks.length === 1 ? 'TASK' : 'TASKS'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              CRIS AI Priority Scoring Matrix · Corridor Possession Queue
            </p>
          </div>
        </div>

        {onOpenNewDefect && (
          <button
            type="button"
            onClick={onOpenNewDefect}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-bold uppercase text-[10px] tracking-wider shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>LOG NEW DEFECT</span>
          </button>
        )}
      </div>

      {/* Vanishing Dark Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-transparent dark:from-slate-600 dark:via-slate-700/50 dark:to-transparent opacity-90"></div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-2.5 animate-pulse">
            <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded-lg w-full"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg w-full flex items-center px-4 space-x-4">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-20"></div>
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-40"></div>
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-24"></div>
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-16"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-24 ml-auto"></div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          /* Empty State */
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/70 dark:bg-slate-900/60">
            <div className="w-10 h-10 rounded-md bg-slate-900 text-amber-500 flex items-center justify-center border border-slate-800 mb-2">
              <ListOrdered className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">NO TASKS SUBMITTED YET</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mt-1 mb-4 font-mono text-[11px]">
              Report infrastructure defects to request corridor block allocation from Central Operations Planning.
            </p>
            {onOpenNewDefect && (
              <button
                type="button"
                onClick={onOpenNewDefect}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>LOG FIRST DEFECT</span>
              </button>
            )}
          </div>
        ) : (
          /* Card-wrapped Data Grid matching Defect Form */
          <div className="border border-slate-200/90 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-950 shadow-xs">
            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                {/* Gunmetal Gray Grid Header Row */}
                <div className="grid grid-cols-12 gap-2 bg-slate-100/90 dark:bg-slate-950 text-slate-700 dark:text-slate-400 text-[11px] uppercase font-bold tracking-wider px-4 py-3 border-b border-slate-200 dark:border-slate-800 select-none font-mono">
                  <div className="col-span-2">Task ID</div>
                  <div className="col-span-4">Asset / Section</div>
                  <div className="col-span-3">Defect Category</div>
                  <div className="col-span-1 text-center">Score</div>
                  <div className="col-span-2 text-right">Status / Action</div>
                </div>

                {/* Data Rows */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                  {tasks.map((task) => {
                    const statusMeta = STATUS_STYLES[task.status] || STATUS_STYLES['Pending Scoring'];
                    const StatusIcon = statusMeta.icon;
                    const isRejected = task.status === 'Rejected';

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-amber-50/20 dark:hover:bg-slate-800/80 cursor-pointer transition-colors text-xs group"
                        title="Click to view full defect telemetry & engineering profile"
                      >
                        {/* Task ID */}
                        <div className="col-span-2 font-mono font-bold text-slate-900 dark:text-slate-100 tracking-tight text-xs flex items-center space-x-1.5">
                          <span>{task.id}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono text-amber-600 dark:text-amber-400 font-normal">
                            Inspect
                          </span>
                        </div>

                        {/* Asset Location */}
                        <div className="col-span-4 min-w-0 pr-2">
                          <div className="font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" title={task.asset}>
                            {task.asset}
                          </div>
                        </div>

                        {/* Defect Type */}
                        <div className="col-span-3 min-w-0 pr-2">
                          <div className="text-slate-600 dark:text-slate-400 truncate text-[11px] font-medium" title={task.defectType}>
                            {task.defectType}
                          </div>
                        </div>

                        {/* AI Priority Score */}
                        <div className="col-span-1 flex items-center justify-center">
                          <span
                            className={`font-black font-mono text-[11px] px-2 py-0.5 rounded-md border ${
                              task.priorityScore >= 90
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/80'
                                : task.priorityScore >= 75
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/80'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {task.priorityScore ? task.priorityScore.toFixed(1) : '78.5'}
                          </span>
                        </div>

                        {/* Status Badge & Action */}
                        <div className="col-span-2 flex items-center justify-end space-x-1.5">
                          <span
                            className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase font-mono tracking-wider border inline-flex items-center space-x-1 ${statusMeta.badge}`}
                          >
                            <StatusIcon className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{task.status}</span>
                          </span>

                          {isRejected && onEditResubmit && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditResubmit(task);
                              }}
                              className="rounded-md px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase text-[9px] font-mono tracking-wider shadow-xs transition-colors cursor-pointer inline-flex items-center space-x-1 shrink-0"
                              title="Open defect form pre-filled with this task's parameters"
                            >
                              <Edit3 className="w-2.5 h-2.5" />
                              <span>EDIT</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Overlay Modal */}
      <TaskDetailOverlayModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEditResubmit={onEditResubmit}
      />
    </div>
  );
}
