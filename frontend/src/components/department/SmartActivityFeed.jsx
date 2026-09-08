import React from 'react';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertCircle,
  RotateCw,
  Clock,
  Radio,
} from 'lucide-react';

/**
 * Type-specific styling per Industrial Command specification:
 * - Approvals = emerald-700
 * - Rejections = rose-800
 * - Scheduling notices = amber-600
 */
const FEED_STYLES = {
  approval: {
    icon: CheckCircle2,
    badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80',
    label: 'Approved',
  },
  rejection: {
    icon: XCircle,
    badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/80',
    label: 'Rejected',
  },
  schedule: {
    icon: Calendar,
    badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/80',
    label: 'Scheduled',
  },
};

/**
 * Component 5: SmartActivityFeed
 * Sidebar feed for real-time notifications with Industrial Command styling.
 * Built to accept notifications from periodic polling or a future WebSocket stream.
 *
 * @param {Object} props
 * @param {import('../../types/department').Notification[]} [props.notifications=[]]
 * @param {boolean} [props.isLoading=false]
 * @param {string|null} [props.error=null]
 * @param {() => void} [props.onRetry]
 * @param {boolean} [props.isPolling=true] - Visual live polling indicator
 */
export default function SmartActivityFeed({
  notifications = [],
  isLoading = false,
  error = null,
  onRetry,
  isPolling = true,
}) {
  if (error) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden transition-colors duration-300">
        <div className="px-5 py-4 rounded-t-lg bg-slate-100 dark:bg-slate-800/40 flex items-center space-x-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
            ACTIVITY FEED · LOG ERROR
          </h3>
        </div>
        {/* Vanishing Dark Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-transparent dark:from-slate-600 dark:via-slate-700/50 dark:to-transparent opacity-90"></div>
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>Feed stream unavailable: {error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-md text-xs font-semibold cursor-pointer border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden flex flex-col h-full transition-colors duration-300">
      {/* Minimalist Slate Header */}
      <div className="px-5 py-4 rounded-t-lg bg-slate-100 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-950 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-slate-200 dark:border-slate-800 flex-shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 leading-tight">
                LIVE SERVER ACTIVITY LOG
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-700 text-white uppercase font-mono">
                TELEMETRY
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              CP-SAT allocation telemetry stream
            </p>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-sm border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            ONLINE
          </span>
        </div>
      </div>

      {/* Vanishing Dark Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-transparent dark:from-slate-600 dark:via-slate-700/50 dark:to-transparent opacity-90"></div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-20"></div>
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-md w-16"></div>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="p-8 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/60 flex-1 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5">
            <div className="w-8 h-8 rounded-md bg-slate-900 text-amber-500 flex items-center justify-center border border-slate-800 mb-1">
              <Bell className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">NO RECENT LOG ENTRIES</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Decisions from Central Planning will stream here automatically.
            </p>
          </div>
        ) : (
          /* Server Log List Container */
          <div className="space-y-2.5 overflow-y-auto max-h-[440px] flex-1 pr-1">
            {notifications.map((item) => {
              const meta = FEED_STYLES[item.type] || FEED_STYLES.schedule;
              const Icon = meta.icon;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono tracking-wider border ${meta.badge}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{meta.label}</span>
                    </span>

                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span>{item.timestamp}</span>
                    </span>
                  </div>

                  <p className="text-slate-800 dark:text-slate-200 text-xs font-medium leading-relaxed">
                    {item.message}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Telemetry Status Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          <span>CRIS Solvers · Stream Polling Active</span>
          <span className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Sync: 15s</span>
        </div>
      </div>
    </div>
  );
}
