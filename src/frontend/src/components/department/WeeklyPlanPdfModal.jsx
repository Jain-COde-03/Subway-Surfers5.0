import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  Clock,
  Shield,
  FileSpreadsheet,
  QrCode
} from 'lucide-react';

export default function WeeklyPlanPdfModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const SCHEDULE_DATA = [
    {
      id: 'BLK-MST-101',
      day: 'Wed 09 Sep',
      window: '01:30 – 05:30 (4h)',
      section: 'GZB–PKW (KM 254/10 – 262/00)',
      track: 'UP Main Line',
      leadDept: 'TMS (Track)',
      bundled: 'SMMS (Signals)',
      plant: 'BCM Tamper #08 + Gang #14',
      status: 'GAZETTED'
    },
    {
      id: 'BLK-MST-102',
      day: 'Thu 10 Sep',
      window: '02:00 – 06:00 (4h)',
      section: 'PKW–HPU (KM 270/00 – 278/14)',
      track: 'DN Main Line',
      leadDept: 'TDMS (TRD)',
      bundled: 'TMS (Track)',
      plant: 'OHE Tower Wagon #14 + Unimat',
      status: 'GAZETTED'
    },
    {
      id: 'BLK-MST-103',
      day: 'Fri 11 Sep',
      window: '11:00 – 14:00 (3h)',
      section: 'HPU Yard (Points 102/104)',
      track: 'Yard Crossover',
      leadDept: 'SMMS (S&T)',
      bundled: 'TDMS (TRD)',
      plant: 'S&T Interlocking Van #02',
      status: 'GAZETTED'
    },
    {
      id: 'BLK-MST-104',
      day: 'Sat 12 Sep',
      window: '00:30 – 04:30 (4h)',
      section: 'HPU–GMS (KM 288/00 – 296/20)',
      track: 'UP Main Line',
      leadDept: 'TMS (Track)',
      bundled: '— (Single Dept)',
      plant: 'Plasser Quick Relaying System',
      status: 'GAZETTED'
    },
    {
      id: 'BLK-MST-105',
      day: 'Sun 13 Sep',
      window: '01:00 – 04:30 (3.5h)',
      section: 'GMS–GJL (KM 304/00 – 312/00)',
      track: 'DN Main Line',
      leadDept: 'TMS (Track)',
      bundled: 'SMMS, TDMS',
      plant: 'DGS Dynamic Track Stabilizer',
      status: 'GAZETTED'
    },
    {
      id: 'BLK-MST-106',
      day: 'Mon 14 Sep',
      window: '02:30 – 05:30 (3h)',
      section: 'GJL Yard (Line 3)',
      track: 'Loop Line',
      leadDept: 'SMMS (S&T)',
      bundled: '— (Single Dept)',
      plant: 'Axle Counter Testing Gang',
      status: 'GAZETTED'
    },
    {
      id: 'BLK-MST-107',
      day: 'Tue 15 Sep',
      window: '01:30 – 06:30 (5h)',
      section: 'AMRO–MB (KM 322/00 – 334/00)',
      track: 'UP Main Line',
      leadDept: 'TMS (Track)',
      bundled: 'TDMS (TRD)',
      plant: 'BCM 392 + TRD Wiring Train',
      status: 'GAZETTED'
    }
  ];

  // Real CSV download generation
  const handleDownloadCsv = () => {
    const headers = ['Block ID', 'Day / Date', 'Time Window', 'Section & KM', 'Track', 'Lead Department', 'Bundled Departments', 'Mobilized Plant', 'Gazette Status'];
    const rows = SCHEDULE_DATA.map(item => [
      item.id,
      item.day,
      `"${item.window}"`,
      `"${item.section}"`,
      `"${item.track}"`,
      `"${item.leadDept}"`,
      `"${item.bundled}"`,
      `"${item.plant}"`,
      item.status
    ]);

    const csvContent = [
      '# NORTHERN RAILWAY - MORADABAD DIVISION',
      '# S.A.M.A.Y CONSOLIDATED WEEKLY CORRIDOR POSSESSION GAZETTE (WEEK 37 / 2026)',
      '# Gazette ID: NR/MB/OPT/2026/WK-37/REV-4',
      '',
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'SAMAY_Weekly_Corridor_Schedule_W37.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-xs animate-fadeIn select-none">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/60 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-slate-100/60 dark:from-amber-500/15 dark:via-slate-900/90 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-900 dark:text-slate-100 font-bold text-sm sm:text-base tracking-tight font-sans">
                  OFFICIAL CORRIDOR POSSESSION GAZETTE
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-mono text-[9px] font-black uppercase tracking-wider">
                  COMMITTED
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Gazette Ref: NR/MB/OPT/2026/WK-37/REV-4 · Week 37 (09 Sep – 15 Sep 2026)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {downloadSuccess && (
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" /> CSV Exported
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/80 dark:bg-slate-950/80 space-y-4 text-slate-900">
          {/* Paper Sheet Container (High Contrast IR Document) */}
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/90 dark:border-slate-800 font-sans space-y-5 transition-colors">
            {/* Masthead Header */}
            <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="text-[10px] font-mono font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                  GOVERNMENT OF INDIA · MINISTRY OF RAILWAYS
                </div>
                <h1 className="text-lg md:text-xl font-black tracking-tight text-slate-950 dark:text-white uppercase mt-0.5">
                  NORTHERN RAILWAY · MORADABAD DIVISION
                </h1>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Office of the Senior Divisional Operations Manager (Central Corridor Control)
                </p>
              </div>

              <div className="text-right font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-0.5 self-end md:self-auto">
                <div className="font-bold text-slate-950 dark:text-slate-100">GAZETTE: NR/MB/OPT/WK37</div>
                <div>DISPATCH DATE: 09-SEP-2026</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">HORIZON: 7 CALENDAR DAYS</div>
              </div>
            </div>

            {/* Document Subtitle & KPI Ribbon */}
            <div className="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 uppercase">SUBJECT: </span>
                <span className="text-slate-600 dark:text-slate-300 font-sans">
                  Approved Weekly Coordinated Maintenance Corridor Possessions (CP-SAT Solved)
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                  <strong>7</strong> BLOCKS
                </span>
                <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                  <strong>24.5</strong> HRS
                </span>
                <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold">
                  <strong>4</strong> BUNDLED (57%)
                </span>
              </div>
            </div>

            {/* Table of Scheduled Blocks */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 dark:bg-slate-950 text-white font-mono text-[10px] uppercase tracking-wider">
                    <th className="p-3 border-b border-slate-700">ID</th>
                    <th className="p-3 border-b border-slate-700">Day / Date</th>
                    <th className="p-3 border-b border-slate-700">Time Window</th>
                    <th className="p-3 border-b border-slate-700">Section Limits</th>
                    <th className="p-3 border-b border-slate-700">Track</th>
                    <th className="p-3 border-b border-slate-700">Lead Dept</th>
                    <th className="p-3 border-b border-slate-700">Bundled</th>
                    <th className="p-3 border-b border-slate-700">Plant / Machinery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
                  {SCHEDULE_DATA.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/70 dark:bg-slate-900/60'} hover:bg-slate-100/70 dark:hover:bg-slate-800/50`}
                    >
                      <td className="p-3 font-bold text-amber-600 dark:text-amber-400">
                        {row.id}
                      </td>
                      <td className="p-3 text-slate-800 dark:text-slate-200 font-semibold whitespace-nowrap">
                        {row.day}
                      </td>
                      <td className="p-3 text-slate-900 dark:text-slate-100 font-bold whitespace-nowrap">
                        {row.window}
                      </td>
                      <td className="p-3 text-slate-800 dark:text-slate-200 font-sans text-xs">
                        {row.section}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 whitespace-nowrap font-sans text-xs">
                        {row.track}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                        {row.leadDept}
                      </td>
                      <td className="p-3">
                        {row.bundled !== '— (Single Dept)' ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                            {row.bundled}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">{row.bundled}</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-sans text-xs">
                        {row.plant}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legal Footnote & Digital Signatures */}
            <div className="pt-4 border-t-2 border-slate-900 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 text-xs font-mono">
              <div className="space-y-1 text-slate-500 dark:text-slate-400 text-[10px]">
                <p>1. Station Masters & Section Controllers must enforce OHE power cutoff prior to block start.</p>
                <p>2. Joint clearance memo required from all involved SSEs before cancellation of speed limits.</p>
                <p>3. Auto-dispatched by S.A.M.A.Y CP-SAT Engine (Constraint Satisfaction Solver v9.8).</p>
              </div>

              <div className="border border-slate-300 dark:border-slate-700 p-3.5 rounded-xl text-right space-y-1 bg-slate-50 dark:bg-slate-950/80 min-w-[240px]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  ELECTRONICALLY SIGNED BY:
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  Shri Vikramaditya Sen, IRTS
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">
                  Chief Corridor Controller & Joint Director (Planning)
                </div>
                <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                  SHA-256 HASH: 8F7A-92E1-4B3C-09D7-COMMITTED
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-5 py-4 bg-white dark:bg-slate-950/90 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between font-mono">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Ready for Division Gazette Circulation · PDF / CSV Formats
          </div>

          <div className="flex items-center space-x-3 ml-auto">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Download CSV Sheet</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

