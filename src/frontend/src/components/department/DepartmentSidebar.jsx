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
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react';

import smmsSignalIllustration from '../../assets/smms_signal_illustration.png';
import tmsTrackIllustration from '../../assets/tms_track_illustration.png';
import tdmsTractionIllustration from '../../assets/tdms_traction_illustration.png';

import EmergencyBlockModal from './EmergencyBlockModal';
import WeeklyPlanPdfModal from './WeeklyPlanPdfModal';
import AssetMapModal from './AssetMapModal';

/**
 * Rebuilt <DepartmentSidebar /> Component
 *
 * Implements strict authorization isolation for a single department view:
 * 1. Top Profile Section with S.A.M.A.Y logo & User Profile Badge ("Civil Eng. (Track)" / "Access: Write/Read").
 * 2. Section 1: "QUICK ACTIONS" with 3 clickable items (Alert, Download, Map) with Gold hover states.
 * 3. Section 2: "LIVE INTEGRATIONS" with 3 non-clickable status indicators showing a green "Online" dot.
 * 4. Bottom Section with "CRIS AI Live" status and "Sign Out" button.
 *
 * @param {Object} props
 * @param {string} [props.department='Civil'] - Logged in department
 * @param {boolean} [props.isDarkMode=false] - Active theme mode
 * @param {() => void} [props.onToggleTheme] - Optional theme toggle handler
 * @param {() => void} [props.onLogout] - Logout handler
 */
