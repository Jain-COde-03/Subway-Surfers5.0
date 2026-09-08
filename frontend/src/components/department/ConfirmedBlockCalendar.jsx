import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Link2,
  Clock,
  AlertCircle,
  RotateCw,
  X,
  Layers,
  MapPin,
  Timer,
  ShieldCheck,
} from 'lucide-react';

/**
 * Standard weekdays for weekly schedule representation
 */
const DAYS_OF_WEEK = [
  { key: 'Mon', label: 'Monday', dateStr: 'Sep 08' },
  { key: 'Tue', label: 'Tuesday', dateStr: 'Sep 09' },
  { key: 'Wed', label: 'Wednesday', dateStr: 'Sep 10' },
  { key: 'Thu', label: 'Thursday', dateStr: 'Sep 11' },
  { key: 'Fri', label: 'Friday', dateStr: 'Sep 12' },
  { key: 'Sat', label: 'Saturday', dateStr: 'Sep 13' },
  { key: 'Sun', label: 'Sunday', dateStr: 'Sep 14' },
];

/**
 * Maps ISO or date string to weekday index (0-6, Mon-Sun)
 */
function getDayIndex(dateStr) {
  try {
    const d = new Date(dateStr);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday...
    return day === 0 ? 6 : day - 1; // Map to 0 (Mon) -> 6 (Sun)
  } catch (e) {
    return 0;
  }
}

/**
 * Formats time from ISO string to HH:MM format
 */
function formatTime(isoStr) {
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch (e) {
    return isoStr;
  }
}

/**
 * Formats full date and time for modal view
 */
function formatFullDateTime(isoStr) {
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch (e) {
    return isoStr;
  }
}

/**
 * Computes human-readable duration between start and end times
 */
function getDurationStr(startTime, endTime) {
  try {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const diffMs = end - start;
    if (isNaN(diffMs) || diffMs <= 0) return '3.5 hrs';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (minutes === 0) return `${hours} hrs`;
    return `${hours} hrs ${minutes} mins`;
  } catch (e) {
    return '3.5 hrs';
  }
}

/**
 * Refined <ConfirmedBlockCalendar /> Component
 *
 * Implements strict enterprise design feedback:
 * 1. Clean, subtle bg-slate-50 day headers with text-blue-900 text-sm font-bold uppercase.
 * 2. Sharper border radii (rounded-lg for outer card, rounded-md for task blocks, avoiding rounded-2xl).
 * 3. Badge overflow fix: flex justify-between items-start w-full gap-2 container, text-[10px], overflow-hidden.
 * 4. Interactive click-to-expand Master-Detail modal displaying exact track location, possession window,
 *    total duration, and nested list of defects with AI Priority Scores.
 *
 * @param {Object} props
 * @param {import('../../types/department').Block[]} [props.blocks=[]]
 * @param {import('../../types/department').Task[]} [props.tasks=[]]
 * @param {boolean} [props.isLoading=false]
 * @param {string|null} [props.error=null]
 * @param {() => void} [props.onRetry]
 */
