import React from 'react';
import { Bell, Train, ShieldCheck, LogOut } from 'lucide-react';
import ThemeToggleSwitch from '../common/ThemeToggleSwitch';

/**
 * Component 0: DashboardHeader
 * Modern Command Header matching the Left Sidebar visual aesthetic.
 *
 * @param {Object} props
 * @param {Object} [props.user] - Authenticated user details
 * @param {string} [props.department='Civil Engineering'] - Resolved department name
 * @param {string} [props.division='Moradabad Division (Northern Railway)'] - Division name
 * @param {number} [props.unreadCount=0] - Unread notifications count
 * @param {() => void} [props.onBellClick] - Focus activity feed
 * @param {() => void} [props.onLogout] - Session logout handler
 * @param {boolean} [props.isDarkMode=false] - Theme mode state
 * @param {() => void} [props.onToggleTheme] - Theme toggle handler
 */
export default function DashboardHeader({
  user,
  department = 'Civil Engineering',
  division = 'Moradabad Division (Northern Railway)',
  unreadCount = 0,
  onBellClick,
  onLogout,
  isDarkMode = false,
  onToggleTheme,
}) {
  const d = String(department).toLowerCase();
  const isSMMS = d.includes('signal') || d.includes('smms') || d.includes('s&t');
  const isTDMS = d.includes('elect') || d.includes('tdms') || d.includes('trd');

  // Derive employee name from authenticated session or department context
  const employeeName =
    user?.name ||
    (isSMMS
      ? 'Dr. Ananya Mukherjee'
      : isTDMS
      ? 'Er. Gurpreet Singh'
      : 'Er. Rajesh Kumar Sharma');

  // Derive department short code
  const deptCode = isSMMS ? 'SMMS' : isTDMS ? 'TDMS' : 'TMS';

  // Derive department full descriptive name
  const deptFullName = isSMMS
    ? 'Signaling Maintenance Management (S&T)'
    : isTDMS
    ? 'Traction Power & Distribution (TRD)'
    : 'Civil Engineering (Track Maintenance)';

  return (
    <header className="w-full bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-md px-6 py-3 flex items-center justify-between flex-shrink-0 z-20 backdrop-blur-md transition-colors duration-300">
      {/* Left: Modern Glassmorphic Emblem + Welcome Back Banner + Department Context */}
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-100 to-slate-200 dark:via-slate-800 dark:to-slate-900 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 flex-shrink-0">
          <Train className="w-5 h-5 text-amber-500 dark:text-amber-400" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-2.5 flex-wrap">
            <h1 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Welcome Back,
            </h1>
            <span className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 font-sans">
              {employeeName}
            </span>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs">
              {deptCode}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse shrink-0"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{deptFullName}</span>
            <span>•</span>
            <span className="truncate">{division}</span>
          </div>
        </div>
      </div>

      {/* Right: Security Status, Mode Switch, Activity Bell, & Sign Out */}
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>CRIS SSO Active</span>
        </div>

        {/* Uiverse Sun/Moon Theme Toggle Switch */}
        {onToggleTheme && (
          <ThemeToggleSwitch isDarkMode={isDarkMode} onToggle={onToggleTheme} />
        )}

        {/* Notification Bell Button */}
        <button
          type="button"
          onClick={onBellClick}
          aria-label="View Activity Feed"
          title="View Smart Activity Feed"
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-amber-600 text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center shadow-xs border border-white dark:border-slate-900 animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Sign Out Button */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Sign out of RailNet Session"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 text-slate-600 dark:text-slate-400 text-xs font-medium transition-all duration-200 cursor-pointer border border-slate-200/80 dark:border-slate-700/60 shadow-xs group"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-500 transition-colors" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
}
