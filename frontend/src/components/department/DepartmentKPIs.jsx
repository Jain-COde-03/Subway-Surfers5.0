import React from 'react';
import {
  ClipboardList,
  Clock,
  CalendarCheck,
  Activity,
  AlertCircle,
  RotateCw,
} from 'lucide-react';

/**
 * Custom Layered Sliding KPI Ribbon for S.A.M.A.Y. Department Dashboard
 *
 * Implements the "layered card with sliding hover effect":
 * - Outer Card: group cursor-pointer relative h-40 w-full rounded-xl
 * - Top Accent Layer: absolute top-0 left-0 w-full h-24 rounded-t-xl overflow-hidden transition-transform duration-300 ease-in-out group-hover:-translate-y-2
 *   with color-coded backgrounds (Sky Blue, Sunrise Gold, Emerald, Deep Indigo) and large semi-transparent watermark icon.
 * - Bottom Data Layer: absolute bottom-0 left-0 w-full h-28 z-10 rounded-xl p-4 flex flex-col justify-between shadow-xl bg-blue-900
 *   with text-white for primary metric numbers and text-blue-200 for secondary text and titles.
 *
 * @param {Object} props
 * @param {Object} [props.data] - Department metrics
 * @param {number} [props.data.activeBacklog]
 * @param {number} [props.data.awaitingApproval]
 * @param {number} [props.data.confirmedBlockHours]
 * @param {number} [props.data.resourceUtilizationPct]
 * @param {boolean} [props.isLoading=false]
 * @param {string|null} [props.error=null]
 * @param {() => void} [props.onRetry]
 */
