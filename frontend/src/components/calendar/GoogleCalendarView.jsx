import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Layers,
  Activity,
  Zap,
  Shield,
  Search,
  Filter,
  X,
  AlertTriangle,
  CheckCircle2,
  Download,
  Link2,
  Trash2,
  Maximize2,
  Sparkles,
  Info,
  CalendarCheck,
  ListFilter,
  Eye,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { matchesDepartment } from '../../services/calendar';

// Department styling & metadata
const DEPT_THEMES = {
  civil: {
    label: 'Civil (TMS)',
    short: 'Civil',
    icon: Layers,
    border: 'border-l-4 border-l-emerald-600 border-emerald-300/80 dark:border-emerald-600/80',
    bg: 'bg-gradient-to-br from-emerald-50/95 via-white to-emerald-100/40 dark:from-slate-800/95 dark:via-slate-900 dark:to-emerald-950/40',
    text: 'text-slate-900 dark:text-slate-100',
    chip: 'bg-emerald-600 text-white font-bold',
    dot: 'bg-emerald-500',
    color: '#059669',
  },
  signal: {
    label: 'Signal (SMMS)',
    short: 'Signal',
    icon: Activity,
    border: 'border-l-4 border-l-amber-600 border-amber-300/80 dark:border-amber-600/80',
    bg: 'bg-gradient-to-br from-amber-50/95 via-white to-amber-100/40 dark:from-slate-800/95 dark:via-slate-900 dark:to-amber-950/40',
    text: 'text-slate-900 dark:text-slate-100',
    chip: 'bg-amber-600 text-white font-bold',
    dot: 'bg-amber-500',
    color: '#d97706',
  },
  electrical: {
    label: 'Electrical (TDMS)',
    short: 'Electrical',
    icon: Zap,
    border: 'border-l-4 border-l-indigo-600 border-indigo-300/80 dark:border-indigo-600/80',
    bg: 'bg-gradient-to-br from-indigo-50/95 via-white to-indigo-100/40 dark:from-slate-800/95 dark:via-slate-900 dark:to-indigo-950/40',
    text: 'text-slate-900 dark:text-slate-100',
    chip: 'bg-indigo-600 text-white font-bold',
    dot: 'bg-indigo-500',
    color: '#4f46e5',
  },
  bundled: {
    label: 'Joint Bundled Block',
    short: 'Bundled',
    icon: Link2,
    border: 'border-l-4 border-l-amber-500 border-amber-300/80 dark:border-amber-600/80',
    bg: 'bg-gradient-to-br from-amber-50/95 via-white to-amber-100/40 dark:from-slate-800/95 dark:via-slate-900 dark:to-amber-950/40',
    text: 'text-slate-900 dark:text-slate-100',
    chip: 'bg-amber-600 text-white font-bold',
    dot: 'bg-amber-500',
    color: '#d97706',
  },
};

function getDeptTheme(block) {
  if (block.isBundled || (block.departments && block.departments.length > 1) || (block.depts && block.depts.length > 1)) {
    return DEPT_THEMES.bundled;
  }
  const depts = block.departments || block.depts || [block.primaryDept || ''];
  if (matchesDepartment(depts, 'Civil')) return DEPT_THEMES.civil;
  if (matchesDepartment(depts, 'Signal')) return DEPT_THEMES.signal;
  if (matchesDepartment(depts, 'Electrical')) return DEPT_THEMES.electrical;
  return DEPT_THEMES.civil;
}

