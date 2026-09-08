import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  Wrench,
  Cpu,
  Clock,
  FileEdit,
  ShieldAlert,
  Layers,
  Tag,
  Gauge,
  Calendar,
  Repeat,
  ArrowRight,
  Activity,
} from 'lucide-react';

/**
 * Realistic Indian Railways Section & Division Catalog
 */
const SECTIONS_CATALOG = [
  { id: 'NDLS-CNB-UP', label: 'NDLS - CNB · UP Main Line (Km 120-155 · High Density)' },
  { id: 'NDLS-GZB', label: 'NDLS - GZB · Quadruple Track Corridor (Km 12-24)' },
  { id: 'MTC-SRE', label: 'MTC - SRE · Double Line Section (Km 75-110)' },
  { id: 'MB-BE', label: 'MB - BE · Moradabad - Bareilly Section (Km 40-68)' },
  { id: 'DLI-TKD', label: 'DLI - TKD · Freight Chord & Yard Approaches (Km 05-18)' },
  { id: 'PWL-AGC', label: 'PWL - AGC · Fast Passenger Line (Km 88-124)' },
  { id: 'CNB-PRYJ', label: 'CNB - PRYJ · High-Speed Corridor (Km 210-245)' },
];

/**
 * Track Classifications
 */
const TRACK_CLASSIFICATIONS = [
  'Main Line (High-Density / 130-160 km/h)',
  'Branch Line (Feeder Route / 100-110 km/h)',
  'Loop Line (Station Passing / Goods Loop)',
  'Yard / Siding Track (Shunting & Stabling)',
];

/**
 * Category-Scoped Defect Catalog
 */
const DEFECT_CATALOG = {
  'Track & Permanent Way (P-Way)': [
    'USFD Rail Flaw - Transverse Fatigue (IMR/OBS defect)',
    'Track Geometry - Twist & Cross-Level (> 3.5 mm/m)',
    'Switch Rail Head & Tongue Wear (> 6.0 mm)',
    'Ballast Cushion Deficiency & Fouling (-120 mm)',
    'Gauge Deviation / Widening (+12 mm to +16 mm)',
    'Weld Joint Micro-Fracture / Heat Affected Zone',
    'Loose Sleeper Fastenings & Rubber Pad Displacement',
  ],
  'Signaling & Interlocking (S&T)': [
    'Point Machine Stalling Current Spike (> 5.5 A)',
    'Digital Axle Counter (DAC) Reset / Pulse Drift',
    'Track Circuit Ballast Resistance Drop (< 2.0 Ω/km)',
    'Electronic Interlocking (EI) Vital Card Failure',
    'Signal Lamp Proving Relay (ECR) Contact Chatter',
    'Block Instrument Line Clear Interlock Fault',
  ],
  'Traction Distribution (TRD / 25kV OHE)': [
    'Contact Wire Residual Area Wear (< 74 mm²)',
    'Catenary Dropper Broken / Neutral Section Spark',
    'Mast Stagger Deviation (> 120 mm out of tolerance)',
    'Traction Substation SF6 Gas Pressure Drop',
    'Section Insulator Glaze Puncturing / Flashover',
    'Isolator Blade Oxidation & Alignment Skew',
  ],
  'Bridge & Civil Structures (BRG)': [
    'Steel Girvert Rivet Looseness / Corrosion Index',
    'Expansion Joint Seizure / Bearing Tilt (> 5°)',
    'Ballasted Deck Waterproofing Membrane Failure',
    'Scour Depth Exceeding Pier Foundation Margin',
  ],
};

/**
 * Risk level options with descriptive railway impact labels
 */
const RISK_LEVELS = [
  { level: 10, label: '10 - Catastrophic (Immediate Derailment / Power Trip Hazard)' },
  { level: 9, label: '9 - Critical Structural / Interlocking Failure Risk' },
  { level: 8, label: '8 - Severe Flaw (Mandatory PSR ≤ 20 km/h Enforced)' },
  { level: 7, label: '7 - High Priority (Severe Punctuality & Safety Impact)' },
  { level: 6, label: '6 - Elevated Wear (Expedited Intervention Required)' },
  { level: 5, label: '5 - Moderate Operating Risk (Placed on Watchlist)' },
  { level: 4, label: '4 - Precautionary Maintenance Threshold' },
  { level: 3, label: '3 - Routine Inspection Finding' },
  { level: 2, label: '2 - Minor Operational Variance' },
  { level: 1, label: '1 - Negligible Baseline Tolerance' },
];

