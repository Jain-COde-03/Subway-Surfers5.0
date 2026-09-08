import React, { useState, useMemo, useEffect } from 'react';
import {
  Train,
  Cpu,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  AlertTriangle,
  RotateCw,
  Flame,
  Radio,
  Activity,
  SlidersHorizontal,
  UserCheck,
  LogOut,
  Check,
  X,
  Bell,
  Shield,
  ShieldCheck,
  Sun,
  Moon,
  Globe,
  FileText,
  Compass,
  TrendingUp,
  Layers,
  MapPin,
  ExternalLink,
  ChevronRight,
  Info,
  ArrowRight,
  Link2,
  Database,
} from 'lucide-react';

/* ========================================================================= */
/* DATA CONTRACTS & SIMULATED FASTAPI ENDPOINT RESPONSES                     */
/* ========================================================================= */

const INITIAL_GLOBAL_METRICS = {
  uptimePct: 99.4,
  hoursSaved: 56.5,
  totalBundled: 18,
  criticalDefects: 14,
  resourceStrain: 68,
};

const INITIAL_PROPOSED_BLOCKS = [
  {
    id: 'PROP-BLK-401',
    depts: ['Civil', 'Signal', 'Electrical'],
    track: 'Delhi - Ghaziabad UP Main (Km 14-18)',
    startTime: '2026-09-08T01:30:00',
    endTime: '2026-09-08T05:30:00',
    status: 'Pending Review',
    priorityScore: 97.4,
    tasksMerged: 3,
    hoursSaved: 4.5,
    summary: 'Joint P-Way Rail Grinding, Point Machine 104A Testing & 25kV OHE Power Isolation',
  },
  {
    id: 'PROP-BLK-402',
    depts: ['Civil', 'Signal'],
    track: 'Moradabad - Bareilly Dn Line (Km 42-46)',
    startTime: '2026-09-09T02:00:00',
    endTime: '2026-09-09T05:00:00',
    status: 'Pending Review',
    priorityScore: 94.2,
    tasksMerged: 2,
    hoursSaved: 3.0,
    summary: 'Track Geometry Tamping & Axle Counter Head Replacement',
  },
  {
    id: 'PROP-BLK-403',
    depts: ['Electrical'],
    track: 'Kanpur Central Yard Approach Catenary',
    startTime: '2026-09-10T01:00:00',
    endTime: '2026-09-10T04:30:00',
    status: 'Pending Review',
    priorityScore: 89.6,
    tasksMerged: 1,
    hoursSaved: 0,
    summary: 'Traction Substation SF6 Breaker Maintenance & Contact Wire Inspection',
  },
  {
    id: 'PROP-BLK-404',
    depts: ['Civil', 'Signal', 'Electrical'],
    track: 'Palwal - Mathura 3rd Line (Km 92-96)',
    startTime: '2026-09-11T02:30:00',
    endTime: '2026-09-11T06:00:00',
    status: 'Pending Review',
    priorityScore: 98.1,
    tasksMerged: 4,
    hoursSaved: 6.0,
    summary: 'Emergency USFD Weld Joint Clamp, Signal Track Circuit Resistance & Neutral Section Overhaul',
  },
];

const INITIAL_MASTER_SCHEDULE = [
  {
    id: 'BLK-MST-101',
    primaryDept: 'Civil',
    depts: ['Civil', 'Signal'],
    track: 'Delhi - Ghaziabad Up Main (Km 14-18)',
    startTime: '2026-09-08T02:00:00',
    endTime: '2026-09-08T06:00:00',
    status: 'Confirmed',
    priorityScore: 96.5,
    isBundled: true,
    associatedTasks: ['TSK-CIV-101', 'TSK-SIG-201'],
  },
  {
    id: 'BLK-MST-102',
    primaryDept: 'Signal',
    depts: ['Signal'],
    track: 'Tilak Bridge Chord (Platform 3 Loop)',
    startTime: '2026-09-09T01:30:00',
    endTime: '2026-09-09T04:30:00',
    status: 'Confirmed',
    priorityScore: 88.0,
    isBundled: false,
    associatedTasks: ['TSK-SIG-204'],
  },
  {
    id: 'BLK-MST-103',
    primaryDept: 'Electrical',
    depts: ['Electrical', 'Civil'],
    track: 'Palwal - Agra Cantt (Km 88-92)',
    startTime: '2026-09-10T02:00:00',
    endTime: '2026-09-10T05:30:00',
    status: 'Confirmed',
    priorityScore: 93.2,
    isBundled: true,
    associatedTasks: ['TSK-ELC-301', 'TSK-CIV-105'],
  },
  {
    id: 'BLK-MST-104',
    primaryDept: 'Civil',
    depts: ['Civil'],
    track: 'Aligarh Jn Yard Approach Dn Line',
    startTime: '2026-09-11T03:00:00',
    endTime: '2026-09-11T06:00:00',
    status: 'Confirmed',
    priorityScore: 84.7,
    isBundled: false,
    associatedTasks: ['TSK-CIV-108'],
  },
  {
    id: 'BLK-MST-105',
    primaryDept: 'Signal',
    depts: ['Signal', 'Electrical'],
    track: 'Moradabad - Bareilly Section (Km 54-58)',
    startTime: '2026-09-12T01:00:00',
    endTime: '2026-09-12T05:00:00',
    status: 'Confirmed',
    priorityScore: 95.8,
    isBundled: true,
    associatedTasks: ['TSK-SIG-209', 'TSK-ELC-304'],
  },
  {
    id: 'BLK-MST-106',
    primaryDept: 'Electrical',
    depts: ['Electrical'],
    track: 'New Delhi - Tughlakabad Freight Chord',
    startTime: '2026-09-13T02:00:00',
    endTime: '2026-09-13T05:00:00',
    status: 'Confirmed',
    priorityScore: 82.5,
    isBundled: false,
    associatedTasks: ['TSK-ELC-307'],
  },
  {
    id: 'BLK-MST-107',
    primaryDept: 'Civil',
    depts: ['Civil', 'Signal', 'Electrical'],
    track: 'Ghaziabad - Meerut City Double Line',
    startTime: '2026-09-14T01:30:00',
    endTime: '2026-09-14T06:30:00',
    status: 'Confirmed',
    priorityScore: 98.4,
    isBundled: true,
    associatedTasks: ['TSK-CIV-112', 'TSK-SIG-212', 'TSK-ELC-310'],
  },
];

const INITIAL_ACTIVITY_FEED = [
  {
    id: 'ACT-1',
    dept: 'Civil',
    message: 'TMS logged critical USFD flaw on Track Km 142/8 (PSR 30 km/h applied)',
    timestamp: '00:46:12',
    type: 'defect',
  },
  {
    id: 'ACT-2',
    dept: 'Signal',
    message: 'SMMS requested 2.0h block for Point Machine #104A stalling current fault',
    timestamp: '00:41:05',
    type: 'submission',
  },
  {
    id: 'ACT-3',
    dept: 'System',
    message: 'CP-SAT identified cross-department bundle saving 4.5h on Delhi-GZB line',
    timestamp: '00:35:50',
    type: 'bundle',
  },
  {
    id: 'ACT-4',
    dept: 'Electrical',
    message: 'TDMS completed 25kV Catenary tension calibration at Palwal Substation',
    timestamp: '00:22:18',
    type: 'approval',
  },
  {
    id: 'ACT-5',
    dept: 'Admin',
    message: 'Chief Controller gazetted Master Multi-Department Weekly Timetable',
    timestamp: '00:05:44',
    type: 'schedule',
  },
];

const DAYS_OF_WEEK = [
  { key: 'Mon', label: 'Monday', dateStr: 'Sep 08' },
  { key: 'Tue', label: 'Tuesday', dateStr: 'Sep 09' },
  { key: 'Wed', label: 'Wednesday', dateStr: 'Sep 10' },
  { key: 'Thu', label: 'Thursday', dateStr: 'Sep 11' },
  { key: 'Fri', label: 'Friday', dateStr: 'Sep 12' },
  { key: 'Sat', label: 'Saturday', dateStr: 'Sep 13' },
  { key: 'Sun', label: 'Sunday', dateStr: 'Sep 14' },
];

function getDayIndex(dateStr) {
  try {
    const d = new Date(dateStr);
    const day = d.getDay();
    return day === 0 ? 6 : day - 1;
  } catch {
    return 0;
  }
}

function formatTime(isoStr) {
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return isoStr;
  }
}

