import React from 'react';
import { Bell, Train, ShieldCheck, LogOut } from 'lucide-react';
import samayLogoSymbol from '../../assets/samay_logo_symbol.png';

/**
 * Component 0: DashboardHeader
 * Minimal chrome above content: Department name + Division + Notification Bell.
 * Strictly adheres to spec: No nav bar, no sidebar.
 *
 * @param {Object} props
 * @param {string} props.department - Resolved department name (e.g. "Civil Engineering")
 * @param {string} [props.division] - Division name (e.g. "Moradabad Division")
 * @param {number} [props.unreadCount=0] - Number of unread notifications for badge
 * @param {() => void} [props.onBellClick] - Click handler to focus activity feed
 * @param {() => void} [props.onLogout] - Optional session sign out handler
 */
export default function DashboardHeader({
  department = 'Civil Engineering',
  division = 'Moradabad Division (Northern Railway)',
  unreadCount = 0,
  onBellClick,
  onLogout,
}) {
  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-md px-6 py-3.5 flex items-center justify-between flex-shrink-0 z-20 transition-colors duration-300">
      {/* Left: Emblem + Department Name + Division */}
      <div className="flex items-center space-x-3.5">
        <div className="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-1.5 shadow-xs border border-slate-200 dark:border-slate-800">
          <Train className="w-5 h-5 text-amber-600 dark:text-amber-500" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
              {department}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 shadow-xs">
              Department Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1">
            {division} • Ministry of Railways
          </p>
        </div>
      </div>

      {/* Right: Security Status & Notification Bell */}
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 pr-3 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          <span>CRIS SSO Active</span>
        </div>

        {/* Notification Bell Button */}
        <button
          type="button"
          onClick={onBellClick}
          aria-label="View Activity Feed"
          title="View Smart Activity Feed"
          className="relative p-2 rounded-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-amber-700 text-white text-[10px] font-black rounded-sm flex items-center justify-center shadow-xs border border-white dark:border-slate-950 animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Optional Sign Out Button */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Sign out of RailNet Session"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-sm transition-colors cursor-pointer ml-1"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        )}
      </div>
    </header>
  );
}
