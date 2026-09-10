import React, { useState } from 'react';
import {
  Train,
  Calendar,
  ListOrdered,
  Activity,
  Sliders,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  Send,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HardHat,
  Truck,
  TrendingUp,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Info,
  SlidersHorizontal,
  MapPin,
  Flame,
  Zap,
  Radio,
  FileSpreadsheet
} from 'lucide-react';

// ==========================================
// 1. KPI RIBBON COMPONENT
// ==========================================
const KPIRibbon = ({ backlogCount, criticalAlertsCount, grantedHours, bundlingEfficiency }) => {
  const cards = [
    {
      title: 'Pending Backlog',
      value: `${backlogCount} Tasks`,
      sub: '+8 ingested from TMS today',
      icon: Layers,
      highlightColor: 'text-blue-900',
      badge: 'P-Way / S&T / TRD',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      title: 'AI Critical Alerts',
      value: criticalAlertsCount,
      sub: 'Urgent track geometry & rail flaws',
      icon: AlertTriangle,
      // Strictly Amber/Red text per prompt requirement
      highlightColor: 'text-amber-600',
      badge: 'Immediate Block Req.',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-300',
    },
    {
      title: 'Granted Block Time',
      value: `${grantedHours} Hrs`,
      sub: 'COA corridor capacity allocated',
      icon: Clock,
      highlightColor: 'text-blue-900',
      badge: '88.5% of 48h Window',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      title: 'Bundling Efficiency',
      value: `${bundlingEfficiency}%`,
      sub: '63 redundant corridor blocks saved',
      icon: Sparkles,
      highlightColor: 'text-blue-900',
      badge: '+14.2% vs Manual',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl p-4 shadow-md shadow-black/[0.04] border border-gray-200 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-black/[0.08]"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <div className={`text-2xl font-bold mt-1 tracking-tight ${card.highlightColor}`}>
                  {card.value}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-gray-200 text-blue-900">
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 truncate max-w-[140px]">{card.sub}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${card.badgeColor}`}
              >
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// 2. INTERACTIVE WEEKLY BLOCK CALENDAR COMPONENT
// ==========================================
const WeeklyBlockCalendar = ({ onSelectBlock }) => {
  const [selectedDay, setSelectedDay] = useState(2); // Wednesday default

  const daysOfWeek = [
    { name: 'Mon', date: '08 Sep', totalHours: '6.5h' },
    { name: 'Tue', date: '09 Sep', totalHours: '5.0h' },
    { name: 'Wed', date: '10 Sep', totalHours: '8.5h' },
    { name: 'Thu', date: '11 Sep', totalHours: '4.0h' },
    { name: 'Fri', date: '12 Sep', totalHours: '7.5h' },
    { name: 'Sat', date: '13 Sep', totalHours: '6.0h' },
    { name: 'Sun', date: '14 Sep', totalHours: '5.0h' },
  ];

  // Realistic Indian Railways maintenance blocks
  const blocksData = {
    0: [
      {
        id: 'BLK-NDLS-01',
        section: 'NDLS - GZB Down Line',
        time: '02:00 - 05:30',
        duration: '3.5h',
        type: 'Ballast Deep Screening',
        department: 'P-Way (Engineering)',
        isBundled: false,
        speedRestriction: 'TSR 30 km/h',
      },
      {
        id: 'BLK-UMB-02',
        section: 'Ambala Cantt Yard',
        time: '12:00 - 15:00',
        duration: '3.0h',
        type: 'Point Machine Replacement',
        department: 'S&T (Signaling)',
        isBundled: false,
        speedRestriction: 'Yard caution',
      },
    ],
    1: [
      {
        id: 'BLK-CNB-03',
        section: 'Kanpur Central UP Through',
        time: '01:30 - 05:00',
        duration: '3.5h',
        type: 'OHE Cantilever Realignment',
        department: 'Electrical TRD',
        isBundled: false,
        speedRestriction: 'None',
      },
      {
        id: 'BLK-GZB-04',
        section: 'Ghaziabad - Aligarh Sec',
        time: '13:30 - 15:00',
        duration: '1.5h',
        type: 'Weld Flaw Ultrasonic Testing',
        department: 'P-Way',
        isBundled: false,
        speedRestriction: 'TSR 45 km/h',
      },
    ],
    2: [
      {
        id: 'BLK-BND-01',
        section: 'Delhi - Kanpur Main UP',
        time: '02:00 - 06:00',
        duration: '4.0h',
        type: 'Track Tamping + OHE Contact Wire',
        department: 'Multi-Dept (P-Way + TRD + S&T)',
        isBundled: true,
        speedRestriction: 'PSR 50 km/h',
        corridorYield: '+2.5h traffic freed',
      },
      {
        id: 'BLK-TKJ-02',
        section: 'Tilak Bridge - Hazrat Nizamuddin',
        time: '00:30 - 04:00',
        duration: '3.5h',
        type: 'Switch Rail Replacement & S&T Locking',
        department: 'Multi-Dept (P-Way + S&T)',
        isBundled: true,
        speedRestriction: 'Yard Lockout',
        corridorYield: 'Dual crew sync',
      },
      {
        id: 'BLK-SNP-03',
        section: 'Sonipat - Panipat Sec',
        time: '11:15 - 12:15',
        duration: '1.0h',
        type: 'Axle Counter Sensor Calibration',
        department: 'Signaling (S&T)',
        isBundled: false,
        speedRestriction: 'None',
      },
    ],
    3: [
      {
        id: 'BLK-ALJN-01',
        section: 'Aligarh Jn Platform 3 Bypass',
        time: '01:45 - 05:45',
        duration: '4.0h',
        type: 'Turnout Renewal & TRD Isolation',
        department: 'Multi-Dept (P-Way + TRD)',
        isBundled: true,
        speedRestriction: 'TSR 20 km/h',
        corridorYield: 'Power Block Synced',
      },
    ],
    4: [
      {
        id: 'BLK-DLI-05',
        section: 'Old Delhi - Shahdara Bridge 24',
        time: '01:00 - 05:30',
        duration: '4.5h',
        type: 'Girder Inspection & Track Lifting',
        department: 'Multi-Dept (Bridge + P-Way + S&T)',
        isBundled: true,
        speedRestriction: 'Caution 15 km/h',
        corridorYield: '3 Depts Bundled',
      },
      {
        id: 'BLK-MTC-06',
        section: 'Meerut City DN Line',
        time: '13:00 - 16:00',
        duration: '3.0h',
        type: 'Continuous Welded Rail Destressing',
        department: 'Engineering',
        isBundled: false,
        speedRestriction: 'TSR 30 km/h',
      },
    ],
    5: [
      {
        id: 'BLK-PWL-01',
        section: 'Palwal - Mathura 4th Line',
        time: '02:30 - 06:00',
        duration: '3.5h',
        type: 'Machine Tamping & Signaling Interlock',
        department: 'Multi-Dept (P-Way + S&T)',
        isBundled: true,
        speedRestriction: 'PSR 60 km/h',
        corridorYield: 'Freight Window Utilized',
      },
      {
        id: 'BLK-ASR-02',
        section: 'Amritsar Yard Entry',
        time: '10:00 - 12:30',
        duration: '2.5h',
        type: 'OHE Neutral Section Overhaul',
        department: 'Electrical TRD',
        isBundled: false,
        speedRestriction: 'None',
      },
    ],
    6: [
      {
        id: 'BLK-SRE-01',
        section: 'Saharanpur - Moradabad Sec',
        time: '01:00 - 05:00',
        duration: '4.0h',
        type: 'BCM Screening & Catenary Retension',
        department: 'Multi-Dept (P-Way + TRD)',
        isBundled: true,
        speedRestriction: 'TSR 45 km/h',
        corridorYield: 'Mega Sunday Block',
      },
      {
        id: 'BLK-GZB-07',
        section: 'Ghaziabad EMU Car Shed Lead',
        time: '11:00 - 12:00',
        duration: '1.0h',
        type: 'Track Circuit Drop Test',
        department: 'Signaling',
        isBundled: false,
        speedRestriction: 'Shed internal',
      },
    ],
  };

  return (
    <div className="mt-6 bg-white p-6 shadow-md shadow-black/[0.04] border border-gray-200 rounded-xl">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-gray-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-900" />
            <h2 className="text-base font-bold text-blue-900 tracking-tight">
              Weekly Maintenance Block Schedule
            </h2>
            <span className="bg-blue-50 text-blue-900 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">
              IR-COA Corridor Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Corridor time windows synchronized across Engineering, S&T Signaling, and Electrical TRD.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-gray-200">
            <span className="w-3 h-3 rounded bg-blue-900 inline-block"></span>
            <span className="text-slate-600 font-medium">Standard Block</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-gray-200">
            <span className="w-3 h-3 rounded bg-blue-900 border-l-4 border-amber-500 inline-block"></span>
            <span className="text-slate-800 font-bold flex items-center gap-1">
              Multi-Dept Bundled
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
            </span>
          </div>
        </div>
      </div>

      {/* 7-Day Horizontal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-5">
        {daysOfWeek.map((day, idx) => {
          const isSelected = selectedDay === idx;
          const dayBlocks = blocksData[idx] || [];

          return (
            <div
              key={idx}
              onClick={() => setSelectedDay(idx)}
              className={`rounded-xl p-3 border transition-all cursor-pointer flex flex-col min-h-[220px] ${
                isSelected
                  ? 'bg-slate-50/80 border-blue-900 ring-2 ring-blue-900/10 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200/80">
                <div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider block ${
                      isSelected ? 'text-blue-900' : 'text-slate-500'
                    }`}
                  >
                    {day.name}
                  </span>
                  <span className="text-xs text-slate-800 font-semibold">{day.date}</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200/60">
                  {day.totalHours}
                </span>
              </div>

              {/* Maintenance Block Pills */}
              <div className="space-y-2 flex-1 flex flex-col justify-start">
                {dayBlocks.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[11px] text-slate-400 italic">
                    No block windows
                  </div>
                ) : (
                  dayBlocks.map((block) => (
                    <div
                      key={block.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBlock && onSelectBlock(block);
                      }}
                      className={`text-left p-2 rounded-lg bg-blue-900 text-white shadow-sm transition-all hover:bg-blue-800 group relative ${
                        block.isBundled ? 'border-l-4 border-amber-500 pl-2.5' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-300 mb-0.5">
                        <span className="font-mono text-amber-400 font-semibold">
                          {block.duration}
                        </span>
                        <span>{block.time}</span>
                      </div>
                      <div className="text-[11px] font-semibold leading-snug line-clamp-1 text-white">
                        {block.section}
                      </div>
                      <div className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                        {block.type}
                      </div>

                      {block.isBundled && (
                        <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-amber-300 bg-amber-400/10 px-1 py-0.5 rounded border border-amber-400/20">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>AI Bundled Block</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 3. AI PRIORITY TASK QUEUE COMPONENT
// ==========================================
const AIPriorityTaskQueue = ({ tasks, onTriggerTask }) => {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.defectType.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'CRITICAL') return task.priorityScore >= 90;
    if (filter === 'BUNDLED') return task.isBundled;
    return true;
  });

  return (
    <div className="mt-6 bg-white shadow-md shadow-black/[0.04] border border-gray-200 rounded-xl overflow-hidden">
      {/* Table Top Controls */}
      <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ListOrdered className="w-5 h-5 text-blue-900" />
            <h2 className="text-base font-bold text-blue-900 tracking-tight">
              AI Priority Maintenance Queue
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-gray-200">
              OR-Tools CP-SAT + XGBoost
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Priority score calculated from track geometry, safety risk flags, GMT traffic load, and SLA overdue days.
          </p>
        </div>

        {/* Search & Tabs */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search section or defect..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-9 pr-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 bg-slate-50 w-52 text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="inline-flex rounded-lg border border-gray-200 bg-slate-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-all ${
                filter === 'ALL'
                  ? 'bg-white text-blue-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('CRITICAL')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                filter === 'CRITICAL'
                  ? 'bg-white text-amber-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-600" />
              Score &gt; 90
            </button>
            <button
              onClick={() => setFilter('BUNDLED')}
              className={`px-3 py-1 rounded-md transition-all ${
                filter === 'BUNDLED'
                  ? 'bg-white text-blue-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bundled
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-200 text-slate-600 font-semibold">
              <th className="py-3 px-4 uppercase tracking-wider text-[11px]">Task ID</th>
              <th className="py-3 px-4 uppercase tracking-wider text-[11px]">Asset Location</th>
              <th className="py-3 px-4 uppercase tracking-wider text-[11px]">Defect Type</th>
              <th className="py-3 px-4 uppercase tracking-wider text-[11px]">Department</th>
              <th className="py-3 px-4 uppercase tracking-wider text-[11px] text-center">
                Est. Duration
              </th>
              <th className="py-3 px-4 uppercase tracking-wider text-[11px] text-center">
                Priority Score
              </th>
              <th className="py-3 px-4 uppercase tracking-wider text-[11px] text-right">
                Bundling State
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-400 italic">
                  No maintenance tasks match the current filter.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const isHighPriority = task.priorityScore > 90;
                return (
                  <tr
                    key={task.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isHighPriority ? 'bg-amber-50/70 border-l-4 border-amber-500' : ''
                    }`}
                  >
                    {/* Task ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {task.id}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-800">
                      <div className="font-semibold">{task.location}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{task.chainage}</div>
                    </td>

                    {/* Defect Type */}
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      <div className="flex items-center space-x-1.5">
                        {isHighPriority && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        )}
                        <span>{task.defectType}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">TGI Index: {task.tgi}</span>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          task.dept === 'Engineering'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : task.dept === 'Signaling'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {task.dept}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                      {task.duration}
                    </td>

                    {/* Priority Score (> 90 highlighted) */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center font-bold px-2.5 py-1 rounded-md text-xs ${
                          isHighPriority
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-800 border border-gray-200'
                        }`}
                      >
                        {task.priorityScore.toFixed(1)}
                      </span>
                    </td>

                    {/* Bundling State */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {task.isBundled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-900 bg-blue-100/70 border border-blue-300 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Bundled ({task.bundledWith})
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-medium text-slate-500 bg-slate-100 border border-gray-200 px-2 py-0.5 rounded-full">
                          Stand-alone
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 4. RESOURCE & CREW UTILIZATION COMPONENT
// ==========================================
const ResourceCrewUtilization = ({ craneUtilPct = 78, crewAvailPct = 64 }) => {
  return (
    <div className="mt-6 bg-white shadow-md shadow-black/[0.04] border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-blue-900 tracking-tight flex items-center space-x-2">
            <Truck className="w-5 h-5 text-blue-900" />
            <span>Heavy Machinery & Crew Utilization</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time track machine allocation and gangmen deployment across Delhi & Moradabad Divisions.
          </p>
        </div>
        <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Optimal Deployment Ratio
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress Bar 1: Crane & Heavy Track Machinery */}
        <div className="p-4 rounded-lg bg-slate-50 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-900 text-white rounded">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Crane & Track Machine Utilization</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold text-blue-900">{craneUtilPct}%</span>
              <span className="text-xs text-slate-500">(18 / 23 Active)</span>
            </div>
          </div>

          {/* Clean Dark Drop Shadow Bar */}
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
            <div
              className="bg-blue-900 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${craneUtilPct}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5">
            <span>BCM: 6/8 • CSM Tamping: 8/9 • 140T Crane: 4/6</span>
            <span className="font-semibold text-blue-900">5 Machines in Maintenance Standby</span>
          </div>
        </div>

        {/* Progress Bar 2: Crew & Gangmen Availability */}
        <div className="p-4 rounded-lg bg-slate-50 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-amber-500 text-white rounded">
                <HardHat className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Crew Availability & Deployment</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold text-amber-600">{crewAvailPct}%</span>
              <span className="text-xs text-slate-500">(112 / 175 On-Duty)</span>
            </div>
          </div>

          {/* Clean Progress Bar with Accent */}
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${crewAvailPct}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5">
            <span>P-Way Gangmen: 74 • S&T Techs: 22 • TRD Linesmen: 16</span>
            <span className="font-semibold text-amber-700">3 Quick Response Teams Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. SMART ACTIVITY FEED COMPONENT (Right Sidebar - Top)
// ==========================================
const SmartActivityFeed = ({ activities }) => {
  return (
    <div className="bg-white shadow-md shadow-black/[0.04] border border-gray-200 rounded-xl p-4 h-1/2 flex flex-col overflow-hidden">
      {/* Feed Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-900" />
          <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            Smart AI Activity Feed
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Engine Live</span>
        </div>
      </div>

      {/* Scrollable Timeline */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 mt-3">
        {activities.map((act) => (
          <div key={act.id} className="relative flex items-start space-x-3 text-xs">
            {/* Timeline Icon */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-sm ${
                act.type === 'bundle'
                  ? 'bg-blue-900'
                  : act.type === 'solver'
                  ? 'bg-amber-500'
                  : act.type === 'degrade'
                  ? 'bg-red-700'
                  : 'bg-slate-700'
              }`}
            >
              {act.type === 'bundle' ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              ) : act.type === 'solver' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : act.type === 'degrade' ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Activity className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Timeline Content */}
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 font-medium leading-snug">{act.text}</p>
              <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400">
                <span>{act.time}</span>
                <span>•</span>
                <span className="font-mono text-slate-500">{act.dept}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 6. TMS-INTEGRATED DEFECT FORM COMPONENT (Right Sidebar - Bottom)
// ==========================================
const TMSDefectForm = ({ onSubmitDefect }) => {
  const [assetCategory, setAssetCategory] = useState('Track Geometry');
  const [defectType, setDefectType] = useState('Track Geometry - Twist');
  const [tgiValue, setTgiValue] = useState(62);
  const [location, setLocation] = useState('Delhi - Kanpur Sec (Km 142/8)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defectOptions = {
    'Track Geometry': [
      'Track Geometry - Twist',
      'Track Geometry - Unevenness',
      'Gauge Widening / Spread',
      'Rail Flaw / Weld Defect',
      'Ballast Deficiency / Caking',
    ],
    'Traction Distribution': [
      'Contact Wire Dropper Wear',
      'Insulator Flashover Risk',
      'Catenary Tension Degradation',
      'Neutral Section Stagger Drift',
    ],
    'Signaling & Telecom': [
      'Point Machine Stalling #4B',
      'Track Circuit Glitch (DC/AFTC)',
      'Axle Counter Count Mismatch',
      'Signal Aspect Relay Resistance',
    ],
    'Bridges & Formation': [
      'Bridge Girder Bedplate Displacement',
      'Cess Erosion / Slope Slumping',
      'Ballast Retainer Wall Bulging',
    ],
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setAssetCategory(newCat);
    setDefectType(defectOptions[newCat][0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Calculate realistic priority based on TGI
      const calculatedPriority = Math.min(
        99.4,
        Math.max(45, (100 - tgiValue) * 0.95 + Math.random() * 10)
      );

      const newDefect = {
        category: assetCategory,
        defectType,
        tgi: tgiValue,
        location,
        priority: parseFloat(calculatedPriority.toFixed(1)),
      };

      onSubmitDefect(newDefect);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="bg-white shadow-md shadow-black/[0.04] border border-gray-200 rounded-xl p-4 mt-4 flex-1 flex flex-col justify-between overflow-y-auto">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
          <div>
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-amber-600" />
              <span>TMS Defect Intake</span>
            </h3>
            <p className="text-[11px] text-slate-500">Track Management System live ingestion</p>
          </div>
          <span className="text-[10px] font-mono bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200 font-semibold">
            TMS v4.2
          </span>
        </div>

        <form id="tms-form" onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Asset Category Select */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Asset Category</label>
            <select
              value={assetCategory}
              onChange={handleCategoryChange}
              className="w-full bg-slate-50 border border-gray-300 rounded-lg py-1.5 px-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 font-medium"
            >
              <option value="Track Geometry">Track Geometry (P-Way)</option>
              <option value="Traction Distribution">Traction Distribution (TDMS)</option>
              <option value="Signaling & Telecom">Signaling & Telecom (SMMS)</option>
              <option value="Bridges & Formation">Bridges & Formation</option>
            </select>
          </div>

          {/* Defect Type Select */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Defect Type</label>
            <select
              value={defectType}
              onChange={(e) => setDefectType(e.target.value)}
              className="w-full bg-slate-50 border border-gray-300 rounded-lg py-1.5 px-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 font-medium"
            >
              {defectOptions[assetCategory]?.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Location / Section */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Corridor Section</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-gray-300 rounded-lg py-1.5 px-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 font-medium"
              placeholder="e.g., Delhi-Kanpur Sec (Km 142/8)"
            />
          </div>

          {/* Track Geometry Index (Slider) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Track Geometry Index (TGI)</label>
              <span
                className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                  tgiValue < 60
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : tgiValue < 80
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {tgiValue} / 100 {tgiValue < 60 ? '(Critical)' : tgiValue < 80 ? '(Caution)' : '(Fair)'}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={tgiValue}
              onChange={(e) => setTgiValue(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>20 (Severe Twist)</span>
              <span>60 (Threshold)</span>
              <span>100 (Nominal)</span>
            </div>
          </div>
        </form>
      </div>

      {/* Submit Button */}
      <div className="pt-3 mt-2 border-t border-gray-100">
        <button
          type="submit"
          form="tms-form"
          disabled={isSubmitting}
          className="w-full bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md shadow-black/10 transition-all flex items-center justify-center space-x-2 text-xs cursor-pointer disabled:opacity-75"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Optimizing Corridor Queue...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Send to AI Optimizer</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// MAIN DASHBOARD COMPONENT: S.A.M.A.Y
// ==========================================
export default function SamayDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [backlogCount, setBacklogCount] = useState(142);
  const [criticalAlertsCount, setCriticalAlertsCount] = useState(12);
  const [grantedHours, setGrantedHours] = useState(42.5);
  const [bundlingEfficiency, setBundlingEfficiency] = useState(85.8);

  // Initial Task Queue Data
  const [tasks, setTasks] = useState([
    {
      id: 'TRK-1042',
      location: 'Delhi-Kanpur Sec',
      chainage: 'Km 142/8-12 Up Main',
      defectType: 'Track Geometry - Twist',
      tgi: 54,
      dept: 'Engineering',
      duration: '3.5 Hrs',
      priorityScore: 94.8,
      isBundled: true,
      bundledWith: 'S&T Point 4B',
    },
    {
      id: 'SIG-0881',
      location: 'Ghaziabad - Aligarh',
      chainage: 'Km 48/2 Dn Line',
      defectType: 'Point Machine Stalling',
      tgi: 78,
      dept: 'Signaling',
      duration: '2.0 Hrs',
      priorityScore: 92.7,
      isBundled: true,
      bundledWith: 'P-Way Tamping',
    },
    {
      id: 'TRD-0419',
      location: 'Kanpur - Prayagraj Sec',
      chainage: 'Km 312/4-6 Catenary',
      defectType: 'Contact Wire Dropper Wear',
      tgi: 82,
      dept: 'TRD (Electrical)',
      duration: '4.0 Hrs',
      priorityScore: 88.4,
      isBundled: false,
      bundledWith: null,
    },
    {
      id: 'TRK-1105',
      location: 'Ambala - Saharanpur',
      chainage: 'Km 88/14 Single Line',
      defectType: 'Weld Defect / Flaw Risk',
      tgi: 51,
      dept: 'Engineering',
      duration: '2.5 Hrs',
      priorityScore: 96.2,
      isBundled: true,
      bundledWith: 'TRD Power Block',
    },
    {
      id: 'TRK-0922',
      location: 'Tilak Bridge - Hazrat Nizamuddin',
      chainage: 'Km 4/2 Up Suburban',
      defectType: 'Gauge Widening (> 14mm)',
      tgi: 59,
      dept: 'Engineering',
      duration: '3.0 Hrs',
      priorityScore: 84.1,
      isBundled: false,
      bundledWith: null,
    },
    {
      id: 'SIG-0943',
      location: 'Sonipat - Panipat Sec',
      chainage: 'Km 62/1-3 Up Main',
      defectType: 'Axle Counter Glitch',
      tgi: 85,
      dept: 'Signaling',
      duration: '1.5 Hrs',
      priorityScore: 76.5,
      isBundled: false,
      bundledWith: null,
    },
  ]);

  // Initial Timeline Actions
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: 'bundle',
      text: 'Task #1042 bundled with Signaling (S&T Point Machine #4B at Ghaziabad)',
      time: '2m ago',
      dept: 'OR-Tools Bundler',
    },
    {
      id: 2,
      type: 'solver',
      text: 'AI recalculated queue in 31.4s (OR-Tools CP-SAT: 25 bundled blocks resolved)',
      time: '14m ago',
      dept: 'Google CP-SAT',
    },
    {
      id: 3,
      type: 'degrade',
      text: 'Track Geometry Index degraded on NDLS-CNB Dn (TGI 68.2 -> Priority elevated to 94.2)',
      time: '28m ago',
      dept: 'TMS Monitor',
    },
    {
      id: 4,
      type: 'bundle',
      text: 'Traction Power Block auto-synced with OHE Inspection Car for Sec-04',
      time: '45m ago',
      dept: 'Electrical TRD',
    },
    {
      id: 5,
      type: 'solver',
      text: 'Safety margin verified: 45 min buffer inserted before 12004 Shatabdi Express',
      time: '1h ago',
      dept: 'COA Dispatcher',
    },
  ]);

  // Handle Defect Submission
  const handleDefectSubmit = (newDefect) => {
    const newTaskId = `TMS-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTask = {
      id: newTaskId,
      location: newDefect.location,
      chainage: 'Auto-mapped GPS Km Post',
      defectType: newDefect.defectType,
      tgi: newDefect.tgi,
      dept: newDefect.category.includes('Signaling')
        ? 'Signaling'
        : newDefect.category.includes('Traction')
        ? 'TRD (Electrical)'
        : 'Engineering',
      duration: '3.0 Hrs',
      priorityScore: newDefect.priority,
      isBundled: true,
      bundledWith: 'Corridor Auto-Sync',
    };

    setTasks((prev) => [newTask, ...prev]);
    setBacklogCount((prev) => prev + 1);

    if (newDefect.priority > 90) {
      setCriticalAlertsCount((prev) => prev + 1);
    }

    // Add activity
    setActivities((prev) => [
      {
        id: Date.now(),
        type: 'solver',
        text: `New defect ${newTaskId} (${newDefect.defectType}) ingested. AI recalculated queue in 31.4s.`,
        time: 'Just now',
        dept: 'AI Optimizer',
      },
      ...prev,
    ]);
  };

  return (
    <div className="h-screen w-full overflow-hidden flex bg-slate-50 font-sans text-slate-800 antialiased selection:bg-amber-500 selection:text-white">
      {/* ---------------------------------------------------------------- */}
      {/* LEFT SIDEBAR (Narrow, Royal Blue bg-blue-900)                     */}
      {/* ---------------------------------------------------------------- */}
      <aside className="w-16 md:w-20 bg-blue-900 flex flex-col items-center py-5 justify-between flex-shrink-0 z-20 shadow-xl shadow-black/20 border-r border-blue-950">
        {/* Top: IR Branding / Logo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-800 to-blue-950 border border-amber-400/40 flex items-center justify-center shadow-md shadow-black/20 group cursor-pointer">
            <Train className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
            IR
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col space-y-2 mt-4">
            {[
              { id: 'dashboard', icon: Activity, label: 'Portal' },
              { id: 'calendar', icon: Calendar, label: 'Corridor' },
              { id: 'tasks', icon: ListOrdered, label: 'Queue' },
              { id: 'assets', icon: SlidersHorizontal, label: 'Geometry' },
              { id: 'crew', icon: HardHat, label: 'Crews' },
            ].map((nav) => {
              const Icon = nav.icon;
              const isActive = activeNav === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => setActiveNav(nav.id)}
                  title={nav.label}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                    isActive
                      ? 'bg-blue-800 text-amber-400 shadow-md shadow-black/20'
                      : 'text-blue-200 hover:text-white hover:bg-blue-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <span className="absolute left-0 w-1 h-6 bg-amber-400 rounded-r"></span>
                  )}
                  {/* Tooltip */}
                  <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {nav.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Status */}
        <div className="flex flex-col items-center space-y-3">
          <div
            title="CRIS & TMS Link Connected"
            className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"
          ></div>
          <span className="text-[9px] font-mono text-blue-300 font-bold">CRIS</span>
        </div>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* MAIN CENTER AREA (Scrollable flex-grow)                           */}
      {/* ---------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 px-6 py-5">
        {/* Enterprise Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/80 gap-3">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-blue-900 tracking-tight">
                S.A.M.A.Y
              </h1>
              <span className="h-4 w-px bg-gray-300"></span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Synchronized Asset Management & Allocation Yield
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                Northern Railway • Delhi Division (NR-DLI)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enterprise Corridor Optimization & Bundling Portal • Integrated with TMS, SMMS, TDMS & COA
            </p>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm text-xs">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="font-semibold text-slate-700">AI CP-SAT: Ready</span>
            </div>

            <button
              onClick={() => {
                setBundlingEfficiency(86.4);
                setActivities((prev) => [
                  {
                    id: Date.now(),
                    type: 'solver',
                    text: 'Manual trigger: Google OR-Tools recalculated corridor slots in 30.1s.',
                    time: 'Just now',
                    dept: 'Dispatcher',
                  },
                  ...prev,
                ]);
              }}
              className="bg-blue-900 hover:bg-blue-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-black/10 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Recalculate Schedule</span>
            </button>
          </div>
        </div>

        {/* 1. KPI Ribbon */}
        <section className="mt-5">
          <KPIRibbon
            backlogCount={backlogCount}
            criticalAlertsCount={criticalAlertsCount}
            grantedHours={grantedHours}
            bundlingEfficiency={bundlingEfficiency}
          />
        </section>

        {/* 2. Interactive Weekly Block Calendar */}
        <section>
          <WeeklyBlockCalendar />
        </section>

        {/* 3. AI Priority Task Queue */}
        <section>
          <AIPriorityTaskQueue tasks={tasks} />
        </section>

        {/* 4. Resource & Crew Utilization */}
        <section className="pb-6">
          <ResourceCrewUtilization craneUtilPct={78} crewAvailPct={64} />
        </section>
      </main>

      {/* ---------------------------------------------------------------- */}
      {/* RIGHT SIDEBAR (Fixed width w-96, Activity Feed + Defect Form)     */}
      {/* ---------------------------------------------------------------- */}
      <aside className="w-96 flex-shrink-0 flex flex-col h-full bg-slate-50 border-l border-gray-200 p-4 space-y-4 overflow-hidden">
        {/* 5. Smart Activity Feed (Top Half) */}
        <SmartActivityFeed activities={activities} />

        {/* 6. TMS-Integrated Defect Form (Bottom Half) */}
        <TMSDefectForm onSubmitDefect={handleDefectSubmit} />
      </aside>
    </div>
  );
}

