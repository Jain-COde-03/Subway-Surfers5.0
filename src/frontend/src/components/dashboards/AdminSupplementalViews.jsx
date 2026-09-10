import React, { useState, useMemo } from 'react';
import {
  Globe,
  Radio,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Train,
  Shield,
  ShieldCheck,
  Search,
  Filter,
  FileText,
  Copy,
  ChevronRight,
  ExternalLink,
  Zap,
  TrendingUp,
  MapPin,
  RefreshCw,
  Compass,
  Sliders,
  Layers,
  ArrowRight,
  Cpu,
  Eye,
  X,
  Check,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';

/* ========================================================================= */
/* COMPONENT 1: GLOBAL NETWORK STATUS VIEW                                   */
/* ========================================================================= */

const HARDCODED_CORRIDORS = [
  {
    id: 'CORR-NDLS-GZB',
    name: 'New Delhi (NDLS) — Ghaziabad (GZB)',
    code: 'QUAD-TRK-01',
    division: 'Delhi (DLI)',
    zone: 'Northern Railway',
    tracks: 'Quadruple (Up/Down Slow & Fast)',
    traction: '25 kV 50Hz AC OHE (Substation: Sahibabad)',
    signaling: 'Automatic Block Signaling (ABS) + Kavach 4.0',
    speedMax: '130 km/h',
    currentThroughput: '94.2%',
    status: 'CAUTION',
    statusColor: 'amber',
    statusBadge: 'BUNDLED MEGABLOCK ACTIVE',
    activeBlock: {
      blockCode: 'BLK-NDLS-GZB-0909',
      window: '01:30 - 04:45 HRS (210 min)',
      deptBundled: ['Engineering (P-Way)', 'Electrical (TRD)', 'S&T (Signaling)'],
      workDescription: 'Deep Ballast Screening (BCM-88) & 25kV OHE Cantilever Inspection @ Km 14/2',
      speedRestriction: '45 km/h Caution Order Issued (T/409 #428)',
      officerInCharge: 'Sr. DEN (Coord) / New Delhi',
    },
    telemetry: {
      voltage: '25.2 kV',
      axleCounterHealth: '100% Normal',
      trackCircuits: '48 / 48 Active',
      activeTrains: 6,
    },
  },
  {
    id: 'CORR-GZB-CNB',
    name: 'Ghaziabad (GZB) — Kanpur Central (CNB)',
    code: 'HDN-1-MAIN',
    division: 'Delhi / Prayagraj',
    zone: 'NCR / NR Feeder',
    tracks: 'Double Line (Dedicated High-Density Network)',
    traction: '2x25 kV AT Feeding System (24.9 kV)',
    signaling: 'Continuous Track Circuit ABS with Kavach',
    speedMax: '160 km/h',
    currentThroughput: '88.7%',
    status: 'OPTIMAL',
    statusColor: 'emerald',
    statusBadge: 'NOMINAL HIGH-SPEED FLOW',
    activeBlock: {
      blockCode: 'PLN-GZB-ALJN-0910',
      window: '02:00 - 04:30 HRS (Tomorrow)',
      deptBundled: ['S&T (Signaling)', 'Engineering (P-Way)'],
      workDescription: 'Aligarh Jn Electronic Interlocking Software Upgrade & Point Calibration',
      speedRestriction: 'None (Unrestricted mainline passage)',
      officerInCharge: 'Sr. DSTE / Aligarh Section',
    },
    telemetry: {
      voltage: '24.9 kV',
      axleCounterHealth: '100% Normal',
      trackCircuits: '112 / 112 Active',
      activeTrains: 11,
    },
  },
  {
    id: 'CORR-DLI-MB',
    name: 'Old Delhi (DLI) — Moradabad (MB)',
    code: 'TRK-DBL-MB',
    division: 'Moradabad (MB)',
    zone: 'Northern Railway',
    tracks: 'Double Line Electrified',
    traction: '25 kV OHE (TSS: Garhmukteshwar)',
    signaling: 'Absolute Block with Route Relay Interlocking',
    speedMax: '110 km/h',
    currentThroughput: '81.4%',
    status: 'CAUTION',
    statusColor: 'amber',
    statusBadge: 'SPEED RESTRICTION IN FORCE',
    activeBlock: {
      blockCode: 'BLK-DLI-MB-0841',
      window: '00:45 - 03:15 HRS',
      deptBundled: ['Engineering (P-Way)'],
      workDescription: 'Ganga Bridge (Bridge No. 118) Sleeper Replacement & USFD Testing',
      speedRestriction: '30 km/h over Bridge Approach Km 88/4',
      officerInCharge: 'ADEN / Hapur Section',
    },
    telemetry: {
      voltage: '25.0 kV',
      axleCounterHealth: '99.2% Nominal',
      trackCircuits: '36 / 36 Active',
      activeTrains: 4,
    },
  },
  {
    id: 'CORR-NZM-AGC',
    name: 'Hazrat Nizamuddin (NZM) — Agra Cantt (AGC)',
    code: 'TRUNK-SEMI-HS',
    division: 'Delhi / Agra',
    zone: 'Northern / North Central',
    tracks: 'Double Line (Semi-High Speed Trunk)',
    traction: '25 kV Heavy-Haul OHE',
    signaling: 'Automatic Block Signaling with Kavach Onboard',
    speedMax: '160 km/h',
    currentThroughput: '91.0%',
    status: 'OPTIMAL',
    statusColor: 'emerald',
    statusBadge: 'ALL CLEAR · ZERO CONFLICT',
    activeBlock: {
      blockCode: 'NIL-WINDOW',
      window: 'No Blocks Active (Golden Pass Corridor)',
      deptBundled: ['Traction / Rolling Stock Ready'],
      workDescription: 'Vande Bharat #22436 and Gatimaan Express clear passage certified',
      speedRestriction: 'Zero Restrictions (160 km/h permissible)',
      officerInCharge: 'Chief Controller / Delhi HQ',
    },
    telemetry: {
      voltage: '25.3 kV',
      axleCounterHealth: '100% Normal',
      trackCircuits: '84 / 84 Active',
      activeTrains: 8,
    },
  },
  {
    id: 'CORR-PWL-MTJ',
    name: 'Palwal (PWL) — Mathura Jn (MTJ)',
    code: 'QUAD-WDFC-02',
    division: 'Delhi / Agra',
    zone: 'Northern Railway',
    tracks: '3rd & 4th Line Quadruple Corridor',
    traction: '25 kV AC High-Rise OHE (WDFC Interconnected)',
    signaling: 'Electronic Interlocking (EI) with Dual VDU',
    speedMax: '130 km/h',
    currentThroughput: '95.6%',
    status: 'MAINTENANCE',
    statusColor: 'sky',
    statusBadge: 'SCHEDULED TRACK TAMPING',
    activeBlock: {
      blockCode: 'BLK-PWL-MTJ-1002',
      window: '02:30 - 05:00 HRS',
      deptBundled: ['Engineering (P-Way)', 'Electrical (TRD)'],
      workDescription: 'Turnout #42 Overhaul at Kosi Kalan Yard with Track Tamping Unit TT-14',
      speedRestriction: '50 km/h on Loop Line 2',
      officerInCharge: 'SSE (P-Way) / Mathura',
    },
    telemetry: {
      voltage: '24.8 kV',
      axleCounterHealth: '100% Normal',
      trackCircuits: '64 / 64 Active',
      activeTrains: 7,
    },
  },
  {
    id: 'CORR-UMB-LDH',
    name: 'Ambala Cantt (UMB) — Ludhiana Jn (LDH)',
    code: 'PUNJAB-TRUNK-01',
    division: 'Ambala (UMB)',
    zone: 'Northern Railway',
    tracks: 'Double Line High-Speed Feeder',
    traction: '25 kV OHE (TSS: Sirhind)',
    signaling: 'Absolute Block with Panel Interlocking',
    speedMax: '130 km/h',
    currentThroughput: '79.3%',
    status: 'OPTIMAL',
    statusColor: 'emerald',
    statusBadge: 'INSPECTION CRUISE OK',
    activeBlock: {
      blockCode: 'PLN-UMB-LDH-0912',
      window: '03:15 - 05:30 HRS',
      deptBundled: ['S&T (Signaling)'],
      workDescription: 'Axle Counter Head Replacement & Digital Interlocking Diagnostic Test',
      speedRestriction: 'None (Scheduled non-traffic interfering window)',
      officerInCharge: 'Sr. DSTE / Ambala',
    },
    telemetry: {
      voltage: '25.1 kV',
      axleCounterHealth: '100% Normal',
      trackCircuits: '52 / 52 Active',
      activeTrains: 5,
    },
  },
];

export function GlobalNetworkStatusView() {
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCorridor, setSelectedCorridor] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('Just now');

  const divisions = ['ALL', 'Delhi (DLI)', 'Moradabad (MB)', 'Ambala (UMB)', 'Lucknow (LKO)'];

  const handleSimulateRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed('Just now (Live simulated)');
    }, 600);
  };

  const filteredCorridors = useMemo(() => {
    return HARDCODED_CORRIDORS.filter((c) => {
      const matchDiv = selectedDivision === 'ALL' || c.division.includes(selectedDivision.split(' ')[0]);
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.statusBadge.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDiv && matchSearch;
    });
  }, [selectedDivision, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Telemetry Grid */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-amber-500/10 via-slate-50 to-transparent dark:from-amber-500/15 dark:via-slate-900 dark:to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                CRIS NETWORK MONITORING
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Updated: {lastRefreshed}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-500 animate-spin-slow" />
              Global Corridor Telemetry &amp; Power Grid Status
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Real-time monitoring across Northern Railway trunk routes, 25kV traction substations, Electronic Interlocking (EI), and Kavach collision avoidance trackside equipment.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-end md:self-center">
            <button
              type="button"
              onClick={handleSimulateRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 py-2 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Polling Sensors...' : 'Simulate Ping'}</span>
            </button>
          </div>
        </div>

        {/* 4 Telemetry Quick-Metric Strips */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80 dark:divide-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="p-4 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400">
                25kV OHE Grid Stability
              </div>
              <div className="text-base font-black text-slate-900 dark:text-slate-100 font-mono">
                99.94% <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">(Nominal)</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">All 14 substations energized</div>
            </div>
          </div>

          <div className="p-4 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400">
                Interlocking Integrity (EI)
              </div>
              <div className="text-base font-black text-slate-900 dark:text-slate-100 font-mono">
                64 / 64 <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Online</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Zero false red aspect signals</div>
            </div>
          </div>

          <div className="p-4 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400">
                Kavach 4.0 Active Shield
              </div>
              <div className="text-base font-black text-slate-900 dark:text-slate-100 font-mono">
                412 <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Locomotives</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Trackside transponders active</div>
            </div>
          </div>

          <div className="p-4 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400">
                Active Bundled Blocks
              </div>
              <div className="text-base font-black text-slate-900 dark:text-slate-100 font-mono">
                3 <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Corridor Sections</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Zero passenger train cancellations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {divisions.map((div) => (
            <button
              key={div}
              type="button"
              onClick={() => setSelectedDivision(div)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
                selectedDivision === div
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {div}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search corridor or section..."
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-xs"
          />
        </div>
      </div>

      {/* Corridor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCorridors.map((corr) => {
          const isCaution = corr.statusColor === 'amber';
          const isOptimal = corr.statusColor === 'emerald';
          const isMaint = corr.statusColor === 'sky';

          return (
            <div
              key={corr.id}
              onClick={() => setSelectedCorridor(corr)}
              className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group hover:border-amber-500/50"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-slate-700">
                      {corr.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                      {corr.division}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1.5 group-hover:text-amber-500 transition-colors">
                    {corr.name}
                  </h3>
                </div>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border tracking-wider shrink-0 ${
                    isCaution
                      ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
                      : isOptimal
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30'
                  }`}
                >
                  {corr.statusBadge}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3.5 flex-1 text-xs">
                {/* Infrastructure specs */}
                <div className="space-y-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Max Permissible Speed:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{corr.speedMax}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Current Throughput Load:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{corr.currentThroughput}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Signaling Protocol:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                      {corr.signaling.split(' ')[0]} {corr.signaling.split(' ')[1]}
                    </span>
                  </div>
                </div>

                {/* Active Maintenance Snippet */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <Clock className="w-3 h-3" />
                      {corr.activeBlock.window}
                    </span>
                    <span className="text-slate-400">{corr.activeBlock.blockCode}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed">
                    {corr.activeBlock.workDescription}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    {corr.activeBlock.deptBundled.map((d, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {d.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                  <Train className="w-3.5 h-3.5 text-amber-500" />
                  <span>{corr.telemetry.activeTrains} trains in sector</span>
                </div>
                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Inspect Telemetry
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Corridor Telemetry Modal */}
      {selectedCorridor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-slate-50 to-transparent dark:from-amber-500/15 dark:via-slate-900 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                    {selectedCorridor.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {selectedCorridor.code} · {selectedCorridor.division}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCorridor(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Traction & Power</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCorridor.traction}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Signaling & Collision Protection</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCorridor.signaling}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300/40 dark:border-amber-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 font-mono">
                    ACTIVE S.A.M.A.Y BUNDLED BLOCK
                  </span>
                  <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    {selectedCorridor.activeBlock.blockCode}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {selectedCorridor.activeBlock.workDescription}
                </p>
                <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 pt-1 space-y-1">
                  <div>Allocated Window: <strong className="text-slate-900 dark:text-slate-100">{selectedCorridor.activeBlock.window}</strong></div>
                  <div>Speed Restriction: <strong className="text-rose-600 dark:text-rose-400">{selectedCorridor.activeBlock.speedRestriction}</strong></div>
                  <div>Officer in Charge: <span className="text-slate-800 dark:text-slate-200">{selectedCorridor.activeBlock.officerInCharge}</span></div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  Live Sensor Feed: 24.8 kV · 100% Track Circuits Intact
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCorridor(null)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================= */
/* COMPONENT 2: OPTIMIZER AUDIT LOGS VIEW                                    */
/* ========================================================================= */

const HARDCODED_AUDIT_LOGS = [
  {
    id: 'AUD-2026-9011',
    epoch: 'Epoch #142',
    timestamp: '2026-09-09 18:42:15 IST',
    corridor: 'NDLS-GZB Quad Line (Km 14.2)',
    actionType: 'MULTI-DEPT BUNDLE',
    actionBadge: 'BUNDLED 3 DEPTS',
    actionColor: 'emerald',
    constraintsSolved: '14 Hard, 4 Soft (Obj: 0.984)',
    solveLatency: '118 ms',
    signedAuthority: 'CRIS-OR-TOOLS-v9.8 [Automated]',
    integrityHash: '0x8f3ce71b52a19b0c67d8f4e2a1b9',
    description: 'Consolidated P-Way Ballast Tamping + TRD OHE Isolator Replacement into single 210m slot. Preserved Vande Bharat #22436 headway (+18m).',
    savedDelay: '142 min passenger delay averted',
    variables: 420,
    clauses: 1840,
    status: 'COMMITTED',
  },
  {
    id: 'AUD-2026-9012',
    epoch: 'Epoch #141',
    timestamp: '2026-09-09 17:15:02 IST',
    corridor: 'GZB-ALJN Mainline (Km 62.8)',
    actionType: 'HEADWAY DE-CONFLICT',
    actionBadge: 'HEADWAY RESCHEDULED',
    actionColor: 'sky',
    constraintsSolved: '12 Hard, 2 Soft (Obj: 0.991)',
    solveLatency: '142 ms',
    signedAuthority: 'SR. DOM / DELHI (Approved)',
    integrityHash: '0x7c3e19a4d8b2f0c1e5a9d3b7f1a8',
    description: 'Shifted S&T Axle Counter calibration window from 19:30 to 02:15 to eliminate conflict with 12004 Lucknow Shatabdi passage.',
    savedDelay: '85 min passenger delay averted',
    variables: 310,
    clauses: 1220,
    status: 'COMMITTED',
  },
  {
    id: 'AUD-2026-9013',
    epoch: 'Epoch #140',
    timestamp: '2026-09-09 15:30:44 IST',
    corridor: 'DLI-MB Trunk (Km 88.0)',
    actionType: 'EMERGENCY PRE-EMPTION',
    actionBadge: 'SAFETY PRIORITY',
    actionColor: 'amber',
    constraintsSolved: '18 Hard, 6 Soft (Obj: 0.976)',
    solveLatency: '64 ms',
    signedAuthority: 'BARODA HOUSE HQ DISPATCHER',
    integrityHash: '0x3a8df0b7c2e1a9d4f5b8c1e7a2d3',
    description: 'Priority safety insertion: Ultrasonic rail flaw alert at Garhmukteshwar. Automatically reassigned freight corridor path to loop 2.',
    savedDelay: 'Critical safety buffer injected (Zero derailment risk)',
    variables: 512,
    clauses: 2450,
    status: 'DISPATCHED',
  },
  {
    id: 'AUD-2026-9014',
    epoch: 'Epoch #139',
    timestamp: '2026-09-09 14:10:19 IST',
    corridor: 'NZM-PWL Corridor (Km 28.5)',
    actionType: 'OHE ISOLATION SYNC',
    actionBadge: 'TRACTION SYNC',
    actionColor: 'emerald',
    constraintsSolved: '10 Hard, 3 Soft (Obj: 0.998)',
    solveLatency: '92 ms',
    signedAuthority: 'CRIS-OR-TOOLS-v9.8 [Automated]',
    integrityHash: '0x5e2b8a7c1d4f9b2e0a3c7d6f1a8b',
    description: 'Synchronized power shutdown on Down-Slow line with P-Way weld grinding gang. Avoided redundant second traction cut.',
    savedDelay: '120 min maintenance downtime merged',
    variables: 280,
    clauses: 980,
    status: 'COMMITTED',
  },
  {
    id: 'AUD-2026-9015',
    epoch: 'Epoch #138',
    timestamp: '2026-09-09 11:22:50 IST',
    corridor: 'PWL-MTJ WDFC Feeder (Km 110.1)',
    actionType: 'FREIGHT WDFC MERGE',
    actionBadge: 'FREIGHT RE-ROUTED',
    actionColor: 'sky',
    constraintsSolved: '16 Hard, 5 Soft (Obj: 0.965)',
    solveLatency: '185 ms',
    signedAuthority: 'CHIEF CONTROLLER / FREIGHT',
    integrityHash: '0x112a77c8d9f4e2b0a1c6f3d5b8e9',
    description: 'Dynamic slot insertion for double-stack container rake over 3rd line during Turnout #42 renewal pause.',
    savedDelay: '3 Freight rakes preserved without detention',
    variables: 640,
    clauses: 3100,
    status: 'COMMITTED',
  },
  {
    id: 'AUD-2026-9016',
    epoch: 'Epoch #137',
    timestamp: '2026-09-09 09:05:11 IST',
    corridor: 'UMB-LDH Feeder (Km 212.4)',
    actionType: 'CALIBRATION AUTO-LOCK',
    actionBadge: 'S&T CERTIFIED',
    actionColor: 'emerald',
    constraintsSolved: '8 Hard, 1 Soft (Obj: 1.000)',
    solveLatency: '82 ms',
    signedAuthority: 'CRIS-OR-TOOLS-v9.8 [Automated]',
    integrityHash: '0x889c2d7f1e4a0b3c6d8f5a2e9b1c',
    description: 'Routine Sirhind Yard point machine overhaul approved. Certified zero interference with Kalka Shatabdi.',
    savedDelay: 'Punctuality preserved (100% on time)',
    variables: 190,
    clauses: 620,
    status: 'COMMITTED',
  },
];

export function OptimizerAuditLogsView() {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  const filteredLogs = useMemo(() => {
    return HARDCODED_AUDIT_LOGS.filter((log) => {
      const matchType = filterType === 'ALL' || log.actionType.includes(filterType);
      const matchSearch =
        log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.corridor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.signedAuthority.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [filterType, searchTerm]);

  const handleCopyHash = (hash) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-amber-500/10 via-slate-50 to-transparent dark:from-amber-500/15 dark:via-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                IMMUTABLE AUDIT TRAIL · SHA-256
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Block Height #849,201
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              CP-SAT Optimizer Decision &amp; Audit Logs
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Mathematical solver ledger recording constraint programming decisions, headway de-conflicts, and departmental bundle approvals with cryptographic verification.
            </p>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <Cpu className="w-4 h-4 text-amber-500" />
            <span>Solver: <strong>Google OR-Tools CP-SAT v9.8</strong></span>
          </div>
        </div>

        {/* 4 Stats Chips */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 dark:divide-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 text-xs">
          <div className="p-4">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-500">Total Solves Logged</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">1,842 Solves</div>
            <div className="text-[10px] text-emerald-600 font-medium">100% Conflict-free certified</div>
          </div>
          <div className="p-4">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-500">Average Solve Latency</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">114 ms</div>
            <div className="text-[10px] text-slate-500">P99: 185 ms on complex yards</div>
          </div>
          <div className="p-4">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-500">Human Dispatch Overrides</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">2 / 1,842</div>
            <div className="text-[10px] text-sky-600 font-medium">99.89% Autonomous adoption</div>
          </div>
          <div className="p-4">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-500">Integrity Signature</div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono truncate">0x8f3ce71b...52a1</div>
            <div className="text-[10px] text-emerald-600 font-medium">Tamper-proof verified</div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {['ALL', 'BUNDLE', 'HEADWAY', 'EMERGENCY'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                filterType === cat
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {cat === 'ALL' ? 'All Logs' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit ID, corridor, or authority..."
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-xs"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/90 dark:border-slate-800 font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Audit ID &amp; Time</th>
                <th className="py-3 px-4">Corridor &amp; Action</th>
                <th className="py-3 px-4">Mathematical Constraints</th>
                <th className="py-3 px-4">Solve Latency</th>
                <th className="py-3 px-4">Signed Authority</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredLogs.map((log) => {
                const isBundle = log.actionType === 'MULTI-DEPT BUNDLE';
                const isHeadway = log.actionType === 'HEADWAY DE-CONFLICT';
                const isEmerg = log.actionType === 'EMERGENCY PRE-EMPTION';

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{log.id}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{log.timestamp}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{log.corridor}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isBundle
                              ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                              : isHeadway
                              ? 'bg-sky-500/15 text-sky-800 dark:text-sky-300'
                              : 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {log.actionBadge}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate max-w-xs">{log.description}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      <div>{log.constraintsSolved}</div>
                      <div className="text-[10px] text-slate-400">{log.variables} vars · {log.clauses} clauses</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {log.solveLatency}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-slate-700 dark:text-slate-300 font-semibold">{log.signedAuthority}</div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <span className="truncate max-w-[90px]">{log.integrityHash}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyHash(log.integrityHash)}
                          className="hover:text-amber-500 cursor-pointer"
                          title="Copy SHA-256 Hash"
                        >
                          {copiedHash === log.integrityHash ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedAudit(log)}
                        className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-slate-50 to-transparent dark:from-amber-500/15 dark:via-slate-900 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                      Audit Telemetry: {selectedAudit.id}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold">
                      {selectedAudit.status}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-500">{selectedAudit.timestamp}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200">{selectedAudit.corridor}</div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{selectedAudit.description}</p>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{selectedAudit.savedDelay}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Mathematical Solver Engine</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Google CP-SAT v9.8</span>
                  <div className="text-[10px] text-slate-500 mt-1">Variables: {selectedAudit.variables} | Clauses: {selectedAudit.clauses}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Execution Latency</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedAudit.solveLatency}</span>
                  <div className="text-[10px] text-emerald-600 mt-1">Zero timeouts or heuristics fallbacks</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 font-mono space-y-1">
                <span className="text-slate-400 text-[10px] block">Cryptographic Integrity Hash (SHA-256)</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 break-all select-all">
                  {selectedAudit.integrityHash}e8a49c2b104938fd8
                </span>
                <div className="text-[10px] text-slate-500 pt-1">
                  Validated against Baroda House Railway Board Central Trust Authority
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAudit(null)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================= */
/* COMPONENT 3: CORRIDOR MAP VIEW (INTERACTIVE SVG RADAR)                    */
/* ========================================================================= */

const RADAR_STATIONS = [
  { id: 'NDLS', name: 'New Delhi', x: 260, y: 150, tag: 'CENTRAL TERMINAL', lines: 16, status: 'HIGH TRAFFIC' },
  { id: 'DLI', name: 'Old Delhi', x: 220, y: 80, tag: 'HISTORIC JUNCTION', lines: 14, status: 'NOMINAL' },
  { id: 'NZM', name: 'H. Nizamuddin', x: 320, y: 220, tag: 'SEMI-HIGH SPEED', lines: 9, status: 'ACTIVE' },
  { id: 'ANVT', name: 'Anand Vihar', x: 380, y: 130, tag: 'EAST EXPRESS HUB', lines: 7, status: 'NOMINAL' },
  { id: 'GZB', name: 'Ghaziabad Jn', x: 490, y: 110, tag: 'QUAD-LINE GATEWAY', lines: 6, status: 'MAINTENANCE ZONE' },
  { id: 'TKD', name: 'Tuglakabad', x: 340, y: 300, tag: 'CONTAINER DEPOT', lines: 8, status: 'NOMINAL' },
  { id: 'PWL', name: 'Palwal', x: 390, y: 390, tag: 'WDFC INTERCHANGE', lines: 4, status: 'NOMINAL' },
  { id: 'ALJN', name: 'Aligarh Jn', x: 670, y: 240, tag: 'HDN-1 TRUNK', lines: 4, status: 'ACTIVE' },
  { id: 'MB', name: 'Moradabad Jn', x: 680, y: 60, tag: 'UP-LINE DIVISION', lines: 5, status: 'SPEED RESTRICTION' },
];

const RADAR_TRAINS = [
  { id: 'VB 22436', name: 'Vande Bharat Express', x: 420, y: 125, speed: '130 km/h', dest: 'NDLS → BSB', status: 'ON TIME' },
  { id: 'SHT 12004', name: 'Lucknow Shatabdi', x: 560, y: 165, speed: '115 km/h', dest: 'NDLS → LKO', status: 'ON TIME' },
  { id: 'RAJ 12302', name: 'Kolkata Rajdhani', x: 610, y: 210, speed: '128 km/h', dest: 'NDLS → HWH', status: 'ON TIME' },
  { id: 'WDFC 8044', name: 'Container Freight', x: 360, y: 340, speed: '65 km/h', dest: 'TKD → JNPT', status: 'NOMINAL' },
];

export function CorridorMapView() {
  const [selectedStation, setSelectedStation] = useState(RADAR_STATIONS[0]);
  const [activeLayer, setActiveLayer] = useState('ALL'); // ALL, MAINTENANCE, SPEED

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-amber-500/10 via-slate-50 to-transparent dark:from-amber-500/15 dark:via-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                TOPOLOGICAL RADAR · NORTHERN RAILWAY
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Live Dynamic Section Map
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-500" />
              Northern Railway Multi-Track Corridor Topology
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Interactive schematic diagram of Delhi Area Junctions, Ghaziabad Quad Line, and Kanpur Trunk showing live maintenance slots and in-transit express train buffers.
            </p>
          </div>

          {/* Layer toggles */}
          <div className="flex items-center space-x-2">
            {[
              { id: 'ALL', label: 'All Layers' },
              { id: 'MAINTENANCE', label: 'Maintenance Zones' },
              { id: 'TRAINS', label: 'Train Flow' },
            ].map((layer) => (
              <button
                key={layer.id}
                type="button"
                onClick={() => setActiveLayer(layer.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                  activeLayer === layer.id
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Radar Layout: 8 Cols SVG Canvas + 4 Cols Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive SVG Schematic Canvas (8 Cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-950 text-white shadow-xl overflow-hidden relative">
          {/* Radar HUD Overlay Header */}
          <div className="absolute top-3 left-4 z-10 flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              RADAR ACTIVE · DEL-NCR GRID
            </span>
            <span className="hidden sm:inline-block text-slate-500 text-[11px]">
              Click any station node to inspect yard status
            </span>
          </div>

          {/* SVG Map */}
          <div className="w-full h-[480px] flex items-center justify-center p-4">
            <svg
              viewBox="100 20 650 420"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
            >
              {/* Background Grid Lines */}
              <defs>
                <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                </pattern>
                <linearGradient id="corridorGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <rect x="100" y="20" width="650" height="420" fill="url(#radarGrid)" />

              {/* Trunk Railway Tracks */}
              {/* Track: DLI -> NDLS */}
              <line x1="220" y1="80" x2="260" y2="150" stroke="#475569" strokeWidth="4" />
              <line x1="220" y1="80" x2="260" y2="150" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6,4" />

              {/* Track: NDLS -> NZM */}
              <line x1="260" y1="150" x2="320" y2="220" stroke="#475569" strokeWidth="6" />
              <line x1="260" y1="150" x2="320" y2="220" stroke="#f59e0b" strokeWidth="2" />

              {/* Track: NDLS -> ANVT -> GZB (Quad Line) */}
              <path d="M 260 150 L 380 130 L 490 110" fill="none" stroke="#475569" strokeWidth="8" />
              <path d="M 260 150 L 380 130 L 490 110" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="8,5" />

              {/* Track: GZB -> MB (Double Line) */}
              <line x1="490" y1="110" x2="680" y2="60" stroke="#475569" strokeWidth="5" />
              <line x1="490" y1="110" x2="680" y2="60" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Track: GZB -> ALJN (High Speed Trunk) */}
              <path d="M 490 110 L 670 240" fill="none" stroke="#3b82f6" strokeWidth="6" />
              <path d="M 490 110 L 670 240" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="10,4" />

              {/* Track: NZM -> TKD -> PWL (Down Trunk) */}
              <path d="M 320 220 L 340 300 L 390 390" fill="none" stroke="#475569" strokeWidth="6" />
              <path d="M 320 220 L 340 300 L 390 390" fill="none" stroke="#10b981" strokeWidth="2" />

              {/* Maintenance Block Highlight Zones (Flashing amber striped area between NDLS & GZB) */}
              {(activeLayer === 'ALL' || activeLayer === 'MAINTENANCE') && (
                <g>
                  {/* Zone 1: NDLS - GZB Quad Block */}
                  <rect
                    x="330"
                    y="115"
                    width="100"
                    height="30"
                    rx="8"
                    fill="rgba(245, 158, 11, 0.25)"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                    className="animate-pulse"
                  />
                  <text x="380" y="134" fill="#fbbf24" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    BLK-NDLS-GZB (ACTIVE)
                  </text>

                  {/* Zone 2: Moradabad Bridge Block */}
                  <circle cx="585" cy="85" r="18" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="585" y="88" fill="#f87171" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    CAUTION 30k
                  </text>
                </g>
              )}

              {/* Moving / Placed Live Trains */}
              {(activeLayer === 'ALL' || activeLayer === 'TRAINS') &&
                RADAR_TRAINS.map((trn) => (
                  <g key={trn.id} className="cursor-pointer">
                    <circle cx={trn.x} cy={trn.y} r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                    <circle cx={trn.x} cy={trn.y} r="14" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.6" className="animate-ping" />
                    <text
                      x={trn.x + 12}
                      y={trn.y + 4}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {trn.id} ({trn.speed})
                    </text>
                  </g>
                ))}

              {/* Station Nodes */}
              {RADAR_STATIONS.map((stn) => {
                const isSelected = selectedStation?.id === stn.id;
                return (
                  <g
                    key={stn.id}
                    onClick={() => setSelectedStation(stn)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={stn.x}
                      cy={stn.y}
                      r={isSelected ? '11' : '8'}
                      fill={isSelected ? '#f59e0b' : '#1e293b'}
                      stroke={isSelected ? '#ffffff' : '#64748b'}
                      strokeWidth={isSelected ? '3' : '2'}
                      className="transition-all duration-200"
                    />
                    <text
                      x={stn.x}
                      y={stn.y - 14}
                      fill={isSelected ? '#fbbf24' : '#e2e8f0'}
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                    >
                      {stn.name}
                    </text>
                    <text
                      x={stn.x}
                      y={stn.y + 22}
                      fill="#94a3b8"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {stn.id} ({stn.lines}L)
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Radar Legend Bar */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-amber-500 rounded"></span>
                <span>Quad-Line (ABS)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-blue-500 rounded"></span>
                <span>HDN-1 High Speed</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Train GPS</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-500"></span>
                <span>Active CP-SAT Block</span>
              </span>
            </div>
            <div className="text-slate-500">
              Coverage: Delhi Division · 128 Track Km Monitored
            </div>
          </div>
        </div>

        {/* Selected Station / Sector Inspector (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300">
                STATION NODE TELEMETRY
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">
                {selectedStation.name} ({selectedStation.id})
              </h3>
              <p className="text-xs font-mono text-slate-500">{selectedStation.tag}</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
              {selectedStation.status}
            </span>
          </div>

          {/* Quick Yard Stats */}
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span className="text-slate-500">Platform Lines:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStation.lines} Track Platforms</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span className="text-slate-500">Kavach Trackside Unit:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">TSU-ACTIVE (100% OK)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span className="text-slate-500">Electronic Interlocking:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Dual VDU Standby</span>
            </div>
          </div>

          {/* Station Departure Feeder */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider">
              Approaching Express Paths
            </h4>
            <div className="space-y-1.5">
              {RADAR_TRAINS.map((trn) => (
                <div
                  key={trn.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">{trn.id}</div>
                    <div className="text-[10px] text-slate-500">{trn.dest}</div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {trn.speed}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => alert(`COIS caution order generated for ${selectedStation.name} sector.`)}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold font-mono transition-all cursor-pointer shadow-xs hover:shadow text-center"
            >
              Generate Caution Notice (T/409)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* COMPONENT 4: DISRUPTION ANALYTICS VIEW                                    */
/* ========================================================================= */

export function DisruptionAnalyticsView() {
  const [timeRange, setTimeRange] = useState('WEEK');
  const [stressSimCount, setStressSimCount] = useState(2);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-amber-500/10 via-slate-50 to-transparent dark:from-amber-500/15 dark:via-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                CRIS OPTIMIZER ROI &amp; PUNCTUALITY
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Northern Railway Analytics Core
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Disruption Mitigation &amp; Multi-Dept Synergy Analytics
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Comparative impact evaluation comparing automated S.A.M.A.Y CP-SAT multi-department bundling against traditional manual single-department corridor closures.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {[
              { id: '24H', label: '24 Hours' },
              { id: 'WEEK', label: 'Current Week' },
              { id: 'MONTH', label: 'Month-to-Date' },
            ].map((rng) => (
              <button
                key={rng.id}
                type="button"
                onClick={() => setTimeRange(rng.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                  timeRange === rng.id
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {rng.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Impact Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80 dark:divide-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 text-xs">
          <div className="p-4">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-500">Train Delay Minutes Averted</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">4,820 min</div>
            <div className="text-[10px] text-slate-500 mt-1">~80.3 passenger hours saved</div>
          </div>
          <div className="p-4">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-500">Punctuality Retention</div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">97.8%</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">+6.2% vs manual benchmark</div>
          </div>
          <div className="p-4">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-500">Bundling Multiplier</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">3.4x</div>
            <div className="text-[10px] text-slate-500 mt-1">Tasks executed per line closure</div>
          </div>
          <div className="p-4">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-500">Economic Value Generated</div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">₹1.48 Cr</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">Loco &amp; crew idle savings</div>
          </div>
        </div>
      </div>

      {/* 2-Column Analytical Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Card 1: Departmental Work Allocation & Synergies (6 Cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Departmental Maintenance Hours Synergized
              </h3>
              <p className="text-xs text-slate-500">Distribution of work completed in joint mega-blocks</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-500">100% COLLABORATIVE</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300">Engineering (P-Way Track Work)</span>
                <span className="text-slate-900 dark:text-slate-100 font-extrabold">42% (38 hrs)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-slate-700 dark:bg-slate-300 rounded-full" style={{ width: '42%' }}></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Track tamping, deep screening, rail weld ultrasonic flaw testing</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="font-bold text-amber-600 dark:text-amber-400">Electrical (TRD 25kV Traction)</span>
                <span className="text-slate-900 dark:text-slate-100 font-extrabold">32% (29 hrs)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '32%' }}></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Cantilever adjustment, neutral section inspection, isolator overhaul</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Signaling &amp; Telecom (S&T / Kavach)</span>
                <span className="text-slate-900 dark:text-slate-100 font-extrabold">26% (23 hrs)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '26%' }}></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Axle counter resetting, point machine calibration, Kavach trackside tags</p>
            </div>
          </div>
        </div>

        {/* Card 2: Time-of-Day Window Optimization (6 Cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                24-Hour Block Placement Profile
              </h3>
              <p className="text-xs text-slate-500">Optimizer clusters work into low-density night hours</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600">ZERO RUSH-HOUR BLOCKS</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-300/40 dark:border-emerald-800/40">
              <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
                <span>01:00 — 05:00 HRS (Golden Maintenance Window)</span>
                <span>84% of Blocks</span>
              </div>
              <div className="w-full h-2 rounded-full bg-emerald-200 dark:bg-emerald-900/60 mt-2 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '84%' }}></div>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-sans mt-1">
                Zero interference with daily express or suburban passenger services.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>08:00 — 11:00 &amp; 17:00 — 20:30 HRS (Peak Rush Hours)</span>
                <span className="text-rose-500">0% (Strictly Prohibited)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 mt-2 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <p className="text-[11px] text-slate-500 font-sans mt-1">
                Hard constraints in CP-SAT enforce 100% corridor clearance during passenger rush hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Benchmark Comparison Table */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Automated S.A.M.A.Y CP-SAT vs Legacy Manual Coordination
          </h3>
          <span className="text-[10px] font-mono font-bold text-slate-500">ANNUALIZED RUNNING BENCHMARK</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Performance Metric</th>
                <th className="py-3 px-4">Legacy Manual Scheduling</th>
                <th className="py-3 px-4">S.A.M.A.Y CP-SAT Optimizer</th>
                <th className="py-3 px-4 text-right">Net Operational Gain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-xs">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">Track Line Closures per Week</td>
                <td className="py-3 px-4 text-rose-500">18 isolated closures</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">5 bundled mega-blocks</td>
                <td className="py-3 px-4 text-right text-emerald-600 font-extrabold">-72.2% Corridor Disruption</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">Freight Corridor Average Speed</td>
                <td className="py-3 px-4 text-slate-500">22.4 km/h</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">36.8 km/h</td>
                <td className="py-3 px-4 text-right text-emerald-600 font-extrabold">+64.2% Throughput Speed</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">Inter-Departmental Scheduling Disputes</td>
                <td className="py-3 px-4 text-rose-500">14 disputes / month</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">0 disputes (Automated objective)</td>
                <td className="py-3 px-4 text-right text-emerald-600 font-extrabold">100% Conflict Elimination</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">Maintenance Crew Idle Waiting Time</td>
                <td className="py-3 px-4 text-slate-500">45 min / block</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">6 min / block</td>
                <td className="py-3 px-4 text-right text-emerald-600 font-extrabold">-86.6% Idle Man-Hours</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

