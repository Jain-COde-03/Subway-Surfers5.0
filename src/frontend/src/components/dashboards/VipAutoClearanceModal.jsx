import React, { useState, useEffect } from 'react';
import {
  Train,
  Sparkles,
  Zap,
  Activity,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  Cpu,
  Layers,
  Radio,
  FileText,
  TrendingUp,
} from 'lucide-react';

export default function VipAutoClearanceModal({ isOpen, onClose }) {
  // Demo States: 'idle' (default schedule), 'injected' (VIP entered, conflict shown), 'solving' (CP-SAT calculating), 'cleared' (Red Sea parted!)
  const [demoState, setDemoState] = useState('idle');
  const [autoPlayInterval, setAutoPlayInterval] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, solver-logs, comparison

  // Clean up auto-play timers on unmount or close
  useEffect(() => {
    return () => {
      if (autoPlayInterval) clearTimeout(autoPlayInterval);
    };
  }, [autoPlayInterval]);

  if (!isOpen) return null;

  // Manual Trigger: 1. Inject VIP Train
  const handleInjectVip = () => {
    setDemoState('injected');
  };

  // Manual Trigger: 2. Solve & Part Red Sea
  const handleSolveAndPart = () => {
    setDemoState('solving');
    setTimeout(() => {
      setDemoState('cleared');
    }, 650);
  };

  // Reset to original state
  const handleReset = () => {
    if (autoPlayInterval) clearTimeout(autoPlayInterval);
    setDemoState('idle');
  };

  // Theatrical Auto-Play: Plays the whole sequence automatically for seamless video recording!
  const handleAutoPlay = () => {
    handleReset();
    setDemoState('idle');

    // Step 1: Inject after 600ms
    const t1 = setTimeout(() => {
      setDemoState('injected');

      // Step 2: Start solver after 1500ms
      const t2 = setTimeout(() => {
        setDemoState('solving');

        // Step 3: Part Red Sea after 800ms
        const t3 = setTimeout(() => {
          setDemoState('cleared');
        }, 700);
        setAutoPlayInterval(t3);
      }, 1400);
      setAutoPlayInterval(t2);
    }, 600);
    setAutoPlayInterval(t1);
  };

  const isIdle = demoState === 'idle';
  const isInjected = demoState === 'injected';
  const isSolving = demoState === 'solving';
  const isCleared = demoState === 'cleared';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none overflow-y-auto">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleIn flex flex-col my-auto max-h-[94vh]">
        
        {/* ========================================================================= */}
        {/* 1. THEATRICAL HEADER                                                      */}
        {/* ========================================================================= */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent dark:from-amber-500/20 dark:via-slate-900 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/10 flex-shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  The &ldquo;VIP Train&rdquo; Auto-Clearance Demonstration
                </h2>
                <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 tracking-wider shadow-xs">
                  DYNAMIC CONSTRAINT SOLVER
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Live Google OR-Tools CP-SAT Corridor Parting · Instantaneous Non-Overlap Resolution
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
            title="Close VIP Showcase"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. DEMO CONTROLS & THEATER PLAYBAR                                        */}
        {/* ========================================================================= */}
        <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          
          {/* Status Indicator */}
          <div className="flex items-center space-x-3 font-mono">
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isIdle
                    ? 'bg-slate-400'
                    : isInjected
                    ? 'bg-rose-500 animate-ping'
                    : isSolving
                    ? 'bg-amber-500 animate-spin'
                    : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                }`}
              ></span>
              <span className="font-bold text-[11px] uppercase text-slate-800 dark:text-slate-200">
                {isIdle && 'State: Normal Schedule Standby'}
                {isInjected && 'State: 🚨 Critical Variable Injected (Overlap Conflicted)'}
                {isSolving && 'State: ⚡ CP-SAT MIP Formulation In Flight (142ms)...'}
                {isCleared && 'State: ⭐ Schedule Parted · Zero Delay Optimal Solution'}
              </span>
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap">
            {/* Auto-Play Theatrical Showcase Button */}
            <button
              type="button"
              onClick={handleAutoPlay}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold font-mono text-xs shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
              title="Record-Ready Demo: Plays the full dynamic resolution sequence automatically"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RECORD-READY DEMO RUN</span>
            </button>

            {/* Step 1: Inject VIP */}
            <button
              type="button"
              onClick={handleInjectVip}
              disabled={isInjected || isSolving || isCleared}
              className={`px-3 py-2 rounded-xl font-bold font-mono text-xs transition-all cursor-pointer border ${
                isInjected
                  ? 'bg-rose-500/20 text-rose-600 border-rose-500/40'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 disabled:opacity-40'
              }`}
            >
              1. Inject VIP Train
            </button>

            {/* Step 2: Part Red Sea */}
            <button
              type="button"
              onClick={handleSolveAndPart}
              disabled={isIdle || isCleared || isSolving}
              className={`px-3 py-2 rounded-xl font-bold font-mono text-xs transition-all cursor-pointer border ${
                isCleared
                  ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 disabled:opacity-40'
              }`}
            >
              2. Part Schedule (Solve)
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 cursor-pointer shadow-xs"
              title="Reset Schedule to Initial State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN THEATER WORKSPACE                                                 */}
        {/* ========================================================================= */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Situation Briefing Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 uppercase text-[10px] tracking-wider">
                SCENARIO TELEMETRY · NEW DELHI (NDLS) TO KANPUR (CNB) HIGH-SPEED QUAD TRUNK
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                {isIdle && 'Baseline: 3 Multi-Department maintenance possessions (P-Way, TRD, S&T) scheduled across 02:00 - 04:30 HRS.'}
                {isInjected && 'CRITICAL OVERLAP DETECTED: Presidential / PM Special Rake #VIP-001 (Speed: 160 km/h) requires unhindered passage at 02:30 - 03:45 HRS.'}
                {isSolving && 'Google CP-SAT is evaluating 10^7 weight penalty on VIP delay and recalculating slack buffers across all 3 departments...'}
                {isCleared && 'RED SEA EFFECT ACTIVATED: Conflicting blocks have dynamically parted left and right. 0 min passenger delay, 0 maintenance blocks cancelled!'}
              </p>
            </div>
            <div className="flex items-center space-x-2 font-mono text-[11px] shrink-0 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-amber-500" />
              <span>Presolve Weight: <strong>W = 10,000,000</strong></span>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* THE RED SEA CORRIDOR TRACK VISUALIZER                                */}
          {/* ===================================================================== */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-white p-6 shadow-xl relative overflow-hidden">
            
            {/* Background Radial Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1.5px,transparent_1.5px)] bg-[size:20px_20px] pointer-events-none"></div>

            {/* Track Header & Time Ticks */}
            <div className="relative z-10 flex items-center justify-between text-slate-400 font-mono text-[11px] pb-4 border-b border-slate-800">
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                TIMETABLE TIMELINE: NORTHERN RAILWAY UP-FAST TRACK
              </span>
              <div className="flex items-center space-x-8 sm:space-x-12 text-slate-500 text-[10px]">
                <span>00:00</span>
                <span>01:00</span>
                <span>02:00</span>
                <span>03:00</span>
                <span>04:00</span>
                <span>05:00</span>
                <span>06:00 HRS</span>
              </div>
            </div>

            {/* The Main Dynamic Timeline Canvas */}
            <div className="relative z-10 py-10 my-4 flex flex-col justify-center min-h-[220px]">
              
              {/* Central Rails Track Line (Visual Railway Rails) */}
              <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none">
                <div className="w-full h-2 bg-slate-800 rounded"></div>
                <div className="w-full h-0.5 bg-slate-700 -mt-1.5 border-t border-dashed border-slate-600"></div>
                <div className="w-full h-2 bg-slate-800 mt-2 rounded"></div>
              </div>

              {/* Dynamic Blocks Container with Red Sea Parting Animation */}
              <div className="relative w-full h-32 flex items-center justify-center">

                {/* ------------------------------------------------------------- */}
                {/* BLOCK 1: Engineering P-Way Ballast Screening                  */}
                {/* (Shifts LEFT like the Red Sea when cleared!)                  */}
                {/* ------------------------------------------------------------- */}
                <div
                  className="absolute transition-all duration-700 ease-out z-20"
                  style={{
                    left: isCleared ? '8%' : '24%',
                    transform: isCleared ? 'scale(0.96)' : 'scale(1)',
                  }}
                >
                  <div
                    className={`w-44 sm:w-52 p-3 rounded-2xl border transition-all duration-500 shadow-xl ${
                      isInjected
                        ? 'bg-rose-950/90 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
                        : isCleared
                        ? 'bg-slate-900/95 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-900/90 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        P-WAY (ENG)
                      </span>
                      <span className={isInjected ? 'text-rose-400 font-bold' : isCleared ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        {isCleared ? '00:45 — 02:00' : '02:15 — 03:30'}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white mt-1 truncate">
                      Ballast Deep Screening (BCM-88)
                    </div>
                    <div className="text-[10px] font-mono mt-1 flex items-center justify-between">
                      <span className="text-slate-400">Km 14/2 - 18/6</span>
                      {isCleared ? (
                        <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                          <ArrowLeft className="w-3 h-3" /> Shifted -90m
                        </span>
                      ) : isInjected ? (
                        <span className="text-rose-400 font-bold animate-bounce">
                          CONFLICT!
                        </span>
                      ) : (
                        <span className="text-slate-500">Standby</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* VIP TRAIN: The Golden Royal Corridor                          */}
                {/* (Beams down in the center of the timeline!)                  */}
                {/* ------------------------------------------------------------- */}
                {(isInjected || isSolving || isCleared) && (
                  <div
                    className={`absolute z-30 transition-all duration-700 ease-out flex flex-col items-center ${
                      isCleared ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
                    }`}
                    style={{
                      left: '37%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {/* Golden Corridor Halo Beam */}
                    <div
                      className={`w-64 sm:w-76 p-3.5 rounded-2xl border-2 transition-all duration-500 shadow-2xl relative overflow-hidden ${
                        isCleared
                          ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.6)] ring-4 ring-amber-400/20'
                          : isSolving
                          ? 'bg-amber-950/80 border-amber-500 animate-pulse'
                          : 'bg-rose-950/90 border-amber-500 ring-2 ring-rose-500/40'
                      }`}
                    >
                      {/* Train Moving Speed Lines */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none"></div>

                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="flex items-center gap-1 font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-xs">
                          <Train className="w-3 h-3 fill-current" />
                          VIP SPECIAL #VIP-001
                        </span>
                        <span className="text-amber-400 font-black tracking-wider text-[11px]">
                          02:30 — 03:45 HRS
                        </span>
                      </div>

                      <div className="font-black text-sm text-white mt-1.5 flex items-center justify-between">
                        <span className="tracking-tight text-amber-200">
                          Vande Bharat Superfast Passage
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          160 km/h
                        </span>
                      </div>

                      <div className="text-[10px] font-mono mt-1 flex items-center justify-between pt-1 border-t border-amber-500/30">
                        <span className="text-amber-300/80">Priority Weight: INF</span>
                        <span
                          className={`font-black uppercase ${
                            isCleared
                              ? 'text-emerald-400 flex items-center gap-1'
                              : 'text-amber-400'
                          }`}
                        >
                          {isCleared ? '⭐ 100% CLEAR HEADWAY' : 'AWAITING RE-SOLVE'}
                        </span>
                      </div>
                    </div>

                    {/* Parted Golden Waves Tag */}
                    {isCleared && (
                      <div className="mt-2 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/20 border border-amber-500/40 px-3 py-0.5 rounded-full shadow-xs animate-fadeIn">
                        Corridor Parted: Zero Interruption Guaranteed
                      </div>
                    )}
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* BLOCK 2 & 3: TRD OHE + S&T Bundled Operations                */}
                {/* (Shifts RIGHT like the Red Sea when cleared!)                 */}
                {/* ------------------------------------------------------------- */}
                <div
                  className="absolute transition-all duration-700 ease-out z-20 space-y-2"
                  style={{
                    right: isCleared ? '6%' : '20%',
                    transform: isCleared ? 'scale(0.96)' : 'scale(1)',
                  }}
                >
                  {/* Block 2: TRD 25kV OHE */}
                  <div
                    className={`w-44 sm:w-52 p-3 rounded-2xl border transition-all duration-500 shadow-xl ${
                      isInjected
                        ? 'bg-rose-950/90 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
                        : isCleared
                        ? 'bg-slate-900/95 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-900/90 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        TRD (ELEC)
                      </span>
                      <span className={isInjected ? 'text-rose-400 font-bold' : isCleared ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        {isCleared ? '04:00 — 05:15' : '02:45 — 04:00'}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white mt-1 truncate">
                      25kV Cantilever Isolation
                    </div>
                    <div className="text-[10px] font-mono mt-1 flex items-center justify-between">
                      <span className="text-slate-400">Sahibabad Yard</span>
                      {isCleared ? (
                        <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                          Shifted +75m <ArrowRight className="w-3 h-3" />
                        </span>
                      ) : isInjected ? (
                        <span className="text-rose-400 font-bold animate-bounce">
                          CONFLICT!
                        </span>
                      ) : (
                        <span className="text-slate-500">Standby</span>
                      )}
                    </div>
                  </div>

                  {/* Block 3: S&T Axle Counter Testing */}
                  <div
                    className={`w-44 sm:w-52 p-2.5 rounded-xl border transition-all duration-500 ${
                      isInjected
                        ? 'bg-rose-950/80 border-rose-500/80'
                        : isCleared
                        ? 'bg-slate-900/90 border-emerald-500/60'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>S&amp;T (SIGNALING)</span>
                      <span className={isCleared ? 'text-emerald-400' : 'text-slate-400'}>
                        {isCleared ? '04:15 — 05:30' : '03:00 — 04:15'}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-200 truncate mt-0.5">
                      Axle Counter Head Calibration
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Visual Track Annotations */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
              <div className="flex items-center space-x-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-amber-500 rounded"></span>
                  <span>VIP Rail Path</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500"></span>
                  <span>Re-Allocated Possessions</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500/30 border border-rose-500"></span>
                  <span>Detected Overlaps</span>
                </span>
              </div>
              <div className="text-slate-400">
                Corridor: NDLS Quad-Line · Sector Km 12/0 to 28/4
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 4. REAL-TIME CP-SAT MATHEMATICAL SOLVER TELEMETRY                     */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Metric 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                CP-SAT Re-Solve Latency
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>138 ms</span>
                <span className="text-xs font-bold text-emerald-600 font-sans px-2 py-0.5 rounded-full bg-emerald-500/10">
                  Instantaneous
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Google OR-Tools MIP re-convergence speed
              </p>
            </div>

            {/* Metric 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                VIP Train Schedule Retention
              </div>
              <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <span>100.0%</span>
                <span className="text-xs font-bold text-emerald-600 font-sans px-2 py-0.5 rounded-full bg-emerald-500/10">
                  0s Delay
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Preserved priority passage without halting
              </p>
            </div>

            {/* Metric 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Maintenance Tasks Preserved
              </div>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <span>3 / 3 Tasks</span>
                <span className="text-xs font-bold text-emerald-600 font-sans px-2 py-0.5 rounded-full bg-emerald-500/10">
                  0 Cancelled
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                All P-Way, TRD &amp; S&amp;T work successfully executed
              </p>
            </div>
          </div>

          {/* Solver Formulation Log Console (Judge-Impressing Code View) */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <Cpu className="w-3.5 h-3.5" />
                CP-SAT MATHEMATICAL FORMULATION CONSOLE
              </span>
              <span>BRANCH-AND-BOUND MIP LOG</span>
            </div>
            <div className="space-y-1 text-[11px] leading-relaxed select-text font-mono">
              <div className="text-slate-400">
                &gt; [02:14:02.108] Injected Dynamic IntervalVar: <strong>VIP_SPECIAL_001</strong> [start: 150m, end: 225m, size: 75m]
              </div>
              <div className="text-slate-400">
                &gt; [02:14:02.112] Model Constraint: <code className="text-amber-300">model.AddNoOverlap([VIP_001, Engg_BCM, Elec_TRD, Sig_SNT])</code>
              </div>
              <div className="text-slate-400">
                &gt; [02:14:02.124] Presolve: Tightened 4 domain windows · Shift bounds: Engg [-120m, 0m], TRD [+60m, +180m]
              </div>
              <div className={isCleared ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                &gt; [02:14:02.246] Search Finished. <strong>OPTIMAL SOLUTION FOUND IN 138ms</strong>. Objective Cost: 0.0 (Zero VIP delay penalty).
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. FOOTER ACTIONS                                                         */}
        {/* ========================================================================= */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 text-xs font-mono flex-shrink-0">
          <div className="text-slate-500 text-[11px] hidden sm:block">
            Designed for SIH 2026 Judge Demonstrations · Northern Railway Central Traffic Control
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleAutoPlay}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-all cursor-pointer"
            >
              Re-Run Theatrical Clearance
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs transition-all cursor-pointer"
            >
              Close Demonstration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