// 24 Hour Slots for Week & Day Views (00:00 to 23:00)
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display} ${ampm}`;
}

function parseHourFloat(timeStr, dateStr, startHourVal) {
  if (startHourVal !== undefined && startHourVal !== null && !isNaN(startHourVal)) {
    return parseFloat(startHourVal);
  }
  if (timeStr && typeof timeStr === 'string' && timeStr.includes(':')) {
    const startPart = timeStr.split('-')[0].trim();
    const [hh, mm] = startPart.split(':').map((v) => parseInt(v, 10) || 0);
    return hh + mm / 60;
  }
  if (dateStr && dateStr.includes('T')) {
    const dt = new Date(dateStr);
    if (!isNaN(dt.getTime())) {
      return dt.getHours() + dt.getMinutes() / 60;
    }
  }
  return 2.0;
}

function parseDurationFloat(timeStr, blockDur) {
  if (blockDur !== undefined && blockDur !== null && !isNaN(blockDur)) return parseFloat(blockDur);
  if (!timeStr || !timeStr.includes('-')) return 3.0;
  const parts = timeStr.split('-').map((p) => p.trim());
  const [h1, m1] = parts[0].split(':').map((v) => parseInt(v, 10) || 0);
  const [h2, m2] = parts[1].split(':').map((v) => parseInt(v, 10) || 0);
  let dur = (h2 + m2 / 60) - (h1 + m1 / 60);
  if (dur < 0) dur += 24;
  return Math.max(0.5, dur);
}

/**
 * Calculates collision-free multi-column layout for overlapping calendar events within a single day.
 * Implements interval graph graph-coloring algorithm to distribute overlapping events
 * side-by-side (like Google Calendar) with proportional widths and left offsets.
 */
function layoutDayEvents(events) {
  if (!events || events.length === 0) return [];

  // 1. Prepare events with calculated start and duration
  const parsed = events.map((ev, idx) => {
    const start = parseHourFloat(ev.time, ev.startTime, ev.startHour ?? ev.start_hour);
    const duration = parseDurationFloat(ev.time, ev.duration_hours ?? ev.duration ?? ev.window_hrs);
    const end = start + duration;
    return {
      raw: ev,
      id: ev.id || `ev-${idx}`,
      start,
      duration,
      end,
      colIndex: 0,
      totalCols: 1,
      leftPercent: 0,
      widthPercent: 100,
    };
  });

  // 2. Sort by start time ascending, then by duration descending
  parsed.sort((a, b) => a.start - b.start || b.duration - a.duration);

  // 3. Assign columns greedily using interval availability
  const columns = [];
  for (const ev of parsed) {
    let placed = false;
    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      const lastInCol = col[col.length - 1];
      if (lastInCol.end <= ev.start + 0.01) {
        col.push(ev);
        ev.colIndex = c;
        placed = true;
        break;
      }
    }
    if (!placed) {
      ev.colIndex = columns.length;
      columns.push([ev]);
    }
  }

  // 4. Group into overlapping clusters to determine totalCols for each cluster
  const clusters = [];
  let currentCluster = [];
  let clusterEnd = -1;

  for (const ev of parsed) {
    if (currentCluster.length === 0 || ev.start < clusterEnd) {
      currentCluster.push(ev);
      clusterEnd = Math.max(clusterEnd, ev.end);
    } else {
      clusters.push(currentCluster);
      currentCluster = [ev];
      clusterEnd = ev.end;
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // 5. Compute leftPercent and widthPercent for each event in each cluster
  for (const cluster of clusters) {
    const maxCol = Math.max(...cluster.map((e) => e.colIndex));
    const totalCols = maxCol + 1;
    for (const ev of cluster) {
      ev.totalCols = totalCols;
      ev.leftPercent = (ev.colIndex * 100) / totalCols;
      ev.widthPercent = 100 / totalCols;
    }
  }

  return parsed;
}

// Generates an iCalendar (.ics) file string and downloads it
function downloadIcsFile(event) {
  const dtStart = (event.startTime || '2026-09-08T01:30:00').replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dtEnd = (event.endTime || '2026-09-08T05:00:00').replace(/[-:]/g, '').split('.')[0] + 'Z';
  const summary = `IR Corridor Block: ${event.id} - ${event.location || event.track || 'Northern Railway'}`;
  const description = `${event.summary || 'Gazetted Corridor Block'}\\nDepartments: ${(event.departments || event.depts || ['Civil']).join(', ')}\\nPriority Score: ${event.priorityScore || 'N/A'}`;
  const location = event.location || event.track || 'Indian Railways';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Indian Railways//SAMAY CP-SAT Optimizer//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id || 'BLK-001'}@samay.railways.gov.in`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.id || 'corridor-block'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function GoogleCalendarView({
  schedule = [],
  onSelectBlock,
  onBlockCancelled,
  onRefresh,
  userRole = 'admin',
  defaultDept = 'all',
}) {
  // View State: 'week' | 'month' | 'day' | 'agenda'
  const [viewMode, setViewMode] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date('2026-09-08T00:00:00'));
  const [selectedDept, setSelectedDept] = useState(defaultDept);
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectModalBlock, setInspectModalBlock] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [nowDate, setNowDate] = useState(new Date());
  const timeGridRef = useRef(null);

  // Live real-time clock update (every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const nowHourFloat = nowDate.getHours() + nowDate.getMinutes() / 60 + nowDate.getSeconds() / 3600;
  const nowTimeFormatted = nowDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const realTodayStr = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}-${String(nowDate.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (defaultDept && defaultDept !== 'all') {
      setSelectedDept(defaultDept);
    }
  }, [defaultDept]);

  // Auto scroll to maintenance hours (01:00 AM) in Week and Day views on initial render
  useEffect(() => {
    if (timeGridRef.current) {
      // 1 hour = 60px; scroll to 1 AM (~60px)
      timeGridRef.current.scrollTop = 50;
    }
  }, [viewMode]);

  // Listen for real-time schedule update events across dashboards
  useEffect(() => {
    if (!onRefresh) return;
    const handleScheduleEvent = () => {
      onRefresh();
    };
    window.addEventListener('samay_schedule_updated', handleScheduleEvent);
    window.addEventListener('railway_data_updated', handleScheduleEvent);
    window.addEventListener('storage', handleScheduleEvent);
    window.addEventListener('focus', handleScheduleEvent);
    return () => {
      window.removeEventListener('samay_schedule_updated', handleScheduleEvent);
      window.removeEventListener('railway_data_updated', handleScheduleEvent);
      window.removeEventListener('storage', handleScheduleEvent);
      window.removeEventListener('focus', handleScheduleEvent);
    };
  }, [onRefresh]);

  // Compute Week Days based on currentDate (Monday to Sunday)
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay(); // 0 is Sun, 1 is Mon...
    const diff = (day === 0 ? -6 : 1) - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);

    const days = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const shortNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const isToday =
        dateStr === realTodayStr ||
        (d.getFullYear() === 2026 && d.getMonth() === nowDate.getMonth() && d.getDate() === nowDate.getDate()) ||
        (d.getDay() === nowDate.getDay());

      days.push({
        name: dayNames[i],
        shortName: shortNames[i],
        date: d,
        dateNumber: d.getDate(),
        dateStr: dateStr,
        isToday: isToday,
      });
    }
    return days;
  }, [currentDate, realTodayStr, nowDate]);

  // Month days matrix (35 or 42 cells)
  const monthMatrix = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7; // 0=Mon
    const daysInMonth = lastDayOfMonth.getDate();

    const cells = [];
    // Previous month padding
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      cells.push({
        date: d,
        dateNumber: d.getDate(),
        dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      cells.push({
        date: d,
        dateNumber: i,
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        isCurrentMonth: true,
        isToday: i === 8 && month === 8 && year === 2026,
      });
    }
    // Next month padding to fill grid
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      cells.push({
        date: d,
        dateNumber: i,
        dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }
    return cells;
  }, [currentDate]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return schedule.filter((block) => {
      // Dept filter
      if (selectedDept !== 'all') {
        const depts = block.departments || block.depts || [block.primaryDept || ''];
        const match = matchesDepartment(depts, selectedDept);
        if (!match) return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const str = `${block.id} ${block.location || ''} ${block.track || ''} ${block.summary || ''} ${(block.departments || []).join(' ')}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [schedule, selectedDept, searchQuery]);

  // Navigate Date
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else if (viewMode === 'day') d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else if (viewMode === 'day') d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-09-08T00:00:00'));
  };

  // Header Title
  const headerDateTitle = useMemo(() => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    if (viewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (viewMode === 'week') {
      const first = weekDays[0];
      const last = weekDays[6];
      return `${first.date.getDate()} ${monthNames[first.date.getMonth()].slice(0, 3)} – ${last.date.getDate()} ${monthNames[last.date.getMonth()].slice(0, 3)} ${last.date.getFullYear()}`;
    }
    if (viewMode === 'day') {
      return `${currentDate.getDate()} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()} (${weekDays.find((w) => w.date.getDate() === currentDate.getDate())?.name || 'Day'})`;
    }
    return 'Master Maintenance Schedule';
  }, [viewMode, currentDate, weekDays]);

  // Handle Block Inspection Click
  const handleEventClick = (block, e) => {
    if (e) e.stopPropagation();
    setInspectModalBlock(block);
    if (onSelectBlock) onSelectBlock(block);
  };

  // Handle Block Cancellation
  const handleCancelBlock = async (blockId) => {
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/v1/blocks/${encodeURIComponent(blockId)}/cancel`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (res.ok) {
        setInspectModalBlock(null);
        if (onBlockCancelled) {
          onBlockCancelled(blockId);
        }
      } else {
        alert('Failed to cancel block. Please try again.');
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      alert('Network error while cancelling block.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/40 overflow-hidden flex flex-col transition-colors duration-300">
      {/* ── GOOGLE CALENDAR TOP APP BAR ────────────────────────────────────── */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-slate-100/60 dark:from-amber-500/15 dark:via-slate-900/90 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: Logo & Navigation */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-xs shrink-0">
            <CalendarIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                {headerDateTitle}
              </h2>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                {filteredEvents.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
              Central Operations Synchronized Possession Schedule
            </p>
          </div>

          <div className="flex items-center space-x-1 pl-2 border-l border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 shadow-xs transition-all cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handlePrev}
              title="Previous"
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent hover:border-slate-300/60 dark:hover:border-slate-700 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              title="Next"
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent hover:border-slate-300/60 dark:hover:border-slate-700 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Search & Filter */}
        <div className="flex items-center space-x-2 flex-1 max-w-md min-w-[220px]">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search corridor, section, defect..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-amber-500 font-sans shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: View Mode Segmented Controls */}
        <div className="flex items-center space-x-2">
          {/* Department Filter Dropdown / Pills */}
          <div className="flex items-center bg-white/90 dark:bg-slate-900/90 rounded-xl p-1 border border-slate-300/80 dark:border-slate-700 shadow-xs">
            {['all', 'civil', 'signal', 'elect'].map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg capitalize transition-all cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {dept === 'all' ? 'All' : dept === 'elect' ? 'TRD' : dept === 'civil' ? 'TMS' : 'SMMS'}
              </button>
            ))}
          </div>

          {/* View Selector (Week, Month, Day, Agenda) */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-300/80 dark:border-slate-700 shadow-xs">
            {[
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' },
              { id: 'day', label: 'Day' },
              { id: 'agenda', label: 'Agenda' },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setViewMode(v.id)}
                className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === v.id
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              title="Refresh Schedule"
              className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── GOOGLE CALENDAR BODY VIEWS ──────────────────────────────────────── */}
      <div className="flex-1 min-h-[580px] flex flex-col overflow-hidden bg-white dark:bg-slate-900">
        {filteredEvents.length === 0 && (
          <div className="px-4 py-2 bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between font-mono flex-shrink-0">
            <span className="flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>No confirmed corridor possession blocks scheduled for this view horizon.</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
              Run CP-SAT Optimizer or Load Demo Data to populate schedule
            </span>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 1: WEEK VIEW (Google Calendar Hourly Columns)                 */}
        {/* =================================================================== */}
        {viewMode === 'week' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col overflow-x-auto min-w-0">
              <div className="min-w-[700px] flex-1 flex flex-col">
                {/* Week Header Row (7 Days + Time Axis Space) */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950 font-sans sticky top-0 z-20">
                  {/* Time Column Placeholder */}
                  <div className="w-16 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 p-2 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-wider">
                    GMT+5:30
                  </div>

                  {/* 7 Day Columns Header */}
                  <div className="flex-1 grid grid-cols-7 divide-x divide-slate-200 dark:divide-slate-800">
                    {weekDays.map((day) => (
                      <div
                        key={day.dateStr}
                        className={`py-2.5 px-1.5 text-center transition-colors ${
                          day.isToday ? 'bg-amber-500/10 dark:bg-amber-500/15 ring-1 ring-inset ring-amber-500/20' : ''
                        }`}
                      >
                        <div className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {day.shortName}
                        </div>
                        <div className="mt-0.5 inline-flex items-center justify-center">
                          <span
                            className={`w-7 h-7 rounded-full text-xs font-mono font-black flex items-center justify-center ${
                              day.isToday
                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {day.dateNumber}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scrollable Hourly Time Grid Body */}
                <div
                  ref={timeGridRef}
                  className="flex-1 overflow-y-auto relative divide-y divide-slate-100 dark:divide-slate-800/60"
                  style={{ maxHeight: '580px' }}
                >
                  <div className="flex relative min-h-[1440px]">
                {/* Left Time Axis (00:00 to 23:00) - each hour 60px height */}
                <div className="w-16 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 select-none bg-slate-50/40 dark:bg-slate-950/40">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="h-[60px] border-b border-slate-100 dark:border-slate-800/50 pr-2 pt-1 text-right text-[10px] font-mono text-slate-400 dark:text-slate-500 font-semibold"
                    >
                      {formatHour(hour)}
                    </div>
                  ))}
                </div>

                {/* 7 Days Grid Columns */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-slate-200 dark:divide-slate-800 relative">
                  {/* Background Hour Lines */}
                  {weekDays.map((day, dayIdx) => {
                    // Filter blocks for this day
                    const dayBlocks = filteredEvents.filter((b) => {
                      const bDate = b.date || b.window_date || (b.startTime ? b.startTime.slice(0, 10) : '');
                      if (bDate && bDate === day.dateStr) return true;
                      if (b.day && b.day.toLowerCase().startsWith(day.name.toLowerCase().slice(0, 3))) return true;
                      if (b.startTime && b.startTime.startsWith(day.dateStr)) return true;
                      return false;
                    });

                    return (
                      <div
                        key={day.dateStr}
                        className={`relative h-[1440px] transition-colors ${
                          day.isToday ? 'bg-amber-500/[0.02]' : ''
                        }`}
                      >
                        {/* Hour background slot borders */}
                        {HOURS.map((h) => (
                          <div
                            key={h}
                            className="h-[60px] border-b border-slate-100 dark:border-slate-800/40"
                          />
                        ))}

                        {/* Current Time Indicator Line for Today (Live Real-Time Clock) */}
                        {day.isToday && (
                          <div
                            className="absolute left-0 right-0 border-t-2 border-rose-500 dark:border-rose-400 z-30 flex items-center pointer-events-none"
                            style={{ top: `${nowHourFloat * 60}px` }}
                          >
                            <div className="w-2.5 h-2.5 -ml-1 rounded-full bg-rose-500 dark:bg-rose-400 shadow-sm animate-pulse"></div>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500 dark:bg-rose-600 text-white ml-1 shadow-sm uppercase tracking-wider">
                              {nowTimeFormatted} NOW
                            </span>
                          </div>
                        )}

                        {/* Google Calendar Event Chips Placed Collision-Free with layoutDayEvents */}
                        {layoutDayEvents(dayBlocks).map(({ raw: block, start: startHour, duration, leftPercent, widthPercent }) => {
                          const topPx = startHour * 60;
                          const heightPx = Math.max(45, duration * 60 - 4);
                          const theme = getDeptTheme(block);
                          const isBundled = block.isBundled || (block.departments && block.departments.length > 1);

                          return (
                            <div
                              key={block.id}
                              onClick={(e) => handleEventClick(block, e)}
                              style={{
                                top: `${topPx}px`,
                                height: `${heightPx}px`,
                                left: `calc(${leftPercent}% + 2px)`,
                                width: `calc(${widthPercent}% - 4px)`,
                              }}
                              className={`absolute rounded-xl p-2 text-xs shadow-sm hover:shadow-xl transition-all cursor-pointer z-20 overflow-hidden flex flex-col justify-between border ${theme.border} ${theme.bg} ${theme.text} hover:scale-[1.015] hover:z-30 backdrop-blur-xs`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-mono text-[10px] font-extrabold flex items-center gap-1 opacity-90 truncate">
                                    <Clock className="w-2.5 h-2.5 shrink-0" />
                                    {block.time || `${formatHour(Math.floor(startHour))}`}
                                  </span>

                                  {isBundled && (
                                    <span className="px-1.5 py-0.2 rounded-full text-[8px] font-mono font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs shrink-0 flex items-center gap-0.5">
                                      <Link2 className="w-2 h-2" />
                                      BUNDLED
                                    </span>
                                  )}
                                </div>

                                <div className="font-bold text-[11px] leading-tight line-clamp-2 tracking-tight">
                                  {block.track || block.location || 'Corridor Maintenance'}
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-current/10 text-[9px] font-mono">
                                <span className="font-extrabold truncate opacity-90">{block.id}</span>
                                <span className="opacity-90 shrink-0 font-extrabold px-1 py-0.2 rounded bg-black/5 dark:bg-white/10">{duration}h</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

        {/* =================================================================== */}
        {/* VIEW 2: MONTH VIEW (Google Calendar 7x5 Matrix)                    */}
        {/* =================================================================== */}
        {viewMode === 'month' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Weekday Names Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950 text-center font-mono font-bold text-xs py-2.5 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Matrix Cells */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 divide-x divide-y divide-slate-200 dark:divide-slate-800 overflow-y-auto">
              {monthMatrix.map((cell) => {
                const cellBlocks = filteredEvents.filter((b) => {
                  const bDate = b.date || b.window_date || (b.startTime ? b.startTime.slice(0, 10) : '');
                  if (bDate && bDate === cell.dateStr) return true;
                  if (b.startTime && b.startTime.startsWith(cell.dateStr)) return true;
                  // Match day of week for repeating prototype blocks
                  const cellDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][cell.date.getDay()];
                  return b.day && b.day.toLowerCase().startsWith(cellDayName.toLowerCase().slice(0, 3));
                });

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => {
                      setCurrentDate(cell.date);
                      setViewMode('day');
                    }}
                    className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/40 cursor-pointer ${
                      !cell.isCurrentMonth
                        ? 'bg-slate-50/50 dark:bg-slate-950/60 opacity-40'
                        : cell.isToday
                        ? 'bg-amber-500/[0.04]'
                        : 'bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-mono font-extrabold flex items-center justify-center ${
                          cell.isToday
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cell.dateNumber}
                      </span>

                      {cellBlocks.length > 0 && (
                        <span className="text-[9px] font-mono font-bold text-slate-400">
                          {cellBlocks.length} blocks
                        </span>
                      )}
                    </div>

                    {/* Compact Event Pills */}
                    <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[80px]">
                      {cellBlocks.slice(0, 3).map((block) => {
                        const theme = getDeptTheme(block);
                        return (
                          <div
                            key={block.id}
                            onClick={(e) => handleEventClick(block, e)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold truncate border ${theme.border} ${theme.bg} ${theme.text} hover:opacity-95 flex items-center space-x-1.5 shadow-2xs transition-transform hover:scale-[1.01]`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} shrink-0`} />
                            <span className="font-mono font-bold">{block.time?.split('-')[0]?.trim() || '02:00'}</span>
                            <span className="truncate">{block.track || block.location}</span>
                          </div>
                        );
                      })}
                      {cellBlocks.length > 3 && (
                        <div className="text-[9px] font-mono font-bold text-slate-500 pl-1">
                          +{cellBlocks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 3: DAY VIEW (Single Day Detailed Timeline)                    */}
        {/* =================================================================== */}
        {viewMode === 'day' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-100/80 via-slate-50 to-amber-500/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
                  Timeline for {headerDateTitle}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                Hourly Possession Grid
              </span>
            </div>

            <div
              ref={timeGridRef}
              className="flex-1 overflow-y-auto relative"
              style={{ maxHeight: '600px' }}
            >
              <div className="relative min-h-[1440px] flex">
                {/* Time Axis */}
                <div className="w-20 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40">
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="h-[60px] border-b border-slate-100 dark:border-slate-800/50 pr-3 pt-1 text-right text-xs font-mono text-slate-400 font-semibold"
                    >
                      {formatHour(h)}
                    </div>
                  ))}
                </div>

                {/* Day Canvas */}
                <div className="flex-1 relative">
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="h-[60px] border-b border-slate-100 dark:border-slate-800/40"
                    />
                  ))}

                  {/* Current Time Indicator Line in Day View (Live Real-Time Clock) */}
                  {(() => {
                    const dayActiveStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                    const isViewingToday =
                      dayActiveStr === realTodayStr ||
                      (currentDate.getFullYear() === 2026 && currentDate.getMonth() === nowDate.getMonth() && currentDate.getDate() === nowDate.getDate()) ||
                      (currentDate.getDay() === nowDate.getDay());

                    if (!isViewingToday) return null;
                    return (
                      <div
                        className="absolute left-0 right-0 border-t-2 border-rose-500 dark:border-rose-400 z-30 flex items-center pointer-events-none"
                        style={{ top: `${nowHourFloat * 60}px` }}
                      >
                        <div className="w-2.5 h-2.5 -ml-1 rounded-full bg-rose-500 dark:bg-rose-400 shadow-sm animate-pulse"></div>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500 dark:bg-rose-600 text-white ml-1 shadow-sm uppercase tracking-wider">
                          {nowTimeFormatted} NOW
                        </span>
                      </div>
                    );
                  })()}

                  {/* Day Events positioned collision-free with layoutDayEvents */}
                  {(() => {
                    const dayActiveStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()];
                    const currentDayEvents = filteredEvents.filter((b) => {
                      const bDate = b.date || b.window_date || (b.startTime ? b.startTime.slice(0, 10) : '');
                      if (bDate && bDate === dayActiveStr) return true;
                      if (b.day && b.day.toLowerCase().startsWith(dayName.toLowerCase().slice(0, 3))) return true;
                      if (b.startTime && b.startTime.startsWith(dayActiveStr)) return true;
                      return false;
                    });
                    const dayEventList = currentDayEvents.length > 0 ? currentDayEvents : filteredEvents;

                    return layoutDayEvents(dayEventList).map(({ raw: block, start: startHour, duration, leftPercent, widthPercent }) => {
                      const topPx = startHour * 60;
                      const heightPx = Math.max(55, duration * 60 - 6);
                      const theme = getDeptTheme(block);

                      return (
                        <div
                          key={block.id}
                          onClick={(e) => handleEventClick(block, e)}
                          style={{
                            top: `${topPx}px`,
                            height: `${heightPx}px`,
                            left: `calc(${leftPercent}% + 8px)`,
                            width: `calc(${widthPercent}% - 16px)`,
                          }}
                          className={`absolute rounded-2xl p-3.5 text-xs shadow-md hover:shadow-2xl transition-all cursor-pointer z-20 border ${theme.border} ${theme.bg} ${theme.text} flex flex-col justify-between hover:z-30 backdrop-blur-xs`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-black">
                                  {block.time || `${formatHour(startHour)}`}
                                </span>
                                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                  {block.id}
                                </span>
                                {block.isBundled && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                                    <Link2 className="w-2.5 h-2.5" />
                                    BUNDLED POSSESSION
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
                                {block.track || block.location}
                              </h4>
                              <p className="text-xs opacity-90 line-clamp-2">
                                {block.summary || 'Scheduled Corridor Block'}
                              </p>
                            </div>

                            <div className="text-right font-mono shrink-0">
                              <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Duration: {duration} hrs</div>
                              <div className="text-[11px] opacity-80 font-bold">Score: {block.priorityScore || 95}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10 text-xs font-mono">
                            <div className="flex items-center space-x-1.5">
                              <span className="opacity-80">Depts:</span>
                              {(block.departments || block.depts || ['Civil']).map((d) => (
                                <span key={d} className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 font-bold">
                                  {d}
                                </span>
                              ))}
                            </div>
                            <span className="text-amber-600 dark:text-amber-400 font-bold hover:underline">Click to inspect →</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 4: AGENDA VIEW (Chronological List)                           */}
        {/* =================================================================== */}
        {viewMode === 'agenda' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[600px]">
            {filteredEvents.length === 0 ? (
              <div className="py-16 text-center text-slate-500 font-mono">
                <CalendarIcon className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                No gazetted corridor blocks matching search criteria.
              </div>
            ) : (
              filteredEvents.map((block) => {
                const theme = getDeptTheme(block);
                return (
                  <div
                    key={block.id}
                    onClick={() => handleEventClick(block)}
                    className={`p-4 rounded-2xl border ${theme.border} ${theme.bg} ${theme.text} shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xs`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                          {block.id}
                        </span>
                        <span className="font-mono text-xs font-extrabold flex items-center gap-1 bg-white/70 dark:bg-slate-900/70 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {block.day || 'Monday'} · {block.time || '02:00 - 05:00'}
                        </span>
                        {block.isBundled && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                            <Link2 className="w-2.5 h-2.5" />
                            BUNDLED MULTI-DEPT
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                        {block.track || block.location}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">
                        {block.summary || 'Scheduled Corridor Possession'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-800">
                      <div className="text-left sm:text-right font-mono text-xs">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {block.duration_hours || 3.5} Hours
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Score: {block.priorityScore || 95}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700 text-xs font-mono font-bold hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs cursor-pointer flex items-center space-x-1.5 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-500" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── GOOGLE CALENDAR EVENT INSPECTION & TELEMETRY MODAL ────────────── */}
      {inspectModalBlock && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInspectModalBlock(null)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 text-white flex items-center justify-between border-b border-amber-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
                  <CalendarCheck className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {inspectModalBlock.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                      CONFIRMED GAZETTE
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold leading-tight mt-0.5 text-white">
                    {inspectModalBlock.track || inspectModalBlock.location}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectModalBlock(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto font-sans">
              {/* Timing & Duration Grid */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 text-center font-mono">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Day & Date</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {inspectModalBlock.day || 'Monday'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Possession Window</div>
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {inspectModalBlock.time || '01:30 - 05:00'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {inspectModalBlock.duration_hours || 3.5} Hours
                  </div>
                </div>
              </div>

              {/* Maintenance Summary */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase font-mono">
                  Possession Objective & Scope
                </label>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono">
                  {inspectModalBlock.summary || 'Joint cross-departmental corridor maintenance window synchronized by OR-Tools CP-SAT scheduler.'}
                </p>
              </div>

              {/* Departments Collaborating */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase font-mono">
                  Bundled Departments
                </label>
                <div className="flex flex-wrap gap-2">
                  {(inspectModalBlock.departments || inspectModalBlock.depts || ['Civil']).map((dept) => (
                    <div
                      key={dept}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center space-x-1.5 text-slate-800 dark:text-slate-200"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-500" />
                      <span>{dept} Department</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Associated Tasks / Defects */}
              {inspectModalBlock.associatedTasks && inspectModalBlock.associatedTasks.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase font-mono">
                    Linked Defect Task IDs ({inspectModalBlock.associatedTasks.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectModalBlock.associatedTasks.map((tId) => (
                      <span
                        key={tId}
                        className="px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-mono font-bold"
                      >
                        {tId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono">
              <button
                type="button"
                onClick={() => downloadIcsFile(inspectModalBlock)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs flex items-center space-x-2 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5 text-amber-500" />
                <span>Export to Calendar (.ics)</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => handleCancelBlock(inspectModalBlock.id)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isCancelling ? 'Cancelling...' : 'Cancel Block'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectModalBlock(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