export default function DepartmentSidebar({
  department = 'Civil',
  isDarkMode = false,
  onToggleTheme,
  onLogout,
  onSelectDashboard,
}) {
  // Active Quick Action modal: 'emergency' | 'pdf' | 'map' | null
  const [activeModal, setActiveModal] = useState(null);

  // Active action tracking for smooth tactile state (defaults to 'dashboard')
  const [activeAction, setActiveAction] = useState('dashboard');

  // Quick Action notification toast
  const [toastMessage, setToastMessage] = useState(null);

  const handleQuickAction = (actionName) => {
    setToastMessage(`Action Triggered: ${actionName}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Check specifically if this is the SMMS (Signal & Telecom) department
  const isSMMS = Boolean(
    department &&
      (String(department).toLowerCase().includes('signal') ||
        String(department).toLowerCase().includes('smms') ||
        String(department).toLowerCase().includes('s&t'))
  );

  // Check specifically if this is the TDMS (Traction / Electrical) department
  const isTDMS = Boolean(
    department &&
      (String(department).toLowerCase().includes('elect') ||
        String(department).toLowerCase().includes('tdms') ||
        String(department).toLowerCase().includes('trd'))
  );

  // Check specifically if this is the TMS (Track Management System / Civil Engineering) department
  const isTMS = Boolean(
    department &&
      !isSMMS &&
      !isTDMS &&
      (String(department).toLowerCase().includes('civil') ||
        String(department).toLowerCase().includes('track') ||
        String(department).toLowerCase().includes('tms') ||
        String(department).toLowerCase().includes('p-way') ||
        department === 'Civil')
  );

  const actionItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      modal: null,
      toast: 'Department Operations Dashboard Active',
    },
    {
      id: 'emergency',
      label: 'Request Emergency Block',
      icon: AlertTriangle,
      modal: 'emergency',
      toast: 'Emergency Block Request Portal Opened',
    },
    {
      id: 'pdf',
      label: 'Export Weekly Plan PDF',
      icon: Download,
      modal: 'pdf',
      toast: 'Weekly Maintenance Plan PDF Generated',
    },
    {
      id: 'map',
      label: 'View Asset Map',
      icon: Map,
      modal: 'map',
      toast: 'Corridor Infrastructure GIS Map Loaded',
    },
  ];

  return (
    <aside className="relative z-40 w-64 bg-slate-900 shadow-[4px_0_24px_rgba(0,0,0,0.4)] flex flex-col justify-between flex-shrink-0 h-full border-r border-slate-800 select-none">
      {/* Top Half: Logo + Profile + Sections */}
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
                {isSMMS ? 'SMMS' : isTDMS ? 'TDMS' : 'TMS'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400 font-medium truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse shrink-0"></span>
              <span className="truncate">
                {isSMMS
                  ? 'Signal & Telecom Control'
                  : isTDMS
                  ? 'Traction & OHE Power Control'
                  : 'Track & P-Way Maintenance'}
              </span>
            </div>
          </div>
        </div>

        {/* Toast Feedback for Quick Actions */}
        {toastMessage && (
          <div className="mx-3 my-2 p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-2 animate-fadeIn shadow-lg shadow-amber-500/5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

        {/* Section 1: Quick Actions with Modern Tactile Pill Buttons */}
        <div className="mt-3">
          <div className="px-4 mb-2 text-[10px] font-bold text-slate-400/90 font-mono tracking-widest uppercase flex items-center justify-between">
            <span>QUICK ACTIONS</span>
            <span className="text-[9px] text-slate-500 font-normal">ACTIONS</span>
          </div>
          <nav className="space-y-1.5 px-3">
            {actionItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeAction === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveAction(item.id);
                    setActiveModal(item.modal);
                    handleQuickAction(item.toast);
                    if (item.id === 'dashboard' && onSelectDashboard) {
                      onSelectDashboard();
                    }
                  }}
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

        {/* Section 2: Live Integrations (Modernized Pill) */}
        <div className="mt-3 mb-1">
          <div className="px-4 mb-1.5 text-[10px] font-bold text-amber-500/90 font-mono tracking-widest uppercase flex items-center gap-1.5">
            <span>LIVE FEEDS</span>
          </div>
          <div className="space-y-1.5 px-3">
            {/* Track Management System (TMS) */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] shadow-xs">
              <span className="text-slate-300 font-medium truncate pr-2 text-[11px]">
                {isSMMS ? 'Signal & Telecom (SMMS)' : isTDMS ? 'Traction Power (TDMS)' : 'Track Management System (TMS)'}
              </span>
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse"></span>
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Online
                </span>
              </div>
            </div>

            {/* Central Weather API (Monsoon) */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] shadow-xs">
              <span className="text-slate-300 font-medium truncate pr-2 text-[11px]">
                Central Weather API (Monsoon)
              </span>
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse"></span>
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Online
                </span>
              </div>
            </div>

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

      {/* Bottom Illustration for TDMS Dashboard: Seamlessly blended traction & OHE artwork */}
      {isTDMS && (
        <div className="w-full mt-auto mb-0 px-0 flex flex-col items-center justify-end pointer-events-none select-none relative overflow-hidden">
          <img
            src={tdmsTractionIllustration}
            alt="TDMS Traction & OHE Infrastructure"
            className="w-full max-w-full h-auto object-contain border-0 outline-none shadow-none -mb-1"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
            }}
          />
        </div>
      )}

      {/* Bottom Illustration for TMS Dashboard: Seamlessly blended track & train artwork */}
      {isTMS && (
        <div className="w-full mt-auto mb-0 px-0 flex flex-col items-center justify-end pointer-events-none select-none relative overflow-hidden">
          <img
            src={tmsTrackIllustration}
            alt="TMS Track Infrastructure"
            className="w-full max-w-full h-auto object-contain border-0 outline-none shadow-none -mb-1"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
            }}
          />
        </div>
      )}

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

      {/* Bottom Section: System Status */}
      <div
        className={`px-3 pb-3.5 ${
          isSMMS || isTMS || isTDMS ? 'pt-1.5 bg-slate-950/95' : 'pt-3 border-t border-slate-800/80 bg-slate-950'
        }`}
      >
        {/* CRIS AI Live Status */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-white/90 text-[11px] shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse"></span>
            <span className="font-bold text-white text-[11px]">CRIS AI Live</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono font-bold">CP-SAT v2.4</span>
        </div>
      </div>

      {/* Interactive Quick Action Modals */}
      <EmergencyBlockModal
        isOpen={activeModal === 'emergency'}
        onClose={() => setActiveModal(null)}
        department={department}
      />

      <WeeklyPlanPdfModal
        isOpen={activeModal === 'pdf'}
        onClose={() => setActiveModal(null)}
      />

      <AssetMapModal
        isOpen={activeModal === 'map'}
        onClose={() => setActiveModal(null)}
        department={department}
      />
    </aside>
  );
}