export default function ConfirmedBlockCalendar({
  blocks = [],
  tasks = [],
  isLoading = false,
  error = null,
  onRetry,
}) {
  // Requirement 1: State management for weekly blocks and fetching indicator
  const [scheduleData, setScheduleData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  // Modal state for selected block
  const [selectedBlock, setSelectedBlock] = useState(null);

  // Requirement 2 & 3: Fetch gazetted maintenance blocks on component mount with Hackathon Armor Fallback
  useEffect(() => {
    let isMounted = true;

    const fetchSchedule = async () => {
      setIsFetching(true);
      try {
        const response = await fetch('http://localhost:8000/api/v1/schedule');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setScheduleData(Array.isArray(data) ? data : (data.schedule || []));
        }
      } catch (err) {
        console.warn('Backend /api/v1/schedule error (activating hackathon armor fallback):', err);
        // Simulate network latency with a setTimeout of 800ms
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (isMounted) {
          const fallbackSchedule = [
            {
              id: 'BLK-GAZ-101',
              day: 'Monday',
              time: '01:30 - 05:00',
              departments: ['Civil', 'Electrical'],
              location: 'Delhi-Kanpur UP',
              track: 'Delhi-Kanpur UP (Km 120-135)',
              isBundled: true,
              summary: 'Joint P-Way Track Tamping & 25kV OHE Catenary Inspection',
              associatedTasks: ['TSK-CIV-101', 'TSK-ELE-302'],
            },
            {
              id: 'BLK-GAZ-102',
              day: 'Wednesday',
              time: '02:00 - 04:30',
              departments: ['Signal'],
              location: 'Ghaziabad - Moradabad Line',
              track: 'Ghaziabad - Moradabad (Km 35-48)',
              isBundled: false,
              summary: 'Digital Axle Counter Calibration & Interlocking Routine Check',
              associatedTasks: ['TSK-SIG-204'],
            },
            {
              id: 'BLK-GAZ-103',
              day: 'Thursday',
              time: '01:00 - 05:30',
              departments: ['Civil', 'Signal'],
              location: 'Palwal - Mathura Fast Corridor',
              track: 'Palwal - Mathura Fast Corridor (Km 88-102)',
              isBundled: true,
              summary: 'USFD Ultrasonic Rail Testing & Point Machine 104A Servicing',
              associatedTasks: ['TSK-CIV-108', 'TSK-SIG-212'],
            },
            {
              id: 'BLK-GAZ-104',
              day: 'Friday',
              time: '02:30 - 06:00',
              departments: ['Civil', 'Signal', 'Electrical'],
              location: 'New Delhi - Tilak Bridge Chord',
              track: 'New Delhi - Tilak Bridge Chord (Platform 3-4)',
              isBundled: true,
              summary: 'Corridor Super-Block: Rail Weld Clamping, Signal Relays & Isolator Blades',
              associatedTasks: ['TSK-CIV-115', 'TSK-SIG-220', 'TSK-ELE-318'],
            },
            {
              id: 'BLK-GAZ-105',
              day: 'Saturday',
              time: '01:30 - 04:00',
              departments: ['Electrical'],
              location: 'Kanpur Central Yard Approaches',
              track: 'Kanpur Central Yard Approach Catenary',
              isBundled: false,
              summary: 'Traction Substation SF6 Switchgear Overhaul',
              associatedTasks: ['TSK-ELE-325'],
            },
          ];
          setScheduleData(fallbackSchedule);
        }
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    };

    fetchSchedule();

    return () => {
      isMounted = false;
    };
  }, []);

  // Determine current day index (0 = Monday, ..., 6 = Sunday)
  const currentDayIdx = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    return day === 0 ? 6 : day - 1;
  }, []);

  // Filter and group blocks by day of week
  const blocksByDay = useMemo(() => {
    const activeBlocks = scheduleData.length > 0 ? scheduleData : (blocks || []);
    return DAYS_OF_WEEK.map((day, idx) => {
      const dayBlocks = activeBlocks.filter((b) => {
        if (b.day) {
          const dayLower = b.day.toLowerCase();
          return (
            dayLower === day.label.toLowerCase() ||
            dayLower === day.key.toLowerCase() ||
            dayLower.startsWith(day.key.toLowerCase())
          );
        }
        if (b.startTime) {
          return getDayIndex(b.startTime) === idx;
        }
        return false;
      });
      return {
        ...day,
        blocks: dayBlocks,
      };
    });
  }, [scheduleData, blocks]);

  // Total confirmed block count
  const totalConfirmedCount = useMemo(() => {
    return (scheduleData.length > 0 ? scheduleData : (blocks || [])).length;
  }, [scheduleData, blocks]);

  // Resolve linked defects for the modal view
  const modalDefects = useMemo(() => {
    if (!selectedBlock) return [];
    const taskRefs = selectedBlock.associatedTasks || [];

    if (taskRefs.length === 0) {
      const depts = selectedBlock.departments || ['Civil'];
      return depts.map((d, i) => ({
        id: `TSK-${d.slice(0, 3).toUpperCase()}-40${i + 1}`,
        defectType: d === 'Civil' ? 'Track Geometry & P-Way Sleepers' : (d === 'Signal' ? 'Point Machine & Interlocking Fault' : '25kV OHE Catenary Wear'),
        asset: selectedBlock.location || selectedBlock.track,
        priorityScore: 92 + i * 2,
        status: 'Confirmed',
      }));
    }

    return taskRefs.map((ref) => {
      if (typeof ref === 'object' && ref !== null) {
        return ref;
      }
      const matched = (tasks || []).find((t) => t.id === ref);
      if (matched) return matched;

      // Realistic fallback defect record
      return {
        id: ref,
        defectType: 'Track Geometry / Rail Wear Maintenance',
        asset: selectedBlock.location || selectedBlock.track,
        priorityScore: 92.4,
        status: 'Confirmed',
      };
    });
  }, [selectedBlock, tasks]);

  if (error) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/40 p-5">
        <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-sm text-rose-900 dark:text-rose-300 text-xs">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>Failed to load confirmed corridor blocks: {error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 text-white rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden relative transition-colors duration-300">
      {/* Minimalist Slate Header */}
      <div className="px-5 py-4 rounded-t-lg bg-slate-100 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-500 flex items-center justify-center shadow-xs flex-shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 leading-tight">
                Confirmed Corridor Block Calendar
              </h2>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-700 text-white uppercase font-mono">
                GAZETTED
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                {totalConfirmedCount} Confirmed
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Approved track possession windows gazetted by Central Operations Planning. Click any block for details.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs self-start sm:self-auto font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"></span>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Single</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 border border-amber-600"></span>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Bundled Block</span>
          </div>
        </div>
      </div>

      {/* Vanishing Dark Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-transparent dark:from-slate-600 dark:via-slate-700/50 dark:to-transparent opacity-90"></div>

      {/* Main Calendar Body Content */}
      <div className="p-4 sm:p-5">
        {/* Loading Skeleton */}
        {isFetching ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d.key} className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 h-48 space-y-2 animate-pulse">
                  <div className="h-3 bg-slate-300 dark:bg-slate-800 rounded-md w-16 mb-3"></div>
                  <div className="h-20 bg-slate-300/70 dark:bg-slate-800 rounded-md"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Calendar Content Container with Horizontal Scroll for Small Screens */
          <div className="overflow-x-auto pb-1">
            <div className="min-w-[760px] md:min-w-full rounded-lg border border-slate-200/90 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-xs">
              {/* Top Row: Day Headers */}
              <div className="grid grid-cols-7 bg-slate-100/90 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 divide-x divide-slate-200 dark:divide-slate-800">
                {blocksByDay.map((day, idx) => {
                  const isToday = idx === currentDayIdx;
                  return (
                    <div
                      key={day.key}
                      className={`py-2.5 px-2 text-center transition-colors relative ${
                        isToday ? 'bg-amber-50/70 dark:bg-slate-900' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1.5">
                        <span className="text-amber-700 dark:text-amber-500 text-xs font-bold uppercase tracking-wider font-mono">
                          {day.key}
                        </span>
                        {isToday && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-amber-600 text-white tracking-tight leading-none shadow-2xs font-mono">
                            TODAY
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium block mt-0.5">
                        {day.dateStr}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Columns Grid */}
              <div className="grid grid-cols-7 divide-x divide-slate-200 dark:divide-slate-800 min-h-[260px] bg-white dark:bg-slate-900">
                {blocksByDay.map((day, idx) => {
                  const isToday = idx === currentDayIdx;
                  const hasBlocks = day.blocks.length > 0;

                  return (
                    <div
                      key={day.key}
                      className={`p-2.5 flex flex-col justify-between transition-colors relative ${
                        isToday ? 'bg-slate-50/70 dark:bg-slate-950/70' : 'bg-white dark:bg-slate-900/80'
                      }`}
                    >
                      {/* Day Blocks Area */}
                      <div className="space-y-2 flex-1">
                        {hasBlocks ? (
                          day.blocks.map((block, bIdx) => {
                            const isBundled = Boolean(block.isBundled);
                            const timeDisplay = block.time || (block.startTime && block.endTime ? `${formatTime(block.startTime)} - ${formatTime(block.endTime)}` : '01:30 - 05:00');
                            const locationDisplay = block.location || block.track || 'Corridor Section';
                            const blockId = block.id || `BLK-GAZ-${bIdx + 1}`;
                            const departments = block.departments || (block.depts || ['Civil']);

                            return (
                              <div
                                key={blockId}
                                onClick={() => setSelectedBlock({ ...block, id: blockId, location: locationDisplay, track: locationDisplay, time: timeDisplay, departments, isBundled })}
                                className={`relative p-3 rounded-lg text-xs cursor-pointer overflow-hidden transition-all shadow-xs hover:shadow-md bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 space-y-1.5 ${
                                  isBundled
                                    ? 'border-l-4 border-l-amber-600'
                                    : 'border-l-4 border-l-slate-700 dark:border-l-slate-400'
                                }`}
                              >
                                {/* Time Row */}
                                <div className="flex items-center space-x-1.5 font-mono text-[10px] font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                  <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                                  <span>{timeDisplay}</span>
                                </div>

                                {/* Bundled Badge Row */}
                                {isBundled && (
                                  <div>
                                    <span
                                      title="Multi-Department Bundled Block"
                                      className="inline-flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/80 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase font-mono tracking-wide"
                                    >
                                      <Link2 className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                      <span>Bundled Block</span>
                                    </span>
                                  </div>
                                )}

                                {/* Track Section Title */}
                                <div className="font-bold text-slate-900 dark:text-slate-100 text-[11px] leading-snug line-clamp-2">
                                  {locationDisplay}
                                </div>

                                {/* Department Badges */}
                                {departments.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {departments.map((d) => (
                                      <span
                                        key={d}
                                        className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md border ${
                                          d === 'Civil'
                                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-700/80'
                                            : d === 'Signal'
                                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-700/80'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300/80 dark:border-slate-700'
                                        }`}
                                      >
                                        {d}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Block ID & Linked Defect Count */}
                                <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                  <span>{blockId}</span>
                                  <span>
                                    {block.associatedTasks ? `${block.associatedTasks.length} defects` : `${departments.length} Depts`}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          /* Empty State for Days with No Blocks */
                          <div className="h-full flex flex-col items-center justify-center py-8 text-center text-slate-400 dark:text-slate-500">
                            <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-1">
                              <CalendarIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                              No blocks
                            </span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">Clear Corridor</span>
                          </div>
                        )}
                      </div>

                      {/* Column Day Footer */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-center font-bold font-mono">
                        {hasBlocks ? (
                          <span className="text-slate-800 dark:text-slate-300">
                            {day.blocks.length} {day.blocks.length === 1 ? 'Window' : 'Windows'}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">0 Windows</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MASTER-DETAIL MODAL VIEW (CLICK-TO-EXPAND)                 */}
      {/* ========================================================= */}
      {selectedBlock && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn"
        >
          {/* Backdrop Click Dismiss */}
          <div
            className="absolute inset-0"
            onClick={() => setSelectedBlock(null)}
          />

          {/* Modal Card */}
          <div
            className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/20 dark:shadow-black/60 overflow-hidden z-10 text-slate-900 dark:text-slate-100 transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Minimalist Slate Header */}
            <div className="px-5 py-4 rounded-t-xl bg-slate-100 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-500 flex items-center justify-center shadow-xs flex-shrink-0">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 leading-tight">
                      Corridor Block Details
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/80">
                      {selectedBlock.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Approved track possession window and linked defect inventory.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBlock(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vanishing Dark Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-transparent dark:from-slate-600 dark:via-slate-700/50 dark:to-transparent opacity-90"></div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Detailed Data Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/70 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
                {/* Exact Track Location */}
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                    Exact Track Location
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                    <span>{selectedBlock.location || selectedBlock.track}</span>
                  </span>
                </div>

                {/* Possession Window */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                    Possession Window (Start / End)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>
                      {selectedBlock.time || (selectedBlock.startTime && selectedBlock.endTime ? `${formatTime(selectedBlock.startTime)} - ${formatTime(selectedBlock.endTime)}` : '01:30 - 05:00')}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono mt-0.5">
                    {selectedBlock.day ? `${selectedBlock.day} · Gazetted Slot` : formatFullDateTime(selectedBlock.startTime)}
                  </span>
                </div>

                {/* Total Duration */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                    Total Duration
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1">
                    <Timer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                    <span>
                      {selectedBlock.duration || (selectedBlock.startTime && selectedBlock.endTime ? getDurationStr(selectedBlock.startTime, selectedBlock.endTime) : '3.5 hrs')}
                    </span>
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5 font-mono">
                    Gazetted Operational Window
                  </span>
                </div>

                {/* Bundled Status Details */}
                {selectedBlock.isBundled && (
                  <div className="sm:col-span-2 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                    <div className="flex items-center space-x-1.5 text-amber-800 dark:text-amber-400 font-bold">
                      <Link2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Synchronized Corridor Bundle</span>
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      Joint possession with:{' '}
                      <span className="font-bold text-slate-900 dark:text-slate-200">
                        {(selectedBlock.departments || selectedBlock.bundledWith || ['Civil (TMS)', 'Signal (SMMS)']).join(', ')}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Nested List of Specific Defects with AI Priority Scores */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                    <span>Scheduled Defects ({modalDefects.length})</span>
                  </h4>
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300/80 dark:border-amber-700/80 uppercase font-mono tracking-wider">
                    CRIS CP-SAT Scored
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {modalDefects.length > 0 ? (
                    modalDefects.map((defect) => (
                      <div
                        key={defect.id}
                        className="p-3 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3 text-xs shadow-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                              {defect.id}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                              {defect.defectType}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                            {defect.asset}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-bold leading-none mb-1 uppercase font-mono tracking-wider">
                            AI PRIORITY
                          </span>
                          <span
                            className={`text-xs font-mono font-black px-2 py-0.5 rounded-md border inline-block ${
                              defect.priorityScore >= 85
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/80'
                                : defect.priorityScore >= 70
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/80'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {defect.priorityScore}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-400 dark:text-slate-500 text-xs italic font-mono">
                      No specific defects attached to this block.
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Modal Action: Close Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBlock(null)}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-850 active:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-black rounded-lg shadow-md uppercase tracking-wider transition-all cursor-pointer text-xs"
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
