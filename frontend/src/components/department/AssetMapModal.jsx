import React, { useState } from 'react';
import {
  Map,
  Compass,
  X,
  Layers,
  MapPin,
  Activity,
  AlertTriangle,
  Zap,
  Radio,
  Train,
  CheckCircle2,
  Filter,
  Eye,
  Info
} from 'lucide-react';

export default function AssetMapModal({ isOpen, onClose, department = 'Civil' }) {
  if (!isOpen) return null;

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const STATIONS = [
    { code: 'GZB', name: 'Ghaziabad Jn', km: 240, x: 70 },
    { code: 'PKW', name: 'Pilkhuwa', km: 262, x: 210 },
    { code: 'HPU', name: 'Hapur Jn', km: 278, x: 370 },
    { code: 'GMS', name: 'Garhmukteshwar', km: 298, x: 530 },
    { code: 'GJL', name: 'Gajraula Jn', km: 312, x: 670 },
    { code: 'AMRO', name: 'Amroha', km: 328, x: 790 },
    { code: 'MB', name: 'Moradabad Jn', km: 335, x: 910 },
  ];

  const ASSETS = [
    {
      id: 'AST-SIG-104',
      name: 'Signal Post S-12 (Multi-Aspect Color Light)',
      type: 'SMMS',
      dept: 'Signaling (SMMS)',
      station: 'Hapur Jn (HPU)',
      km: 'KM 278/14',
      x: 380,
      y: 110,
      status: 'OPERATIONAL',
      aspect: 'Double Yellow / Attention',
      telemetry: 'Lamp Resistance: 12.4 Ω · Track Circuit Drop: 0ms · Relays: Energized',
      lastInsp: '06-Sep-2026 by SSE/Sig/HPU',
      nextBlock: 'BLK-MST-103 (Fri 11 Sep)',
      notes: 'Digital Axle Counter interface healthy. Interlocking relay room telemetry active.'
    },
    {
      id: 'AST-TRK-278',
      name: 'KM 278 Ultrasonic Rail Flaw (IMR Zone)',
      type: 'TMS',
      dept: 'Track / Civil (TMS)',
      station: 'Hapur Yard UP Line',
      km: 'KM 278/18',
      x: 395,
      y: 180,
      status: 'MAINTENANCE DUE',
      aspect: 'Speed Restriction: 30 km/h',
      telemetry: 'TGI: 76.2 · Gauge: +3mm · Rail Wear: 4.2mm · Fatigue Index: Moderate',
      lastInsp: '08-Sep-2026 by USFD Vehicle #03',
      nextBlock: 'BLK-MST-102 (Thu 10 Sep)',
      notes: 'Fishplate clamp applied. Plasser BCM Tamper scheduled for ballast rehabilitation.'
    },
    {
      id: 'AST-TRD-042',
      name: 'Traction Substation TSS Hapur (25kV Feeder)',
      type: 'TDMS',
      dept: 'Traction / Electrical (TDMS)',
      station: 'Pilkhuwa – Hapur Midsection',
      km: 'KM 274/20',
      x: 320,
      y: 90,
      status: 'OPERATIONAL',
      aspect: '25.4 kV Catenary Feed Active',
      telemetry: 'Line Voltage: 25.4 kV · Load: 340 A · Catenary Tension: 1,000 kgf · Power Factor: 0.94',
      lastInsp: '05-Sep-2026 by DEE/TRD/MB',
      nextBlock: 'BLK-MST-102 (Thu 10 Sep)',
      notes: 'SCADA telemetry linked to Central Power Controller. Insulator wash completed.'
    },
    {
      id: 'AST-BLK-101',
      name: 'Corridor Possession Zone BLK-MST-101',
      type: 'BLOCK',
      dept: 'Joint TMS / SMMS',
      station: 'Ghaziabad – Pilkhuwa Section',
      km: 'KM 254/00 – 262/00',
      x: 140,
      y: 150,
      status: 'SCHEDULED BLOCK',
      aspect: 'Possession: Wed 01:30 – 05:30',
      telemetry: 'Duration: 4.0 hrs · Machine: Plasser 08 Tamper · Crew: 14 Gangmen',
      lastInsp: 'Coordinated via S.A.M.A.Y CP-SAT Solver',
      nextBlock: 'Scheduled for Tomorrow 01:30 hrs',
      notes: 'Traffic routed through DN line via single-line working protocol.'
    },
    {
      id: 'AST-WTH-098',
      name: 'Automatic Weather Station (AWS Garhmukteshwar)',
      type: 'WEATHER',
      dept: 'Operations & Safety',
      station: 'Garhmukteshwar River Bridge',
      km: 'KM 298/50',
      x: 545,
      y: 110,
      status: 'MONSOON WATCH',
      aspect: 'Ganga Bridge Water Level: Normal',
      telemetry: 'Wind Speed: 16 km/h · Rainfall: 1.8 mm/hr · Rail Temp: 32.5°C · Water Gauge: 4.2m',
      lastInsp: 'Hourly Automated Telemetry Sync',
      nextBlock: 'Continuous Monitoring Active',
      notes: 'High wind alarms set to trigger automated TSR 45 km/h if wind exceeds 50 km/h.'
    },
    {
      id: 'AST-SIG-312',
      name: 'Point Machine 102 Crossover & Interlocking',
      type: 'SMMS',
      dept: 'Signaling (SMMS)',
      station: 'Gajraula Jn (GJL)',
      km: 'KM 312/08',
      x: 685,
      y: 180,
      status: 'OPERATIONAL',
      aspect: 'Point Normal · Locked',
      telemetry: 'Motor Current: 2.1 A · Throw Time: 3.8s · Obstruction Test: Passed',
      lastInsp: '07-Sep-2026 by ESM/Sig/GJL',
      nextBlock: 'BLK-MST-106 (Mon 14 Sep)',
      notes: 'Solid State Interlocking (SSI) feedback verified normal.'
    },
    {
      id: 'AST-TRD-328',
      name: 'OHE Sectioning Post SP-Amroha',
      type: 'TDMS',
      dept: 'Traction / Electrical (TDMS)',
      station: 'Amroha Yard',
      km: 'KM 328/15',
      x: 805,
      y: 110,
      status: 'OPERATIONAL',
      aspect: 'Bridging Interrupter Closed',
      telemetry: 'Bus Voltage: 25.1 kV · Temperature: 36°C · SCADA Status: Remote Ready',
      lastInsp: '03-Sep-2026 by SSE/TRD/AMRO',
      nextBlock: 'BLK-MST-107 (Tue 15 Sep)',
      notes: 'Sub-station circuit breakers tested during August power audit.'
    }
  ];

  const filteredAssets = ASSETS.filter(a => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'TMS') return a.type === 'TMS' || a.type === 'BLOCK';
    if (activeFilter === 'SMMS') return a.type === 'SMMS' || a.type === 'BLOCK';
    if (activeFilter === 'TDMS') return a.type === 'TDMS' || a.type === 'BLOCK';
    if (activeFilter === 'BLOCK') return a.type === 'BLOCK';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-xs animate-fadeIn select-none">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/60 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Top Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-slate-100/60 dark:from-amber-500/15 dark:via-slate-900/90 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
              <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-900 dark:text-slate-100 font-bold text-sm sm:text-base tracking-tight font-sans">
                  S.A.M.A.Y GIS CORRIDOR ASSET & POSSESSION MAP
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-mono text-[9px] font-black uppercase tracking-wider">
                  LIVE GIS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Moradabad – Ghaziabad Mainline Corridor · Dual Tracks (KM 240.0 – 335.0)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mr-1">
              Layer:
            </span>
            <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-300/80 dark:border-slate-700 shadow-xs space-x-1">
              {[
                { id: 'ALL', label: 'All Layers' },
                { id: 'TMS', label: 'Track (TMS)' },
                { id: 'SMMS', label: 'Signals (SMMS)' },
                { id: 'TDMS', label: 'Traction (TDMS)' },
                { id: 'BLOCK', label: 'Active Blocks' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    activeFilter === f.id
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Block
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> TSR/Defect
            </span>
          </div>
        </div>

        {/* Map Workspace (Scrollable Interactive SVG) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/60 dark:bg-slate-950/80 space-y-4">
          <div className="relative w-full overflow-x-auto bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-2xl">
            <svg
              viewBox="0 0 980 280"
              className="w-full min-w-[760px] h-auto text-slate-400 select-none"
            >
              <defs>
                {/* Glow Filter for Active Blocks */}
                <filter id="blockGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Grid Lines */}
              <g stroke="rgba(255,255,255,0.04)" strokeWidth="1">
                {[50, 100, 150, 200, 250].map(y => (
                  <line key={y} x1="0" y1={y} x2="980" y2={y} />
                ))}
                {STATIONS.map(st => (
                  <line key={st.code} x1={st.x} y1="30" x2={st.x} y2="250" />
                ))}
              </g>

              {/* Station Mileage Markers at Top */}
              {STATIONS.map(st => (
                <g key={st.code} transform={`translate(${st.x}, 40)`}>
                  <text
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {st.name}
                  </text>
                  <text
                    textAnchor="middle"
                    y="14"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    KM {st.km}
                  </text>
                  <circle cy="25" r="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                </g>
              ))}

              {/* Dual Main Lines (Tracks) */}
              {/* UP Main Line */}
              <line
                x1="40"
                y1="130"
                x2="940"
                y2="130"
                stroke="#475569"
                strokeWidth="4"
                strokeDasharray="8 4"
              />
              <text x="15" y="133" fill="#cbd5e1" fontSize="9" fontFamily="monospace" fontWeight="bold">
                UP
              </text>

              {/* DN Main Line */}
              <line
                x1="40"
                y1="160"
                x2="940"
                y2="160"
                stroke="#475569"
                strokeWidth="4"
                strokeDasharray="8 4"
              />
              <text x="15" y="163" fill="#cbd5e1" fontSize="9" fontFamily="monospace" fontWeight="bold">
                DN
              </text>

              {/* Active Block Zone Highlight (KM 254 - 262 UP Line) */}
              <rect
                x="110"
                y="125"
                width="80"
                height="10"
                fill="#f59e0b"
                opacity="0.8"
                rx="2"
                filter="url(#blockGlow)"
              >
                <animate
                  attributeName="opacity"
                  values="0.4;0.9;0.4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </rect>

              {/* Asset Pins & Interactivity */}
              {filteredAssets.map(asset => {
                const isSelected = selectedAsset?.id === asset.id;
                const isWarning = asset.status.includes('DUE') || asset.status.includes('WATCH');
                const isBlock = asset.type === 'BLOCK';

                const pinColor = isWarning
                  ? '#f43f5e'
                  : isBlock
                  ? '#f59e0b'
                  : asset.type === 'TDMS'
                  ? '#38bdf8'
                  : asset.type === 'SMMS'
                  ? '#eab308'
                  : '#10b981';

                return (
                  <g
                    key={asset.id}
                    transform={`translate(${asset.x}, ${asset.y})`}
                    onClick={() => setSelectedAsset(asset)}
                    className="cursor-pointer group"
                  >
                    {/* Connecting dashed lead to track */}
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2={asset.y < 145 ? 130 - asset.y : 160 - asset.y}
                      stroke={pinColor}
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                      opacity="0.7"
                    />

                    {/* Outer pulse */}
                    <circle r={isSelected ? '14' : '10'} fill={pinColor} opacity="0.2">
                      <animate
                        attributeName="r"
                        values={isSelected ? '12;18;12' : '8;14;8'}
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Pin Circle Body */}
                    <circle
                      r="8"
                      fill={isSelected ? '#ffffff' : pinColor}
                      stroke="#0f172a"
                      strokeWidth="2"
                      className="transition-transform group-hover:scale-125"
                    />

                    {/* Tag label */}
                    <text
                      y={asset.y < 145 ? -12 : 20}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {asset.id.split('-')[1]}
                    </text>
                  </g>
                );
              })}

              {/* Direction Indicator */}
              <g transform="translate(480, 240)">
                <text textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
                  ◄ TOWARDS NEW DELHI (GZB) —————— DIRECTION OF TRAVEL —————— TOWARDS BAREILLY (MB) ►
                </text>
              </g>
            </svg>
          </div>

          {/* Asset Telemetry Bottom Drawer */}
          {selectedAsset ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-3.5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base font-sans">{selectedAsset.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30">
                        {selectedAsset.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Location: {selectedAsset.km} · {selectedAsset.station} · Dept: {selectedAsset.dept}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                    selectedAsset.status.includes('DUE')
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                      : selectedAsset.status.includes('BLOCK')
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {selectedAsset.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedAsset(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Live Telemetry:</div>
                  <div className="text-slate-900 dark:text-white text-[11px] leading-relaxed font-semibold">
                    {selectedAsset.telemetry}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Operational State:</div>
                  <div className="text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                    {selectedAsset.aspect}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                    Next Block: <span className="text-slate-900 dark:text-white font-semibold">{selectedAsset.nextBlock}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Inspector Field Notes:</div>
                  <div className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {selectedAsset.notes}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center justify-center space-x-2 shadow-xs">
              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Click on any station marker or asset pin (S-12, TSS-04, Track KM 278) to open live sensor telemetry sheet.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

