import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import Header from '../components/layout/Header';
import BlockDetailsModal from '../components/planner/BlockDetailsModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { optimizeSchedule, getBlocks, approveBlock, commitAllProposals } from '../services/planner';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Planner() {
  const { currentUser, isAdmin } = useAuth();
  const { success, error, info } = useToast();
  const userDeptKey = currentUser?.deptKey || 'Civil';

  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);

  // Search, Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('priority'); // 'priority', 'utilization', 'tasksMerged', 'duration'

  const [activeMetrics, setActiveMetrics] = useState({
    tasksConsidered: 147,
    tasksScheduled: 132,
    bundledBlocks: 25,
    conflictsResolved: 31,
    utilization: 85.88,
  });

  const loadBlocks = async () => {
    try {
      const data = await getBlocks(null, 'all');
      if (Array.isArray(data) && data.length > 0) {
        setProposals(data);
        setActiveMetrics((prev) => ({
          ...prev,
          bundledBlocks: data.filter((b) => b.isBundled || (b.departments && b.departments.length > 1)).length || 25,
        }));
      } else {
        const opt = await optimizeSchedule();
        if (Array.isArray(opt) && opt.length > 0) {
          setProposals(opt);
        }
      }
    } catch (e) {
      console.warn('Fallback planner blocks loaded');
    }
  };

  useEffect(() => {
    loadBlocks();

    const handleSync = () => loadBlocks();
    window.addEventListener('railway_data_updated', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      window.removeEventListener('railway_data_updated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const handleGeneratePlan = async () => {
    setLoading(true);
    info('Running ML prioritization and constraint optimization...');
    try {
      const optProposals = await optimizeSchedule();
      setProposals(optProposals || []);
      success('Weekly Corridor Plan synthesized by CP-SAT Solver!');
    } catch (err) {
      error('Optimization solver encountered an error');
    } finally {
      setLoading(false);
    }
  };

  const handleCommitAll = async () => {
    try {
      await commitAllProposals(proposals);
      success('All approved blocks committed to Gazette Timetable!');
      loadBlocks();
    } catch (err) {
      error('Failed to commit timetable');
    }
  };

  // Filtered and Sorted proposals
  const filteredBlocks = useMemo(() => {
    let list = proposals.filter((b) => {
      const q = searchQuery.toLowerCase();
      const bId = (b.id || b.bundle_id || '').toLowerCase();
      const trk = (b.track || b.section_id || '').toLowerCase();
      const depts = (b.departments || b.depts || []).join(' ').toLowerCase();

      if (q && !bId.includes(q) && !trk.includes(q) && !depts.includes(q)) {
        return false;
      }

      if (deptFilter !== 'All') {
        const dList = (b.departments || b.depts || []).map((d) => d.toLowerCase());
        if (deptFilter === 'Bundled') {
          if (dList.length <= 1) return false;
        } else if (deptFilter === 'MyDept') {
          if (!dList.some((d) => d.includes(userDeptKey.toLowerCase()))) return false;
        } else {
          if (!dList.some((d) => d.includes(deptFilter.toLowerCase()))) return false;
        }
      }

      if (statusFilter !== 'All') {
        const stat = (b.status || 'Pending Review').toLowerCase();
        if (statusFilter === 'Confirmed' && !stat.includes('confirm') && !stat.includes('approved')) return false;
        if (statusFilter === 'Pending' && (stat.includes('confirm') || stat.includes('approved'))) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'priority') {
        return (parseFloat(b.priorityScore) || 90) - (parseFloat(a.priorityScore) || 90);
      }
      if (sortBy === 'utilization') {
        return (parseFloat(b.utilization) || 90) - (parseFloat(a.utilization) || 90);
      }
      if (sortBy === 'tasksMerged') {
        const aCount = a.tasksMerged || (a.constituentTasks ? a.constituentTasks.length : 2);
        const bCount = b.tasksMerged || (b.constituentTasks ? b.constituentTasks.length : 2);
        return bCount - aCount;
      }
      if (sortBy === 'duration') {
        return (parseFloat(b.duration_hours) || 3) - (parseFloat(a.duration_hours) || 3);
      }
      return 0;
    });

    return list;
  }, [proposals, searchQuery, deptFilter, statusFilter, sortBy]);

  const donutData = [
    { name: 'Scheduled', value: activeMetrics.tasksScheduled, color: '#3B82F6' },
    { name: 'Unscheduled', value: Math.max(0, activeMetrics.tasksConsidered - activeMetrics.tasksScheduled), color: '#E2E8F0' },
  ];

  return (
    <div className="flex-1 pb-10">
      <Header
        title="Weekly Corridor Planner"
        subtitle="Generate, filter, and review CP-SAT optimized maintenance plans for the week."
      />

      <div className="px-8 space-y-6">
        {/* Top Actions & Metrics Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* 4 Metrics Banner matching UI reference */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-white dark:bg-slate-800/90 p-4 px-6 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs flex-1">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Tasks Considered</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">
                {activeMetrics.tasksConsidered}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Tasks Scheduled</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {activeMetrics.tasksScheduled}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Bundled Blocks</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">
                {activeMetrics.bundledBlocks}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Conflicts Resolved</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
                {activeMetrics.conflictsResolved}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCommitAll}
              className="py-2.5 px-4 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Commit Timetable</span>
            </button>

            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="py-2.5 px-4 rounded-lg bg-[#0F172A] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>{loading ? 'Solving CP-SAT...' : 'Generate Plan'}</span>
            </button>
          </div>
        </div>

        {/* Loading Banner */}
        {loading && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-3 animate-pulse">
            <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
            <span className="font-semibold">
              Running ML prioritization and constraint optimization...
            </span>
          </div>
        )}

        {/* Search, Filter & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800/90 p-3.5 px-5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">
              <Filter className="w-3 h-3 text-slate-400" /> Filters:
            </span>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search corridor or block..."
                className="pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 font-medium"
              />
            </div>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Departments</option>
              {!isAdmin && (
                <option value="MyDept">★ Granted to My Dept ({userDeptKey})</option>
              )}
              <option value="Bundled">Joint Multi-Dept Bundles</option>
              <option value="Civil">Civil / Track (TMS)</option>
              <option value="Signal">Signal & Telecom (SMMS)</option>
              <option value="Electrical">Electrical / TRD (TDMS)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed / Gazetted</option>
              <option value="Pending">Pending Review (Proposed)</option>
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="priority">AI Priority Score</option>
                <option value="utilization">Slot Utilization %</option>
                <option value="tasksMerged">Tasks Merged Count</option>
                <option value="duration">Corridor Duration</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Showing <span className="text-slate-900 dark:text-white font-bold">{filteredBlocks.length}</span> of {proposals.length} proposals
          </div>
        </div>

        {/* Two-Column Section: Left Optimized Blocks, Right Utilization Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Optimized Blocks list */}
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Optimized Corridor Proposals</h2>

            <div className="space-y-3.5">
              {filteredBlocks.length === 0 ? (
                <div className="bg-white dark:bg-slate-800/90 rounded-xl p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs text-center space-y-3">
                  <Cpu className="w-8 h-8 text-blue-500 mx-auto" />
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">No Proposals Found</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Adjust your filter criteria or click "Generate Plan" above to trigger Google OR-Tools CP-SAT corridor optimizer.
                  </p>
                </div>
              ) : (
                filteredBlocks.map((b) => {
                  const bId = b.id || b.bundle_id;
                  const depts = b.departments || b.depts || ['Electrical', 'Civil'];
                  const util = Math.round(b.utilization || (b.priorityScore ? Math.min(96, b.priorityScore * 0.95) : 90));
                  const tMerged = b.tasksMerged || (b.constituentTasks ? b.constituentTasks.length : 2);

                  const timeStr = b.startTime
                    ? `${b.startTime.slice(11, 16)} - ${b.endTime ? b.endTime.slice(11, 16) : '14:00'}`
                    : '10:00 - 14:00';

                  return (
                    <div
                      key={bId}
                      className="bg-white dark:bg-slate-800/90 rounded-xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{bId}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {b.track || b.section_id || 'Track A'} • {timeStr}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {b.status || 'Proposed'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">Granted to:</span>
                          {depts.map((d, dIdx) => {
                            const isUserDept = !isAdmin && currentUser?.deptKey && d.toLowerCase().includes(currentUser.deptKey.toLowerCase());
                            return (
                              <span
                                key={dIdx}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  isUserDept
                                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border-emerald-400 ring-1 ring-emerald-400'
                                    : d.toLowerCase().includes('elect')
                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700'
                                    : d.toLowerCase().includes('sig')
                                    ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700'
                                    : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700'
                                }`}
                              >
                                {isUserDept ? `★ ${d} (Your Dept)` : d}
                              </span>
                            );
                          })}

                          {b.isBundled && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                              Joint Multi-Dept Bundle
                            </span>
                          )}

                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-slate-500 dark:text-slate-400 font-normal">
                            {tMerged} tasks merged
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                          {util}% utilization
                        </span>

                        <button
                          onClick={() => setSelectedBlock(b)}
                          className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Block Utilization Circular Gauge matching UI reference */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-800/90 rounded-xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Block Utilization</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average efficiency across scheduled corridors</p>
            </div>

            <div className="h-56 relative flex items-center justify-center my-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">
                  {activeMetrics.utilization}%
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">Efficiency</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Total Corridor Capacity</span>
                <span className="font-semibold text-slate-900 dark:text-white">42.5 hrs</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Allocated Possession</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">36.5 hrs</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Free Freight Capacity</span>
                <span className="font-semibold text-slate-500 dark:text-slate-400">6.0 hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Block Details Modal */}
      <BlockDetailsModal
        block={selectedBlock}
        isOpen={Boolean(selectedBlock)}
        onClose={() => setSelectedBlock(null)}
        onBlockUpdated={(id, stat) => {
          setProposals((prev) =>
            prev.map((b) => (b.id === id || b.bundle_id === id ? { ...b, status: stat } : b))
          );
        }}
      />
    </div>
  );
}