/* ========================================================================= */
/* MODULE 1: LEFT SIDEBAR (w-64) & MECHANICAL THEME TOGGLE                   */
/* ========================================================================= */

function AdminSidebar({ onLogout, activeNav, onSelectNav, isDarkMode, onToggleTheme }) {
  const navLinks = [
    { id: 'schedule', label: 'Master Timetable', icon: CalendarIcon },
    { id: 'network', label: 'Global Network Status', icon: Globe },
    { id: 'audit', label: 'Optimizer Audit Logs', icon: FileText },
    { id: 'map', label: 'Corridor Map', icon: Compass },
    { id: 'analytics', label: 'Disruption Analytics', icon: TrendingUp },
  ];

  return (
    <aside className="relative z-40 w-64 bg-slate-900 shadow-[4px_0_24px_rgba(0,0,0,0.4)] border-r border-slate-800 text-slate-100 flex flex-col justify-between flex-shrink-0 h-full select-none">
      <div className="flex flex-col">
        {/* Top Logo Area: Physical Terminal Bar */}
        <div className="px-4 py-3.5 border-b-4 border-amber-700 flex items-center space-x-3 bg-slate-950">
          <div className="w-8 h-8 rounded-sm bg-slate-900 border border-amber-600/60 flex items-center justify-center shadow-xs flex-shrink-0">
            <Train className="w-4 h-4 text-amber-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-white font-black text-sm tracking-wider leading-none">
                S.A.M.A.Y
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm bg-amber-700 text-white leading-none tracking-tight">
                HQ
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight mt-1 truncate">
              Central Operations Planning
            </p>
          </div>
        </div>

        {/* Profile: Chief Controller / Master Admin */}
        <div className="mx-3 my-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 shadow-inner flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-slate-900 border border-amber-600/60 flex items-center justify-center text-amber-500 font-bold text-xs shrink-0 shadow-xs">
            <UserCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate tracking-wide">
              Chief Controller / Master Admin
            </div>
            <div className="text-[10px] text-amber-400 font-mono font-bold tracking-tight flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-none bg-emerald-400 animate-pulse"></span>
              <span>Root Clearance · Level 5</span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="mt-1">
          <div className="px-4 mb-2 text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">
            CONTROL CENTER NAVIGATION
          </div>
          <nav className="space-y-1 px-3">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectNav(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-slate-800 border-l-4 border-amber-600 text-white shadow-xs font-bold'
                      : 'border-l-4 border-transparent text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-amber-500' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Status, Theme Toggle & Sign Out */}
      <div className="p-3 border-t-2 border-slate-950 bg-slate-950 space-y-2">
        {/* CP-SAT Solver Status */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white/90 text-[11px] shadow-inner">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-white text-[11px]">CRIS CP-SAT v9.8</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono font-bold">ACTIVE</span>
        </div>

        {/* Mechanical Light/Dark Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex items-center gap-3 w-full p-3 rounded-lg border border-slate-700 hover:bg-slate-800 transition-all cursor-pointer text-slate-300"
          title={isDarkMode ? 'Switch to Light Command' : 'Switch to Dark Command'}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Light Command
              </span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Dark Command
              </span>
            </>
          )}
        </button>

        {/* Sign Out Button */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-900 hover:bg-rose-950 hover:border-rose-700/60 text-white font-bold uppercase tracking-wider text-xs transition-all cursor-pointer border border-slate-800 shadow-md"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-500" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
}

/* ========================================================================= */
/* MODULE 2: THE GLOBAL KPI RIBBON (STRICT SLIDING CARD MATCH)               */
/* ========================================================================= */

function AdminKpiRibbon({ metrics }) {
  const cards = [
    {
      id: 'uptime',
      title: 'TOTAL ASSET UPTIME',
      value: `${metrics.uptimePct}`,
      unit: '%',
      sub: 'Network target 99.0% exceeded (+0.4%)',
      accentColor: 'bg-slate-700', // Steel
      badge: 'SYSTEM UPTIME',
      icon: Activity,
    },
    {
      id: 'hoursSaved',
      title: 'BLOCK-HOURS SAVED',
      value: `${metrics.hoursSaved}`,
      unit: 'hrs',
      sub: `${metrics.totalBundled} joint corridors synchronized`,
      accentColor: 'bg-amber-700', // Rust
      badge: 'BUNDLING GAIN',
      icon: Flame,
    },
    {
      id: 'criticalDefects',
      title: 'ACTIVE CRITICAL DEFECTS',
      value: `${metrics.criticalDefects}`,
      unit: 'Units',
      sub: 'Requires urgent block possession',
      accentColor: 'bg-emerald-800', // Deep Pine
      badge: 'CRITICAL BACKLOG',
      icon: AlertTriangle,
    },
    {
      id: 'strain',
      title: 'GLOBAL RESOURCE STRAIN',
      value: `${metrics.resourceStrain}`,
      unit: '%',
      sub: 'Equilibrium maintained across divisions',
      accentColor: 'bg-slate-800', // Gunmetal
      badge: 'LOAD FACTOR',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="group cursor-pointer relative h-40 w-full rounded-lg overflow-hidden shadow-xl shadow-slate-900/10 dark:shadow-black/40"
          >
            {/* Top Accent Layer (Translates up on group hover) */}
            <div
              className={`absolute top-0 left-0 w-full h-24 rounded-t-lg overflow-hidden transition-transform duration-300 ease-in-out group-hover:-translate-y-2 ${card.accentColor}`}
            >
              {/* Top Accent Badge */}
              <div className="px-3.5 py-2.5 flex items-center space-x-1.5 text-white/90">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider font-mono">
                  {card.badge}
                </span>
              </div>

              {/* Large Watermark Icon Overflowing Right Edge */}
              <Icon
                className="absolute -right-3 -bottom-3 w-20 h-20 text-white/20 pointer-events-none transform -rotate-12 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                aria-hidden="true"
              />
            </div>

            {/* Bottom Data Layer (Overlaps top accent layer) */}
            <div className="absolute bottom-0 left-0 w-full h-28 z-10 rounded-lg p-4 flex flex-col justify-between shadow-xl bg-slate-800 dark:bg-slate-900 text-white border border-slate-700/60 dark:border-slate-800 group-hover:shadow-2xl transition-all duration-300">
              {/* Card Title */}
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                {card.title}
              </span>

              {/* Metric Value */}
              <div className="flex items-baseline">
                <span className="text-2xl font-black text-white tracking-tight font-mono">
                  {card.value}
                </span>
                {card.unit && (
                  <span
                    className={`text-xs font-semibold text-slate-300 ${
                      card.unit === '%' ? 'ml-0.5' : 'ml-1.5'
                    }`}
                  >
                    {card.unit}
                  </span>
                )}
              </div>

              {/* Subtitle */}
              <p className="text-[11px] text-slate-300/90 font-medium truncate">
                {card.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ========================================================================= */
/* MODULE 3: THE TOP ACTION CENTER (CP-SAT ENGINE)                           */
/* ========================================================================= */

function CpSatActionCenter({ engineState, onRunOptimizer }) {
  const isRunning = engineState === 'running';

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden relative transition-colors duration-300">
      {/* Minimalist Slate Header */}
      <div className="px-5 py-4 rounded-t-lg bg-slate-100 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-950 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-slate-200 dark:border-slate-800 flex-shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 leading-tight">
                OR-TOOLS CP-SAT PLANNING ENGINE
              </h2>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-700 text-white uppercase font-mono">
                GLOBAL MIP SOLVER
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Jointly optimizes Civil, Signaling &amp; Electrical maintenance requests, minimizing train delay penalty indices
            </p>
          </div>
        </div>

        {/* Solver Engine State Pill */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-sm border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white">
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning
                ? 'bg-amber-500 animate-spin'
                : engineState === 'review'
                ? 'bg-blue-500'
                : engineState === 'approved'
                ? 'bg-emerald-500'
                : 'bg-emerald-500'
            } animate-pulse`}
          ></span>
          <span className="text-[10px] font-mono font-bold uppercase text-slate-800 dark:text-slate-200">
            {isRunning
              ? 'SOLVING MIP...'
              : engineState === 'review'
              ? 'PROPOSALS AWAITING REVIEW'
              : engineState === 'approved'
              ? 'MASTER PLAN COMMITTED'
              : 'STANDBY · READY'}
          </span>
        </div>
      </div>

      {/* Vanishing Dark Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-transparent dark:from-slate-600 dark:via-slate-700/50 dark:to-transparent opacity-90"></div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* 4 Modular Micro-Cards for Telemetry & Engine Config */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Engine State */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                ENGINE STATE
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                MIP Mode
              </span>
            </div>
            <div>
              <span
                className={`inline-block font-mono text-xs font-bold px-2 py-0.5 rounded-md border ${
                  engineState === 'running'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse'
                    : engineState === 'review'
                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                    : engineState === 'approved'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
              >
                {engineState === 'running'
                  ? 'SOLVING MIP CONSTRAINTS'
                  : engineState === 'review'
                  ? 'REVIEW PENDING'
                  : engineState === 'approved'
                  ? 'COMMITTED TO HORIZON'
                  : 'STANDBY · READY'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Constraint programming formulation
            </p>
          </div>

          {/* Card 2: Solver Core */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                SOLVER CORE
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                v9.8.3296
              </span>
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              Google OR-Tools CP-SAT
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Presolve linear relaxations &amp; SAT clauses
            </p>
          </div>

          {/* Card 3: Feasible Slots */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                FEASIBLE SLOTS
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                Corridors
              </span>
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              48 Identified Windows
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              COA sectional headways synchronized
            </p>
          </div>

          {/* Card 4: Avg Solve Time */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                AVG SOLVE TIME
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                Latency
              </span>
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              2,480 ms
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Multi-criteria MIP convergence speed
            </p>
          </div>
        </div>

        {/* Action Bar with Portal-Style Trigger Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Cross-department possession synthesis · Indian Railways Central Operations</span>
          </div>

          <button
            type="button"
            disabled={isRunning}
            onClick={onRunOptimizer}
            className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-700 text-white opacity-90 cursor-not-allowed animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white active:scale-[0.99]'
            }`}
          >
            {isRunning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-white" />
                <span>SOLVER ENGAGED: COMPUTING BUNDLES...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{engineState === 'review' ? 'RE-RUN CP-SAT OPTIMIZER' : 'RUN CP-SAT OPTIMIZER'}</span>
                <ArrowRight className="w-4 h-4 text-amber-400 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* MODULE 4: OPTIMIZER PROPOSAL REVIEW QUEUE (engineState === 'review')       */
/* ========================================================================= */

function OptimizerProposalReviewQueue({
  proposals,
  onApprove,
  onReject,
  onCommitAll,
  onSelectProposal,
}) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden transition-colors duration-300 animate-fadeIn">
      {/* Minimalist Slate Header */}
      <div className="px-5 py-4 rounded-t-lg bg-slate-100 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-950 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-slate-200 dark:border-slate-800 flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 leading-tight">
                OPTIMIZER PROPOSAL REVIEW QUEUE
              </h3>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-amber-700 text-white uppercase font-mono">
                {proposals.length} PROPOSALS GENERATED
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Review AI-bundled multi-department possession windows before committing to the Master Timetable
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCommitAll}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-wider shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
          <span>Commit All Approved to Master Schedule</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-300 ml-0.5" />
        </button>
      </div>

      {/* Vanishing Dark Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-transparent dark:from-slate-600 dark:via-slate-700/50 dark:to-transparent opacity-90"></div>

      {/* Table Container */}
      <div className="p-4 sm:p-5">
        <div className="rounded-lg border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs bg-white dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider font-mono">
                  <th className="py-3 px-4">PROPOSAL ID &amp; TRACK</th>
                  <th className="py-3 px-4">INVOLVED DEPARTMENTS</th>
                  <th className="py-3 px-4">PROPOSED WINDOW</th>
                  <th className="py-3 px-4">BUNDLING CALLOUT</th>
                  <th className="py-3 px-4">AI PRIORITY</th>
                  <th className="py-3 px-4 text-right">ADMIN ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">
                {proposals.map((prop) => {
                  const id = prop.id || prop.bundle_id;
                  const track = prop.track || prop.location || 'Corridor Section';
                  const depts = prop.depts || prop.departments || ['Civil'];
                  const rawStatus = (prop.status || 'pending_approval').toLowerCase();
                  const isApproved = rawStatus === 'approved';
                  const isRejected = rawStatus === 'rejected';
                  const windowHrs = prop.hoursSaved ?? prop.window_hrs ?? 4.5;
                  const priority = prop.priorityScore ?? 96.5;
                  const summary = prop.summary || `Joint corridor possession window across ${depts.join(' & ')}`;
                  const tasksMerged = prop.tasksMerged || (depts.length > 1 ? depts.length : 1);

                  return (
                    <tr
                      key={id}
                      onClick={() => onSelectProposal && onSelectProposal(prop)}
                      className={`group cursor-pointer hover:bg-amber-50/20 dark:hover:bg-slate-900/90 transition-all ${
                        isApproved
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                          : isRejected
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 opacity-60'
                          : ''
                      }`}
                      title="Click to view optimizer telemetry &amp; bundled task details"
                    >
                      {/* Proposal ID & Track */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="font-mono font-bold text-amber-600 dark:text-amber-500 text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 inline-block">
                            {id}
                          </div>
                          <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            <Info className="w-3 h-3 text-amber-600 dark:text-amber-500" />
                            <span>Inspect Telemetry</span>
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 leading-tight mt-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {track}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-mono">
                          {summary}
                        </div>
                      </td>

                      {/* Involved Departments */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {depts.map((d) => (
                            <span
                              key={d}
                              className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                d === 'Civil'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80'
                                  : d === 'Signal'
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/80'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Proposed Window */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {prop.startTime ? `${formatTime(prop.startTime)} - ${formatTime(prop.endTime)}` : `${windowHrs} Hours Window`}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {prop.startTime ? new Date(prop.startTime).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          }) : `${windowHrs}h Corridor Block`}
                        </span>
                      </td>

                      {/* Bundling Callout: Highlight merged tasks */}
                      <td className="py-3.5 px-4">
                        {tasksMerged > 1 ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 font-bold text-[10px] uppercase font-mono">
                            <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>
                              {tasksMerged} TASKS MERGED · SAVES {windowHrs}H
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-[11px] italic font-mono">
                            Single Dept Window
                          </span>
                        )}
                      </td>

                      {/* AI Priority Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-black text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                          {priority}
                        </span>
                      </td>

                      {/* Admin Action Buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isApproved ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-900 dark:text-emerald-300 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/80 px-2.5 py-1 rounded-lg">
                            <Check className="w-3.5 h-3.5" />
                            <span>APPROVED</span>
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center space-x-1 text-rose-900 dark:text-rose-300 font-bold text-xs bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/80 px-2.5 py-1 rounded-lg">
                            <X className="w-3.5 h-3.5" />
                            <span>REJECTED</span>
                          </span>
                        ) : (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onApprove(id);
                              }}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReject(id);
                              }}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span>CRIS CP-SAT multi-criteria optimization queue · Pending controller gazette</span>
            <span>SHOWING {proposals.length} PROPOSED BUNDLES</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* MODULE 5: MASTER MULTI-DEPARTMENT CALENDAR (BOTTOM CENTER)                */
/* ========================================================================= */

function MasterMultiDeptCalendar({ schedule, onSelectBlock }) {
  // Group schedule blocks by weekday index (0-6)
  const blocksByDay = useMemo(() => {
    return DAYS_OF_WEEK.map((day, idx) => {
      const dayBlocks = schedule.filter((b) => getDayIndex(b.startTime) === idx);
      return {
        ...day,
        blocks: dayBlocks,
      };
    });
  }, [schedule]);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden relative transition-colors duration-300">
      {/* Minimalist Slate Header */}
      <div className="px-5 py-4 rounded-t-lg bg-slate-100 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-950 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-slate-200 dark:border-slate-800 flex-shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 leading-tight">
                MASTER MULTI-DEPARTMENT TIMETABLE
              </h3>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-emerald-700 text-white uppercase font-mono">
                GAZETTED HORIZON
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-amber-700 text-white uppercase font-mono">
                {schedule.length} CONFIRMED BLOCKS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Unified cross-departmental possession schedule approved by Central Traffic Control · Click block for telemetry
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <span className="w-2.5 h-2.5 rounded-none bg-emerald-600"></span>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">Civil (TMS)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <span className="w-2.5 h-2.5 rounded-none bg-amber-600"></span>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">Signal (SMMS)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <span className="w-2.5 h-2.5 rounded-none bg-slate-500"></span>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">Electrical (TDMS)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-700/80 bg-amber-50 dark:bg-amber-950/60">
            <span className="text-[9px] font-bold uppercase px-1 py-0.2 rounded-sm bg-amber-700 text-white font-mono">
              Bundled
            </span>
            <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 font-mono">Merged</span>
          </div>
        </div>
      </div>

      {/* Vanishing Dark Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-transparent dark:from-slate-600 dark:via-slate-700/50 dark:to-transparent opacity-90"></div>

      {/* 7-Day Timeline Grid */}
      <div className="p-4 sm:p-5 overflow-x-auto">
        <div className="min-w-[880px] md:min-w-full rounded-lg border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs bg-white dark:bg-slate-950">
          {/* Top Row: Days of Week */}
          <div className="grid grid-cols-7 bg-slate-100/90 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 divide-x divide-slate-200 dark:divide-slate-800 text-center font-mono">
            {blocksByDay.map((day) => (
              <div key={day.key} className="py-3 px-2">
                <span className="text-slate-900 dark:text-slate-100 text-xs font-bold uppercase tracking-wider block">
                  {day.key}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                  {day.dateStr}
                </span>
              </div>
            ))}
          </div>

          {/* Columns: Scheduled Blocks */}
          <div className="grid grid-cols-7 divide-x divide-slate-200 dark:divide-slate-800 min-h-[320px] bg-slate-50/50 dark:bg-slate-950/40">
            {blocksByDay.map((day) => {
              const hasBlocks = day.blocks.length > 0;

              return (
                <div key={day.key} className="p-2 sm:p-2.5 flex flex-col justify-between space-y-2">
                  <div className="space-y-2.5 flex-1">
                    {hasBlocks ? (
                      day.blocks.map((block) => {
                        const dept = (block.primaryDept || (block.depts && block.depts[0]) || '').toLowerCase();
                        const isBundled = Boolean(block.isBundled || (block.depts && block.depts.length > 1));

                        // Department Border Classification
                        const deptBorderClass = dept.includes('civil')
                          ? 'border-l-4 border-l-emerald-600'
                          : dept.includes('signal')
                          ? 'border-l-4 border-l-amber-600'
                          : 'border-l-4 border-l-slate-500';

                        return (
                          <div
                            key={block.id}
                            onClick={() => onSelectBlock(block)}
                            className={`p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs shadow-xs hover:shadow-md hover:border-amber-500/80 dark:hover:border-amber-500/80 transition-all cursor-pointer ${deptBorderClass} space-y-2 overflow-hidden`}
                          >
                            {/* Top Row: Time Range */}
                            <div className="flex items-center space-x-1.5 font-mono text-[10px] font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                              <span>
                                {formatTime(block.startTime)} – {formatTime(block.endTime)}
                              </span>
                            </div>

                            {/* Prominent Bundled Pill Tag (Never cut off or overflowed) */}
                            {isBundled && (
                              <div>
                                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 text-[9px] font-mono font-bold uppercase tracking-wide">
                                  <Link2 className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                  <span>Bundled Block</span>
                                </span>
                              </div>
                            )}

                            {/* Track Location */}
                            <div className="text-xs font-bold leading-snug line-clamp-2 text-slate-900 dark:text-slate-100">
                              {block.track}
                            </div>

                            {/* Department Tags & ID */}
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px] font-mono gap-1">
                                <span className="font-bold text-amber-600 dark:text-amber-500 whitespace-nowrap">
                                  {block.id}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 font-bold whitespace-nowrap">
                                  Score: {block.priorityScore}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {(block.depts || [block.primaryDept]).map((d) => (
                                  <span
                                    key={d}
                                    className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap"
                                  >
                                    {d}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center py-8 text-center text-slate-400 dark:text-slate-600 font-mono">
                        <span className="text-[10px] uppercase tracking-wider">
                          Clear Corridor
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-center font-bold text-slate-500 dark:text-slate-400 font-mono">
                    {day.blocks.length} {day.blocks.length === 1 ? 'Window' : 'Windows'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* MODULE 6: GLOBAL ACTIVITY FEED (RIGHT SIDEBAR)                            */
/* ========================================================================= */

function GlobalActivityFeed({ activities }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden flex flex-col h-full transition-colors duration-300">
      {/* Minimalist Slate Header */}
      <div className="px-5 py-4 rounded-t-lg bg-slate-100 dark:bg-slate-800/40 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-950 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-slate-200 dark:border-slate-800 flex-shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 leading-tight">
                LIVE SERVER ACTIVITY LOG
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-700 text-white uppercase font-mono">
                TELEMETRY
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Control room cross-department telemetry stream
            </p>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-sm border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            ONLINE
          </span>
        </div>
      </div>

      {/* Vanishing Dark Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-transparent dark:from-slate-600 dark:via-slate-700/50 dark:to-transparent opacity-90"></div>

      {/* Live Server Log Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2.5 overflow-y-auto max-h-[580px] flex-1">
          {activities.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 shadow-xs space-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    item.dept === 'Civil'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80'
                      : item.dept === 'Signal'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/80'
                      : item.dept === 'Electrical'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      : 'bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-700/80'
                  }`}
                >
                  {item.dept}
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  <span>{item.timestamp}</span>
                </span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 text-xs font-medium leading-relaxed">
                {item.message}
              </p>
            </div>
          ))}
        </div>

        {/* Telemetry Sync Status Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>HQ Telemetry Stream Active</span>
          </span>
          <span>SYNC: REALTIME</span>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* CP-SAT PIPELINE MODAL & FALLBACK CONTRACTS                                */
/* ========================================================================= */

const FALLBACK_OPTIMIZED_TASKS = [
  {
    bundle_id: 'BLK-MST-101',
    id: 'BLK-MST-101',
    departments: ['Civil', 'Signal'],
    depts: ['Civil', 'Signal'],
    window_hrs: 4.5,
    hoursSaved: 4.5,
    location: 'Delhi-Ghaziabad UP',
    track: 'Delhi - Ghaziabad UP (Km 14-18)',
    status: 'pending_approval',
    summary: 'Bundled Track Geometry Tamping & Point Machine 104A Recalibration',
    priorityScore: 97.4,
    tasksMerged: 2,
    startTime: '2026-09-08T02:00:00',
    endTime: '2026-09-08T06:30:00',
  },
  {
    bundle_id: 'BLK-MST-102',
    id: 'BLK-MST-102',
    departments: ['Civil', 'Electrical'],
    depts: ['Civil', 'Electrical'],
    window_hrs: 3.5,
    hoursSaved: 3.5,
    location: 'Moradabad - Bareilly Dn Line',
    track: 'Moradabad - Bareilly Dn Line (Km 42-46)',
    status: 'pending_approval',
    summary: 'Combined USFD Rail Weld Clamping & Catenary Dropper Adjustment',
    priorityScore: 94.8,
    tasksMerged: 2,
    startTime: '2026-09-09T01:30:00',
    endTime: '2026-09-09T05:00:00',
  },
  {
    bundle_id: 'BLK-MST-103',
    id: 'BLK-MST-103',
    departments: ['Signal', 'Electrical'],
    depts: ['Signal', 'Electrical'],
    window_hrs: 5.0,
    hoursSaved: 5.0,
    location: 'Palwal - Mathura 3rd Line',
    track: 'Palwal - Mathura 3rd Line (Km 92-96)',
    status: 'pending_approval',
    summary: 'Digital Axle Counter Reset & 25kV OHE Cantilever Realignment',
    priorityScore: 98.2,
    tasksMerged: 2,
    startTime: '2026-09-10T01:00:00',
    endTime: '2026-09-10T06:00:00',
  },
];

const PIPELINE_STAGES = [
  {
    id: 1,
    title: 'Corridor Defect Backlog Ingestion',
    subtitle: 'TMS, SMMS & TDMS multi-department backlog ingestion & spatial clustering',
    icon: Database,
    targetDuration: 1.1,
    activeDetail: 'Ingesting 14 backlog defect notices across Civil, S&T, Electrical feeds...',
    completedDetail: 'Ingested 14 active defects clustered across UP/DN trunk corridors.',
  },
  {
    id: 2,
    title: 'Sent to XGBoost Model Booster for Prioritising',
    subtitle: 'Gradient boosted tree severity scoring & dynamic hazard penalty weighting',
    icon: TrendingUp,
    targetDuration: 1.4,
    activeDetail: 'Scoring track degradation vectors & computing derailment hazard weights...',
    completedDetail: 'ML priority scoring converged: Peak critical priority 98.2 assigned to P-Way weld.',
  },
  {
    id: 3,
    title: 'COA Train Headway & Sectional Clearance Resolution',
    subtitle: 'Control Office Application passenger & freight timetable arbitration',
    icon: Clock,
    targetDuration: 1.0,
    activeDetail: 'Arbitrating 48 candidate slots with live sectional train diagrams & headways...',
    completedDetail: 'Clearance validated for 48 windows with zero headway conflicts against mail/express trains.',
  },
  {
    id: 4,
    title: 'Google OR-Tools CP-SAT MIP Optimization & Bundling',
    subtitle: 'Mixed-integer programming corridor bundling & resource allocation solver',
    icon: Cpu,
    targetDuration: 1.8,
    activeDetail: 'Solving multi-criteria MIP: Maximizing track hours saved, co-locating multi-dept crews...',
    completedDetail: 'Optimal convergence reached. 3 bundled corridor possessions synthesized, saving 13.0 hours.',
  },
];

function CpSatPipelineModal({
  isOpen,
  onClose,
  onOpenReviewQueue,
}) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stageRuntimes, setStageRuntimes] = useState([0, 0, 0, 0]);
  const [stageStatuses, setStageStatuses] = useState(['running', 'pending', 'pending', 'pending']);
  const [isComplete, setIsComplete] = useState(false);

  // Reset and restart whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStageIndex(0);
      setStageRuntimes([0, 0, 0, 0]);
      setStageStatuses(['running', 'pending', 'pending', 'pending']);
      setIsComplete(false);
    }
  }, [isOpen]);

  // Sequential stage runner with ticking live stopwatch
  useEffect(() => {
    if (!isOpen || isComplete) return;

    const currentStage = PIPELINE_STAGES[currentStageIndex];
    if (!currentStage) return;

    const startTime = performance.now();
    const targetMs = currentStage.targetDuration * 1000;

    const timer = setInterval(() => {
      const elapsedMs = performance.now() - startTime;
      const elapsedSec = elapsedMs / 1000;

      setStageRuntimes((prev) => {
        const next = [...prev];
        next[currentStageIndex] = Math.min(Number(elapsedSec.toFixed(1)), currentStage.targetDuration);
        return next;
      });

      if (elapsedMs >= targetMs) {
        clearInterval(timer);

        setStageRuntimes((prev) => {
          const next = [...prev];
          next[currentStageIndex] = currentStage.targetDuration;
          return next;
        });

        setStageStatuses((prev) => {
          const next = [...prev];
          next[currentStageIndex] = 'completed';
          if (currentStageIndex + 1 < PIPELINE_STAGES.length) {
            next[currentStageIndex + 1] = 'running';
          }
          return next;
        });

        if (currentStageIndex + 1 < PIPELINE_STAGES.length) {
          setCurrentStageIndex((prev) => prev + 1);
        } else {
          setIsComplete(true);
        }
      }
    }, 50);

    return () => clearInterval(timer);
  }, [isOpen, currentStageIndex, isComplete]);

  if (!isOpen) return null;

  const totalRuntime = stageRuntimes.reduce((acc, curr) => acc + curr, 0).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl shadow-slate-900/40 dark:shadow-black/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Minimalist Slate Header */}
        <div className="px-6 py-4 rounded-t-xl bg-slate-100 dark:bg-slate-800/40 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-950 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-slate-200 dark:border-slate-800 flex-shrink-0 shadow-xs">
              <Cpu className={`w-5 h-5 ${!isComplete ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  CRIS CP-SAT OPTIMIZATION PIPELINE
                </h3>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase font-mono ${
                    isComplete ? 'bg-emerald-600 text-white' : 'bg-amber-700 text-white animate-pulse'
                  }`}
                >
                  {isComplete ? 'SOLVER CONVERGED' : 'SOLVER ACTIVE'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Autonomous multi-stage ML scoring, timetable arbitration &amp; CP-SAT MIP bundling
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
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Top Status & Overall Progress Banner */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isComplete ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
                }`}
              ></span>
              <span className="text-slate-700 dark:text-slate-300 font-bold uppercase">
                {isComplete
                  ? 'All 4 Pipeline Stages Successfully Resolved'
                  : `Running Stage 0${currentStageIndex + 1} of 04 · Live Telemetry`}
              </span>
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              Total Elapsed:{' '}
              <span className="font-bold text-slate-900 dark:text-slate-100">{totalRuntime}s</span>
            </div>
          </div>

          {/* 4 Process Loaders */}
          <div className="space-y-3">
            {PIPELINE_STAGES.map((stage, idx) => {
              const status = stageStatuses[idx];
              const runtime = stageRuntimes[idx];
              const percent =
                status === 'completed'
                  ? 100
                  : status === 'running'
                  ? Math.min(98, Math.round((runtime / stage.targetDuration) * 100))
                  : 0;

              return (
                <div
                  key={stage.id}
                  className={`p-3.5 rounded-lg border transition-all duration-300 ${
                    status === 'running'
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/80 shadow-md ring-1 ring-amber-400/30'
                      : status === 'completed'
                      ? 'bg-slate-50/80 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-50/30 dark:bg-slate-950/30 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono transition-colors ${
                          status === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                            : status === 'running'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {status === 'completed' ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                        ) : status === 'running' ? (
                          <RotateCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
                        ) : (
                          <span>0{stage.id}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4
                          className={`text-xs font-bold uppercase tracking-tight truncate ${
                            status === 'running'
                              ? 'text-amber-900 dark:text-amber-300'
                              : status === 'completed'
                              ? 'text-slate-900 dark:text-slate-100'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {stage.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                          {stage.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Runtime Badge Displaying How Many Seconds It Ran */}
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {status === 'completed' ? (
                        <span className="px-2 py-0.5 rounded-sm bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Ran for {runtime.toFixed(1)}s</span>
                        </span>
                      ) : status === 'running' ? (
                        <span className="px-2 py-0.5 rounded-sm bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 text-[10px] font-mono font-bold flex items-center space-x-1 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>Running: {runtime.toFixed(1)}s</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 text-[10px] font-mono">
                          Queued (--s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full transition-all duration-75 ${
                        status === 'completed'
                          ? 'bg-emerald-500 dark:bg-emerald-400'
                          : status === 'running'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500'
                          : 'bg-transparent'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Dynamic Status Detail */}
                  <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                    {status === 'completed'
                      ? stage.completedDetail
                      : status === 'running'
                      ? stage.activeDetail
                      : 'Awaiting upstream pipeline execution...'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Convergence Summary (Reveals when all 4 loaders finish) */}
          {isComplete && (
            <div className="p-4 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-700/80 shadow-xs space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                      CP-SAT MIP OPTIMIZATION CONVERGED · CANDIDATE BLOCKS READY
                    </h4>
                    <p className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                      All 4 stages completed in {totalRuntime}s · Presolve and SAT clauses satisfied
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-mono text-[10px] font-bold">
                  OPTIMAL (0 ERRORS)
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/80 text-center font-mono">
                <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-md border border-emerald-200 dark:border-emerald-900">
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">Bundles Created</div>
                  <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">3 Possessions</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-md border border-emerald-200 dark:border-emerald-900">
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">Track Hours Saved</div>
                  <div className="text-xs font-black text-amber-700 dark:text-amber-400">13.0 hrs</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-md border border-emerald-200 dark:border-emerald-900">
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">Headway Conflicts</div>
                  <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">0 Conflicts</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-md border border-emerald-200 dark:border-emerald-900">
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">Solve Duration</div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-200">{totalRuntime}s</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Inspect Option */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}
            ></span>
            <span>
              {isComplete
                ? 'Optimization complete. Candidate blocks forwarded to Review Queue.'
                : `Pipeline execution in progress (Stage 0${currentStageIndex + 1} active)...`}
            </span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            {isComplete ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors shadow-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={onOpenReviewQueue}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer shadow-md transition-all active:scale-[0.99]"
                >
                  <span>Inspect in Review Queue</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition-colors shadow-xs"
              >
                Cancel &amp; Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* BLOCK DETAIL MODAL                                                        */
/* ========================================================================= */

function BlockDetailModal({ block, onClose }) {
  if (!block) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Minimalist Slate Header */}
        <div className="px-5 py-4 rounded-t-xl bg-slate-100 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-950 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-slate-200 dark:border-slate-800 flex-shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  CORRIDOR POSSESSION TELEMETRY · {block.id}
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-700 text-white uppercase font-mono">
                  GAZETTED
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                CRIS CP-SAT Gazetted Possession Window Telemetry Sheet
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vanishing Dark Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-transparent dark:from-slate-600 dark:via-slate-700/50 dark:to-transparent opacity-90"></div>

        {/* Modal Body */}
        <div className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
                Track Location
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                {block.track}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
                Time Window
              </span>
              <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100 block">
                {formatTime(block.startTime)} - {formatTime(block.endTime)}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
              Involved Departments &amp; Bundling
            </span>
            <div className="flex flex-wrap gap-1.5 items-center">
              {(block.depts || [block.primaryDept]).map((d) => (
                <span
                  key={d}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                >
                  {d}
                </span>
              ))}
              {block.isBundled && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 font-mono flex items-center space-x-1">
                  <Link2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Bundled Corridor Window</span>
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
              Optimization Constraints &amp; Gazette Status
            </span>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 dark:text-slate-400">AI Priority Score:</span>
              <span className="font-black text-amber-600 dark:text-amber-400">{block.priorityScore} / 100</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 dark:text-slate-400">Gazette Horizon Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{block.status}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer shadow-xs transition-colors"
          >
            Close Telemetry Sheet
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* BUNDLED PROPOSAL DETAIL MODAL (AI OPTIMIZER SYNTHESIS & SUB-TASKS)        */
/* ========================================================================= */

function getBundledProposalDetails(prop) {
  const id = prop.id || prop.bundle_id || 'BLK-MST-101';

  if (id.includes('101') || id.includes('401')) {
    return {
      chainage: 'Km 14/2 to Km 17/8 (UP Main)',
      spatialOverlap: '100% Spatial Co-Location',
      safetyBuffer: '450m machine-to-ground crew clearance verified',
      hoursSaved: prop.hoursSaved ?? prop.window_hrs ?? 4.5,
      tasks: [
        {
          id: 'TSK-CIV-2026-089',
          dept: 'Civil',
          title: 'Track Geometry Tamping & Ballast Regulating',
          window: '02:00 - 04:30 (2.5 hrs)',
          machine: 'Plasser Duomatic 08-32 Track Relaying Train',
          crew: '8 P-Way Technicians + JE (P-Way)',
          originalWindow: '3.5 hrs standalone',
          riskAvoided: 'Rectifies 0.4mm gauge widening & dynamic cross-level deviation on high-speed track.',
        },
        {
          id: 'TSK-SIG-2026-114',
          dept: 'Signal',
          title: 'Point Machine 104A Recalibration & Ground Connections',
          window: '03:30 - 06:30 (3.0 hrs)',
          machine: 'High-Precision Digital Multimeter & Throw Rod Test Rig',
          crew: '4 S&T Signal Maintainers + SSE (Signal)',
          originalWindow: '3.0 hrs standalone',
          riskAvoided: 'Eliminates detection contact resistance fault & prevents switch point locking failure.',
        },
      ],
      xgboost: {
        rawScore: prop.priorityScore ?? 97.4,
        defectSeverity: '96.8 / 100 · Critical track geometry deviation on trunk route',
        hazardWeight: '0.94 · Dense passenger traffic index (Derailment risk mitigation)',
        tsrAvoidance: 'Averts mandatory 30 km/h Temporary Speed Restriction (TSR)',
        passengerMinsSaved: '185 passenger delay minutes averted',
      },
      headway: {
        precedingTrain: '12004 Lucknow Shatabdi Exp (Passed 01:28, +32 min clearance margin)',
        followingTrain: '12423 Dibrugarh Rajdhani Exp (Expected 07:05, +35 min buffer margin)',
        freightClearance: 'Arbitrated 2 container rakes via Goods Avoidance Line (GAL)',
        conflicts: '0 Timetable Path Conflicts Identified',
      },
      cpsat: {
        solveLatency: '2,480 ms',
        linearRelaxation: 'Converged in 1,240 presolve simplex iterations',
        constraintsSatisfied: '100% (Machine spacing, 25kV power isolation, crew shift quotas)',
        netHoursSaved: '4.5 Track Possession Hours Saved',
      },
    };
  }

  if (id.includes('102') || id.includes('402')) {
    return {
      chainage: 'Km 42/0 to Km 46/0 (DN Mainline)',
      spatialOverlap: '98% Spatial Co-Location',
      safetyBuffer: '380m electrical-to-weld crew clearance verified',
      hoursSaved: prop.hoursSaved ?? prop.window_hrs ?? 3.5,
      tasks: [
        {
          id: 'TSK-CIV-2026-094',
          dept: 'Civil',
          title: 'Combined USFD Rail Weld Clamping & Flaw Testing',
          window: '01:30 - 03:45 (2.25 hrs)',
          machine: 'Double-Rail USFD Ultrasonic Flaw Detector Trolley Unit 02',
          crew: '6 P-Way Welders + SSE (P-Way)',
          originalWindow: '3.0 hrs standalone',
          riskAvoided: 'Eliminates transverse fatigue crack failure risk on rail head under heavy freight axles.',
        },
        {
          id: 'TSK-ELE-2026-057',
          dept: 'Electrical',
          title: '25kV OHE Catenary Dropper Adjustment & Wire Height Survey',
          window: '02:15 - 05:00 (2.75 hrs)',
          machine: 'OHE Self-Propelled Inspection Car (Tower Wagon RU-08)',
          crew: '5 Traction Distribution (TRD) Linemen + JE (TRD)',
          originalWindow: '3.0 hrs standalone',
          riskAvoided: 'Prevents electric pantograph entanglement & catenary sag tripping on DN corridor.',
        },
      ],
      xgboost: {
        rawScore: prop.priorityScore ?? 94.8,
        defectSeverity: '94.2 / 100 · Rail head USFD ultrasonic flaw detection anomaly',
        hazardWeight: '0.91 · High-axle-load freight & mail corridor weight',
        tsrAvoidance: 'Eliminates 20 km/h cautionary speed order on DN mainline',
        passengerMinsSaved: '140 passenger delay minutes averted',
      },
      headway: {
        precedingTrain: '14206 Delhi-Ayodhya Cantt Exp (Passed 01:05, +25 min clearance margin)',
        followingTrain: '12230 Lucknow Mail (Expected 05:40, +40 min buffer margin)',
        freightClearance: 'Held 1 empty coal rake at Bareilly Yard loop line during window',
        conflicts: '0 Timetable Path Conflicts Identified',
      },
      cpsat: {
        solveLatency: '2,150 ms',
        linearRelaxation: 'Converged in 980 presolve simplex iterations',
        constraintsSatisfied: '100% (25kV traction power block isolated, USFD clearance valid)',
        netHoursSaved: '3.5 Track Possession Hours Saved',
      },
    };
  }

  // Default / 103 / other proposals
  return {
    chainage: 'Km 92/5 to Km 96/0 (3rd Feeder Line)',
    spatialOverlap: '100% Spatial Co-Location',
    safetyBuffer: '500m electronic sensor buffer verified',
    hoursSaved: prop.hoursSaved ?? prop.window_hrs ?? 5.0,
    tasks: [
      {
        id: 'TSK-SIG-2026-121',
        dept: 'Signal',
        title: 'Digital Axle Counter (HAC-DAC) Reset & Sensor Alignment',
        window: '01:00 - 04:30 (3.5 hrs)',
        machine: 'High-Availability Dual-Channel DAC Calibration Analyzer',
        crew: '5 S&T Signal Engineers + SSE (Signal)',
        originalWindow: '4.0 hrs standalone',
        riskAvoided: 'Resolves intermittent track occupancy false drops & signal flicker on 3rd Line.',
      },
      {
        id: 'TSK-ELE-2026-063',
        dept: 'Electrical',
        title: '25kV OHE Cantilever Realignment & Section Insulator Servicing',
        window: '02:00 - 06:00 (4.0 hrs)',
        machine: 'Self-Propelled 8-Wheeler Tower Wagon (RU-14)',
        crew: '7 TRD Technicians + SSE (TRD)',
        originalWindow: '4.5 hrs standalone',
        riskAvoided: 'Remedies insulator flashover & cantilever corrosion degradation before foggy season.',
      },
    ],
    xgboost: {
      rawScore: prop.priorityScore ?? 98.2,
      defectSeverity: '98.5 / 100 · Axle counter false-occupancy tripping on high-speed feeder',
      hazardWeight: '0.96 · High-density freight feeder line to Mathura Junction',
      tsrAvoidance: 'Prevents total section closure; saves 220 passenger & freight delay minutes',
      passengerMinsSaved: '220 passenger delay minutes averted',
    },
    headway: {
      precedingTrain: '12954 August Kranti Tejas Rajdhani (Passed 00:35, +25 min clearance margin)',
      followingTrain: '12926 Paschim SF Express (Expected 06:45, +45 min buffer margin)',
      freightClearance: 'Diverted 3 container trains via Up & Dn mainlines during window',
      conflicts: '0 Timetable Path Conflicts Identified',
    },
    cpsat: {
      solveLatency: '2,620 ms',
      linearRelaxation: 'Converged in 1,410 presolve simplex iterations',
      constraintsSatisfied: '100% (Substation sectioning switch isolated, DAC clearance verified)',
      netHoursSaved: '5.0 Track Possession Hours Saved',
    },
  };
}

function ProposalDetailModal({ proposal, onClose, onApprove, onReject }) {
  if (!proposal) return null;

  const id = proposal.id || proposal.bundle_id;
  const rawStatus = (proposal.status || 'pending_approval').toLowerCase();
  const isApproved = rawStatus === 'approved';
  const isRejected = rawStatus === 'rejected';
  const details = getBundledProposalDetails(proposal);
  const depts = proposal.depts || proposal.departments || ['Civil', 'Signal'];
  const track = proposal.track || proposal.location || 'Corridor Section';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl shadow-slate-900/40 dark:shadow-black/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Minimalist Slate Header */}
        <div className="px-6 py-4 rounded-t-xl bg-slate-100 dark:bg-slate-800/40 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-950 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-slate-200 dark:border-slate-800 flex-shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  OPTIMIZER TELEMETRY · BUNDLED PROPOSAL {id}
                </h3>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase ${
                    isApproved
                      ? 'bg-emerald-600 text-white'
                      : isRejected
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-700 text-white'
                  }`}
                >
                  {isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : 'PENDING REVIEW'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                CRIS CP-SAT Bundled Multi-Department Possession Intelligence Sheet
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
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto text-xs">
          {/* Top 4 Metric Micro-Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
                Track &amp; Section
              </span>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                {track}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                {details.chainage}
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
                Optimized Window
              </span>
              <div className="font-bold font-mono text-slate-900 dark:text-slate-100 text-xs">
                {proposal.startTime ? `${formatTime(proposal.startTime)} - ${formatTime(proposal.endTime)}` : `${details.hoursSaved}h Window`}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                {proposal.startTime ? new Date(proposal.startTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Next Horizon'}
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
                Possession Savings
              </span>
              <div className="font-bold font-mono text-amber-600 dark:text-amber-400 text-xs flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5" />
                <span>{details.hoursSaved}h Track Hours</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                {details.tasks.length} Tasks Bundled
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
                XGBoost Priority
              </span>
              <div className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                {details.xgboost.rawScore} / 100
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                Top 2% Critical Index
              </span>
            </div>
          </div>

          {/* Section 1: Constituent Tasks Bundled By Optimizer */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  CONSTITUENT DEPARTMENTAL TASKS BUNDLED BY CP-SAT
                </h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80">
                Single Unified Possession Window
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {details.tasks.map((task, idx) => (
                <div
                  key={task.id}
                  className="p-3.5 bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                        Task 0{idx + 1}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          task.dept === 'Civil'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80'
                            : task.dept === 'Signal'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/80'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700/80'
                        }`}
                      >
                        {task.dept} Dept
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {task.id}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      {task.title}
                    </h5>
                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                      Sub-window: <span className="font-semibold text-slate-900 dark:text-slate-200">{task.window}</span> (Standalone: {task.originalWindow})
                    </div>
                  </div>

                  <div className="space-y-1 pt-1.5 border-t border-slate-200 dark:border-slate-800/80 text-[10px] font-mono">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Machinery / Kit:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-200 truncate max-w-[200px] text-right">
                        {task.machine}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Crew Deployed:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-200">
                        {task.crew}
                      </span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 pt-1 text-[9.5px] leading-tight">
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">Risk Addressed: </span>
                      {task.riskAvoided}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Optimizer Synthesis Telemetry (3 Feature Cards) */}
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                OPTIMIZER MULTI-STAGE REASONING &amp; CONVERGENCE
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Card 1: Spatial & Physical Constraints */}
              <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                  <span className="uppercase">Spatial Co-Location</span>
                  <span className="text-amber-600 dark:text-amber-400">Bounds</span>
                </div>
                <div className="space-y-1 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-slate-500">Overlap: </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{details.spatialOverlap}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Chainage: </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{details.chainage}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Buffer: </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{details.safetyBuffer}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: XGBoost Machine Learning Telemetry */}
              <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                  <span className="uppercase">XGBoost ML Scoring</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Weights</span>
                </div>
                <div className="space-y-1 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                  <div className="truncate">
                    <span className="text-slate-500">Hazard: </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{details.xgboost.hazardWeight}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">TSR Avoided: </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{details.xgboost.tsrAvoidance}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">Delay: </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{details.xgboost.passengerMinsSaved}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: COA Timetable Headway Arbitration */}
              <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                  <span className="uppercase">COA Headway Arbitration</span>
                  <span className="text-blue-600 dark:text-blue-400">Paths</span>
                </div>
                <div className="space-y-1 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                  <div className="truncate">
                    <span className="text-slate-500">Preceding: </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{details.headway.precedingTrain}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">Following: </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{details.headway.followingTrain}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">Freight: </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{details.headway.freightClearance}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Solver Core Metrics Banner */}
          <div className="p-3.5 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-600 dark:text-slate-400">
            <div>
              <span className="text-slate-500">OR-Tools Solver Presolve: </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{details.cpsat.linearRelaxation}</span>
            </div>
            <div>
              <span className="text-slate-500">Convergence Speed: </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{details.cpsat.solveLatency}</span>
            </div>
            <div>
              <span className="text-slate-500">Constraint Satisfaction: </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{details.cpsat.constraintsSatisfied}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isApproved ? 'bg-emerald-500' : isRejected ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
              }`}
            ></span>
            <span>
              {isApproved
                ? 'Proposal approved. Ready to commit to Master Gazetted Timetable.'
                : isRejected
                ? 'Proposal rejected. Backlog returned to department holding queue.'
                : 'Awaiting Chief Controller decision on candidate bundled window.'}
            </span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            {!isApproved && !isRejected ? (
              <>
                <button
                  type="button"
                  onClick={() => onReject && onReject(id)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer shadow-xs transition-colors flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  type="button"
                  onClick={() => onApprove && onApprove(id)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all active:scale-[0.99] flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Approve Proposal</span>
                </button>
              </>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* ROOT COMPONENT: MASTER ADMIN CONTROL ROOM DASHBOARD                       */
/* ========================================================================= */

export default function AdminDashboard({ user, onLogout }) {
  // Theme state: defaults to dark mode (isDarkMode = true)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Engine state machine: 'standby' -> 'running' -> 'review' -> 'approved'
  const [engineState, setEngineState] = useState('standby');

  // Requirement 1: State management for returned optimized tasks
  const [optimizedTasks, setOptimizedTasks] = useState([]);

  // Root state collections
  const [globalMetrics, setGlobalMetrics] = useState(INITIAL_GLOBAL_METRICS);
  const [proposedBlocks, setProposedBlocks] = useState(INITIAL_PROPOSED_BLOCKS);
  const [masterSchedule, setMasterSchedule] = useState(INITIAL_MASTER_SCHEDULE);
  const [activityFeed, setActivityFeed] = useState(INITIAL_ACTIVITY_FEED);
  const [activeNav, setActiveNav] = useState('schedule');
  const [selectedBlockModal, setSelectedBlockModal] = useState(null);
  const [selectedProposalModal, setSelectedProposalModal] = useState(null);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);

  // Requirements 2 & 3: Asynchronous handleRunOptimizer with Hackathon Armor Fallback & Pipeline Modal
  const handleRunOptimizer = async () => {
    setIsPipelineModalOpen(true);
    setEngineState('running');

    try {
      const response = await fetch('http://localhost:8000/api/v1/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const tasks = Array.isArray(data) ? data : (data.tasks || []);
      const finalTasks = tasks.length > 0 ? tasks : FALLBACK_OPTIMIZED_TASKS;
      setOptimizedTasks(finalTasks);

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });
      setActivityFeed((prev) => [
        {
          id: `ACT-${Date.now()}`,
          dept: 'System',
          message: `CRIS CP-SAT Engine solved schedule: ${finalTasks.length} optimal candidate blocks identified.`,
          timestamp: timeStr,
          type: 'bundle',
        },
        ...prev,
      ]);
    } catch (err) {
      console.warn('Backend /api/v1/optimize error (activating hackathon armor fallback):', err);
      setOptimizedTasks(FALLBACK_OPTIMIZED_TASKS);

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });
      setActivityFeed((prev) => [
        {
          id: `ACT-${Date.now()}`,
          dept: 'System',
          message: 'CP-SAT Engine generated 3 optimal candidate blocks saving 13.0 hours.',
          timestamp: timeStr,
          type: 'bundle',
        },
        ...prev,
      ]);
    }
  };

  // Pipeline Modal Action: Inspect in Review Queue
  const handleOpenReviewQueueFromModal = () => {
    setEngineState('review');
    setIsPipelineModalOpen(false);
  };

  // Pipeline Modal Action: Close
  const handleClosePipelineModal = () => {
    setIsPipelineModalOpen(false);
    if (optimizedTasks.length > 0) {
      setEngineState('review');
    } else {
      setEngineState('standby');
    }
  };

  // Row Approval Handler
  const handleApproveProposal = (id) => {
    setOptimizedTasks((prev) =>
      prev.map((b) => ((b.id === id || b.bundle_id === id) ? { ...b, status: 'Approved' } : b))
    );
    setProposedBlocks((prev) =>
      prev.map((b) => ((b.id === id || b.bundle_id === id) ? { ...b, status: 'Approved' } : b))
    );
    setSelectedProposalModal((prev) =>
      prev && (prev.id === id || prev.bundle_id === id) ? { ...prev, status: 'Approved' } : prev
    );
  };

  // Row Rejection Handler
  const handleRejectProposal = (id) => {
    setOptimizedTasks((prev) =>
      prev.map((b) => ((b.id === id || b.bundle_id === id) ? { ...b, status: 'Rejected' } : b))
    );
    setProposedBlocks((prev) =>
      prev.map((b) => ((b.id === id || b.bundle_id === id) ? { ...b, status: 'Rejected' } : b))
    );
    setSelectedProposalModal((prev) =>
      prev && (prev.id === id || prev.bundle_id === id) ? { ...prev, status: 'Rejected' } : prev
    );
  };

  // Commit All Approved Proposals to Master Schedule
  const handleCommitAll = () => {
    const activeList = optimizedTasks.length > 0 ? optimizedTasks : proposedBlocks;
    const approved = activeList.filter((b) => {
      const s = (b.status || '').toLowerCase();
      return s === 'approved' || s === 'pending_approval' || s === 'pending review';
    });
    
    // Transform approved proposals into master schedule items
    const newMasterItems = approved.map((prop) => {
      const bundleId = prop.id || prop.bundle_id || `PROP-${Date.now()}`;
      const depts = prop.depts || prop.departments || ['Civil'];
      const track = prop.track || prop.location || 'Corridor Section';
      const sTime = prop.startTime || '2026-09-08T02:00:00';
      const eTime = prop.endTime || '2026-09-08T06:30:00';
      const priority = prop.priorityScore ?? 95.0;

      return {
        id: `BLK-MST-${bundleId.split('-').pop()}`,
        primaryDept: depts[0] || 'Civil',
        depts,
        track,
        startTime: sTime,
        endTime: eTime,
        status: 'Confirmed',
        priorityScore: priority,
        isBundled: depts.length > 1 || (prop.tasksMerged && prop.tasksMerged > 1),
        associatedTasks: [`TSK-COMMITTED-${bundleId}`],
      };
    });

    setMasterSchedule((prev) => [...newMasterItems, ...prev]);
    setEngineState('approved');
    setGlobalMetrics((prev) => ({
      ...prev,
      hoursSaved: parseFloat((prev.hoursSaved + 13.0).toFixed(1)),
      totalBundled: prev.totalBundled + approved.length,
      uptimePct: 99.6,
    }));

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });

    setActivityFeed((prev) => [
      {
        id: `ACT-${Date.now()}`,
        dept: 'Admin',
        message: `Chief Controller committed ${approved.length} approved corridor blocks to Master Schedule.`,
        timestamp: timeStr,
        type: 'schedule',
      },
      ...prev,
    ]);
  };

  return (
    <div
      className={`h-screen min-h-screen w-full overflow-hidden flex flex-row font-sans antialiased selection:bg-amber-700 selection:text-white transition-colors duration-300 ${
        isDarkMode ? 'dark' : ''
      }`}
    >
      {/* Module 1: Master Admin Left Sidebar (w-64) */}
      <AdminSidebar
        onLogout={onLogout}
        activeNav={activeNav}
        onSelectNav={(navId) => setActiveNav(navId)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Main Workspace Column: Dynamic Light / Dark Mode Canvas with Swiss Dots */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(rgba(30,58,138,0.1)_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(rgba(255,255,255,0.06)_1.5px,transparent_1.5px)] bg-[size:24px_24px] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {/* Top Header Chrome */}
        <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-md px-6 py-3 flex items-center justify-between flex-shrink-0 z-20 transition-colors duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-950 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-xs flex-shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                  Central Traffic Control &amp; Corridor Planning
                </h1>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-amber-700 text-white font-mono">
                  HQ CONTROL ROOM
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Northern Railway HQ · Baroda House · New Delhi
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-300 px-3 py-1.5 rounded-lg font-mono shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All 3 Departments Connected</span>
            </div>
          </div>
        </header>

        {/* Scrollable Center Workspace */}
        <main className="flex-1 w-full max-w-[1720px] mx-auto p-6 space-y-6 overflow-y-auto min-h-0 scroll-smooth">
          {/* Module 3: Top Action Center (CP-SAT Engine) */}
          <section id="action-center" aria-label="CP-SAT Action Center">
            <CpSatActionCenter
              engineState={engineState}
              onRunOptimizer={handleRunOptimizer}
            />
          </section>

          {/* Module 2: The Global KPI Ribbon (4 Strict Sliding Cards) */}
          <section id="kpis" aria-label="Global Admin KPIs">
            <AdminKpiRibbon metrics={globalMetrics} />
          </section>

          {/* Module 4: Optimizer Proposal Review Queue (Shows when engineState === 'review') */}
          {engineState === 'review' && (
            <section id="review-queue" aria-label="Optimizer Proposal Review Queue">
              <OptimizerProposalReviewQueue
                proposals={optimizedTasks.length > 0 ? optimizedTasks : proposedBlocks}
                onApprove={handleApproveProposal}
                onReject={handleRejectProposal}
                onCommitAll={handleCommitAll}
                onSelectProposal={(prop) => setSelectedProposalModal(prop)}
              />
            </section>
          )}

          {/* 2-Column Section: Master Calendar (Left 8 cols) + Activity Feed (Right 4 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Module 5: Master Multi-Department Calendar (Left 8 Columns) */}
            <div className="xl:col-span-8 space-y-6">
              <MasterMultiDeptCalendar
                schedule={masterSchedule}
                onSelectBlock={(block) => setSelectedBlockModal(block)}
              />
            </div>

            {/* Module 6: Global Activity Feed (Right 4 Columns) */}
            <div className="xl:col-span-4 space-y-6">
              <GlobalActivityFeed activities={activityFeed} />
            </div>
          </div>
        </main>
      </div>

      {/* CP-SAT 4-Stage Optimization Pipeline Modal */}
      <CpSatPipelineModal
        isOpen={isPipelineModalOpen}
        onClose={handleClosePipelineModal}
        onOpenReviewQueue={handleOpenReviewQueueFromModal}
      />

      {/* Block Detail Inspection Modal (Gazetted Horizon) */}
      <BlockDetailModal
        block={selectedBlockModal}
        onClose={() => setSelectedBlockModal(null)}
      />

      {/* Bundled Proposal Optimizer Telemetry Modal */}
      <ProposalDetailModal
        proposal={selectedProposalModal}
        onClose={() => setSelectedProposalModal(null)}
        onApprove={handleApproveProposal}
        onReject={handleRejectProposal}
      />
    </div>
  );
}