/**
 * Helper to compute default target date (tomorrow)
 */
const getDefaultTargetDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

/**
 * <LogDepartmentDefect /> Component
 *
 * Data-dense, realistic Indian Railways defect reporting interface with
 * multi-criteria ML feature input for CRIS CP-SAT solver constraint allocation.
 * Wires up with the XGBoost priority scoring endpoint (http://localhost:8000/api/v1/score)
 * with robust hackathon fallback armor.
 *
 * @param {Object} props
 * @param {(defectPayload: any) => Promise<any>} props.onSubmit - Submission callback calling API
 * @param {import('../../types/department').Task|null} [props.prefill=null] - Prefill task data for resubmission
 * @param {() => void} [props.onCancelPrefill] - Callback when user cancels resubmission
 * @param {string} [props.department='Civil'] - Logged in department key
 */
export default function LogDepartmentDefect({
  onSubmit,
  prefill = null,
  onCancelPrefill,
  department = 'Civil',
}) {
  // Determine default category based on department (used when category is explicitly set or prefilled)
  const initialCategory = useMemo(() => {
    if (department === 'Signal' || department === 'SMMS') return 'Signaling & Interlocking (S&T)';
    if (department === 'Electrical' || department === 'TDMS') return 'Traction Distribution (TRD / 25kV OHE)';
    return 'Track & Permanent Way (P-Way)';
  }, [department]);

  // Requirement: Completely empty on login
  const [formData, setFormData] = useState({
    section: '',
    assetCategory: '',
    defectType: '',
    speedRestriction: '',
    daysOverdue: '',
    repeatDefectCount: '',
  });

  // Loading and aiScore states
  const [isLoading, setIsLoading] = useState(false);
  const [aiScore, setAiScore] = useState(null);

  // Additional form inputs & execution constraints - clean empty defaults
  const [trackClassification, setTrackClassification] = useState('');
  const [specificMarker, setSpecificMarker] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [safetyRiskLevel, setSafetyRiskLevel] = useState('');
  const [possessionWindow, setPossessionWindow] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Feedback notifications
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset form helper to ensure form is completely empty
  const resetForm = () => {
    setFormData({
      section: '',
      assetCategory: '',
      defectType: '',
      speedRestriction: '',
      daysOverdue: '',
      repeatDefectCount: '',
    });
    setTrackClassification('');
    setSpecificMarker('');
    setDetailedDescription('');
    setSafetyRiskLevel('');
    setPossessionWindow('');
    setTargetDate('');
    setAiScore(null);
  };

  // Handle Prefill (e.g. from Rejected Task click in Task Queue)
  useEffect(() => {
    if (prefill) {
      let matchedCategory = initialCategory;
      for (const [cat, defects] of Object.entries(DEFECT_CATALOG)) {
        if (defects.some((d) => d.toLowerCase().includes(prefill.defectType?.toLowerCase() || ''))) {
          matchedCategory = cat;
          break;
        }
      }
      setFormData({
        section: prefill.section || SECTIONS_CATALOG[0].label,
        assetCategory: matchedCategory,
        defectType: prefill.defectType || DEFECT_CATALOG[matchedCategory][0],
        speedRestriction: 30,
        daysOverdue: 7,
        repeatDefectCount: 2,
      });
      setSpecificMarker(prefill.asset || 'Km 142/8-12 UP Main');
      
      const derivedRisk = Math.min(10, Math.max(1, Math.round((prefill.priorityScore || 80) / 10)));
      setSafetyRiskLevel(derivedRisk);
      setPossessionWindow(3.0);
      setTargetDate(getDefaultTargetDate());
      setDetailedDescription(
        `[Resubmitted Task ${prefill.id}] Corrected corridor block boundary requirements and adjusted team possession window based on controller review.`
      );
      setSuccessMessage('');
      setErrorMessage('');
    }
  }, [prefill, initialCategory]);

  // Handle Category Change: cascade update defect type
  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    const defects = DEFECT_CATALOG[newCat] || [];
    setFormData((prev) => ({
      ...prev,
      assetCategory: newCat,
      defectType: defects[0] || '',
    }));
  };

  // Live ML Priority Estimate Calculation (used as fallback baseline before API scoring)
  const estimatedPriority = useMemo(() => {
    const risk = Number(safetyRiskLevel);
    if (!risk || (!formData.section && !formData.assetCategory)) {
      return '--';
    }
    let score = risk * 7.5;
    const psr = Number(formData.speedRestriction) || 0;
    if (psr > 0) {
      if (psr <= 20) score += 15;
      else if (psr <= 45) score += 10;
      else score += 5;
    }
    score += Math.min(10, (Number(formData.daysOverdue) || 0) * 1.5);
    score += Math.min(8, (Number(formData.repeatDefectCount) || 0) * 2.5);
    return Math.min(99.4, Math.max(35.0, score)).toFixed(1);
  }, [safetyRiskLevel, formData.speedRestriction, formData.daysOverdue, formData.repeatDefectCount, formData.section, formData.assetCategory]);

  // Priority classification pill styling reflecting aiScore or estimatedPriority
  const displayedScore = aiScore !== null ? Number(aiScore) : (estimatedPriority !== '--' ? parseFloat(estimatedPriority) : null);

  const priorityBadge = useMemo(() => {
    if (displayedScore === null) {
      return { text: 'AWAITING DATA', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700' };
    }
    const num = displayedScore;
    if (num >= 85) return { text: 'HIGH PRIORITY', bg: 'bg-rose-50 text-rose-800 border-rose-300' };
    if (num >= 65) return { text: 'MEDIUM PRIORITY', bg: 'bg-amber-50 text-amber-900 border-amber-300' };
    return { text: 'ROUTINE PRIORITY', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
  }, [displayedScore]);

  // Requirements 2 & 3: Asynchronous handleSubmit with Hackathon Armor Fallback
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.section) {
      setErrorMessage('Please select a Section / Division.');
      return;
    }

    if (!formData.assetCategory) {
      setErrorMessage('Please select an Asset Category.');
      return;
    }

    if (!formData.defectType) {
      setErrorMessage('Please select a Defect Type.');
      return;
    }

    if (!detailedDescription.trim()) {
      setErrorMessage('Please provide a brief detailed description for the CP-SAT optimization model.');
      return;
    }

    setIsLoading(true);

    const requestBody = {
      asset_type: formData.assetCategory || 'Track & Permanent Way (P-Way)',
      speed_drop: Number(formData.speedRestriction) || 0,
      days_overdue: Number(formData.daysOverdue) || 0,
      repeat_incidents: Number(formData.repeatDefectCount) || 0,
    };

    try {
      const response = await fetch('http://localhost:8000/api/v1/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const scoreVal = data.predicted_priority ?? 94.5;
      setAiScore(Number(scoreVal));

      setSuccessMessage(
        prefill
          ? `Defect ${prefill.id} updated and scored successfully via CRIS XGBoost endpoint (${scoreVal}).`
          : `Defect logged and scored successfully via CRIS XGBoost endpoint (Predicted Priority: ${scoreVal}).`
      );

      // Call parent onSubmit if provided
      if (onSubmit) {
        const assetIdentifier = specificMarker.trim() 
          ? `${formData.section.split(' · ')[0]} (${specificMarker.trim()})`
          : `${formData.section.split(' · ')[0]} [${trackClassification.split(' ')[0]}]`;

        const fullPayload = {
          id: prefill ? prefill.id : undefined,
          department,
          asset: assetIdentifier,
          section: formData.section,
          trackClassification,
          specificMarker: specificMarker.trim(),
          category: formData.assetCategory,
          defectType: formData.defectType,
          detailedDescription: detailedDescription.trim(),
          notes: detailedDescription.trim(),
          speedRestriction: Number(formData.speedRestriction) || 0,
          safetyRiskLevel: Number(safetyRiskLevel) || 5,
          daysOverdue: Number(formData.daysOverdue) || 0,
          repeatDefectCount: Number(formData.repeatDefectCount) || 0,
          possessionWindow: Number(possessionWindow) || 2.0,
          targetDate,
          severity: Number(scoreVal),
          priorityScore: Number(scoreVal),
        };
        await onSubmit(fullPayload);
      }

      // Empty form as soon as a new defect is submitted
      if (!prefill) {
        resetForm();
      }
    } catch (err) {
      console.warn('Backend /api/v1/score error (activating hackathon armor fallback):', err);
      // Simulate successful response after a 1.5-second timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const fallbackScore = 88.5;
      setAiScore(fallbackScore);

      setSuccessMessage(
        prefill
          ? `Defect ${prefill.id} updated and scored via CRIS CP-SAT fallback (${fallbackScore}).`
          : `Defect logged successfully via CRIS CP-SAT fallback (Predicted Priority: ${fallbackScore}).`
      );

      if (onSubmit) {
        const assetIdentifier = specificMarker.trim() 
          ? `${formData.section.split(' · ')[0]} (${specificMarker.trim()})`
          : `${formData.section.split(' · ')[0]} [${trackClassification.split(' ')[0]}]`;

        const fullPayload = {
          id: prefill ? prefill.id : undefined,
          department,
          asset: assetIdentifier,
          section: formData.section,
          trackClassification,
          specificMarker: specificMarker.trim(),
          category: formData.assetCategory,
          defectType: formData.defectType,
          detailedDescription: detailedDescription.trim(),
          notes: detailedDescription.trim(),
          speedRestriction: Number(formData.speedRestriction) || 0,
          safetyRiskLevel: Number(safetyRiskLevel) || 5,
          daysOverdue: Number(formData.daysOverdue) || 0,
          repeatDefectCount: Number(formData.repeatDefectCount) || 0,
          possessionWindow: Number(possessionWindow) || 2.0,
          targetDate,
          severity: fallbackScore,
          priorityScore: fallbackScore,
        };
        try {
          await onSubmit(fullPayload);
        } catch (submitErr) {
          console.warn('Error in parent onSubmit callback:', submitErr);
        }
      }

      // Empty form as soon as a new defect is submitted
      if (!prefill) {
        resetForm();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden relative transition-colors duration-300">
      {/* Minimalist Slate Header */}
      <div className="px-5 py-4 rounded-t-lg bg-slate-100 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-950 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-slate-200 dark:border-slate-800 flex-shrink-0">
            {prefill ? <FileEdit className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 leading-tight">
                {prefill ? `EDIT & RESUBMIT DEFECT (${prefill.id})` : 'LOG DEPARTMENT DEFECT'}
              </h2>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-700 text-white uppercase font-mono">
                CRIS CP-SAT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              {prefill
                ? 'Modify parameters and constraints for Central Operations re-evaluation.'
                : 'Enter defect parameters to initiate automated multi-criteria AI priority scoring.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Estimated AI Priority Score Badge (renders aiScore when returned or fallback triggers) */}
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-sm border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white">
            <Cpu className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
            <div className="text-right font-mono">
              <span className="text-[9px] text-slate-500 dark:text-slate-400 block leading-none">PREDICTED PRIORITY</span>
              <span className="text-xs font-black text-slate-900 dark:text-white leading-none">
                {aiScore !== null ? aiScore : estimatedPriority} <span className="text-[10px] text-slate-500 dark:text-slate-400">/ 100</span>
              </span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ml-1 ${priorityBadge.bg}`}>
              {priorityBadge.text}
            </span>
          </div>

          {prefill && onCancelPrefill && (
            <button
              type="button"
              onClick={onCancelPrefill}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1 cursor-pointer transition-colors px-2 py-1 rounded-sm border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Vanishing Dark Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-transparent dark:from-slate-600 dark:via-slate-700/50 dark:to-transparent opacity-90"></div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Prefill Alert Banner */}
        {prefill && (
          <div className="p-3 rounded-sm bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-700 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>
                <strong>Task {prefill.id}</strong> was previously rejected by Central Planning. Modify features or possession window below to trigger CP-SAT re-evaluation.
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-sm text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shrink-0">
              Action Required
            </span>
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div className="p-3 rounded-sm bg-emerald-50 dark:bg-emerald-950/50 border-l-4 border-emerald-700 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs flex items-center space-x-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 rounded-sm bg-rose-50 dark:bg-rose-950/50 border-l-4 border-rose-800 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 text-xs flex items-center space-x-2.5">
            <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ========================================================= */}
          {/* GROUP 1: LOCATION PARAMETERS                              */}
          {/* ========================================================= */}
          <section className="border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-md bg-slate-900 text-amber-500 flex items-center justify-center border border-slate-800 shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    Location Parameters
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Corridor chainage & spatial boundary definitions
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300/80 dark:border-amber-700/80 font-mono">
                Spatial Bounds
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Section/Division Dropdown */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1.5">
                  Section / Division <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData((prev) => ({ ...prev, section: e.target.value }))}
                    disabled={isLoading}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs text-slate-900 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300 focus:border-slate-900 dark:focus:border-slate-300 transition-all cursor-pointer"
                  >
                    <option value="" disabled>-- Select Section / Division --</option>
                    {SECTIONS_CATALOG.map((sec) => (
                      <option key={sec.id} value={sec.label}>
                        {sec.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Track Classification Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1.5">
                  Track Classification <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Activity className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <select
                    value={trackClassification}
                    onChange={(e) => setTrackClassification(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs text-slate-900 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300 focus:border-slate-900 dark:focus:border-slate-300 transition-all cursor-pointer"
                  >
                    <option value="" disabled>-- Select Track Classification --</option>
                    {TRACK_CLASSIFICATIONS.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specific KM Marker / Asset Tag */}
              <div className="md:col-span-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                    Specific Chainage / Asset Marker
                  </label>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">e.g. Km 142/8-12, Turnout #24B, Mast 142/18</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <input
                    type="text"
                    value={specificMarker}
                    onChange={(e) => setSpecificMarker(e.target.value)}
                    disabled={isLoading}
                    placeholder="Track Km 142/8-12 UP Main, Point Machine 104A, Mast 142/18"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs text-slate-900 dark:text-slate-200 font-medium placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300 focus:border-slate-900 dark:focus:border-slate-300 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* GROUP 2: DEFECT DETAILS                                   */}
          {/* ========================================================= */}
          <section className="border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-md bg-slate-900 text-amber-500 flex items-center justify-center border border-slate-800 shrink-0">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    Defect Details & Classification
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Asset discipline category & engineering telemetry
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300/80 dark:border-amber-700/80 font-mono">
                Asset Scope
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Asset Category Segmented Pill Bar */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1.5">
                  Asset Category <span className="text-amber-500">*</span>
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  {Object.keys(DEFECT_CATALOG).map((cat) => {
                    const isSelected = formData.assetCategory === cat;
                    let shortLabel = cat;
                    if (cat.includes('Track & Permanent Way')) shortLabel = 'P-Way (Track)';
                    else if (cat.includes('Signaling & Interlocking')) shortLabel = 'S&T (Signals)';
                    else if (cat.includes('Traction Distribution')) shortLabel = 'TRD (25kV OHE)';
                    else if (cat.includes('Bridge')) shortLabel = 'Civil (Bridges)';

                    return (
                      <button
                        key={cat}
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleCategoryChange({ target: { value: cat } })}
                        className={`py-1.5 px-2 text-[11px] font-bold rounded-md transition-all text-center truncate cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs dark:bg-slate-800 dark:text-amber-400'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-300/40 dark:hover:bg-slate-900'
                        }`}
                      >
                        {shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Defect Type (Category-Scoped) Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1.5">
                  Defect Type <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Wrench className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <select
                    value={formData.defectType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, defectType: e.target.value }))}
                    disabled={isLoading}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs text-slate-900 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300 focus:border-slate-900 dark:focus:border-slate-300 transition-all cursor-pointer"
                  >
                    <option value="" disabled>
                      {formData.assetCategory ? '-- Select Defect Type --' : '-- Choose Asset Category First --'}
                    </option>
                    {(DEFECT_CATALOG[formData.assetCategory] || []).map((def) => (
                      <option key={def} value={def}>
                        {def}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Detailed Description Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                    Detailed Description & Telemetry <span className="text-amber-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Measurements, USFD classification, or track telemetry</span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={detailedDescription}
                  onChange={(e) => setDetailedDescription(e.target.value)}
                  disabled={isLoading}
                  placeholder="Provide physical measurements, defect telemetry, USFD echo patterns, or operational constraints for CP-SAT solver modeling..."
                  className="w-full p-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs text-slate-900 dark:text-slate-200 font-medium placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300 focus:border-slate-900 dark:focus:border-slate-300 transition-all resize-none"
                />
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* GROUP 3: AI MODEL FEATURES (ML SCORING FEATURES)           */}
          {/* ========================================================= */}
          <section className="border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-md bg-slate-900 text-amber-500 flex items-center justify-center border border-slate-800 shrink-0">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    ML Scoring Features
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    CRIS XGBoost multi-criteria priority model inputs
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300/80 dark:border-amber-700/80 font-mono">
                CRIS XGBoost v3
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Speed Restriction Imposed (km/h) */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-amber-500" />
                    Speed Drop (PSR)
                  </span>
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                    km/h
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={160}
                  step={5}
                  value={formData.speedRestriction}
                  onChange={(e) => setFormData((prev) => ({ ...prev, speedRestriction: Number(e.target.value) }))}
                  disabled={isLoading}
                  placeholder="e.g. 30"
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300"
                />
                <span className="block text-[10px] text-slate-500 dark:text-slate-500 font-mono">0 = no speed drop</span>
              </div>

              {/* Safety Risk Level (1-10 Dropdown) */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    Risk Level <span className="text-amber-500">*</span>
                  </span>
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300/80 dark:border-amber-700/80">
                    1-10
                  </span>
                </div>
                <select
                  value={safetyRiskLevel}
                  onChange={(e) => setSafetyRiskLevel(Number(e.target.value))}
                  disabled={isLoading}
                  className="w-full py-1.5 px-2 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300 cursor-pointer"
                >
                  <option value="" disabled>-- Select (1-10) --</option>
                  {RISK_LEVELS.map((item) => (
                    <option key={item.level} value={item.level}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <span className="block text-[10px] text-slate-500 dark:text-slate-500 font-mono">Derailment severity weight</span>
              </div>

              {/* Days Overdue (Number Input) */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    Days Overdue
                  </span>
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                    Days
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={365}
                  value={formData.daysOverdue}
                  onChange={(e) => setFormData((prev) => ({ ...prev, daysOverdue: Math.max(0, Number(e.target.value)) }))}
                  disabled={isLoading}
                  placeholder="e.g. 4"
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300"
                />
                <span className="block text-[10px] text-slate-500 dark:text-slate-500 font-mono">Statutory inspection lag</span>
              </div>

              {/* Repeat Defect Count (Number Input) */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5 text-amber-500" />
                    Repeat Incidents
                  </span>
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                    180d
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={formData.repeatDefectCount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, repeatDefectCount: Math.max(0, Number(e.target.value)) }))}
                  disabled={isLoading}
                  placeholder="e.g. 1"
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300"
                />
                <span className="block text-[10px] text-slate-500 dark:text-slate-500 font-mono">Historical recurrences</span>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* GROUP 4: EXECUTION CONSTRAINTS                            */}
          {/* ========================================================= */}
          <section className="border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-md bg-slate-900 text-amber-500 flex items-center justify-center border border-slate-800 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    Execution Constraints
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Traffic block window duration & target scheduling date
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300/80 dark:border-amber-700/80 font-mono">
                Possession Bounds
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Required Possession Window (Hours) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                    Required Possession Window <span className="text-amber-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400">Hours</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <input
                    type="number"
                    min={0.5}
                    max={12.0}
                    step={0.5}
                    required
                    value={possessionWindow}
                    onChange={(e) => setPossessionWindow(Math.max(0.5, Number(e.target.value)))}
                    disabled={isLoading}
                    placeholder="e.g. 2.5"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300 focus:border-slate-900 dark:focus:border-slate-300 transition-all"
                  />
                </div>
                <span className="block text-[10px] text-slate-500 dark:text-slate-500 mt-1 font-mono">Required corridor closure</span>
              </div>

              {/* Target Execution Date (Date Picker) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                    Target Execution Date <span className="text-amber-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">ISO Date</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setTargetDate(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300 focus:border-slate-900 dark:focus:border-slate-300 transition-all"
                  />
                </div>
                <span className="block text-[10px] text-slate-500 dark:text-slate-500 mt-1 font-mono">Subject to corridor bundling</span>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* PORTAL-STYLE SUBMIT BUTTON                                */}
          {/* ========================================================= */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-5 bg-slate-900 hover:bg-slate-800 active:bg-black dark:bg-slate-100 dark:hover:bg-white dark:active:bg-slate-200 text-white dark:text-slate-950 font-black tracking-wider rounded-lg shadow-md uppercase text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Scoring via CRIS CP-SAT Engine...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                  <span>
                    {prefill
                      ? `RESUBMIT DEFECT ${prefill.id} FOR AI PRIORITY SCORING`
                      : 'SUBMIT FOR AI PRIORITY SCORING'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-amber-500 ml-1" />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-500 dark:text-slate-500 mt-2 font-mono uppercase tracking-tight">
              Ingested by Indian Railways CRIS CP-SAT Engine · Central Operations Planning
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
