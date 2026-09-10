import React, { useState, useMemo } from 'react';
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
  Search,
  Filter,
  SlidersHorizontal,
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

  // ============================================================
  // TSK-SIG-201 — POINT MACHINE / SWITCH FAILURE
  // ============================================================
  if (id === 'TSK-SIG-201') {
    return {
      chainage: 'Km 15/4 - 15/8 (Ghaziabad West Yard)',
      trackLine: 'UP Mainline Junction Points',
      severityLevel: 'Level 1 Critical (Hazardous)',
      stallingMargin:
        '5.8 Amps (Rated Max: 4.2A) · +38% Stalling Overcurrent',

      operationalImpact:
        'Point machine throws with severe mechanical friction. Switch rails fail to detect full normal lock within 4.5s timeout, creating risk of signal dropout & train halting.',

      equipmentNeeded:
        'Digital Multimeter, Throw Rod Overhaul Kit & 110V DC Test Rig',

      crewGang:
        '4 S&T Signal Maintainers + 1 Section Engineer (Signal)',

      recommendedWindow: '2.5 Hours Block Required',

      xgboostMetrics: {
        score: task.priorityScore ?? 92.4,
        failureProbability: '88.4% within 48 hours',
        tsrAvoidance:
          'Prevents mandatory 15 km/h Caution Order through junction points',
        derailmentFactor:
          'High risk of facing-point split if not overhauled',
      },

      // ⭐ PRIORITY JUSTIFICATION
      priorityJustification: {
        decision: task.status || 'Confirmed',

        score: task.priorityScore ?? 92.4,

        threshold: 75,

        summary:
          'This defect received a very high priority because the point machine is drawing excessive current, the probability of failure within 48 hours is high, and incomplete switch locking creates a direct signalling and train movement safety risk at a mainline junction.',

        factors: [
          {
            name: 'Defect Severity',
            value: 'Level 1 Critical (Hazardous)',
            impact: '+24.0',
            explanation:
              'The defect can prevent the switch rails from achieving full lock, making it a critical signalling safety issue.',
          },

          {
            name: 'Failure Probability',
            value: '88.4% within 48 hours',
            impact: '+22.5',
            explanation:
              'The very high short-term failure probability significantly increases the urgency of maintenance.',
          },

          {
            name: 'Safety Risk',
            value: 'High',
            impact: '+21.0',
            explanation:
              'Failure of the point machine at a junction can result in unsafe route detection or train movement restrictions.',
          },

          {
            name: 'Stalling Overcurrent',
            value: '+38% above rated current',
            impact: '+12.4',
            explanation:
              'The measured 5.8A current exceeds the rated 4.2A limit, indicating severe mechanical friction and abnormal equipment behaviour.',
          },

          {
            name: 'Operational Impact',
            value: 'Mainline Junction',
            impact: '+8.5',
            explanation:
              'A failure at a junction can affect multiple train routes and require restrictive operating measures.',
          },

          {
            name: 'Derailment Exposure',
            value: 'Facing-point split risk',
            impact: '+4.0',
            explanation:
              'The possibility of an incomplete or unreliable switch lock increases the safety significance of the defect.',
          },
        ],
      },

      schedulingHorizon:
        'Confirmed & Bundled in Tuesday Gazetted Corridor Block BLK-SIG-501 (01:30 - 05:00 hrs with Civil & Electrical).',
    };
  }


  // ============================================================
  // TSK-SIG-202 — AXLE COUNTER FALSE OCCUPANCY
  // ============================================================
  if (id === 'TSK-SIG-202') {
    return {
      chainage: 'Km 11/8 - 12/2 (Sahibabad Outer Track)',
      trackLine: 'DN Fast Corridor',
      severityLevel: 'Level 2 Major (Intermittent)',

      stallingMargin:
        'Spurious count drift: 4 counts pulse jitter per 100 axles',

      operationalImpact:
        'Dual-channel High-Availability Axle Counter (HAC-DAC) experiencing intermittent false occupancy indications during early morning dew condensation.',

      equipmentNeeded:
        'DAC Sensor Alignment Jig, High-Frequency Oscilloscope & Cable Analyzer',

      crewGang:
        '3 S&T Electronics Technicians + 1 SSE (Telecom)',

      recommendedWindow: '2.0 Hours Block Required',

      xgboostMetrics: {
        score: task.priorityScore ?? 86.0,
        failureProbability: '74.2% within 72 hours',
        tsrAvoidance:
          'Prevents automatic signal red clamping on DN fast track',
        derailmentFactor:
          'Low derailment risk; high traffic puncture risk (saves 45 min delay)',
      },

      // ⭐ PRIORITY JUSTIFICATION
      priorityJustification: {
        decision: task.status || 'Awaiting Admin Approval',

        score: task.priorityScore ?? 86.0,

        threshold: 75,

        summary:
          'The model assigned a high priority because the axle counter shows intermittent false occupancy, has a 74.2% predicted failure probability within 72 hours, and is located on a high-traffic fast corridor where signalling interruptions can create significant operational delays.',

        factors: [
          {
            name: 'Defect Severity',
            value: 'Level 2 Major (Intermittent)',
            impact: '+20.0',
            explanation:
              'The defect is not continuously active but can intermittently affect train detection, making it a major signalling reliability concern.',
          },

          {
            name: 'Failure Probability',
            value: '74.2% within 72 hours',
            impact: '+20.5',
            explanation:
              'A high probability of near-term failure increases the need to intervene before the condition escalates.',
          },

          {
            name: 'Safety / Detection Risk',
            value: 'False Occupancy Indication',
            impact: '+17.8',
            explanation:
              'Incorrect track occupancy information can cause restrictive signalling behaviour and disrupt safe train movement.',
          },

          {
            name: 'Traffic Exposure',
            value: 'DN Fast Corridor',
            impact: '+13.5',
            explanation:
              'The affected equipment is located on a fast, high-traffic route, increasing the operational consequences of failure.',
          },

          {
            name: 'Environmental Sensitivity',
            value: 'Dew Condensation',
            impact: '+6.2',
            explanation:
              'The defect becomes more likely under early-morning moisture conditions, indicating an intermittent but recurring failure pattern.',
          },

          {
            name: 'Delay Impact',
            value: 'Potential 45 min delay',
            impact: '+5.5',
            explanation:
              'Resolving the defect proactively can avoid substantial downstream train delays.',
          },
        ],
      },

      schedulingHorizon:
        'Submitted to Central Traffic Control. Queued in CP-SAT MIP optimizer pool awaiting train headway slot resolution.',
    };
  }


  // ============================================================
  // TSK-SIG-203 — TRACK CIRCUIT / BALLAST RESISTANCE
  // ============================================================
  if (id === 'TSK-SIG-203') {
    return {
      chainage: 'Km 03/6 - 04/0 (Tilak Bridge Approach)',
      trackLine: 'UP Slow Suburban Line',
      severityLevel: 'Level 3 Moderate (Degraded)',

      stallingMargin:
        'Ballast resistance: 1.6 ohm/km (Minimum threshold: 2.0 ohm/km)',

      operationalImpact:
        'Track circuit voltage dropping near drop-away value due to wet muck accumulation at sleeper seatings, causing sporadic signal flicker during rain.',

      equipmentNeeded:
        'DC Shunt Resistance Bridge, Insulated Joint Tester & Ballast Cleaner Kit',

      crewGang:
        '4 S&T Gangmen + 1 JE (Signal)',

      recommendedWindow: '1.5 Hours Block Required',

      xgboostMetrics: {
        score: task.priorityScore ?? 78.5,
        failureProbability: '58.0% within 7 days',
        tsrAvoidance:
          'Prevents suburban EMU transit delays',
        derailmentFactor:
          'Negligible derailment risk; localized signaling fail-safe',
      },

      // ⭐ PRIORITY JUSTIFICATION
      priorityJustification: {
        decision: task.status || 'Pending Scoring',

        score: task.priorityScore ?? 78.5,

        threshold: 75,

        summary:
          'The defect crosses the priority threshold primarily because ballast resistance is below the required minimum and the track circuit is approaching its drop-away voltage. The failure probability is moderate and the expected impact is mainly localized signalling disruption rather than a direct derailment hazard.',

        factors: [
          {
            name: 'Defect Severity',
            value: 'Level 3 Moderate (Degraded)',
            impact: '+15.5',
            explanation:
              'The condition represents degraded signalling reliability but does not currently indicate a critical safety failure.',
          },

          {
            name: 'Ballast Resistance',
            value: '1.6 ohm/km vs 2.0 minimum',
            impact: '+17.0',
            explanation:
              'Resistance is below the required threshold, increasing the possibility of unreliable track-circuit operation.',
          },

          {
            name: 'Failure Probability',
            value: '58.0% within 7 days',
            impact: '+14.5',
            explanation:
              'The probability of failure is moderate, supporting planned intervention rather than emergency response.',
          },

          {
            name: 'Weather Sensitivity',
            value: 'Wet conditions',
            impact: '+10.0',
            explanation:
              'Wet muck accumulation can further reduce electrical performance and increase the likelihood of signal flickering during rain.',
          },

          {
            name: 'Traffic Impact',
            value: 'Suburban EMU corridor',
            impact: '+8.5',
            explanation:
              'A signalling failure on the suburban line can cause train movement delays and service disruption.',
          },

          {
            name: 'Derailment Risk',
            value: 'Negligible',
            impact: '+2.0',
            explanation:
              'The current defect is primarily a signalling reliability issue, so its direct derailment contribution is relatively low.',
          },
        ],
      },

      schedulingHorizon:
        'Telemetry pending final ML scoring validation. Cross-checking ballast clearance with Civil P-Way division.',
    };
  }


  // ============================================================
  // TSK-SIG-204 — RELAY CHATTER / TERMINAL APPROACH
  // ============================================================
  if (id === 'TSK-SIG-204') {
    return {
      chainage: 'Km 08/2 (Anand Vihar Terminal Approach)',
      trackLine: 'Down Branch Chord',
      severityLevel: 'Level 2 Major (Rejected)',

      stallingMargin:
        'ECR relay chatter: 120ms debounce spike during aspect transition',

      operationalImpact:
        'Lamp Proving Relay experiencing contact bounce when switching green to yellow. Chief Controller rejected requested window because it directly conflicted with the high-priority Vande Bharat Express departure slot.',

      equipmentNeeded:
        'Plug-in Q-style Relay Replacement Unit & Optical Contact Scope',

      crewGang:
        '2 S&T Signal Technicians',

      recommendedWindow: '1.0 Hour Block Required',

      xgboostMetrics: {
        score: task.priorityScore ?? 91.0,
        failureProbability: '82.5% within 36 hours',
        tsrAvoidance:
          'Prevents signal dark aspect failure at terminal entry',
        derailmentFactor:
          'Zero physical track hazard; signal aspect continuity risk',
      },

      // ⭐ PRIORITY JUSTIFICATION
      priorityJustification: {
        decision: task.status || 'Rejected',

        score: task.priorityScore ?? 91.0,

        threshold: 75,

        summary:
          'The model classified this defect as high priority because relay contact bounce creates a significant signalling reliability risk and the predicted failure probability is 82.5% within 36 hours. However, the requested maintenance window was rejected by operations because it conflicts with a high-priority passenger service departure slot.',

        factors: [
          {
            name: 'Defect Severity',
            value: 'Level 2 Major',
            impact: '+21.0',
            explanation:
              'Relay chatter during signal aspect transitions can affect the reliability of signal indication and lamp proving.',
          },

          {
            name: 'Failure Probability',
            value: '82.5% within 36 hours',
            impact: '+22.0',
            explanation:
              'The high probability of near-term failure makes this defect operationally urgent.',
          },

          {
            name: 'Signal Reliability Risk',
            value: 'Aspect transition instability',
            impact: '+18.5',
            explanation:
              'Contact bounce during green-to-yellow transition can create signal aspect continuity problems at the terminal approach.',
          },

          {
            name: 'Traffic Exposure',
            value: 'Terminal Approach',
            impact: '+12.0',
            explanation:
              'A signalling failure near a major terminal approach can affect train arrivals, departures and platform operations.',
          },

          {
            name: 'Safety Impact',
            value: 'Signal continuity risk',
            impact: '+10.0',
            explanation:
              'Although there is no direct physical track hazard, signalling continuity is safety-critical for train movement.',
          },

          {
            name: 'Scheduling Conflict',
            value: 'High-priority train departure',
            impact: '+2.5',
            explanation:
              'The defect remains important, but the requested maintenance window conflicts with a high-priority train movement and therefore requires rescheduling.',
          },
        ],
      },

      schedulingHorizon:
        'REJECTED by Chief Controller: Timetable conflict with Vande Bharat Express slot. Click "Edit & Resubmit" to modify the requested window.',
    };
  }


  // ============================================================
  // DEFAULT / OTHER TASKS
  // ============================================================
  return {
    chainage: task.location || 'Corridor Km 18/4 - 20/0',

    trackLine: 'Mainline Corridor',

    severityLevel:
      (task.priorityScore ?? 80) >= 90
        ? 'Level 1 Critical'
        : (task.priorityScore ?? 80) >= 75
          ? 'Level 2 Major'
          : 'Level 3 Moderate',

    stallingMargin:
      'Telemetry recorded via departmental field inspection',

    operationalImpact:
      task.defectType ||
      'Infrastructure anomaly recorded during routine inspection.',

    equipmentNeeded:
      'Standard departmental inspection & overhaul toolkit',

    crewGang:
      '4 Dedicated Technicians + Section Engineer',

    recommendedWindow:
      '2.0 - 3.5 Hours Block Required',

    xgboostMetrics: {
      score: task.priorityScore ?? 85.0,

      failureProbability:
        `${Math.round(task.priorityScore ?? 85)}% risk factor`,

      tsrAvoidance:
        'Prevents Temporary Speed Restriction on mainline',

      derailmentFactor:
        'Managed under Indian Railways Safety Standards',
    },

    // ⭐ DEFAULT PRIORITY JUSTIFICATION
    priorityJustification: {
      decision: task.status || 'Pending Scoring',

      score: task.priorityScore ?? 85.0,

      threshold: 75,

      summary:
        'The priority score is based on the defect characteristics, operational impact, safety relevance and predicted failure risk. The task is evaluated against the configured priority threshold before being passed to the scheduling stage.',

      factors: [
        {
          name: 'AI Priority Score',
          value: `${(task.priorityScore ?? 85.0).toFixed(1)} / 100`,
          impact: 'Model Output',
          explanation:
            'The XGBoost model combines multiple maintenance and operational features to produce the final priority score.',
        },

        {
          name: 'Defect Category',
          value: task.defectType || 'Infrastructure anomaly',
          impact: 'Model Input',
          explanation:
            'The type of defect influences the predicted urgency based on historical maintenance behaviour.',
        },

        {
          name: 'Location',
          value: task.location || 'Mainline Corridor',
          impact: 'Model Input',
          explanation:
            'The affected corridor and operational context contribute to determining the potential impact of the defect.',
        },
      ],
    },

    schedulingHorizon:
      task.status === 'Confirmed'
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
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/20 dark:shadow-black/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* S.A.M.A.Y Signature Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/10 via-amber-50/40 to-slate-100/60 dark:from-amber-500/15 dark:via-slate-900/90 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-xs">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  DEFECT TELEMETRY · {task.id}
                </h3>
                <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase inline-flex items-center space-x-1.5 shadow-xs border ${statusMeta.badge}`}>
                  <StatusIcon className="w-3 h-3" />
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
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Telemetry"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
          {/* Top 4 Metric Micro-Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs space-y-1 hover:border-amber-500/40 transition-all">
              <span className="text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Asset &amp; Section
              </span>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate" title={task.asset}>
                {task.asset}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                {telemetry.chainage}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs space-y-1 hover:border-amber-500/40 transition-all">
              <span className="text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Defect Severity
              </span>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate" title={task.defectType}>
                {task.defectType}
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block font-bold">
                {telemetry.severityLevel}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs space-y-1 hover:border-amber-500/40 transition-all">
              <span className="text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                AI Priority Score
              </span>
              <div className="font-black font-mono text-xs flex items-center space-x-1">
                <span
                  className={
                    (task.priorityScore ?? 0) >= 90
                      ? 'text-rose-600 dark:text-rose-400'
                      : (task.priorityScore ?? 0) >= 75
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-800 dark:text-slate-200'
                  }
                >
                  {task.priorityScore ? task.priorityScore.toFixed(1) : '78.5'}
                </span>
                <span className="text-slate-400 font-medium">/ 100</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                XGBoost ML Weight
              </span>
            </div>

            <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs space-y-1 hover:border-amber-500/40 transition-all">
              <span className="text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Possession Needed
              </span>
              <div className="font-bold font-mono text-slate-900 dark:text-slate-100 text-xs">
                {telemetry.recommendedWindow.split(' ')[0]} {telemetry.recommendedWindow.split(' ')[1]}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                {telemetry.trackLine}
              </span>
            </div>
          </div>

          {/* Section 1: Engineering Telemetry & Operational Impact */}
          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs space-y-2.5 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
              <span className="uppercase flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <span>Field Telemetry &amp; Ground Diagnostics</span>
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                Line: {telemetry.trackLine}
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-xs">
              {telemetry.operationalImpact}
            </p>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between shadow-xs">
              <span>Sensor Margin / Parameter Deviation:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{telemetry.stallingMargin}</span>
            </div>
          </div>

          {/* Section 2: Machine & Crew Requisition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs space-y-1.5 hover:border-amber-500/40 transition-all">
              <span className="text-[10px] font-bold uppercase font-mono text-slate-500 dark:text-slate-400 block tracking-wider">
                Required Equipment &amp; Test Kit
              </span>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {telemetry.equipmentNeeded}
              </p>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Calibrated per CRIS maintenance standards
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs space-y-1.5 hover:border-amber-500/40 transition-all">
              <span className="text-[10px] font-bold uppercase font-mono text-slate-500 dark:text-slate-400 block tracking-wider">
                Gang Deployment Quota
              </span>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {telemetry.crewGang}
              </p>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Division field personnel assigned
              </p>
            </div>
          </div>

          {/* Section 3: Scheduling Horizon & Coordination Status */}
          <div
            className={`p-4 rounded-xl border shadow-xs space-y-2.5 transition-all ${
              isConfirmed
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-300'
                : isRejected
                ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 text-rose-900 dark:text-rose-300'
                : isAwaiting
                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-300'
                : 'bg-slate-50/80 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono font-bold">
              <span className="uppercase flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-current/10 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span>Central Operations Scheduling Status</span>
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-current/10 border border-current/20">
                {task.status}
              </span>
            </div>
            <p className="text-xs font-medium leading-relaxed font-sans">
              {telemetry.schedulingHorizon}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 font-mono text-[10px] border-t border-current/20">
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

          {/* PRIORITY JUSTIFICATION INSPECTOR */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-xs">
            {/* Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-amber-500/10 via-amber-50/40 to-slate-100/60 dark:from-amber-500/15 dark:via-slate-900/90 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
                    Priority Justification Inspector
                  </span>
                  <span className="text-[9px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 uppercase">
                    EXPLAINABLE AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Why did the XGBoost model assign this priority?
                </p>
              </div>

              <div className="text-right">
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Model Score
                </div>
                <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
                  {(telemetry.priorityJustification?.score ??
                    task.priorityScore ??
                    telemetry.xgboostMetrics?.score ??
                    0
                  ).toFixed(1)}
                </div>
              </div>
            </div>

            {/* Decision Summary */}
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Decision */}
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 p-3 shadow-xs">
                  <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Decision
                  </div>
                  <div className="mt-1 font-bold text-xs text-slate-900 dark:text-slate-100">
                    {telemetry.priorityJustification?.decision || task.status || 'Pending'}
                  </div>
                </div>

                {/* Threshold */}
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 p-3 shadow-xs">
                  <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Priority Threshold
                  </div>
                  <div className="mt-1 font-bold text-xs font-mono text-slate-900 dark:text-slate-100">
                    ≥ {telemetry.priorityJustification?.threshold ?? 75}
                  </div>
                </div>

                {/* Model */}
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 p-3 shadow-xs">
                  <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Model
                  </div>
                  <div className="mt-1 font-bold text-xs font-mono text-slate-900 dark:text-slate-100">
                    XGBoost
                  </div>
                </div>
              </div>

              {/* Why this decision? */}
              <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 p-3.5">
                <div className="text-[9px] uppercase tracking-wider font-mono font-bold text-amber-700 dark:text-amber-400 mb-1">
                  Why this decision?
                </div>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {telemetry.priorityJustification?.summary ||
                    'The model evaluated the available defect, safety and operational features to determine the maintenance priority.'}
                </p>
              </div>

              {/* Feature Contributions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-500 dark:text-slate-400">
                    Feature Contribution
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    Higher contribution = greater priority
                  </span>
                </div>

                <div className="space-y-2">
                  {(telemetry.priorityJustification?.factors || []).map(
                    (factor, index) => {
                      const parsedImpact = parseFloat(
                        String(factor.impact).replace('+', '')
                      );
                      const hasNumericImpact = !Number.isNaN(parsedImpact);
                      const impact = hasNumericImpact
                        ? Math.max(parsedImpact, 0)
                        : 0;
                      const maxImpact = 25;
                      const width = Math.min(
                        (impact / maxImpact) * 100,
                        100
                      );

                      return (
                        <div
                          key={`${factor.name}-${index}`}
                          className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-3 hover:border-amber-500/40 transition-all"
                        >
                          {/* Feature Header */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {factor.name}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                Input: {factor.value}
                              </div>
                            </div>

                            {/* Impact */}
                            <div className="text-right font-mono">
                              <div className="text-xs font-black text-amber-600 dark:text-amber-400">
                                {factor.impact}
                              </div>
                              <div className="text-[8px] uppercase tracking-wider text-slate-400">
                                contribution
                              </div>
                            </div>
                          </div>

                          {/* Contribution Bar */}
                          {hasNumericImpact && (
                            <div className="mt-2 h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          )}

                          {/* Explanation */}
                          <div className="mt-2 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-sans">
                            {factor.explanation}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConfirmed
                  ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                  : isRejected
                  ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]'
                  : 'bg-amber-500 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.8)]'
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
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold uppercase text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center space-x-1.5 active:scale-[0.98]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit &amp; Resubmit</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-300/80 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer transition-all shadow-xs active:scale-[0.98]"
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered task collection
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status tab filter
      if (statusFilter !== 'all') {
        const s = (task.status || '').toLowerCase();
        if (statusFilter === 'confirmed' && !s.includes('confirm')) return false;
        if (statusFilter === 'awaiting' && !s.includes('await') && !s.includes('approval')) return false;
        if (statusFilter === 'rejected' && !s.includes('reject')) return false;
        if (statusFilter === 'pending' && !s.includes('pending') && !s.includes('scoring')) return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${task.id || ''} ${task.asset || ''} ${task.location || ''} ${task.defectType || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, searchQuery]);

  // Counts for tabs
  const counts = useMemo(() => {
    const c = { all: tasks.length, confirmed: 0, awaiting: 0, rejected: 0, pending: 0 };
    tasks.forEach((t) => {
      const s = (t.status || '').toLowerCase();
      if (s.includes('confirm')) c.confirmed += 1;
      else if (s.includes('await') || s.includes('approval')) c.awaiting += 1;
      else if (s.includes('reject')) c.rejected += 1;
      else c.pending += 1;
    });
    return c;
  }, [tasks]);

  // Error state
  if (error) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/40 overflow-hidden transition-colors duration-300">
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-slate-100/60 dark:from-amber-500/15 dark:via-slate-900/90 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-100/60 dark:from-amber-500/20 dark:via-slate-800 dark:to-slate-900 border border-amber-300/80 dark:border-amber-500/40 text-amber-500 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-xs">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              DEPARTMENT TASK QUEUE
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              CRIS AI Priority Scoring Matrix · Corridor Possession Queue
            </p>
          </div>
        </div>
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-300 text-xs flex items-center justify-between font-mono">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>Failed to load department task queue: {error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
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
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/40 overflow-hidden relative transition-colors duration-300">
      {/* Top Bar with Signature S.A.M.A.Y Gradient */}
      <div className="px-5 py-4 bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-slate-100/60 dark:from-amber-500/15 dark:via-slate-900/90 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-100/60 dark:from-amber-500/20 dark:via-slate-800 dark:to-slate-900 border border-amber-300/80 dark:border-amber-500/40 text-amber-500 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-xs transition-all duration-300">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 leading-tight">
                DEPARTMENT TASK QUEUE
              </h2>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wider shadow-2xs">
                {tasks.length} {tasks.length === 1 ? 'DEFECT' : 'DEFECTS'}
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
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-bold uppercase text-[10px] tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>LOG NEW DEFECT</span>
          </button>
        )}
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Filter & Search Bar */}
        {tasks.length > 0 && !isLoading && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-1">
            {/* Status Tabs */}
            <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono overflow-x-auto">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All ({counts.all})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('confirmed')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'confirmed'
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shadow-xs border border-emerald-200 dark:border-emerald-800'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Confirmed ({counts.confirmed})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('awaiting')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'awaiting'
                    ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shadow-xs border border-amber-200 dark:border-amber-800'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Awaiting Approval ({counts.awaiting})
              </button>
              {counts.rejected > 0 && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('rejected')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === 'rejected'
                      ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 shadow-xs border border-rose-200 dark:border-rose-800'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Rejected ({counts.rejected})
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search defect, asset..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

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
          <div className="py-14 px-4 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-white dark:from-slate-800 dark:to-slate-900 border border-amber-300/80 dark:border-amber-500/40 text-amber-500 flex items-center justify-center mb-3 shadow-xs">
              <ListOrdered className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 font-mono">
              NO DEFECTS LOGGED YET
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 mb-4 font-mono text-[11px]">
              Report infrastructure defects to request corridor block possession from Central Operations Planning.
            </p>
            {onOpenNewDefect && (
              <button
                type="button"
                onClick={onOpenNewDefect}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>LOG FIRST DEFECT</span>
              </button>
            )}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              No defects matching the selected filter or search query.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="mt-2 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          /* Card-wrapped Data Grid matching Defect Form */
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-xs">
            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                {/* Gunmetal Gray Grid Header Row */}
                <div className="grid grid-cols-12 gap-2 bg-slate-100/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 text-[11px] uppercase font-bold tracking-wider px-4 py-3 border-b border-slate-200 dark:border-slate-800 select-none font-mono">
                  <div className="col-span-2">Task ID</div>
                  <div className="col-span-4">Asset / Section</div>
                  <div className="col-span-3">Defect Category</div>
                  <div className="col-span-1 text-center">Score</div>
                  <div className="col-span-2 text-right">Status / Action</div>
                </div>

                {/* Data Rows */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                  {filteredTasks.map((task) => {
                    const statusMeta = STATUS_STYLES[task.status] || STATUS_STYLES['Pending Scoring'];
                    const StatusIcon = statusMeta.icon;
                    const isRejected = task.status === 'Rejected';

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="grid grid-cols-12 gap-2 items-center px-4 py-3.5 hover:bg-amber-50/25 dark:hover:bg-slate-800/60 cursor-pointer transition-colors text-xs group"
                        title="Click to view full defect telemetry & engineering profile"
                      >
                        {/* Task ID */}
                        <div className="col-span-2 font-mono font-bold text-slate-900 dark:text-slate-100 tracking-tight text-xs flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 group-hover:bg-amber-500 group-hover:shadow-[0_0_6px_rgba(245,158,11,0.8)] transition-all shrink-0"></span>
                          <span>{task.id}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono text-amber-600 dark:text-amber-400 font-normal">
                            Inspect
                          </span>
                        </div>

                        {/* Asset Location */}
                        <div className="col-span-4 min-w-0 pr-2">
                          <div className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" title={task.asset}>
                            {task.asset}
                          </div>
                          {task.location && task.location !== task.asset && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                              {task.location}
                            </div>
                          )}
                        </div>

                        {/* Defect Type */}
                        <div className="col-span-3 min-w-0 pr-2">
                          <div className="text-slate-600 dark:text-slate-300 truncate text-[11px] font-medium" title={task.defectType}>
                            {task.defectType}
                          </div>
                        </div>

                        {/* AI Priority Score */}
                        <div className="col-span-1 flex items-center justify-center">
                          <span
                            className={`font-black font-mono text-xs px-2.5 py-1 rounded-lg border shadow-2xs ${
                              task.priorityScore >= 90
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80'
                                : task.priorityScore >= 75
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/80'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {task.priorityScore ? task.priorityScore.toFixed(1) : '78.5'}
                          </span>
                        </div>

                        {/* Status Badge & Action */}
                        <div className="col-span-2 flex items-center justify-end space-x-1.5">
                          <span
                            className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase font-mono tracking-wider border inline-flex items-center space-x-1.5 shadow-2xs ${statusMeta.badge}`}
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
                              className="rounded-lg px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase text-[9px] font-mono tracking-wider shadow-xs transition-colors cursor-pointer inline-flex items-center space-x-1 shrink-0"
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

            {/* Table Footer */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span>Showing {filteredTasks.length} of {tasks.length} defects · Click any defect to inspect CRIS AI factor telemetry</span>
              <span className="uppercase text-amber-600 dark:text-amber-400 font-bold">CRIS XGBoost ML Matrix</span>
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
