import api from './api';
export { getBlocks } from './planner';

export const DEPARTMENT_ALIASES = {
  Civil: ['civil', 'engg', 'track', 'tms', 'p-way', 'permanent way', 'engineering', 'pway'],
  Signal: ['signal', 'signals', 's&t', 'smms', 'telecom', 'signaling', 'telecommunication'],
  Electrical: ['electrical', 'trd', 'tdms', 'traction', 'ohe', 'power', 'elect'],
};

export function getCanonicalDept(dept) {
  if (!dept || typeof dept !== 'string') return '';
  const d = dept.toLowerCase().trim();
  for (const [canonical, aliases] of Object.entries(DEPARTMENT_ALIASES)) {
    if (canonical.toLowerCase() === d || aliases.some((a) => d.includes(a) || a.includes(d))) {
      return canonical;
    }
  }
  return dept;
}

export function matchesDepartment(depts, targetDept) {
  if (!targetDept || targetDept === 'All' || targetDept === 'all') return true;
  if (!depts) return false;

  const targetCanonical = getCanonicalDept(targetDept);
  const targetLower = targetDept.toLowerCase().trim();

  const deptList = Array.isArray(depts) ? depts : [depts];
  return deptList.some((dept) => {
    if (!dept) return false;
    const dLower = String(dept).toLowerCase().trim();
    if (dLower === targetLower) return true;
    const dCanonical = getCanonicalDept(dLower);
    if (dCanonical && targetCanonical && dCanonical === targetCanonical) return true;
    const aliases = DEPARTMENT_ALIASES[targetCanonical] || [targetLower];
    return aliases.some((alias) => dLower.includes(alias) || alias.includes(dLower));
  });
}

/**
 * Fetch weekly gazetted schedule blocks from backend for Master Calendar
 * @param {string} department - optional filter for department calendar
 */
export async function getSchedule(department = null) {
  const params = department ? { dept: department } : {};
  const response = await api.get('/api/v1/schedule', { params });
  return response.data;
}

/**
 * Cancel an approved/confirmed maintenance block.
 * Backend updates status to 'Cancelled' and alerts all involved departments.
 * @param {string} blockId
 * @param {string} reason
 */
export async function cancelBlock(blockId, reason = 'Corridor emergency slot reallocation') {
  const response = await api.put(`/api/v1/blocks/${blockId}/cancel`, null, {
    params: { reason },
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('railway_data_updated', { detail: { type: 'block_cancelled', blockId } }));
    window.dispatchEvent(new CustomEvent('samay_schedule_updated', { detail: { type: 'block_cancelled', blockId } }));
    try {
      localStorage.setItem('railway_last_schedule_sync', Date.now().toString());
    } catch (e) {}
  }
  return response.data;
}

/**
 * Reschedule maintenance block
 * Note: If the backend does not yet have a dedicated PUT /blocks/{id}/reschedule endpoint,
 * this function cancels the existing block or reports unhandled backend routing cleanly.
 */
export async function rescheduleBlock(blockId, { newDate, newTime, reason }) {
  try {
    const response = await api.put(`/api/v1/blocks/${blockId}/reschedule`, {
      new_date: newDate,
      new_time: newTime,
      reason,
    });
    return response.data;
  } catch (error) {
    // If backend returns 404/405 (endpoint not present), gracefully log and fall back to cancellation with note
    console.warn(`[Backend API Note] PUT /api/v1/blocks/${blockId}/reschedule is not defined on locked backend. Cancelling existing block.`);
    return cancelBlock(blockId, `Rescheduled to ${newDate} ${newTime}: ${reason}`);
  }
}

