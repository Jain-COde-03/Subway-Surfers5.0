import React, { useState } from 'react';
import {
  Train,
  UserCheck,
  AlertTriangle,
  Download,
  Map,
  LogOut,
  Radio,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';

import smmsSignalIllustration from '../../assets/smms_signal_illustration.png';

/**
 * Rebuilt <DepartmentSidebar /> Component
 *
 * Implements strict authorization isolation for a single department view:
 * 1. Top Profile Section with S.A.M.A.Y logo & User Profile Badge ("Civil Eng. (Track)" / "Access: Write/Read").
 * 2. Section 1: "QUICK ACTIONS" with 3 clickable items (Alert, Download, Map) with Gold hover states.
 * 3. Section 2: "LIVE INTEGRATIONS" with 3 non-clickable status indicators showing a green "Online" dot.
 * 4. Bottom Section with "CRIS AI Live" status, theme toggle, and "Sign Out" button.
 *
 * @param {Object} props
 * @param {string} [props.department='Civil'] - Logged in department
 * @param {boolean} [props.isDarkMode=true] - Active theme mode
 * @param {() => void} [props.onToggleTheme] - Theme toggle handler
 * @param {() => void} [props.onLogout] - Logout handler
 */
export default function DepartmentSidebar({
  department = 'Civil',
  isDarkMode = true,
  onToggleTheme,
  onLogout,
}) {
  // Quick Action notification toast
  const [toastMessage, setToastMessage] = useState(null);

  const handleQuickAction = (actionName) => {
    setToastMessage(`Action Triggered: ${actionName}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Derive department title
  const getProfileTitle = () => {
    const d = String(department).toLowerCase();
    if (d.includes('signal') || d.includes('smms')) return 'Signal Eng. (S&T)';
    if (d.includes('elect') || d.includes('tdms') || d.includes('trd')) return 'Electrical Eng. (TRD)';
    return 'Civil Eng. (Track)';
  };

  const profileTitle = getProfileTitle();

  // Check specifically if this is the SMMS (Signal & Telecom) department
  const isSMMS = Boolean(
    department &&
      (String(department).toLowerCase().includes('signal') ||
        String(department).toLowerCase().includes('smms') ||
        String(department).toLowerCase().includes('s&t'))
  );

  return (
    <aside className="relative z-40 w-64 bg-slate-900 shadow-[4px_0_24px_rgba(0,0,0,0.4)] flex flex-col justify-between flex-shrink-0 h-full border-r border-slate-800 select-none">
      {/* Top Half: Logo + Profile + Sections */}
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
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight mt-1 truncate">
              Moradabad Div · Northern Rly
            </p>
          </div>
        </div>

        {/* User Profile Badge: Indented Sharp Terminal Box */}
        <div className="mx-3 my-3 p-2.5 rounded-sm bg-slate-950/80 border border-slate-800 shadow-inner flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-slate-900 border border-amber-600/60 flex items-center justify-center text-amber-500 font-bold text-xs shrink-0 shadow-xs">
            <UserCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate tracking-wide">
              {profileTitle}
            </div>
            <div className="text-[10px] text-amber-400 font-mono font-bold tracking-tight">
              Access: Write/Read
            </div>
          </div>
        </div>

        {/* Toast Feedback for Quick Actions */}
        {toastMessage && (
          <div className="mx-3 mb-2 p-2 rounded-sm bg-amber-950/40 border border-amber-600/60 text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

        {/* Section 1: Quick Actions (Placeholders) */}
        <div className="mt-1 mb-3">
          <div className="px-4 mb-1.5 text-[10px] font-bold text-amber-500/90 tracking-wider uppercase flex items-center gap-1.5">
            <span>QUICK ACTIONS</span>
          </div>
          <nav className="space-y-0.5">
            {/* Request Emergency Block */}
            <button
              type="button"
              onClick={() => handleQuickAction('Request Emergency Block')}
              className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-white/90 border-l-4 border-transparent hover:border-amber-600 hover:bg-white/10 hover:text-white transition-all cursor-pointer text-left group uppercase tracking-wider"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors shrink-0" />
              <span className="truncate">Request Emergency Block</span>
            </button>

            {/* Export Weekly Plan PDF */}
            <button
              type="button"
              onClick={() => handleQuickAction('Export Weekly Plan PDF')}
              className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-white/90 border-l-4 border-transparent hover:border-amber-600 hover:bg-white/10 hover:text-white transition-all cursor-pointer text-left group uppercase tracking-wider"
            >
              <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors shrink-0" />
              <span className="truncate">Export Weekly Plan PDF</span>
            </button>

            {/* View Asset Map */}
            <button
              type="button"
              onClick={() => handleQuickAction('View Asset Map')}
              className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-white/90 border-l-4 border-transparent hover:border-amber-600 hover:bg-white/10 hover:text-white transition-all cursor-pointer text-left group uppercase tracking-wider"
            >
              <Map className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors shrink-0" />
              <span className="truncate">View Asset Map</span>
            </button>
          </nav>
        </div>

        {/* Section 2: Live Integrations (Realism Flex) */}
        <div className="mb-3">
          <div className="px-4 mb-1.5 text-[10px] font-bold text-amber-500/90 tracking-wider uppercase flex items-center gap-1.5">
            <span>LIVE INTEGRATIONS</span>
          </div>
          <div className="space-y-1.5 px-3">
            {/* Track Management System (TMS) */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-sm bg-slate-950/60 border border-slate-800 text-[11px] shadow-inner">
              <span className="text-slate-200 font-medium truncate pr-2 text-[10px]">
                Track Management System (TMS)
              </span>
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="w-2 h-2 rounded-xs bg-emerald-500 shadow-xs animate-pulse"></span>
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Online
                </span>
              </div>
            </div>

            {/* Central Weather API (Monsoon) */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-sm bg-slate-950/60 border border-slate-800 text-[11px] shadow-inner">
              <span className="text-slate-200 font-medium truncate pr-2 text-[10px]">
                Central Weather API (Monsoon)
              </span>
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="w-2 h-2 rounded-xs bg-emerald-500 shadow-xs animate-pulse"></span>
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Online
                </span>
              </div>
            </div>

            {/* Train Control (TCS) Feed */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-sm bg-slate-950/60 border border-slate-800 text-[11px] shadow-inner">
              <span className="text-slate-200 font-medium truncate pr-2 text-[10px]">
                Train Control (TCS) Feed
              </span>
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="w-2 h-2 rounded-xs bg-emerald-500 shadow-xs animate-pulse"></span>
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Illustration for SMMS Dashboard: Seamlessly blended signal artwork lining up with CRIS AI Live */}
      {isSMMS && (
        <div className="w-full mt-auto mb-0 px-0 flex flex-col items-center justify-end pointer-events-none select-none relative overflow-hidden">
          <img
            src={smmsSignalIllustration}
            alt="SMMS Signal Automation"
            className="w-full max-w-full h-auto object-contain border-0 outline-none shadow-none -mb-1"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
            }}
          />
        </div>
      )}

      {/* Bottom Section: System Status + Sign Out */}
      <div
        className={`px-3 pb-3 space-y-2 ${
          isSMMS ? 'pt-1 bg-slate-950/95' : 'pt-3 border-t-2 border-slate-950 bg-slate-950'
        }`}
      >
        {/* CRIS AI Live Status */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-sm bg-slate-900 border border-slate-800 text-white/90 text-[11px] shadow-inner">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-xs bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-white text-[11px]">CRIS AI Live</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono font-bold">CP-SAT v2.4</span>
        </div>

        {/* Mechanical Theme Toggle Button */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-3 w-full p-3 rounded-sm border border-slate-700 hover:bg-slate-800 transition-all cursor-pointer text-slate-300"
            title={isDarkMode ? 'Switch to Light Command' : 'Switch to Dark Command'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Light Command</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Dark Command</span>
              </>
            )}
          </button>
        )}

        {/* Sign Out Button */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-sm bg-slate-900 hover:bg-rose-950 hover:border-rose-700/60 text-white font-bold uppercase tracking-wider text-xs transition-all cursor-pointer border border-slate-800 shadow-md"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-500" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
