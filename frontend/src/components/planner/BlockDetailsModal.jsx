import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Layers,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { approveBlock, rejectBlock } from '../../services/planner';
import { cancelBlock } from '../../services/calendar';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function BlockDetailsModal({ block, isOpen, onClose, onBlockUpdated }) {
  if (!isOpen || !block) return null;

  const { currentUser, isAdmin } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Corridor slot contention with freight rakes');

  const bId = block.id || block.bundle_id || 'Block #17';
  const utilization = Math.round(block.utilization || (block.priorityScore ? Math.min(98, block.priorityScore * 0.95) : 92));
  const tasksMerged = block.tasksMerged || (block.constituentTasks ? block.constituentTasks.length : 3);
  const hoursSaved = block.hoursSaved || 1.8;

  const userDeptKey = currentUser?.deptKey || 'Civil';
  const depts = block.departments || block.depts || ['Civil'];
  const userDeptGranted = !isAdmin && depts.some((d) => d.toLowerCase().includes(userDeptKey.toLowerCase()));

  // Department pill helper
  const renderDeptBadge = (dept) => {
    const d = (dept || '').toLowerCase();
    if (d.includes('elect') || d.includes('trd')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
          Electrical
        </span>
      );
    }
    if (d.includes('sig') || d.includes('smms')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-700">
          Signal
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700">
        Civil
      </span>
    );
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveBlock(bId, block);
      success(`${bId} approved and scheduled on Master Calendar`);
      onBlockUpdated && onBlockUpdated(bId, 'Confirmed');
      onClose();
    } catch (err) {
      error('Failed to approve block');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await cancelBlock(bId, cancelReason);
      success(`${bId} cancelled and affected departments notified`);
      onBlockUpdated && onBlockUpdated(bId, 'Cancelled');
      setShowCancelModal(false);
      onClose();
    } catch (err) {
      error('Failed to cancel block');
    } finally {
      setLoading(false);
    }
  };

  // Constituent Tasks display
  const constituentTasks = block.constituentTasks && block.constituentTasks.length > 0
    ? block.constituentTasks
    : [
        { dept: 'Electrical', title: 'OHE Insulator Replacement', priorityScore: 91 },
        { dept: 'Civil', title: 'Drainage Inspection', priorityScore: 74 },
        { dept: 'Signal', title: 'Cable Inspection', priorityScore: 68 },
      ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header Bar matching reference image */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">Optimized Block Details</h2>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            {/* Title Row with Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{bId}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {block.status === 'Cancelled' ? 'Cancelled' : 'Approved'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-800">
                  {utilization}% Utilization
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {tasksMerged} tasks merged
                </span>
              </div>
            </div>

            {/* Location & Time */}
            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 font-medium">
              <span>{block.location || block.track || 'Track A · Section 4'}</span>
              <span>•</span>
              <span>
                {block.startTime
                  ? `${block.startTime.slice(11, 16)} - ${block.endTime ? block.endTime.slice(11, 16) : '14:00'}`
                  : '10:00 AM - 2:00 PM'}
              </span>
            </div>

            {/* Department Possession Allocation Banner */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Possession Granted To:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {depts.map((d, dIdx) => (
                    <span key={dIdx}>
                      {renderDeptBadge(d)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Clearance Status for Department User */}
              {!isAdmin && (
                userDeptGranted ? (
                  <div className="p-3 rounded-lg bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                        Clearance Granted to Your Department ({userDeptKey})
                      </span>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                        Your maintenance team has authorized track possession in this proposed window. Constituent tasks will execute concurrently.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                        Allocated to {depts.join(', ')}
                      </span>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                        This corridor block is allocated to other departments. Your department does not have an active work order scheduled here.
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Maintenance Tasks section */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
                Maintenance Tasks
              </h4>
              <div className="space-y-2.5">
                {constituentTasks.map((t, idx) => {
                  const tDept = t.dept || t.department || 'Civil';
                  const isMyTask = !isAdmin && tDept.toLowerCase().includes(userDeptKey.toLowerCase());
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-colors ${
                        isMyTask
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-300/60'
                          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {renderDeptBadge(tDept)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {t.title || t.defectType || 'Maintenance Task'}
                            </span>
                            {isMyTask && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200">
                                Your Department
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {t.asset_id || t.asset || 'Asset #441'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                        <span>Priority</span>
                        <span className="font-bold text-red-600 dark:text-red-400">{Math.round(t.priorityScore || 85)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optimization Metrics Cards */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
                Optimization
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 text-center">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Bundled tasks</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
                    {tasksMerged}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 text-center">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Setup saved</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1 block">
                    {hoursSaved} hrs
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 text-center">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Block utilization</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {utilization}%
                  </span>
                </div>
              </div>
            </div>

            {/* Approved Note */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Approved by Admin</span>
              </div>
              <span>Approved: 09 Sep 2026, 09:42</span>
            </div>
          </div>

          {/* Action Footer Buttons matching reference image: Reschedule & Cancel Block */}
          {isAdmin && (
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3">
              {block.status === 'pending_approval' ? (
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Approve Proposal
                </button>
              ) : null}

              <button
                onClick={() => {
                  success('Reschedule dialog opened. Select new corridor slot on Calendar.');
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                Reschedule
              </button>

              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                Cancel Block
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Cancellation */}
      {showCancelModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cancel Maintenance Block</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This maintenance block contains <strong className="text-slate-900 dark:text-white">{tasksMerged} tasks</strong> from{' '}
              <strong className="text-slate-900 dark:text-white">{constituentTasks.length} departments</strong> (Electrical, Civil, Signal).
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cancellation Reason:
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

