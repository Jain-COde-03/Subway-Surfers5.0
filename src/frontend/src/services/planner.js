import api from './api';

/**
 * Run the CP-SAT Corridor Optimization solver.
 * Dynamically clusters active defects into multi-department bundled blocks.
 */
export async function optimizeSchedule() {
  const response = await api.post('/api/v1/optimize');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('railway_data_updated', { detail: { type: 'schedule_optimized' } }));
  }
  return response.data;
}

/**
 * Trigger weekly corridor optimization.
 * Note: POST /generate-plan on the locked backend has an internal AttributeError (database.save_blocks).
 * If /generate-plan fails, this automatically routes through the operational CP-SAT solver POST /api/v1/optimize.
 */
export async function generatePlan() {
  try {
    const response = await api.post('/generate-plan');
    if (response.data && response.data.status === 'success') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('railway_data_updated', { detail: { type: 'schedule_optimized' } }));
      }
      return response.data;
    }
  } catch (err) {
    console.warn('[Backend Gap Note] /generate-plan failed, falling back to /api/v1/optimize:', err.message);
  }
  // Operational solver route
  return optimizeSchedule();
}

/**
 * Fetch blocks from the database
 * @param {string} department
 * @param {string} status - 'Confirmed', 'pending_approval', 'all'
 */
export async function getBlocks(department = null, status = 'all') {
  const params = {};
  if (department) params.dept = department;
  if (status) params.status = status;
  const response = await api.get('/api/v1/blocks', { params });
  return response.data;
}

/**
 * Approve a proposed maintenance block
 * @param {string} blockId
 * @param {Object} [blockData]
 */
export async function approveBlock(blockId, blockData = null) {
  const response = await api.put(`/api/v1/blocks/${encodeURIComponent(blockId)}/approve`, blockData || {});
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('railway_data_updated', { detail: { type: 'block_approved', blockId } }));
    window.dispatchEvent(new CustomEvent('samay_schedule_updated', { detail: { type: 'block_approved', blockId } }));
    try {
      localStorage.setItem('railway_last_schedule_sync', Date.now().toString());
    } catch (e) {}
  }
  return response.data;
}

/**
 * Reject a proposed maintenance block
 * @param {string} blockId
 * @param {string} reason
 */
export async function rejectBlock(blockId, reason = '') {
  const response = await api.put(`/api/v1/blocks/${encodeURIComponent(blockId)}/reject`, null, {
    params: { reason },
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('railway_data_updated', { detail: { type: 'block_rejected', blockId } }));
    window.dispatchEvent(new CustomEvent('samay_schedule_updated', { detail: { type: 'block_rejected', blockId } }));
    try {
      localStorage.setItem('railway_last_schedule_sync', Date.now().toString());
    } catch (e) {}
  }
  return response.data;
}

/**
 * Commit all approved proposals to the Gazette Horizon / Confirmed Master Timetable
 * @param {Array} [proposals]
 */
export async function commitAllProposals(proposals = null) {
  const response = await api.post('/api/v1/blocks/commit-all', proposals ? { proposals } : {});
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('railway_data_updated', { detail: { type: 'blocks_committed' } }));
    window.dispatchEvent(new CustomEvent('samay_schedule_updated', { detail: { type: 'blocks_committed' } }));
    try {
      localStorage.setItem('railway_last_schedule_sync', Date.now().toString());
    } catch (e) {}
  }
  return response.data;
}


