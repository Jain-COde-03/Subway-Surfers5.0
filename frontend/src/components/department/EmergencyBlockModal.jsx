import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Radio,
  Clock,
  MapPin,
  ShieldAlert,
  Send,
  CheckCircle2,
  Cpu,
  FileText,
  Printer,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

/**
 * <EmergencyBlockModal />
 * Realistic Form EB-1 for Emergency Corridor Block Possession Requests.
 * Simulates real-time section controller submission and CP-SAT headway arbitration.
 */
export default function EmergencyBlockModal({ isOpen, onClose, department = 'Civil' }) {
  if (!isOpen) return null;

  const isSignal = String(department).toLowerCase().includes('signal') || String(department).toLowerCase().includes('smms');
  const isTRD = String(department).toLowerCase().includes('elect') || String(department).toLowerCase().includes('tdms') || String(department).toLowerCase().includes('trd');

  const deptLabel = isSignal ? 'Signal & Telecom (SMMS)' : isTRD ? 'Electrical / TRD (TDMS)' : 'Civil Engineering (TMS / Track)';
  const deptCode = isSignal ? 'SMMS' : isTRD ? 'TDMS' : 'TMS';

  // Default pre-populated defect descriptions by department
  const defaultReason = isSignal
    ? 'Point machine 104A track circuit drop and false detection on crossover. Interlocking locked in normal position, signal S-12 failing to display green aspect.'
    : isTRD
    ? 'SCADA telemetry report: Catenary wire tension loss at Mast 278/12 with carbon brush fouling on insulator assembly. 25kV power cutoff required for TRD tower wagon inspection.'
    : 'Ultrasonic Flaw Detection (USFD) confirmed IMR (Immediate Removal) internal transverse fatigue crack in gauge face corner at KM 278/18. Rail renewal & thermit welding required immediately.';

  const defaultLocation = isSignal
    ? 'Hapur Yard (KM 278/10 – Point 104)'
    : isTRD
    ? 'Pilkhuwa – Hapur Section (Mast 274/12 to 276/08)'
    : 'KM 278/14 – 278/22 (Hapur Yard UP Line)';

  // Form states
  const [section, setSection] = useState('Ghaziabad (GZB) – Moradabad (MB)');
  const [trackLine, setTrackLine] = useState('UP Main Line');
  const [location, setLocation] = useState(defaultLocation);
  const [duration, setDuration] = useState('90');
  const [severity, setSeverity] = useState('CRITICAL');
  const [reason, setReason] = useState(defaultReason);
  const [personnel, setPersonnel] = useState('SSE Field Unit #04 · Gang #12 (10 Personnel) · 1 Emergency Tool Van');

  // Submission lifecycle: 'idle' -> 'transmitting' -> 'confirmed'
  const [submitState, setSubmitState] = useState('idle');
  const [txStep, setTxStep] = useState(0);

  const handleTransmit = (e) => {
    e.preventDefault();
    setSubmitState('transmitting');
    setTxStep(1);

    setTimeout(() => {
      setTxStep(2);
    }, 700);

    setTimeout(() => {
      setTxStep(3);
    }, 1400);

    setTimeout(() => {
      setSubmitState('confirmed');
    }, 2100);
  };

  const handleReset = () => {
    setSubmitState('idle');
    setTxStep(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/60 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-rose-500/15 via-rose-50/40 to-slate-100/60 dark:from-rose-950/40 dark:via-slate-900/90 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 dark:bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-900 dark:text-slate-100 font-bold text-sm sm:text-base tracking-tight font-sans">
                  FORM EB-1 · EMERGENCY BLOCK POSSESSION
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 text-[9px] font-mono font-black uppercase tracking-wider">
                  CODE RED
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Moradabad Division Section Control Dispatch · S.A.M.A.Y Telemetry
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-800 dark:text-slate-200 font-sans">
          {submitState === 'idle' && (
            <form onSubmit={handleTransmit} className="space-y-4">
              {/* Protocol Alert Banner */}
              <div className="p-3.5 rounded-xl bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 dark:border-rose-800/60 flex items-start space-x-3">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-sans">
                  <span className="font-bold uppercase tracking-wide">
                    Emergency Protocol Activated:
                  </span>{' '}
                  This request bypasses the 48-hr gazette window and initiates real-time CP-SAT train headway arbitration.
                </div>
              </div>

              {/* Row 1: Dept & Severity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Requesting Department
                  </label>
                  <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between">
                    <span>{deptLabel}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold">
                      {deptCode}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Urgency Classification
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/90 dark:border-slate-800">
                    {['CRITICAL', 'URGENT', 'PRIORITY'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSeverity(level)}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          severity === level
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Section & Line */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Corridor Section
                  </label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-1.5 focus:ring-amber-500 focus:outline-hidden font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Track / Line
                  </label>
                  <select
                    value={trackLine}
                    onChange={(e) => setTrackLine(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-1.5 focus:ring-amber-500 focus:outline-hidden font-sans"
                  >
                    <option value="UP Main Line">UP Main Line (Track 1)</option>
                    <option value="DN Main Line">DN Main Line (Track 2)</option>
                    <option value="Common Loop Line">Common Loop Line</option>
                    <option value="Yard Crossover">Yard Crossover</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Location KM */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Kilometer Mileage / Location Tag
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-1.5 focus:ring-amber-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Row 4: Requested Duration */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Requested Possession Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: '45', label: '45 mins' },
                    { val: '60', label: '60 mins' },
                    { val: '90', label: '90 mins' },
                    { val: '120', label: '120 mins' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setDuration(item.val)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        duration === item.val
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 5: Defect / Failure Reason */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Technical Defect Diagnostic & Justification
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-1.5 focus:ring-amber-500 focus:outline-hidden leading-relaxed font-sans"
                />
              </div>

              {/* Row 6: Gang / Crew In-Charge */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Mobilized Personnel & Plant Units
                </label>
                <input
                  type="text"
                  value={personnel}
                  onChange={(e) => setPersonnel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-1.5 focus:ring-amber-500 focus:outline-hidden font-mono text-[11px]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-end space-x-3 font-mono">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-rose-900/20 flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit to Section Controller</span>
                </button>
              </div>
            </form>
          )}

          {/* Transmitting Telemetry State */}
          {submitState === 'transmitting' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-5 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-amber-500 animate-spin flex items-center justify-center"></div>
                <Radio className="w-6 h-6 text-amber-500 absolute inset-0 m-auto animate-pulse" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-sans">
                  Transmitting Telemetry Dispatch
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  S.A.M.A.Y CP-SAT Engine · Moradabad Division Traffic Control
                </p>
              </div>

              {/* Progress Steps */}
              <div className="w-full max-w-md space-y-2 text-left text-xs font-mono">
                <div className={`p-2.5 rounded-xl flex items-center space-x-2.5 transition-all ${txStep >= 1 ? 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>[1/3] Telemetry handshake verified with Section Controller</span>
                </div>
                <div className={`p-2.5 rounded-xl flex items-center space-x-2.5 transition-all ${txStep >= 2 ? 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>[2/3] CP-SAT solver arbitrating passenger timetable buffer (+8m)</span>
                </div>
                <div className={`p-2.5 rounded-xl flex items-center space-x-2.5 transition-all ${txStep >= 3 ? 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>[3/3] Emergency Gazette Code EB-2026-9042 committed to live feed</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirmed State */}
          {submitState === 'confirmed' && (
            <div className="py-6 space-y-4 font-sans">
              <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-600/60 flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      EMERGENCY BLOCK POSSESSION GRANTED
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[9px] font-black uppercase tracking-wider">
                      ACTIVE AUTHORIZATION
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-mono mt-0.5">
                    Authorization Code: EB-2026-NR-9042 · Section Controller: Sh. R.K. Varma
                  </p>
                </div>
              </div>

              {/* Official Electronic Slip */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-500 uppercase">Granted Window:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">
                    {duration} Minutes (Immediate Possession)
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-500 uppercase">Section & Track:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {section} · {trackLine}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-500 uppercase">Kilometer Limits:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{location}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-500 uppercase">Timetable Buffer:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Train 12429 (Lucknow Mail) rescheduled +8m headway
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 uppercase">Gang Protection:</span>
                  <span className="text-slate-900 dark:text-white">{personnel}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between font-mono">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-500" />
                  <span>Print Possession Memo</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  Acknowledge & Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

