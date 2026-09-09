import React, { useState, useEffect, useCallback } from 'react';
import GoogleCalendarView from '../calendar/GoogleCalendarView';
import { AlertCircle, RotateCw } from 'lucide-react';

/**
 * ConfirmedBlockCalendar Component
 *
 * Fully integrated Google Calendar style corridor block scheduler for Department Engineers.
 * Supports Week, Month, Day, and Agenda views with live backend sync and cancellation.
 */
export default function ConfirmedBlockCalendar({
  blocks = [],
  tasks = [],
  isLoading = false,
  error = null,
  departmentKey = '',
  onRetry,
  onBlockCancelled,
}) {
  const [scheduleData, setScheduleData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch gazetted maintenance blocks from real SQLite backend filtered by department
  const fetchSchedule = useCallback(async () => {
    setIsFetching(true);
    try {
      const url = departmentKey
        ? `/api/v1/schedule?dept=${encodeURIComponent(departmentKey)}`
        : '/api/v1/schedule';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setScheduleData(Array.isArray(data) ? data : data.schedule || []);
    } catch (err) {
      console.warn('Backend /api/v1/schedule fallback:', err);
      if (blocks && blocks.length > 0) {
        setScheduleData(blocks);
      }
    } finally {
      setIsFetching(false);
    }
  }, [departmentKey, blocks]);

  useEffect(() => {
    fetchSchedule();
    const interval = setInterval(() => {
      fetchSchedule();
    }, 5000);
    const handleSync = () => fetchSchedule();
    window.addEventListener('samay_schedule_updated', handleSync);
    window.addEventListener('railway_data_updated', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('samay_schedule_updated', handleSync);
      window.removeEventListener('railway_data_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [fetchSchedule]);

  const handleBlockCancelled = (blockId) => {
    setScheduleData((prev) => prev.filter((b) => b.id !== blockId));
    if (onBlockCancelled) {
      onBlockCancelled(blockId);
    }
  };

  if (error) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl p-5">
        <div className="flex items-center justify-between p-4 bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 dark:border-rose-800/60 rounded-xl text-rose-900 dark:text-rose-300 text-xs font-mono">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>Failed to load corridor schedule: {error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
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
    <GoogleCalendarView
      schedule={scheduleData.length > 0 ? scheduleData : blocks}
      onBlockCancelled={handleBlockCancelled}
      onRefresh={fetchSchedule}
      userRole="department"
      defaultDept={departmentKey || 'all'}
    />
  );
}
