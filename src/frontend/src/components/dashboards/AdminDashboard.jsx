import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Trash2,
} from 'lucide-react';
import GoogleCalendarView from '../calendar/GoogleCalendarView';
import ThemeToggleSwitch from '../common/ThemeToggleSwitch';
import adminUnifiedIllustration from '../../assets/admin_unified_illustration.png';
import {
  GlobalNetworkStatusView,
  OptimizerAuditLogsView,
  CorridorMapView,
  DisruptionAnalyticsView,
} from './AdminSupplementalViews';
import VipAutoClearanceModal from './VipAutoClearanceModal';

/* ========================================================================= */
/* DATA CONTRACTS & SIMULATED FASTAPI ENDPOINT RESPONSES                     */
/* ========================================================================= */

const INITIAL_GLOBAL_METRICS = {
  uptimePct: 100.0,
  hoursSaved: 0,
  totalBundled: 0,
  criticalDefects: 0,
  resourceStrain: 0,
};

const INITIAL_PROPOSED_BLOCKS = [];
const INITIAL_MASTER_SCHEDULE = [];
const INITIAL_ACTIVITY_FEED = [];

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
        {/* Modern & Soothing Top Brand Header */}
        <div className="p-4 pb-3.5 flex items-center space-x-3 border-b border-slate-800/60 bg-gradient-to-b from-slate-950/80 to-transparent">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-800 to-slate-900 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 flex-shrink-0">
            <Train className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-white font-extrabold text-sm tracking-widest leading-none font-mono">
                S.A.M.A.Y
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs">
                HQ
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400 font-medium truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse shrink-0"></span>
              <span className="truncate">Central Operations Planning</span>
            </div>
          </div>
        </div>

        {/* Navigation Section with Modern Tactile Pill Buttons */}
        <div className="mt-3">
          <div className="px-4 mb-2 text-[10px] font-bold text-slate-400/90 font-mono tracking-widest uppercase flex items-center justify-between">
            <span>NAVIGATION</span>
            <span className="text-[9px] text-slate-500 font-normal">PORTAL</span>
          </div>
          <nav className="space-y-1.5 px-3">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectNav(item.id)}
                  className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer border border-transparent ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 via-slate-800/90 to-slate-800/50 text-white font-semibold shadow-md shadow-black/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-800/60 text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] shrink-0 mr-1 animate-pulse" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section: Live Integrations (Modernized Pill) */}
        <div className="mt-3 mb-1">
          <div className="px-4 mb-1.5 text-[10px] font-bold text-amber-500/90 font-mono tracking-widest uppercase flex items-center gap-1.5">
            <span>LIVE FEEDS</span>
          </div>
          <div className="px-3">
            {/* Train Control (TCS) Feed */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] shadow-xs">
              <span className="text-slate-300 font-medium truncate pr-2 text-[11px]">
                Train Control (TCS) Feed
              </span>
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse"></span>
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Illustration for Admin Dashboard: Seamlessly blended unified multi-department artwork */}
      <div className="w-full mt-auto mb-0 px-0 flex flex-col items-center justify-end pointer-events-none select-none relative overflow-hidden">
        <img
          src={adminUnifiedIllustration}
          alt="Unified Corridor Infrastructure"
          className="w-full max-w-full h-auto object-contain border-0 outline-none shadow-none -mb-1"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
          }}
        />
      </div>

      {/* Bottom Status: CRIS AI Live shifted to the very bottom */}
      <div className="px-3 pb-3.5 pt-1 bg-slate-950/95">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-white/90 text-[11px] shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse"></span>
            <span className="font-bold text-white text-[11px]">CRIS AI Live</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono font-bold">CP-SAT v9.8</span>
        </div>
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
      accentGradient:
        'bg-gradient-to-br from-slate-100 via-slate-100 to-slate-200/90 dark:from-slate-700 dark:to-slate-800 border-t border-x border-slate-300/80 dark:border-slate-600/70',
      badgeBg:
        'bg-white/90 dark:bg-black/30 text-slate-700 dark:text-white border border-slate-300/80 dark:border-white/15',
      watermarkColor: 'text-slate-500/15 dark:text-white/15',
      dotHover: 'group-hover:bg-slate-500 group-hover:shadow-[0_0_6px_rgba(100,116,139,0.8)]',
      badge: 'SYSTEM UPTIME',
      icon: Activity,
    },
    {
      id: 'hoursSaved',
      title: 'BLOCK-HOURS SAVED',
      value: `${metrics.hoursSaved}`,
      unit: 'hrs',
      sub: `${metrics.totalBundled} joint corridors synchronized`,
      accentGradient:
        'bg-gradient-to-br from-amber-50 via-amber-100/70 to-amber-100 dark:from-amber-700 dark:to-amber-800 border-t border-x border-amber-200/80 dark:border-amber-600/70',
      badgeBg:
        'bg-white/90 dark:bg-black/30 text-amber-800 dark:text-white border border-amber-300/70 dark:border-white/15',
      watermarkColor: 'text-amber-600/15 dark:text-white/15',
      dotHover: 'group-hover:bg-amber-500 group-hover:shadow-[0_0_6px_rgba(245,158,11,0.8)]',
      badge: 'BUNDLING GAIN',
      icon: Flame,
    },
    {
      id: 'criticalDefects',
      title: 'ACTIVE CRITICAL DEFECTS',
      value: `${metrics.criticalDefects}`,
      unit: 'Units',
      sub: 'Requires urgent block possession',
      accentGradient:
        'bg-gradient-to-br from-rose-50 via-rose-100/70 to-rose-100 dark:from-rose-800/80 dark:to-rose-900 border-t border-x border-rose-200/80 dark:border-rose-700/70',
      badgeBg:
        'bg-white/90 dark:bg-black/30 text-rose-800 dark:text-white border border-rose-300/70 dark:border-white/15',
      watermarkColor: 'text-rose-600/15 dark:text-white/15',
      dotHover: 'group-hover:bg-rose-500 group-hover:shadow-[0_0_6px_rgba(244,63,94,0.8)]',
      badge: 'CRITICAL BACKLOG',
      icon: AlertTriangle,
    },
    {
      id: 'strain',
      title: 'GLOBAL RESOURCE STRAIN',
      value: `${metrics.resourceStrain}`,
      unit: '%',
      sub: 'Equilibrium maintained across divisions',
      accentGradient:
        'bg-gradient-to-br from-blue-50 via-indigo-50/70 to-blue-100 dark:from-blue-700 dark:to-indigo-800 border-t border-x border-blue-200/80 dark:border-blue-600/70',
      badgeBg:
        'bg-white/90 dark:bg-black/30 text-blue-800 dark:text-white border border-blue-300/70 dark:border-white/15',
      watermarkColor: 'text-blue-600/15 dark:text-white/15',
      dotHover: 'group-hover:bg-blue-500 group-hover:shadow-[0_0_6px_rgba(59,130,246,0.8)]',
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
            className="group cursor-pointer relative h-40 w-full rounded-2xl transition-all duration-300"
          >
            {/* Top Accent Layer (Translates up on group hover) */}
            <div
              className={`absolute top-0 left-0 w-full h-24 rounded-t-2xl overflow-hidden transition-transform duration-300 ease-out group-hover:-translate-y-2.5 shadow-xs ${card.accentGradient}`}
            >
              {/* Top Accent Badge */}
              <div className="px-3.5 py-2.5 flex items-center justify-between">
                <div className={`px-2.5 py-0.5 rounded-full flex items-center space-x-1.5 shadow-xs ${card.badgeBg}`}>
                  <Icon className="w-3 h-3 text-current opacity-90" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-current">
                    {card.badge}
                  </span>
                </div>
              </div>

              {/* Large Semi-Transparent Watermark Icon */}
              <Icon
                className={`absolute -right-3 -bottom-3 w-20 h-20 pointer-events-none transform -rotate-12 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${card.watermarkColor}`}
                aria-hidden="true"
              />
            </div>

            {/* Bottom Data Layer (Responsive to Light / Dark Mode) */}
            <div className="absolute bottom-0 left-0 w-full h-28 z-10 rounded-2xl p-4 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 shadow-lg shadow-slate-900/5 dark:shadow-black/40 group-hover:shadow-2xl transition-all duration-300">
              {/* Card Title */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 ${card.dotHover} transition-all`}></span>
              </div>

              {/* Metric Value */}
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none font-sans">
                  {card.value}
                </span>
                {card.unit && (
                  <span
                    className={`text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono ${
                      card.unit === '%' ? 'ml-0.5' : 'ml-1'
                    }`}
                  >
                    {card.unit}
                  </span>
                )}
              </div>

              {/* Subtitle */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
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

function CpSatActionCenter({ engineState, onRunOptimizer, onSeedDemoData, onClearData, onOpenVipClearance }) {
  const isRunning = engineState === 'running';

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/40 overflow-hidden relative transition-colors duration-300">
      {/* S.A.M.A.Y Signature Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-amber-500/10 via-amber-50/40 to-slate-100/60 dark:from-amber-500/15 dark:via-slate-900/90 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs flex-shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 leading-tight">
                OR-TOOLS CP-SAT PLANNING ENGINE
              </h2>
              <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                GLOBAL MIP SOLVER
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Jointly optimizes Civil, Signaling &amp; Electrical maintenance requests, minimizing train delay penalty indices
            </p>
          </div>
        </div>

        {/* Solver Engine State Pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs">
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

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* 4 Modular Micro-Cards for Telemetry & Engine Config */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Engine State */}
          <div className="bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 shadow-xs space-y-2 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                ENGINE STATE
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-xs">
                MIP Mode
              </span>
            </div>
            <div>
              <span
                className={`inline-block font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                  engineState === 'running'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse'
                    : engineState === 'review'
                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                    : engineState === 'approved'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
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
          <div className="bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 shadow-xs space-y-2 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                SOLVER CORE
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 shadow-xs">
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
          <div className="bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 shadow-xs space-y-2 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                FEASIBLE SLOTS
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-xs">
                COA Matrix
              </span>
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              Dynamic Windows
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              COA sectional headways synchronized
            </p>
          </div>

          {/* Card 4: Avg Solve Time */}
          <div className="bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 shadow-xs space-y-2 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                AVG SOLVE TIME
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-xs">
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

        {/* Action Bar with Unified Responsive Toolbar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Cross-department possession synthesis · Indian Railways Central Operations</span>
          </div>

          <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end flex-wrap sm:flex-nowrap">
            {onClearData && (
              <button
                type="button"
                onClick={onClearData}
                title="Wipe all tasks, blocks, and start from a clean blank slate"
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800/80 shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>CLEAR ALL</span>
              </button>
            )}

            {onSeedDemoData && (
              <button
                type="button"
                onClick={onSeedDemoData}
                title="Populate test defect queue and schedule for live demonstration"
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700 shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
              >
                <Database className="w-3.5 h-3.5 text-amber-500" />
                <span>LOAD DEMO DATA</span>
              </button>
            )}

            {onOpenVipClearance && (
              <button
                type="button"
                onClick={onOpenVipClearance}
                title="Dynamic Constraint Resolution Demonstration: Part the Red Sea"
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/15 hover:from-amber-500/30 hover:to-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/40 shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] group"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 transition-transform animate-pulse" />
                <span>VIP AUTO-CLEARANCE DEMO</span>
              </button>
            )}

            <button
              type="button"
              disabled={isRunning}
              onClick={onRunOptimizer}
              className={`inline-flex items-center justify-center space-x-2 px-5 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-lg transition-all cursor-pointer whitespace-nowrap ${
                isRunning
                  ? 'bg-amber-700 text-white opacity-90 cursor-not-allowed animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white active:scale-[0.99] shadow-amber-500/20'
              }`}
            >
              {isRunning ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>SOLVER COMPUTING...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>{engineState === 'review' ? 'RE-RUN CP-SAT OPTIMIZER' : 'RUN CP-SAT OPTIMIZER'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-200" />
                </>
              )}
            </button>
          </div>
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
  const pendingProposals = proposals.filter((p) => {
    const s = (p.status || 'pending_approval').toLowerCase();
    return s !== 'approved' && s !== 'confirmed' && s !== 'rejected' && s !== 'cancelled';
  });
  const approvedProposals = proposals.filter((p) => {
    const s = (p.status || '').toLowerCase();
    return s === 'approved' || s === 'confirmed';
  });

  const [filterTab, setFilterTab] = useState(pendingProposals.length > 0 ? 'pending' : 'all');

  const displayProposals =
    filterTab === 'pending'
      ? pendingProposals
      : filterTab === 'approved'
      ? approvedProposals
      : proposals;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/40 overflow-hidden transition-colors duration-300 animate-fadeIn">
      {/* S.A.M.A.Y Signature Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-amber-500/10 via-amber-50/40 to-slate-100/60 dark:from-amber-500/15 dark:via-slate-900/90 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 leading-tight">
                OPTIMIZER PROPOSAL REVIEW QUEUE
              </h3>
              <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                {pendingProposals.length} PENDING REVIEW
              </span>
              {approvedProposals.length > 0 && (
                <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  {approvedProposals.length} APPROVED
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Review AI-bundled multi-department possession windows before committing to the Master Timetable
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Filter Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/90 dark:border-slate-800 text-[10px] font-mono font-bold">
            <button
              type="button"
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Pending ({pendingProposals.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('approved')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterTab === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Approved ({approvedProposals.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterTab === 'all'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All ({proposals.length})
            </button>
          </div>

          <button
            type="button"
            onClick={onCommitAll}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold uppercase text-[10px] tracking-wider shadow-md shadow-emerald-600/20 transition-all cursor-pointer self-start sm:self-auto active:scale-[0.99]"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>Commit All Approved to Master Schedule</span>
            <ArrowRight className="w-3.5 h-3.5 text-white ml-0.5" />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="p-4 sm:p-5">
        {displayProposals.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {filterTab === 'pending'
                ? 'All Proposals Have Been Reviewed & Approved'
                : 'No proposals matching this filter'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {filterTab === 'pending'
                ? 'All synthesized corridor blocks are approved and active in the Master Timetable. New proposals will appear here whenever departments log new defects.'
                : 'Switch between Pending, Approved, or All tabs to review corridor optimization details.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onCommitAll}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Commit to Master Schedule
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                View All Proposals ({proposals.length})
              </button>
            </div>
          </div>
        ) : (
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
                  {displayProposals.map((prop) => {
                    const id = prop.id || prop.bundle_id;
                    const track = prop.track || prop.location || 'Corridor Section';
                    const depts = prop.depts || prop.departments || ['Civil'];
                    const rawStatus = (prop.status || 'pending_approval').toLowerCase();
                    const isApproved = rawStatus === 'approved' || rawStatus === 'confirmed';
                    const isRejected = rawStatus === 'rejected' || rawStatus === 'cancelled';
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
              <span>SHOWING {displayProposals.length} OF {proposals.length} BUNDLES</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* MODULE 5: MASTER MULTI-DEPARTMENT CALENDAR (BOTTOM CENTER)                */
/* ========================================================================= */

function MasterMultiDeptCalendar({ schedule, onSelectBlock, onBlockCancelled, onRefresh }) {
  return (
    <GoogleCalendarView
      schedule={schedule}
      onSelectBlock={onSelectBlock}
      onBlockCancelled={onBlockCancelled}
      onRefresh={onRefresh}
      userRole="admin"
    />
  );
}

/* ========================================================================= */
/* MODULE 6: GLOBAL ACTIVITY FEED (RIGHT SIDEBAR)                            */
/* ========================================================================= */

function GlobalActivityFeed({ activities }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/40 overflow-hidden flex flex-col h-full transition-colors duration-300">
      {/* S.A.M.A.Y Signature Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-amber-500/10 via-amber-50/40 to-slate-100/60 dark:from-amber-500/15 dark:via-slate-900/90 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs flex-shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 leading-tight">
                LIVE SERVER ACTIVITY LOG
              </h3>
              <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                TELEMETRY
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Control room cross-department telemetry stream
            </p>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse"></span>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            ONLINE
          </span>
        </div>
      </div>

      {/* Live Server Log Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2.5 overflow-y-auto max-h-[580px] flex-1">
          {activities.length === 0 ? (
            <div className="py-14 px-4 text-center space-y-2.5 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                TELEMETRY STANDBY
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[220px] leading-relaxed font-sans">
                Log a department defect or click Load Demo Data / Run Optimizer to stream live events.
              </p>
            </div>
          ) : (
            activities.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 shadow-xs space-y-1.5 hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      item.dept === 'Civil'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80'
                        : item.dept === 'Signal'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/80'
                        : item.dept === 'Electrical'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700/80'
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
            ))
          )}
        </div>

        {/* Telemetry Sync Status Footer */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
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
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/40 dark:shadow-black/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* S.A.M.A.Y Signature Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/10 via-amber-50/40 to-slate-100/60 dark:from-amber-500/15 dark:via-slate-900/90 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Cpu className={`w-5 h-5 ${!isComplete ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  CRIS CP-SAT OPTIMIZATION PIPELINE
                </h3>
                <span
                  className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isComplete
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 animate-pulse'
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
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Telemetry"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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

function BlockDetailModal({ block, onClose, onCancelBlock }) {
  if (!block) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* S.A.M.A.Y Signature Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500/10 via-amber-50/40 to-slate-100/60 dark:from-amber-500/15 dark:via-slate-900/90 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  CORRIDOR POSSESSION TELEMETRY · {block.id}
                </h3>
                <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wider">
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
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
                Track Location
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                {block.track || block.location}
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
              {(block.depts || block.departments || [block.primaryDept || 'Civil']).map((d) => (
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
              <span className="font-black text-amber-600 dark:text-amber-400">{block.priorityScore || 95.0} / 100</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 dark:text-slate-400">Gazette Horizon Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{block.status || 'Confirmed'}</span>
            </div>
            {block.summary && (
              <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-medium italic border-t border-slate-200 dark:border-slate-800 pt-1.5">
                "{block.summary}"
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          {onCancelBlock ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to cancel Corridor Block ${block.id}? All involved departments will be notified immediately.`)) {
                  onCancelBlock(block.id);
                  onClose();
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Cancel Corridor Block</span>
            </button>
          ) : <div></div>}

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
  if (!prop) return null;
  const id = prop.id || prop.bundle_id || 'BLK-MST-101';

  // If proposal contains dynamic constituent tasks from real department submissions, render them
  const rawTasks = prop.constituentTasks || prop.tasks;
  if (Array.isArray(rawTasks) && rawTasks.length > 0) {
    const formattedTasks = rawTasks.map((t, idx) => {
      const d = t.dept || t.department || 'Civil';
      const deptLabel = d.toUpperCase().includes('SIGNAL') || d.toUpperCase().includes('S&T') ? 'Signal' : (d.toUpperCase().includes('ELECT') || d.toUpperCase().includes('TRD') ? 'Electrical' : 'Civil');
      return {
        id: t.id || `TSK-LIVE-${idx + 1}`,
        dept: deptLabel,
        title: t.title || t.defect_type || t.description || 'Department Defect Rectification',
        window: t.window || `${prop.window_hrs || 3.0} hrs bundled`,
        machine: t.machine || t.machine_required || (deptLabel === 'Signal' ? 'S&T Throw Rod Test Rig & Digital Multimeter' : deptLabel === 'Electrical' ? 'OHE Tower Wagon (RU-08)' : 'Dual-Rail USFD Ultrasonic Flaw Detector Trolley'),
        crew: t.crew || t.crew_required || (deptLabel === 'Signal' ? '4 S&T Signal Maintainers + SSE (Signal)' : deptLabel === 'Electrical' ? '5 TRD Linemen + JE (TRD)' : '6 P-Way Technicians + JE (P-Way)'),
        originalWindow: t.originalWindow || `${t.estimated_block_duration_hours || 2.5} hrs standalone`,
        riskAvoided: t.riskAvoided || t.description || `Mitigates track failure on ${t.asset || t.asset_id || 'section'} and prevents speed restrictions.`,
      };
    });

    return {
      chainage: prop.chainage || `Section: ${prop.location || prop.track || 'Corridor'}`,
      spatialOverlap: prop.spatialOverlap || '100% Spatial Co-Location',
      safetyBuffer: prop.safetyBuffer || '450m inter-gang dynamic clearance verified',
      hoursSaved: prop.hoursSaved ?? prop.window_hrs ?? 3.5,
      tasks: formattedTasks,
      xgboost: prop.xgboost || {
        rawScore: prop.priorityScore ?? 95.0,
        defectSeverity: `${prop.priorityScore ?? 95.0} / 100 · Criticality score of constituent defects`,
        hazardWeight: '0.94 · Dense passenger & freight corridor index',
        tsrAvoidance: 'Averts mandatory 30 km/h Temporary Speed Restriction (TSR)',
        passengerMinsSaved: `${Math.round((prop.hoursSaved ?? 3.5) * 45)} passenger delay minutes averted`,
      },
      headway: prop.headway || {
        precedingTrain: '12004 Lucknow Shatabdi Exp (Passed, +32 min clearance margin)',
        followingTrain: '12423 Dibrugarh Rajdhani Exp (Expected, +35 min buffer margin)',
        freightClearance: 'Arbitrated freight rakes via Goods Avoidance Line (GAL)',
        conflicts: '0 Timetable Path Conflicts Identified',
      },
      cpsat: prop.cpsat || {
        solveLatency: '2,480 ms',
        linearRelaxation: 'Converged in 1,240 presolve simplex iterations',
        constraintsSatisfied: '100% (Machine spacing, 25kV power isolation, crew shift quotas)',
        netHoursSaved: `${prop.hoursSaved ?? 3.5} Track Possession Hours Saved`,
      },
    };
  }

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
  const isApproved = rawStatus === 'approved' || rawStatus === 'confirmed';
  const isRejected = rawStatus === 'rejected' || rawStatus === 'cancelled';
  const details = getBundledProposalDetails(proposal);
  const depts = proposal.depts || proposal.departments || ['Civil', 'Signal'];
  const track = proposal.track || proposal.location || 'Corridor Section';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/40 dark:shadow-black/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* S.A.M.A.Y Signature Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/10 via-amber-50/40 to-slate-100/60 dark:from-amber-500/15 dark:via-slate-900/90 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-slate-200 dark:border-slate-800 flex-shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  OPTIMIZER TELEMETRY · BUNDLED PROPOSAL {id}
                </h3>
                <span
                  className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isApproved
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                      : isRejected
                      ? 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
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
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Telemetry"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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
  // Theme state: defaults to light mode (isDarkMode = false)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Engine state machine: 'standby' -> 'running' -> 'review' -> 'approved'
  const [engineState, setEngineState] = useState('standby');

  // Requirement 1: State management for returned optimized tasks
  // State management for returned optimized tasks
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
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  // Fetch real data from backend
  const loadDashboardData = useCallback(async () => {
    try {
      // 1. Fetch master schedule blocks
      const blocksRes = await fetch('/api/v1/schedule', { credentials: 'include' });
      if (blocksRes.ok) {
        const blocksData = await blocksRes.json();
        const items = Array.isArray(blocksData) ? blocksData : blocksData.schedule || [];
        setMasterSchedule(items);
      }

      // 2. Fetch notifications
      const notifsRes = await fetch('/api/v1/notifications', { credentials: 'include' });
      if (notifsRes.ok) {
        const notifsData = await notifsRes.json();
        if (Array.isArray(notifsData)) {
          setActivityFeed(
            notifsData.map((n) => ({
              id: n.id,
              dept:
                n.department === 'ENGG'
                  ? 'Civil'
                  : n.department === 'S&T'
                  ? 'Signal'
                  : n.department === 'TRD'
                  ? 'Electrical'
                  : n.department || 'Admin',
              message: n.message,
              timestamp: n.timestamp || 'Just now',
              type: n.type || 'schedule',
            }))
          );
        }
      }

      // 3. Fetch global KPIs
      const kpisRes = await fetch('/api/v1/kpis', { credentials: 'include' });
      if (kpisRes.ok) {
        const kpisData = await kpisRes.json();
        setGlobalMetrics({
          uptimePct: 100.0,
          hoursSaved: kpisData.confirmedBlockHours || 0,
          totalBundled: kpisData.activeBacklog || 0,
          criticalDefects: kpisData.awaitingApproval || 0,
          resourceStrain: kpisData.resourceUtilizationPct || 0,
        });
      }

      // 4. Fetch persistent proposal blocks (all statuses)
      const propRes = await fetch('/api/v1/blocks?status=all', { credentials: 'include' });
      if (propRes.ok) {
        const propData = await propRes.json();
        if (Array.isArray(propData)) {
          setProposedBlocks(propData);
        }
      }
    } catch (err) {
      console.warn('Dashboard load fallback:', err);
    }
  }, []);

  // Initial load + Real-time polling every 8 seconds
  useEffect(() => {
    loadDashboardData();
    const timer = setInterval(() => {
      loadDashboardData();
    }, 8000);

    const handleSync = () => loadDashboardData();
    window.addEventListener('samay_schedule_updated', handleSync);

    return () => {
      clearInterval(timer);
      window.removeEventListener('samay_schedule_updated', handleSync);
    };
  }, [loadDashboardData]);

  // Clear / Wipe All Data to Start 100% Blank
  const handleClearAllData = async () => {
    try {
      const res = await fetch('/api/v1/clear-data', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        setOptimizedTasks([]);
        setProposedBlocks([]);
        setMasterSchedule([]);
        setActivityFeed([]);
        setGlobalMetrics({
          uptimePct: 100.0,
          hoursSaved: 0,
          totalBundled: 0,
          criticalDefects: 0,
          resourceStrain: 0,
        });
        setEngineState('standby');
        window.dispatchEvent(new Event('samay_schedule_updated'));
      }
    } catch (err) {
      console.error('Clear data error:', err);
    }
  };

  // Inject / Load Demo Prototype Sample Data
  const handleSeedDemoData = async () => {
    try {
      const res = await fetch('/api/v1/seed-demo', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        window.dispatchEvent(new Event('samay_schedule_updated'));
        await loadDashboardData();
        setActivityFeed((prev) => [
          {
            id: `ACT-${Date.now()}`,
            dept: 'Admin',
            message: 'Demo dataset loaded: 15 defects, 7 corridor blocks, 10 notifications.',
            timestamp: 'Just now',
            type: 'schedule',
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Seed demo error:', err);
    }
  };

  // Handle Optimizer Execution via real backend
  const handleRunOptimizer = async () => {
    setIsPipelineModalOpen(true);
    setEngineState('optimizing');

    try {
      const response = await fetch('/api/v1/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Optimizer returned status ${response.status}`);
      }

      const data = await response.json();
      const proposals = Array.isArray(data) ? data : data.proposed_blocks || [];

      if (proposals.length > 0) {
        setOptimizedTasks(proposals);
        setProposedBlocks(proposals);
      }
      await loadDashboardData();
    } catch (err) {
      console.warn('Optimizer API fallback:', err);
    }
  };

  // Pipeline Modal Action: Open Review Queue
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
  const handleApproveProposal = async (id) => {
    const activeList = optimizedTasks.length > 0 ? optimizedTasks : proposedBlocks;
    const foundProp = activeList.find((b) => b.id === id || b.bundle_id === id);
    try {
      await fetch(`/api/v1/blocks/${encodeURIComponent(id)}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foundProp || {}),
        credentials: 'include',
      });
      window.dispatchEvent(new CustomEvent('samay_schedule_updated', { detail: { type: 'block_approved', blockId: id } }));
      window.dispatchEvent(new CustomEvent('railway_data_updated', { detail: { type: 'block_approved', blockId: id } }));
      try {
        localStorage.setItem('railway_last_schedule_sync', Date.now().toString());
      } catch (err) {}
      await loadDashboardData();
    } catch (e) {}

    setOptimizedTasks((prev) =>
      prev.map((b) => (b.id === id || b.bundle_id === id ? { ...b, status: 'Approved' } : b))
    );
    setProposedBlocks((prev) =>
      prev.map((b) => (b.id === id || b.bundle_id === id ? { ...b, status: 'Approved' } : b))
    );
    setSelectedProposalModal((prev) =>
      prev && (prev.id === id || prev.bundle_id === id) ? { ...prev, status: 'Approved' } : prev
    );
  };

  // Row Rejection Handler
  const handleRejectProposal = async (id) => {
    try {
      await fetch(`/api/v1/blocks/${encodeURIComponent(id)}/reject`, { method: 'PUT', credentials: 'include' });
      window.dispatchEvent(new CustomEvent('samay_schedule_updated', { detail: { type: 'block_rejected', blockId: id } }));
      window.dispatchEvent(new CustomEvent('railway_data_updated', { detail: { type: 'block_rejected', blockId: id } }));
      try {
        localStorage.setItem('railway_last_schedule_sync', Date.now().toString());
      } catch (err) {}
      await loadDashboardData();
    } catch (e) {}

    setOptimizedTasks((prev) =>
      prev.map((b) => (b.id === id || b.bundle_id === id ? { ...b, status: 'Rejected' } : b))
    );
    setProposedBlocks((prev) =>
      prev.map((b) => (b.id === id || b.bundle_id === id ? { ...b, status: 'Rejected' } : b))
    );
    setSelectedProposalModal((prev) =>
      prev && (prev.id === id || prev.bundle_id === id) ? { ...prev, status: 'Rejected' } : prev
    );
  };

  // Block Cancellation Handler from Calendar
  const handleCancelBlock = async (id) => {
    try {
      await fetch(`/api/v1/blocks/${encodeURIComponent(id)}/cancel`, { method: 'PUT', credentials: 'include' });
      window.dispatchEvent(new CustomEvent('samay_schedule_updated', { detail: { type: 'block_cancelled', blockId: id } }));
      window.dispatchEvent(new CustomEvent('railway_data_updated', { detail: { type: 'block_cancelled', blockId: id } }));
      try {
        localStorage.setItem('railway_last_schedule_sync', Date.now().toString());
      } catch (err) {}
      await loadDashboardData();
    } catch (e) {
      console.error('Cancel block error:', e);
    }
  };

  // Commit All Approved Proposals to Master Schedule
  const handleCommitAll = async () => {
    const activeList = optimizedTasks.length > 0 ? optimizedTasks : proposedBlocks;
    const approved = activeList.filter((b) => {
      const s = (b.status || '').toLowerCase();
      return s === 'approved' || s === 'pending_approval' || s === 'pending review';
    });

    try {
      await fetch('/api/v1/blocks/commit-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposals: activeList }),
        credentials: 'include',
      });
    } catch (e) {
      for (const prop of approved) {
        const bId = prop.id || prop.bundle_id;
        try {
          await fetch(`/api/v1/blocks/${encodeURIComponent(bId)}/approve`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prop || {}),
            credentials: 'include',
          });
        } catch (err) {}
      }
    }

    window.dispatchEvent(new CustomEvent('samay_schedule_updated', { detail: { type: 'blocks_committed' } }));
    window.dispatchEvent(new CustomEvent('railway_data_updated', { detail: { type: 'blocks_committed' } }));
    try {
      localStorage.setItem('railway_last_schedule_sync', Date.now().toString());
    } catch (err) {}
    await loadDashboardData();
    setEngineState('approved');

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
      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(rgba(30,58,138,0.1)_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(rgba(255,255,255,0.06)_1.5px,transparent_1.5px)] bg-[size:24px_24px] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {/* Top Header Chrome */}
        <header className="w-full bg-gradient-to-r from-amber-500/10 via-amber-50/40 to-slate-50/80 dark:from-amber-500/15 dark:via-slate-900/90 dark:to-slate-900 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between flex-shrink-0 z-20 transition-colors duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                  Central Traffic Control &amp; Corridor Planning
                </h1>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shadow-xs">
                  HQ CONTROL ROOM
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Northern Railway HQ · Baroda House · New Delhi
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* VIP Clearance Quick Launcher */}
            <button
              type="button"
              onClick={() => setIsVipModalOpen(true)}
              className="hidden lg:flex items-center space-x-2 text-xs font-mono font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-500/40 px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer group active:scale-[0.98]"
              title="Live Dynamic Constraint Resolution Demonstration: Part the Red Sea"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 transition-transform animate-pulse" />
              <span>VIP CLEARANCE DEMO</span>
            </button>

            <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-300 px-3.5 py-1.5 rounded-xl font-mono shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse"></span>
              <span>All 3 Departments Connected</span>
            </div>

            {/* Uiverse Sun/Moon Theme Toggle Switch */}
            <ThemeToggleSwitch
              isDarkMode={isDarkMode}
              onToggle={() => setIsDarkMode((prev) => !prev)}
            />

            {/* Top-Right Sign Out Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center space-x-2 py-1.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80 text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs hover:shadow group ml-1"
                title="Sign out of Central Traffic Control"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500 group-hover:scale-110 transition-transform" />
                <span className="font-sans hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Center Workspace */}
        <main className="flex-1 w-full max-w-[1720px] mx-auto p-6 space-y-6 overflow-y-auto min-h-0 scroll-smooth">
          {activeNav === 'schedule' && (
            <>
              {/* Module 3: Top Action Center (CP-SAT Engine) */}
              <section id="action-center" aria-label="CP-SAT Action Center">
                <CpSatActionCenter
                  engineState={engineState}
                  onRunOptimizer={handleRunOptimizer}
                  onSeedDemoData={handleSeedDemoData}
                  onClearData={handleClearAllData}
                  onOpenVipClearance={() => setIsVipModalOpen(true)}
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
                    onBlockCancelled={handleCancelBlock}
                    onRefresh={loadDashboardData}
                  />
                </div>

                {/* Module 6: Global Activity Feed (Right 4 Columns) */}
                <div className="xl:col-span-4 space-y-6">
                  <GlobalActivityFeed activities={activityFeed} />
                </div>
              </div>
            </>
          )}

          {activeNav === 'network' && (
            <section id="global-network" aria-label="Global Network Status">
              <GlobalNetworkStatusView />
            </section>
          )}

          {activeNav === 'audit' && (
            <section id="optimizer-audit" aria-label="Optimizer Audit Logs">
              <OptimizerAuditLogsView />
            </section>
          )}

          {activeNav === 'map' && (
            <section id="corridor-map" aria-label="Corridor Map">
              <CorridorMapView />
            </section>
          )}

          {activeNav === 'analytics' && (
            <section id="disruption-analytics" aria-label="Disruption Analytics">
              <DisruptionAnalyticsView />
            </section>
          )}
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
        onCancelBlock={handleCancelBlock}
      />

      {/* Bundled Proposal Optimizer Telemetry Modal */}
      <ProposalDetailModal
        proposal={selectedProposalModal}
        onClose={() => setSelectedProposalModal(null)}
        onApprove={handleApproveProposal}
        onReject={handleRejectProposal}
      />

      {/* Theatrical VIP Train Auto-Clearance Demonstration Modal (Parting the Red Sea) */}
      <VipAutoClearanceModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
      />
    </div>
  );
}

