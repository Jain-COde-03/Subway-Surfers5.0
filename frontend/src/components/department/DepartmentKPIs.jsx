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
      accentColor: 'bg-slate-700', // Steel
      badge: 'Backlog',
      icon: ClipboardList,
    },
    {
      id: 'awaitingApproval',
      title: 'AWAITING APPROVAL',
      value: data?.awaitingApproval ?? 5,
      unit: 'Requests',
      sub: 'Submitted to Central',
      accentColor: 'bg-amber-700', // Rust
      badge: 'Pending',
      icon: Clock,
    },
    {
      id: 'confirmedBlockHours',
      title: 'CONFIRMED HOURS',
      value: data?.confirmedBlockHours ?? 18.5,
      unit: 'hrs/week',
      sub: 'Gazetted maintenance slots',
      accentColor: 'bg-emerald-800', // Deep Pine
      badge: 'Confirmed',
      icon: CalendarCheck,
    },
    {
      id: 'resourceUtilizationPct',
      title: 'UTILIZATION',
      value: data?.resourceUtilizationPct ?? 84,
      unit: '%',
      sub: 'Active machinery allocation',
      accentColor: 'bg-slate-800', // Deep Gunmetal
      badge: 'Resources',
      icon: Activity,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full pt-2">
      {kpiCards.map((card) => {
        const Icon = card.icon;

        if (isLoading) {
          return (
            <div
              key={card.id}
              className="relative h-40 w-full rounded-md border border-gray-300 overflow-hidden animate-pulse shadow-md"
            >
              {/* Skeleton Top Accent */}
              <div className="absolute top-0 left-0 w-full h-24 rounded-t-md bg-slate-200"></div>
              {/* Skeleton Bottom Layer */}
              <div className="absolute bottom-0 left-0 w-full h-28 z-10 rounded-md p-4 bg-slate-300 flex flex-col justify-between">
                <div className="h-3 bg-slate-400/50 rounded-sm w-24"></div>
                <div className="h-6 bg-slate-400/60 rounded-sm w-32"></div>
                <div className="h-3 bg-slate-400/40 rounded-sm w-40"></div>
              </div>
            </div>
          );
        }

        return (
          <div
            key={card.id}
            className="group cursor-pointer relative h-40 w-full rounded-md shadow-lg shadow-black/20"
          >
            {/* Top Accent Layer (Industrial Command Colors with Sliding Hover Effect) */}
            <div
              className={`absolute top-0 left-0 w-full h-24 rounded-t-md overflow-hidden transition-transform duration-300 ease-in-out group-hover:-translate-y-2 ${card.accentColor}`}
            >
              {/* Top Accent Badge */}
              <div className="px-3.5 py-2.5 flex items-center space-x-1.5 text-white/90">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">
                  {card.badge}
                </span>
              </div>

              {/* Large Semi-Transparent Watermark Icon Overflowing Slightly Off Edge */}
              <Icon
                className="absolute -right-3 -bottom-3 w-20 h-20 text-white/20 pointer-events-none transform -rotate-12 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                aria-hidden="true"
              />
            </div>

            {/* Bottom Data Layer (Gunmetal Gray bg-slate-900 overlapping top layer) */}
            <div className="absolute bottom-0 left-0 w-full h-28 z-10 rounded-md p-4 flex flex-col justify-between shadow-lg shadow-black/20 bg-slate-900 border border-slate-800 group-hover:shadow-2xl transition-shadow duration-300">
              {/* Card Title */}
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                {card.title}
              </span>

              {/* Metric Value: Pure White Main Number + Muted Secondary Unit */}
              <div className="flex items-baseline">
                <span className="text-2xl font-black text-white tracking-tight">
                  {card.value}
                </span>
                {card.unit && (
                  <span
                    className={`text-xs font-semibold text-slate-300 ${
                      card.unit === '%' ? 'ml-0.5' : 'ml-1.5'
                    }`}
                  >
                    {card.unit}
                  </span>
                )}
              </div>

              {/* Secondary Subtitle */}
              <p className="text-[11px] text-slate-300/90 font-medium truncate">
                {card.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