export default function DepartmentKPIs({
  data = null,
  isLoading = false,
  error = null,
  onRetry,
}) {
  // Error State
  if (error) {
    return (
      <div className="w-full bg-red-50 border border-red-300 rounded-md p-4 flex items-center justify-between text-red-800 text-xs shadow-lg shadow-black/20">
        <div className="flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>Failed to load department metrics: {error}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center space-x-1.5 px-3 py-1 bg-slate-900 text-white rounded-sm hover:bg-slate-800 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
          >
            <RotateCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        )}
      </div>
    );
  }

  // 4 Specific Department Metrics Mapping (Industrial Command Palette)
  const kpiCards = [
    {
      id: 'activeBacklog',
      title: 'ACTIVE BACKLOG',
      value: data?.activeBacklog ?? 14,
      unit: 'Defects',
      sub: 'Pending track rectification',
      accentGradient:
        'bg-gradient-to-br from-slate-100 via-slate-100 to-slate-200/90 dark:from-slate-700 dark:to-slate-800 border-t border-x border-slate-300/80 dark:border-slate-600/70',
      badgeBg:
        'bg-white/90 dark:bg-black/30 text-slate-700 dark:text-white border border-slate-300/80 dark:border-white/15',
      watermarkColor: 'text-slate-500/15 dark:text-white/15',
      dotHover: 'group-hover:bg-slate-500 group-hover:shadow-[0_0_6px_rgba(100,116,139,0.8)]',
      badge: 'Backlog',
      icon: ClipboardList,
    },
    {
      id: 'awaitingApproval',
      title: 'AWAITING APPROVAL',
      value: data?.awaitingApproval ?? 5,
      unit: 'Requests',
      sub: 'Submitted to Central',
      accentGradient:
        'bg-gradient-to-br from-amber-50 via-amber-100/70 to-amber-100 dark:from-amber-700 dark:to-amber-800 border-t border-x border-amber-200/80 dark:border-amber-600/70',
      badgeBg:
        'bg-white/90 dark:bg-black/30 text-amber-800 dark:text-white border border-amber-300/70 dark:border-white/15',
      watermarkColor: 'text-amber-600/15 dark:text-white/15',
      dotHover: 'group-hover:bg-amber-500 group-hover:shadow-[0_0_6px_rgba(245,158,11,0.8)]',
      badge: 'Pending',
      icon: Clock,
    },
    {
      id: 'confirmedBlockHours',
      title: 'CONFIRMED HOURS',
      value: data?.confirmedBlockHours ?? 18.5,
      unit: 'hrs/week',
      sub: 'Gazetted maintenance slots',
      accentGradient:
        'bg-gradient-to-br from-emerald-50 via-emerald-100/70 to-emerald-100 dark:from-emerald-700 dark:to-emerald-800 border-t border-x border-emerald-200/80 dark:border-emerald-600/70',
      badgeBg:
        'bg-white/90 dark:bg-black/30 text-emerald-800 dark:text-white border border-emerald-300/70 dark:border-white/15',
      watermarkColor: 'text-emerald-600/15 dark:text-white/15',
      dotHover: 'group-hover:bg-emerald-500 group-hover:shadow-[0_0_6px_rgba(16,185,129,0.8)]',
      badge: 'Confirmed',
      icon: CalendarCheck,
    },
    {
      id: 'resourceUtilizationPct',
      title: 'UTILIZATION',
      value: data?.resourceUtilizationPct ?? 84,
      unit: '%',
      sub: 'Active machinery allocation',
      accentGradient:
        'bg-gradient-to-br from-blue-50 via-indigo-50/70 to-blue-100 dark:from-blue-700 dark:to-indigo-800 border-t border-x border-blue-200/80 dark:border-blue-600/70',
      badgeBg:
        'bg-white/90 dark:bg-black/30 text-blue-800 dark:text-white border border-blue-300/70 dark:border-white/15',
      watermarkColor: 'text-blue-600/15 dark:text-white/15',
      dotHover: 'group-hover:bg-blue-500 group-hover:shadow-[0_0_6px_rgba(59,130,246,0.8)]',
      badge: 'Resources',
      icon: Activity,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full pt-1">
      {kpiCards.map((card) => {
        const Icon = card.icon;

        if (isLoading) {
          return (
            <div
              key={card.id}
              className="relative h-40 w-full rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse shadow-md"
            >
              {/* Skeleton Top Accent */}
              <div className="absolute top-0 left-0 w-full h-24 rounded-t-xl bg-slate-200 dark:bg-slate-800"></div>
              {/* Skeleton Bottom Layer */}
              <div className="absolute bottom-0 left-0 w-full h-28 z-10 rounded-xl p-4 bg-white dark:bg-slate-900 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-24"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-sm w-32"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-40"></div>
              </div>
            </div>
          );
        }

        return (
          <div
            key={card.id}
            className="group cursor-pointer relative h-40 w-full rounded-xl transition-all duration-300"
          >
            {/* Top Accent Layer (Industrial Command Colors with Sliding Hover Effect) */}
            <div
              className={`absolute top-0 left-0 w-full h-24 rounded-t-xl overflow-hidden transition-transform duration-300 ease-out group-hover:-translate-y-2.5 shadow-xs ${card.accentGradient}`}
            >
              {/* Top Accent Badge */}
              <div className="px-3.5 py-2.5 flex items-center justify-between">
                <div className={`px-2 py-0.5 rounded-full flex items-center space-x-1.5 ${card.badgeBg}`}>
                  <Icon className="w-3 h-3 text-current opacity-90" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-current">
                    {card.badge}
                  </span>
                </div>
              </div>

              {/* Large Semi-Transparent Watermark Icon */}
              <Icon
                className={`absolute -right-3 -bottom-3 w-20 h-20 pointer-events-none transform -rotate-12 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${card.watermarkColor}`}
                aria-hidden="true"
              />
            </div>

            {/* Bottom Data Layer (Responsive to Light / Dark Mode) */}
            <div className="absolute bottom-0 left-0 w-full h-28 z-10 rounded-xl p-4 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 shadow-lg shadow-slate-900/5 dark:shadow-black/40 group-hover:shadow-2xl transition-all duration-300">
              {/* Card Title */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 ${card.dotHover} transition-all`}></span>
              </div>

              {/* Metric Value: Bold Primary Number + Muted Secondary Unit */}
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none font-sans">
                  {card.value}
                </span>
                {card.unit && (
                  <span
                    className={`text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono ${
                      card.unit === '%' ? 'ml-0.5' : 'ml-1'
                    }`}
                  >
                    {card.unit}
                  </span>
                )}
              </div>

              {/* Secondary Subtitle */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {card.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

