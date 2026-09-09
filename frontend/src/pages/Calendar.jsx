import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  Layers,
  Sparkles,
  RefreshCw,
  RotateCcw,
  Search,
  Plus,
  X,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import Header from '../components/layout/Header';
import CalendarEventDetailsModal from '../components/calendar/CalendarEventDetailsModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getSchedule, getBlocks, matchesDepartment } from '../services/calendar';
import { submitDefect } from '../services/requests';

export default function Calendar() {
  const { currentUser, isAdmin } = useAuth();
  const { success, error, info } = useToast();

  // View state: 'Week' | 'Month' | 'Day' | 'Agenda'
  const [view, setView] = useState('Week');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Date navigation: baseline week starts Monday, Sep 8, 2026
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // 0 to 6 for Day view

  // Department Allocation Scope: 'my_dept' (blocks granted to user's dept) vs 'all' (all corridor blocks)
  const [deptScope, setDeptScope] = useState(isAdmin ? 'all' : 'my_dept');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [trackFilter, setTrackFilter] = useState('All');
  const [durationFilter, setDurationFilter] = useState('All'); // 'All', '<2', '2-4', '>4'
  const [bundleFilter, setBundleFilter] = useState('All'); // 'All', 'Bundled', 'Single'

  // Quick slot creation modal state (like Google Calendar click-to-create)
  const [quickSlotModal, setQuickSlotModal] = useState({
    isOpen: false,
    date: '',
    dayName: '',
    startHour: 10,
  });
  const [slotFormData, setSlotFormData] = useState({
    title: '',
    department: 'Civil',
    section: 'NDLS - GZB · UP Main Line (Km 14-28)',
    duration: 2.5,
    speedDrop: 15,
  });
  const [slotSubmitting, setSlotSubmitting] = useState(false);

  // Dynamic Week Days calculation (Sep 7, 2026 is Monday)
  const baseDate = useMemo(() => {
    const d = new Date(2026, 8, 7); // Sep 7, 2026 is Monday
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const days = useMemo(() => {
    return dayNames.map((name, i) => {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateNum = d.getDate();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(dateNum).padStart(2, '0');
      return {
        name,
        dateNum,
        fullDate: `${yyyy}-${mm}-${dd}`,
        monthName: d.toLocaleString('en-US', { month: 'short' }),
        year: yyyy,
        isToday: weekOffset === 0 && i === 2, // Sep 9, 2026 (Wednesday) as active today
      };
    });
  }, [baseDate, weekOffset]);

  const activeDay = days[selectedDayIndex] || days[0];

  const weekRangeLabel = useMemo(() => {
    return `${days[0].dateNum} ${days[0].monthName} - ${days[6].dateNum} ${days[6].monthName} ${days[6].year}`;
  }, [days]);

  // Dynamic Month calculation (anchored to full calendar month)
  const monthDate = useMemo(() => {
    return new Date(2026, 8 + monthOffset, 1); // Baseline: September 2026
  }, [monthOffset]);

  const currentMonthYearLabel = useMemo(() => {
    return monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [monthDate]);

  const monthWeeks = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    // 1st day of month
    const firstDay = new Date(year, month, 1);
    // 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;

    // Grid starts on Monday on or before the 1st
    const gridStart = new Date(year, month, 1 - firstDayOfWeek);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDays = firstDayOfWeek + daysInMonth;
    const numWeeks = Math.ceil(totalDays / 7);

    const weeks = [];
    for (let w = 0; w < numWeeks; w++) {
      const daysArr = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(gridStart);
        cellDate.setDate(gridStart.getDate() + w * 7 + d);

        const yyyy = cellDate.getFullYear();
        const mm = String(cellDate.getMonth() + 1).padStart(2, '0');
        const dd = String(cellDate.getDate()).padStart(2, '0');

        daysArr.push({
          dateNum: cellDate.getDate(),
          fullDateStr: `${yyyy}-${mm}-${dd}`,
          isCurrentMonth: cellDate.getMonth() === month,
          isToday: yyyy === 2026 && cellDate.getMonth() === 8 && cellDate.getDate() === 9,
          dayIdx: d,
          dateObj: cellDate,
        });
      }
      weeks.push(daysArr);
    }
    return weeks;
  }, [monthDate]);

  // Full 24-hour timeline
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`), []);

  // Fetch calendar events from real backend SQLite database
  const fetchCalendar = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      // Load all confirmed blocks so department users can toggle between their granted blocks and all division corridors
      const data = await getSchedule(null);
      if (Array.isArray(data) && data.length > 0) {
        setEvents(data);
      } else {
        const allBlocks = await getBlocks(null, 'Confirmed');
        if (Array.isArray(allBlocks) && allBlocks.length > 0) {
          setEvents(allBlocks);
        } else {
          setEvents([]);
        }
      }
    } catch (e) {
      console.warn('Calendar schedule fetch error:', e.message);
      setEvents([]);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendar(false);

    // Auto-poll every 4 seconds
    const timer = setInterval(() => {
      fetchCalendar(true);
    }, 4000);

    const handleSync = () => fetchCalendar(false);
    window.addEventListener('railway_data_updated', handleSync);
    window.addEventListener('samay_schedule_updated', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchCalendar(true);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      window.removeEventListener('railway_data_updated', handleSync);
      window.removeEventListener('samay_schedule_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchCalendar]);

  // Compute blocks allocated specifically to the logged-in user's department
  const userDeptKey = currentUser?.deptKey || 'Civil';
  const myDeptBlocks = useMemo(() => {
    return events.filter((ev) => {
      return matchesDepartment(ev.departments, userDeptKey);
    });
  }, [events, userDeptKey]);

  const totalGrantedHours = useMemo(() => {
    return myDeptBlocks.reduce((acc, ev) => acc + parseFloat(ev.duration || ev.duration_hours || 3), 0);
  }, [myDeptBlocks]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const stat = (ev.status || '').toLowerCase();
      if (stat === 'cancelled' || stat === 'rejected') return false;

      // Department scope filter for department engineers
      if (!isAdmin && deptScope === 'my_dept') {
        const matchUserDept = matchesDepartment(ev.departments, userDeptKey);
        if (!matchUserDept) return false;
      }

      // Text search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const bId = (ev.id || ev.bundle_id || '').toLowerCase();
        const trk = (ev.track || ev.location || '').toLowerCase();
        const depts = (ev.departments || []).join(' ').toLowerCase();
        if (!bId.includes(q) && !trk.includes(q) && !depts.includes(q)) {
          return false;
        }
      }

      // Department filter dropdown
      if (deptFilter !== 'All') {
        const match = matchesDepartment(ev.departments, deptFilter);
        if (!match) return false;
      }

      // Track Corridor filter
      if (trackFilter !== 'All') {
        const trk = ev.track || ev.location || '';
        if (!trk.toLowerCase().includes(trackFilter.toLowerCase())) return false;
      }

      // Duration filter
      const dur = parseFloat(ev.duration || ev.duration_hours || 3);
      if (durationFilter === '<2' && dur >= 2) return false;
      if (durationFilter === '2-4' && (dur < 2 || dur > 4)) return false;
      if (durationFilter === '>4' && dur <= 4) return false;

      // Bundle filter
      const isBundled = ev.isBundled || (ev.departments && ev.departments.length > 1);
      if (bundleFilter === 'Bundled' && !isBundled) return false;
      if (bundleFilter === 'Single' && isBundled) return false;

      return true;
    });
  }, [events, searchQuery, deptFilter, trackFilter, durationFilter, bundleFilter, isAdmin, deptScope, userDeptKey]);

  // Quick slot creation handler
  const handleSlotCreate = async (e) => {
    e.preventDefault();
    if (!slotFormData.title.trim()) {
      error('Please enter a maintenance title/defect');
      return;
    }

    setSlotSubmitting(true);
    try {
      await submitDefect({
        department: slotFormData.department,
        defect_type: slotFormData.title,
        asset_type: 'Track Corridor Section',
        asset: `${slotFormData.department} Asset - ${slotFormData.section.split('·')[0].trim()}`,
        section: slotFormData.section,
        target_date: quickSlotModal.date,
        possession_window: parseFloat(slotFormData.duration),
        speed_drop: parseFloat(slotFormData.speedDrop),
      });

      success(`Possession block requested for ${quickSlotModal.date} at ${quickSlotModal.startHour}:00!`);
      setQuickSlotModal({ isOpen: false, date: '', dayName: '', startHour: 10 });
      setSlotFormData({
        title: '',
        department: 'Civil',
        section: 'NDLS - GZB · UP Main Line (Km 14-28)',
        duration: 2.5,
        speedDrop: 15,
      });
      fetchCalendar(false);
    } catch (err) {
      error('Failed to schedule block: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSlotSubmitting(false);
    }
  };

  // Google Calendar continuous vertical coordinate system constants & helpers
  const HOUR_HEIGHT = 64; // 64px per hour, matching Google Calendar density (24 hrs = 1536px)

  const getEventStartHour = (ev) => {
    if (ev.startHour !== undefined && ev.startHour !== null) return parseFloat(ev.startHour);
    if (ev.start_hour !== undefined && ev.start_hour !== null) return parseFloat(ev.start_hour);
    if (ev.startTime && typeof ev.startTime === 'string' && ev.startTime.includes(':')) {
      const parts = ev.startTime.split('T').pop().split(':');
      const h = parseFloat(parts[0]) || 0;
      const m = parseFloat(parts[1]) || 0;
      return h + m / 60;
    }
    return 10.0;
  };

  const getEventDuration = (ev) => {
    if (ev.duration !== undefined && ev.duration !== null) return Math.max(0.5, parseFloat(ev.duration));
    if (ev.duration_hours !== undefined && ev.duration_hours !== null) return Math.max(0.5, parseFloat(ev.duration_hours));
    return 3.0;
  };

  const formatFloatHour = (val) => {
    const normalized = Math.max(0, Math.min(24, val));
    const h = Math.floor(normalized);
    const m = Math.round((normalized - h) * 60);
    const hh = String(h % 24).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  // Google Calendar style interval clustering and column assignment for overlapping events
  const layoutDayEvents = (dayEvents) => {
    if (!dayEvents || dayEvents.length === 0) return [];

    const items = dayEvents.map((ev) => {
      const start = getEventStartHour(ev);
      const dur = getEventDuration(ev);
      const end = start + dur;
      return { ...ev, _start: start, _dur: dur, _end: end };
    }).sort((a, b) => a._start - b._start || b._dur - a._dur);

    const clusters = [];
    let currentCluster = [];
    let clusterEnd = -1;

    for (const item of items) {
      if (currentCluster.length === 0) {
        currentCluster.push(item);
        clusterEnd = item._end;
      } else if (item._start < clusterEnd - 0.01) {
        currentCluster.push(item);
        clusterEnd = Math.max(clusterEnd, item._end);
      } else {
        clusters.push(currentCluster);
        currentCluster = [item];
        clusterEnd = item._end;
      }
    }
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    const laidOutEvents = [];
    for (const cluster of clusters) {
      const columns = [];
      for (const ev of cluster) {
        let placed = false;
        for (let c = 0; c < columns.length; c++) {
          if (ev._start >= columns[c] - 0.01) {
            columns[c] = ev._end;
            ev.colIndex = c;
            placed = true;
            break;
          }
        }
        if (!placed) {
          ev.colIndex = columns.length;
          columns.push(ev._end);
        }
      }
      const totalCols = columns.length;
      for (const ev of cluster) {
        ev.totalCols = totalCols;
        laidOutEvents.push(ev);
      }
    }

    return laidOutEvents;
  };

  // Helper to resolve card color based on departments
  const getEventCardStyle = (depts) => {
    const isElec = matchesDepartment(depts, 'Electrical');
    const isCivil = matchesDepartment(depts, 'Civil');
    const isSig = matchesDepartment(depts, 'Signal');
    const deptCount = (isElec ? 1 : 0) + (isCivil ? 1 : 0) + (isSig ? 1 : 0);

    if (deptCount > 1 || (depts && depts.length > 1)) {
      // Joint Multi-Department Bundled Block
      return {
        bg: 'bg-purple-50/95 dark:bg-purple-950/80 border-purple-200 dark:border-purple-800/80 text-purple-900 dark:text-purple-200 hover:bg-purple-100/90 dark:hover:bg-purple-900/90',
        badge: 'bg-purple-100 dark:bg-purple-900/80 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700',
        borderLeft: 'border-l-purple-600 dark:border-l-purple-400',
      };
    }
    if (isElec) {
      return {
        bg: 'bg-blue-50/95 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 hover:bg-blue-100/90 dark:hover:bg-blue-900/90',
        badge: 'bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
        borderLeft: 'border-l-blue-600 dark:border-l-blue-400',
      };
    }
    if (isCivil) {
      return {
        bg: 'bg-emerald-50/95 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/90',
        badge: 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
        borderLeft: 'border-l-emerald-600 dark:border-l-emerald-400',
      };
    }
    if (isSig) {
      return {
        bg: 'bg-amber-50/95 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 hover:bg-amber-100/90 dark:hover:bg-amber-900/90',
        badge: 'bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
        borderLeft: 'border-l-amber-600 dark:border-l-amber-400',
      };
    }
    return {
      bg: 'bg-slate-50/95 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-200',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
      borderLeft: 'border-l-slate-600 dark:border-l-slate-400',
    };
  };

  return (
    <div className="flex-1 pb-10">
      <Header
        title={isAdmin ? 'Master Corridor Calendar' : 'Department Corridor Calendar'}
        subtitle={isAdmin ? 'Full interactive multi-department possession horizon and gazetted timetables.' : 'Your department maintenance possession slots and joint bundled corridor possessions.'}
      />

      <div className="px-8 space-y-4">
        {/* Department Possession Allocation Banner for Department Engineers */}
        {!isAdmin && (
          <div className="bg-gradient-to-r from-[#0F172A] to-slate-800 text-white p-4 px-5 rounded-xl border border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    Corridor Possession Allocation: {currentUser.department || `${userDeptKey} Engineering`}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {myDeptBlocks.length} Blocks Granted
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {totalGrantedHours.toFixed(1)} Hours Allocated
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Your department is granted track possession for <strong className="text-white font-semibold">{myDeptBlocks.length} maintenance blocks</strong> across Delhi Division corridors.
                </p>
              </div>
            </div>

            {/* Scope Switcher: My Department Blocks vs All Division Corridors */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-lg border border-slate-700/80 text-xs shrink-0">
              <button
                onClick={() => setDeptScope('my_dept')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer font-semibold ${
                  deptScope === 'my_dept'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ★ Blocks Granted to You ({myDeptBlocks.length})
              </button>
              <button
                onClick={() => setDeptScope('all')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer font-medium ${
                  deptScope === 'all'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Corridors ({events.length})
              </button>
            </div>
          </div>
        )}

        {/* Top Control Toolbar (Google Calendar style header) */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-slate-800/90 p-3.5 px-5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-colors">
          {/* Left: View Mode Switcher + Navigation */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-lg text-xs font-medium border border-transparent dark:border-slate-700/50">
              {['Week', 'Month', 'Day', 'Agenda'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    view === v
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 border border-slate-200/80 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50/50 dark:bg-slate-900/40">
                <button
                  onClick={() => {
                    if (view === 'Month') setMonthOffset((prev) => prev - 1);
                    else setWeekOffset((prev) => prev - 1);
                  }}
                  title="Previous"
                  className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (view === 'Month') setMonthOffset((prev) => prev + 1);
                    else setWeekOffset((prev) => prev + 1);
                  }}
                  title="Next"
                  className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {view === 'Month'
                  ? currentMonthYearLabel
                  : view === 'Day'
                  ? `${activeDay.name}, ${activeDay.dateNum} ${activeDay.monthName} ${activeDay.year}`
                  : weekRangeLabel}
              </span>

              {(weekOffset !== 0 || monthOffset !== 0) && (
                <button
                  onClick={() => {
                    setWeekOffset(0);
                    setMonthOffset(0);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Today</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Department Legend & Sync Button */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Search Box */}
            <div className="relative min-w-[180px] max-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blocks, track..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Department Color Legend */}
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">Electrical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">Civil</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">Signal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">Bundled</span>
              </div>
            </div>

            {/* Sync Button */}
            <button
              onClick={() => fetchCalendar(false)}
              disabled={isRefreshing}
              title="Sync schedule with backend"
              className="p-1.5 px-3 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-medium shadow-2xs cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/60 p-2.5 px-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 transition-colors">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Filter className="w-3 h-3" /> Filters:
            </span>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Departments</option>
              <option value="Civil">Civil / Track (TMS)</option>
              <option value="Signal">Signal & Telecom (SMMS)</option>
              <option value="Electrical">Electrical / TRD (TDMS)</option>
            </select>

            {/* Bundled Filter */}
            <select
              value={bundleFilter}
              onChange={(e) => setBundleFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Formats</option>
              <option value="Bundled">Joint Bundled Only</option>
              <option value="Single">Single Department Only</option>
            </select>

            {/* Duration Filter */}
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">Any Duration</option>
              <option value="<2">Short (&lt; 2h)</option>
              <option value="2-4">Standard (2 - 4h)</option>
              <option value=">4">Major (&gt; 4h)</option>
            </select>

            {/* Corridor / Track Filter */}
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Trunk Corridors</option>
              <option value="GZB">NDLS - Ghaziabad</option>
              <option value="PWL">NDLS - Palwal / Mathura</option>
              <option value="CNB">Delhi - Kanpur Main</option>
              <option value="MB">Moradabad - Bareilly</option>
              <option value="MTC">Meerut - Saharanpur</option>
            </select>
          </div>

          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Showing <span className="text-slate-900 dark:text-white font-bold">{filteredEvents.length}</span> possession blocks
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────
            VIEW 1: WEEK VIEW (Google Calendar Standard 7-Day Timegrid)
        ───────────────────────────────────────────────────────────────────────────── */}
        {view === 'Week' && (
          <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs overflow-hidden transition-colors">
            {/* Day Headers Row */}
            <div className="grid grid-cols-8 border-b border-slate-200/80 dark:border-slate-700/80 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-900/80 sticky top-0 z-10">
              <div className="p-3 text-center text-slate-400 dark:text-slate-500 border-r border-slate-200/80 dark:border-slate-700/80 font-semibold text-[11px]">
                GMT+5:30
              </div>
              {days.map((d, idx) => (
                <div
                  key={d.dateNum}
                  onClick={() => {
                    setSelectedDayIndex(idx);
                    setView('Day');
                  }}
                  className={`p-3 text-center border-r border-slate-200/80 dark:border-slate-700/80 last:border-r-0 cursor-pointer transition-colors ${
                    d.isToday ? 'bg-blue-50/50 dark:bg-blue-950/40' : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-normal">{d.name}</span>
                  <span
                    className={`text-sm font-bold mt-0.5 inline-block px-2 py-0.5 rounded-full ${
                      d.isToday ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {d.dateNum}
                  </span>
                </div>
              ))}
            </div>

            {/* Time Rows & Events Grid (Scrollable Continuous Google Calendar Grid) */}
            <div className="max-h-[680px] overflow-y-auto relative">
              <div className="grid grid-cols-8 relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
                {/* Column 1: Time Labels */}
                <div className="border-r border-slate-200/80 dark:border-slate-700/80 bg-slate-50/40 dark:bg-slate-900/60 select-none">
                  {hours.map((timeLabel) => (
                    <div
                      key={timeLabel}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      className="border-b border-slate-100 dark:border-slate-800 p-1.5 text-center text-slate-400 dark:text-slate-500 text-[11px] font-medium flex items-start justify-center"
                    >
                      <span className="-translate-y-2">{timeLabel}</span>
                    </div>
                  ))}
                </div>

                {/* Columns 2-8: 7 Day Columns */}
                {days.map((day, dIdx) => {
                  const dayEvents = filteredEvents.filter((ev) => {
                    const evDay = ev.dayDate || ev.date || ev.window_date || (ev.startTime ? ev.startTime.slice(0, 10) : '');
                    return evDay === day.fullDate || (ev.day && ev.day.toLowerCase().startsWith(day.name.toLowerCase()));
                  });
                  const laidEvents = layoutDayEvents(dayEvents);

                  return (
                    <div
                      key={day.dateNum}
                      className="border-r border-slate-200/80 dark:border-slate-700/80 last:border-r-0 relative group/day"
                      style={{ height: `${24 * HOUR_HEIGHT}px` }}
                    >
                      {/* Background 24 hourly clickable slots */}
                      {hours.map((timeLabel, hIdx) => (
                        <div
                          key={timeLabel}
                          style={{ height: `${HOUR_HEIGHT}px` }}
                          onClick={() => {
                            setQuickSlotModal({
                              isOpen: true,
                              date: day.fullDate,
                              dayName: `${day.name}, ${day.dateNum} ${day.monthName}`,
                              startHour: hIdx,
                            });
                          }}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50/30 dark:hover:bg-blue-950/30 cursor-pointer relative group transition-colors"
                        >
                          <span className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-blue-500/60 pointer-events-none transition-opacity">
                            <Plus className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      ))}

                      {/* Continuous Absolute Event Cards Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        {laidEvents.map((ev, evIdx) => {
                          const depts = ev.departments || ['Civil'];
                          const topPx = Math.max(0, Math.min(24 * HOUR_HEIGHT - 30, ev._start * HOUR_HEIGHT));
                          const heightPx = Math.max(34, Math.min(24 * HOUR_HEIGHT - topPx, ev._dur * HOUR_HEIGHT - 4));
                          const colIdx = ev.colIndex || 0;
                          const totalCols = ev.totalCols || 1;
                          const leftPercent = (colIdx * 100) / totalCols;
                          const widthPercent = 100 / totalCols;

                          const cardStyle = getEventCardStyle(depts);
                          const hasUserDept = !isAdmin && currentUser?.deptKey && matchesDepartment(depts, currentUser.deptKey);

                          const startStr = formatFloatHour(ev._start);
                          const endStr = formatFloatHour(ev._end);

                          return (
                            <div
                              key={ev.id || evIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(ev);
                              }}
                              style={{
                                top: `${topPx}px`,
                                height: `${heightPx}px`,
                                left: `calc(${leftPercent}% + 2px)`,
                                width: `calc(${widthPercent}% - 4px)`,
                              }}
                              className={`absolute p-2 rounded-lg border border-l-4 shadow-2xs cursor-pointer hover:shadow-md hover:z-30 transition-all flex flex-col justify-between overflow-hidden pointer-events-auto ${cardStyle.bg} ${cardStyle.borderLeft} ${
                                hasUserDept ? 'ring-2 ring-emerald-500/80 shadow-xs' : ''
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-[11px] leading-tight truncate">
                                    {ev.id || ev.bundle_id}
                                  </span>
                                  {ev.isBundled ? (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-200/90 dark:bg-purple-900/90 text-purple-900 dark:text-purple-200 shrink-0">
                                      JOINT
                                    </span>
                                  ) : hasUserDept ? (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-200/90 dark:bg-emerald-900/90 text-emerald-900 dark:text-emerald-200 shrink-0">
                                      GRANTED
                                    </span>
                                  ) : null}
                                </div>

                                <div className="text-[10px] font-medium opacity-85 mt-0.5 truncate">
                                  {ev.track || ev.location || 'Northern Corridor'}
                                </div>

                                {/* Department Allocation Pills */}
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {depts.map((d, dIndex) => {
                                    const isUserDept = !isAdmin && currentUser?.deptKey && matchesDepartment(d, currentUser.deptKey);
                                    return (
                                      <span
                                        key={dIndex}
                                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                                          isUserDept
                                            ? 'bg-emerald-200 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-200 border-emerald-400 shadow-2xs'
                                            : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                        }`}
                                      >
                                        {isUserDept ? `★ ${d}` : d}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="text-[10px] font-semibold opacity-95 mt-1 flex items-center justify-between border-t border-black/5 dark:border-white/10 pt-1">
                                <span className="truncate">{startStr} - {endStr}</span>
                                <span className="text-[9px] font-bold opacity-80 shrink-0 ml-1">{ev._dur}h window</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            VIEW 2: MONTH VIEW (Google Calendar Month Grid)
        ───────────────────────────────────────────────────────────────────────────── */}
        {view === 'Month' && (
          <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[760px] w-full">
                {/* Month Day Name Header */}
                <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-900/40">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((dn) => (
                    <div key={dn} className="p-3 text-center border-r border-slate-200/80 dark:border-slate-700/80 last:border-r-0">
                      {dn}
                    </div>
                  ))}
                </div>

                {/* Month Weeks (Dynamic Full-Month Grid) */}
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {monthWeeks.map((week, wIdx) => (
                    <div key={wIdx} className="grid grid-cols-7 min-h-[115px]">
                      {week.map((cell) => {
                        // Events matching this date
                        const cellEvents = filteredEvents.filter((ev) => {
                          const evDay = ev.dayDate || ev.date || ev.window_date || (ev.startTime ? ev.startTime.slice(0, 10) : '');
                          if (evDay === cell.fullDateStr) return true;
                          if (ev.day && !evDay && cell.isCurrentMonth) {
                            const dayShort = dayNames[cell.dayIdx];
                            return ev.day.toLowerCase().startsWith(dayShort.toLowerCase());
                          }
                          return false;
                        });

                        return (
                          <div
                            key={cell.fullDateStr}
                            onClick={() => {
                              // Select day and switch to day view
                              const refD = new Date(2026, 8, 8);
                              const diffDays = Math.round((cell.dateObj - refD) / (1000 * 60 * 60 * 24));
                              const wOff = Math.floor(diffDays / 7);
                              setWeekOffset(wOff);
                              setSelectedDayIndex(cell.dayIdx);
                            }}
                            className={`p-2 border-r border-slate-100 dark:border-slate-700/60 last:border-r-0 flex flex-col justify-between transition-colors ${
                              !cell.isCurrentMonth
                                ? 'bg-slate-50/40 dark:bg-slate-900/30 text-slate-400 dark:text-slate-500'
                                : 'bg-white dark:bg-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-700/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                                  cell.isToday
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : cell.isCurrentMonth
                                    ? 'text-slate-700 dark:text-slate-200'
                                    : 'text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                {cell.dateNum}
                              </span>
                              {cellEvents.length > 0 && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                                  {cellEvents.length} {cellEvents.length === 1 ? 'block' : 'blocks'}
                                </span>
                              )}
                            </div>

                            {/* Event Chips */}
                            <div className="space-y-1 mt-1.5 flex-1">
                              {cellEvents.slice(0, 2).map((ev, eIdx) => {
                                const depts = ev.departments || ['Civil'];
                                const cardStyle = getEventCardStyle(depts);
                                const isUserDept = !isAdmin && currentUser?.deptKey && matchesDepartment(depts, currentUser.deptKey);
                                return (
                                  <div
                                    key={eIdx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEvent(ev);
                                    }}
                                    className={`p-1 px-1.5 rounded text-[10px] font-semibold truncate border border-l-2 cursor-pointer shadow-2xs ${cardStyle.bg} ${cardStyle.borderLeft} ${
                                      isUserDept ? 'ring-1 ring-emerald-500/80' : ''
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-1 truncate">
                                      <span className="truncate">{ev.id || ev.bundle_id}</span>
                                      <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-black/5 dark:bg-white/10 dark:text-slate-200 shrink-0">
                                        {isUserDept ? `★ ${currentUser.deptKey}` : depts.join('+')}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                              {cellEvents.length > 2 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const refD = new Date(2026, 8, 7);
                                    const diffDays = Math.round((cell.dateObj - refD) / (1000 * 60 * 60 * 24));
                                    const wOff = Math.floor(diffDays / 7);
                                    setWeekOffset(wOff);
                                    setSelectedDayIndex(cell.dayIdx);
                                    setView('Day');
                                  }}
                                  className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline block"
                                >
                                  +{cellEvents.length - 2} more
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            VIEW 3: DAY VIEW (Focused Single-Day Timegrid)
        ───────────────────────────────────────────────────────────────────────────── */}
        {view === 'Day' && (
          <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs overflow-hidden">
            {/* Day Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/70 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold">
                  <span className="text-[10px] font-normal leading-tight">{activeDay.name}</span>
                  <span className="text-base leading-tight">{activeDay.dateNum}</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {activeDay.name}, {activeDay.dateNum} {activeDay.monthName} {activeDay.year}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Detailed possession horizon for Northern Railway Delhi Division trunk corridors.
                  </p>
                </div>
              </div>

              {/* Day switcher pills */}
              <div className="flex items-center gap-1">
                {days.map((d, dIdx) => (
                  <button
                    key={d.dateNum}
                    onClick={() => setSelectedDayIndex(dIdx)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      selectedDayIndex === dIdx
                        ? 'bg-[#0F172A] dark:bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {d.name} {d.dateNum}
                  </button>
                ))}
              </div>
            </div>

            {/* 24-Hour Continuous Timeline */}
            <div className="max-h-[680px] overflow-y-auto relative">
              <div className="flex relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
                {/* Left: Hour Time Labels Column */}
                <div className="w-20 border-r border-slate-200/80 dark:border-slate-700/80 bg-slate-50/40 dark:bg-slate-900/40 select-none shrink-0">
                  {hours.map((timeLabel) => (
                    <div
                      key={timeLabel}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      className="border-b border-slate-100 dark:border-slate-700/60 p-2 text-center text-slate-400 dark:text-slate-400 text-xs font-semibold flex items-start justify-center"
                    >
                      <span className="-translate-y-2">{timeLabel}</span>
                    </div>
                  ))}
                </div>

                {/* Right: Day Slots Background + Absolute Event Cards */}
                <div className="flex-1 relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
                  {/* Background 24 hourly clickable slots */}
                  {hours.map((timeLabel, hIdx) => (
                    <div
                      key={timeLabel}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      onClick={() => {
                        setQuickSlotModal({
                          isOpen: true,
                          date: activeDay.fullDate,
                          dayName: `${activeDay.name}, ${activeDay.dateNum} ${activeDay.monthName}`,
                          startHour: hIdx,
                        });
                      }}
                      className="border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 flex items-center px-4 text-slate-400 dark:text-slate-500 text-xs cursor-pointer group transition-colors"
                    >
                      <span className="opacity-0 group-hover:opacity-100 text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 transition-opacity">
                        <Plus className="w-3.5 h-3.5" /> Propose Corridor Slot at {timeLabel}
                      </span>
                    </div>
                  ))}

                  {/* Absolute Event Overlays for Day View */}
                  {(() => {
                    const dayEvents = filteredEvents.filter((ev) => {
                      const evDay = ev.dayDate || ev.date || ev.window_date || (ev.startTime ? ev.startTime.slice(0, 10) : '');
                      return evDay === activeDay.fullDate || (ev.day && ev.day.toLowerCase().startsWith(activeDay.name.toLowerCase()));
                    });
                    const laidEvents = layoutDayEvents(dayEvents);

                    return (
                      <div className="absolute inset-0 pointer-events-none">
                        {laidEvents.map((ev, eIdx) => {
                          const depts = ev.departments || ['Civil'];
                          const topPx = Math.max(0, Math.min(24 * HOUR_HEIGHT - 40, ev._start * HOUR_HEIGHT));
                          const heightPx = Math.max(48, Math.min(24 * HOUR_HEIGHT - topPx, ev._dur * HOUR_HEIGHT - 6));
                          const colIdx = ev.colIndex || 0;
                          const totalCols = ev.totalCols || 1;
                          const leftPercent = (colIdx * 100) / totalCols;
                          const widthPercent = 100 / totalCols;

                          const cardStyle = getEventCardStyle(depts);
                          const startStr = formatFloatHour(ev._start);
                          const endStr = formatFloatHour(ev._end);

                          return (
                            <div
                              key={ev.id || eIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(ev);
                              }}
                              style={{
                                top: `${topPx + 2}px`,
                                height: `${heightPx}px`,
                                left: `calc(${leftPercent}% + 8px)`,
                                width: `calc(${widthPercent}% - 16px)`,
                              }}
                              className={`absolute p-3 rounded-xl border border-l-4 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between overflow-hidden pointer-events-auto ${cardStyle.bg} ${cardStyle.borderLeft}`}
                            >
                              <div className="space-y-1.5 min-w-0">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                                      {ev.id || ev.bundle_id}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">Granted to:</span>
                                    {depts.map((d, dIdx) => {
                                      const isCurUserDept = !isAdmin && currentUser?.deptKey && matchesDepartment(d, currentUser.deptKey);
                                      return (
                                        <span
                                          key={dIdx}
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                            isCurUserDept
                                              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border-emerald-400 ring-1 ring-emerald-400'
                                              : matchesDepartment(d, 'Electrical')
                                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700'
                                              : matchesDepartment(d, 'Signal')
                                              ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700'
                                              : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700'
                                          }`}
                                        >
                                          {isCurUserDept ? `★ ${d} (Your Dept)` : d}
                                        </span>
                                      );
                                    })}
                                    {ev.isBundled && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-200 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-700">
                                        JOINT BUNDLE ({ev.tasksMerged || 3} Tasks)
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEvent(ev);
                                    }}
                                    className="py-1 px-2.5 rounded-md bg-white/90 dark:bg-slate-700/90 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 shadow-2xs transition-colors shrink-0"
                                  >
                                    Inspect Slot
                                  </button>
                                </div>

                                <div className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{ev.track || ev.location || 'Northern Trunk Corridor'}</span>
                                  <span className="text-slate-300 dark:text-slate-600">•</span>
                                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{startStr} - {endStr} ({ev._dur} Hours)</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            VIEW 4: AGENDA VIEW (Chronological List View)
        ───────────────────────────────────────────────────────────────────────────── */}
        {view === 'Agenda' && (
          <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/70 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Possession Block Agenda Horizon</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {filteredEvents.length} Scheduled Blocks
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredEvents.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No maintenance possession blocks found matching the active filters.
                </div>
              ) : (
                filteredEvents.map((ev, idx) => {
                  const depts = ev.departments || ['Civil'];
                  const dur = parseFloat(ev.duration || ev.duration_hours || 3);
                  const cardStyle = getEventCardStyle(depts);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedEvent(ev)}
                      className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center font-bold shrink-0">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            {ev.day ? ev.day.slice(0, 3) : 'Mon'}
                          </span>
                          <span className="text-sm text-slate-900 dark:text-white leading-none">
                            {ev.date ? ev.date.slice(8, 10) : '08'}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {ev.id || ev.bundle_id}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">Granted to:</span>
                            {depts.map((d, dIdx) => {
                              const isUserDept = !isAdmin && currentUser?.deptKey && d.toLowerCase().includes(currentUser.deptKey.toLowerCase());
                              return (
                                <span
                                  key={dIdx}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    isUserDept
                                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 border-emerald-400 ring-1 ring-emerald-400'
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
                            {ev.isBundled && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                                Joint Bundled ({depts.join(' + ')})
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {ev.track || ev.location || 'Northern Trunk Section'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-200">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {ev.time || '10:00 - 13:00'} ({dur}h)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {ev.status || 'Confirmed'}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Schedule Possession Slot Modal (Google Calendar Click-on-Slot experience) */}
      {quickSlotModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Propose Maintenance Slot</h3>
              </div>
              <button
                onClick={() => setQuickSlotModal({ isOpen: false, date: '', dayName: '', startHour: 10 })}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSlotCreate} className="p-5 space-y-4">
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
                <span className="font-bold">{quickSlotModal.dayName}</span>
                <span className="font-semibold bg-white/80 dark:bg-slate-800 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-700">
                  Starts at {quickSlotModal.startHour}:00
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Defect Title / Maintenance Activity *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OHE Cantilever Insulator Overhaul or USFD Weld Test"
                  value={slotFormData.title}
                  onChange={(e) => setSlotFormData({ ...slotFormData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={slotFormData.department}
                    onChange={(e) => setSlotFormData({ ...slotFormData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Civil">Civil / Track (TMS)</option>
                    <option value="Signal">Signal & Telecom (SMMS)</option>
                    <option value="Electrical">Electrical / TRD (TDMS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Hours)</label>
                  <select
                    value={slotFormData.duration}
                    onChange={(e) => setSlotFormData({ ...slotFormData, duration: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={1.5}>1.5 Hours</option>
                    <option value={2.0}>2.0 Hours</option>
                    <option value={2.5}>2.5 Hours</option>
                    <option value={3.0}>3.0 Hours</option>
                    <option value={4.0}>4.0 Hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Corridor Section</label>
                <select
                  value={slotFormData.section}
                  onChange={(e) => setSlotFormData({ ...slotFormData, section: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="NDLS - GZB · UP Main Line (Km 14-28)">NDLS - GZB · UP Main Line (Km 14-28)</option>
                  <option value="NDLS - PWL · 3rd Line (Km 20-45)">NDLS - PWL · 3rd Line (Km 20-45)</option>
                  <option value="NDLS - CNB · UP Main Line (Km 120-155)">NDLS - CNB · UP Main Line (Km 120-155)</option>
                  <option value="MB - BE · Moradabad - Bareilly (Km 40-68)">MB - BE · Moradabad - Bareilly (Km 40-68)</option>
                  <option value="MTC - SRE · Meerut - Saharanpur (Km 75-110)">MTC - SRE · Meerut - Saharanpur (Km 75-110)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setQuickSlotModal({ isOpen: false, date: '', dayName: '', startHour: 10 })}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={slotSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#0F172A] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  {slotSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Propose Slot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      <CalendarEventDetailsModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        onEventUpdated={(id, stat) => {
          setEvents((prev) =>
            prev.filter((e) => e.id !== id && e.bundle_id !== id)
          );
          fetchCalendar(true);
        }}
      />
    </div>
  );
}
