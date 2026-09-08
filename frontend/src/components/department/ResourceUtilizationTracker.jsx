import React, { useState } from 'react';
import {
  Gauge,
  AlertTriangle,
  RotateCw,
  AlertCircle,
  X,
  Truck,
  Wrench,
  Clock,
  ShieldCheck,
  Building2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

/**
 * Generates domain telemetry for department resources
 */
function getResourceTelemetry(item) {
  const label = item.label || '';
  const percent = item.percent ?? 50;

  if (label.includes('S&T Inspection Teams')) {
    return {
      totalUnits: '12 Active Teams',
      deployedUnits: '8 In Field · 4 On Standby',
      primaryDepot: 'Ghaziabad Junction (GZB) S&T Depot',
      shiftCoverage: '24/7 Rotational Roster (3 Shifts of 4 Teams)',
      operationalDetails: 'Routine point machine insulation testing, signal bonding measurements, and pre-monsoon track circuit inspections along Ghaziabad-New Delhi quad track corridor.',
      equipmentPairing: 'Fluke 1587 Insulation Testers & Track Gauge Calibration Rigs',
      isCritical: percent < 30,
      rule14Advisory: 'Operating at optimal load (65%). Sufficient reserve capacity available for emergency corridor possession calls.',
      readinessGrade: 'Alpha (Normal Operations)',
    };
  }

  if (label.includes('Relay Testing Kits')) {
    return {
      totalUnits: '10 Calibrated Kits',
      deployedUnits: '8 in Active Field Testing · 2 in Lab Calibration',
      primaryDepot: 'New Delhi (NDLS) Signal Overhaul Workshop',
      shiftCoverage: 'General Shift (08:00 - 17:00) + Night Block Possession Roster',
      operationalDetails: 'High-precision micro-ohmmeter and relay pick-up/drop-away timing test benches verifying plug-in Q-style relays across Sahibabad and Anand Vihar interlocking cabins.',
      equipmentPairing: 'CRIS Digital Relay Diagnostic Loggers (DRDL-v3) & Contact Scopes',
      isCritical: percent < 30,
      rule14Advisory: 'High utilization (82%). Non-urgent shop calibrations postponed during upcoming Tuesday Gazetted corridor block.',
      readinessGrade: 'Beta (Heavy Allocation)',
    };
  }

  if (label.includes('Emergency Signal Vans')) {
    return {
      totalUnits: '4 Division Vans',
      deployedUnits: '1 Van In-Service · 3 in Scheduled Overhaul / Maintenance',
      primaryDepot: 'Anand Vihar Terminal (ANVR) Maintenance Siding',
      shiftCoverage: 'Critical Roster: 1 Standby Quick Response Crew on 24/7 alert',
      operationalDetails: 'Rapid-response mobile workshops equipped with oxy-acetylene cutting rigs, temporary bypass jumpers, and replacement point motors for quick corridor restoration.',
      equipmentPairing: 'On-board 15kVA Diesel Generator & Hydraulic Track Jacks',
      isCritical: true,
      rule14Advisory: 'CRITICAL DEFICIT (24% < 30% Threshold). Mutual aid requisition triggered under CRIS Rule 14.2 to transfer 2 standby signal vans from Old Delhi (DLI) Division within 4 hours.',
      readinessGrade: 'Delta (Critical Deficit - Mutual Aid Active)',
    };
  }

  if (label.includes('Cable Jointing Crews')) {
    return {
      totalUnits: '8 Certified Crews',
      deployedUnits: '4 Crews on Trenching/Jointing · 4 in Reserve',
      primaryDepot: 'Tilak Bridge (TKJ) Telecommunications Depot',
      shiftCoverage: 'Day Shift (06:00 - 14:00) & Night Corridor Possession (01:00 - 05:00)',
      operationalDetails: 'Thermo-shrink jointing, optical fiber fusion splicing, and underground signaling cable fault locating via Time Domain Reflectometry (TDR) along chord lines.',
      equipmentPairing: 'Fujikura 90S+ Fusion Splicers & TDR Cable Fault Locators',
      isCritical: percent < 30,
      rule14Advisory: 'Balanced allocation (48%). Mobilized for joint possession during planned block BLK-SIG-501.',
      readinessGrade: 'Alpha (Normal Operations)',
    };
  }

  return {
    totalUnits: 'Standard Division Fleet',
    deployedUnits: `${percent}% deployed across active sections`,
    primaryDepot: 'Northern Railway Division Depot',
    shiftCoverage: 'Standard 3-Tier Operational Roster',
    operationalDetails: 'Field capacity monitored under Northern Railway Signal & Telecommunication Engineering Manual.',
    equipmentPairing: 'Standard CRIS field tools & testing equipment.',
    isCritical: percent < 30,
    rule14Advisory: percent < 30
      ? 'CRITICAL DEFICIT (<30% Threshold). Mutual aid reallocation protocol activated under CRIS Rule 14.2.'
      : 'Operational balance maintained within standard Divisional capacity limits.',
    readinessGrade: percent < 30 ? 'Delta (Deficit Alert)' : 'Alpha (Operational)',
  };
}

/**
 * Resource Detail Modal Overlay
 */
function ResourceDetailOverlayModal({ resource, onClose }) {
  if (!resource) return null;

  const telemetry = getResourceTelemetry(resource);
  const isCritical = resource.percent < 30;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl shadow-slate-900/40 dark:shadow-black/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Minimalist Slate Header */}
        <div className="px-6 py-4 rounded-t-xl bg-slate-100 dark:bg-slate-800/40 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-sm bg-slate-100 dark:bg-slate-950 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-slate-200 dark:border-slate-800 flex-shrink-0 shadow-xs">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  RESOURCE TELEMETRY · {resource.label}
                </h3>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase inline-flex items-center space-x-1 ${
                    isCritical
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800/80'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/80'
                  }`}
                >
                  {isCritical ? (
                    <>
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>DEFICIT ({resource.percent}%)</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>{resource.percent}% ALLOCATED</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                CRIS Asset Fleet Allocation &amp; Divisional Maintenance Capacity
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Telemetry"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vanishing Dark Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-transparent dark:from-slate-600 dark:via-slate-700/50 dark:to-transparent opacity-90 flex-shrink-0"></div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
          {/* Top 4 Micro-Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
                Total Fleet / Strength
              </span>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                {telemetry.totalUnits}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                Division Roster
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
                Deployment Level
              </span>
              <div className="font-mono font-black text-xs flex items-center space-x-1">
                <span className={isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}>
                  {resource.percent}%
                </span>
                <span className="text-slate-400">capacity</span>
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block font-semibold">
                {telemetry.readinessGrade}
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
                Home Base Depot
              </span>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate" title={telemetry.primaryDepot}>
                {telemetry.primaryDepot.split(' ')[0]} {telemetry.primaryDepot.split(' ')[1]}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                Northern Railway
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">
                Shift Schedule
              </span>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                {telemetry.shiftCoverage.split('(')[0]}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                Active Manning
              </span>
            </div>
          </div>

          {/* Section 1: Active Deployment & Field Allocation */}
          <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
              <span className="uppercase flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-500" />
                <span>Field Deployment Status &amp; Tasks</span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-normal">
                {telemetry.deployedUnits}
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-xs">
              {telemetry.operationalDetails}
            </p>
            <div className="p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Tooling &amp; Calibrated Kits:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{telemetry.equipmentPairing}</span>
            </div>
          </div>

          {/* Section 2: Depot Assignment & Shift Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase font-mono text-slate-500 dark:text-slate-400 block flex items-center space-x-1">
                <Building2 className="w-3 h-3 text-amber-500" />
                <span>Assigned Maintenance Siding</span>
              </span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                {telemetry.primaryDepot}
              </p>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Direct track access to mainline blocks
              </p>
            </div>

            <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase font-mono text-slate-500 dark:text-slate-400 block flex items-center space-x-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Roster &amp; Shift Manning</span>
              </span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                {telemetry.shiftCoverage}
              </p>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Continuous availability compliance
              </p>
            </div>
          </div>

          {/* Section 3: CRIS Rule 14.2 Allocation Matrix */}
          <div
            className={`p-3.5 rounded-lg border shadow-xs space-y-2 ${
              isCritical
                ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 text-rose-900 dark:text-rose-300'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono font-bold">
              <span className="uppercase flex items-center space-x-1.5">
                <ShieldCheck className={`w-3.5 h-3.5 ${isCritical ? 'text-rose-500' : 'text-amber-500'}`} />
                <span>CRIS Asset Allocation Rule 14.2 Advisory</span>
              </span>
              <span className="text-[10px] uppercase font-mono">
                {isCritical ? 'ALERT: DEFICIT' : 'QUOTA NORMAL'}
              </span>
            </div>
            <p className="text-xs font-medium leading-relaxed font-sans">
              {telemetry.rule14Advisory}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            S.A.M.A.Y. Telemetry Ref: RES-{resource.label.substring(0, 3).toUpperCase()}-{resource.percent}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            {isCritical ? (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer shadow-xs flex items-center space-x-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Rebalance Fleet Quota</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer shadow-xs flex items-center space-x-1"
              >
                <span>Acknowledge Status</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Component 6: ResourceUtilizationTracker
 * Progress bars per ResourceMetric with Industrial Command styling.
 *
 * @param {Object} props
 * @param {import('../../types/department').ResourceMetric[]} [props.utilization=[]]
 * @param {boolean} [props.isLoading=false]
 * @param {string|null} [props.error=null]
 * @param {() => void} [props.onRetry]
 */
export default function ResourceUtilizationTracker({
  utilization = [],
  isLoading = false,
  error = null,
  onRetry,
}) {
  const [selectedResource, setSelectedResource] = useState(null);

  if (error) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/40 p-5 transition-colors duration-300">
        <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-sm text-rose-900 dark:text-rose-300 text-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>Failed to load resources: {error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
              title="Retry resource loading"
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
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden flex flex-col justify-between transition-colors duration-300">
      {/* Minimalist Slate Header */}
      <div className="px-5 py-4 rounded-t-lg bg-slate-100 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-500 flex items-center justify-center shadow-xs shrink-0">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 leading-tight">
                Resource Utilization Tracker
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-700 text-white uppercase font-mono">
                CAPACITY
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Department machinery, crews &amp; possession capacity · Click to inspect
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300/80 dark:border-amber-700/80 font-mono">
          &lt;30% = Deficit
        </span>
      </div>

      {/* Vanishing Dark Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-transparent dark:from-slate-600 dark:via-slate-700/50 dark:to-transparent opacity-90"></div>

      {/* Main Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-28"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-10"></div>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full w-full"></div>
              </div>
            ))}
          </div>
        ) : utilization.length === 0 ? (
          /* Empty State */
          <div className="p-8 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/60 flex-1 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5">
            <div className="w-8 h-8 rounded-md bg-slate-900 text-amber-500 flex items-center justify-center border border-slate-800 mb-1">
              <Gauge className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              No resource metrics registered
            </span>
          </div>
        ) : (
          /* Progress Micro-Cards matching Defect Form features */
          <div className="space-y-2.5">
            {utilization.map((item, idx) => {
              const isCritical = item.percent < 30;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedResource(item)}
                  className="group bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 shadow-xs space-y-2 hover:border-amber-400 dark:hover:border-amber-600/70 hover:shadow-md transition-all cursor-pointer"
                  title="Click to view full resource telemetry & allocation"
                >
                  {/* Metric Label & Percent Pill */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-xs group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {item.label}
                      </span>
                      {isCritical && (
                        <span className="inline-flex items-center space-x-1 text-[9px] font-bold uppercase font-mono px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 tracking-wider animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Deficit</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-mono text-xs font-black ${
                          isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {item.percent}%
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Progress Bar Track: Rounded and indented */}
                  <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical ? 'bg-rose-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, item.percent))}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Capacity Note */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          <span>CRIS Asset Allocation Rule 14.2</span>
          <span className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Division Quota Normal</span>
        </div>
      </div>

      {/* Expandable Resource Overlay Modal */}
      {selectedResource && (
        <ResourceDetailOverlayModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </div>
  );
}

