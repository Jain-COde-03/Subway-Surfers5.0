/**
 * S.A.M.A.Y — API Service Layer
 * All functions now call the real FastAPI backend at /api/v1/*.
 * The Vite dev-server proxy forwards these to http://localhost:8000.
 *
 * Falls back to a minimal hardcoded set only if the backend is unreachable,
 * so the UI never shows a blank crash during demos.
 */

const BASE = '/api/v1';

// ─── tiny helpers ────────────────────────────────────────────────────────────

/**
 * Normalizes frontend department names to the query param the backend expects.
 * Backend _resolve_dept_key() handles the actual DB mapping.
 */
function resolveDeptParam(dept) {
  if (!dept) return 'Civil';
  const l = dept.toLowerCase();
  if (l.includes('signal') || l.includes('smms') || l.includes('s&t')) return 'Signal';
  if (l.includes('elect') || l.includes('tdms') || l.includes('trd') || l.includes('traction')) return 'Electrical';
  return 'Civil';
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',  // send httpOnly cookie with every request
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

// ─── fallback data (used only when backend is down) ──────────────────────────

const FALLBACK = {
  tasks: [],
  blocks: [],
  notifications: [],
  resources: [],
  kpis: { activeBacklog: 0, awaitingApproval: 0, confirmedBlockHours: 0, resourceUtilizationPct: 0 },
};

// ─── exported API functions ───────────────────────────────────────────────────

/**
 * GET /api/v1/tasks?dept={department}
 */
export async function getDepartmentTasks(department) {
  const dept = resolveDeptParam(department);
  try {
    return await apiFetch(`${BASE}/tasks?dept=${encodeURIComponent(dept)}`);
  } catch (err) {
    console.error('[getDepartmentTasks]', err);
    return FALLBACK.tasks;
  }
}

/**
 * GET /api/v1/blocks?dept={department}&status=Confirmed
 */
export async function getConfirmedBlocks(department) {
  const dept = resolveDeptParam(department);
  try {
    return await apiFetch(`${BASE}/blocks?dept=${encodeURIComponent(dept)}&status=Confirmed`);
  } catch (err) {
    console.error('[getConfirmedBlocks]', err);
    return FALLBACK.blocks;
  }
}

/**
 * GET /api/v1/notifications?dept={department}
 */
export async function getDepartmentNotifications(department) {
  const dept = resolveDeptParam(department);
  try {
    return await apiFetch(`${BASE}/notifications?dept=${encodeURIComponent(dept)}`);
  } catch (err) {
    console.error('[getDepartmentNotifications]', err);
    return FALLBACK.notifications;
  }
}

/**
 * GET /api/v1/resources?dept={department}
 */
export async function getDepartmentResources(department) {
  const dept = resolveDeptParam(department);
  try {
    return await apiFetch(`${BASE}/resources?dept=${encodeURIComponent(dept)}`);
  } catch (err) {
    console.error('[getDepartmentResources]', err);
    return FALLBACK.resources;
  }
}

/**
 * GET /api/v1/kpis?dept={department}
 */
export async function getDepartmentKpis(department) {
  const dept = resolveDeptParam(department);
  try {
    return await apiFetch(`${BASE}/kpis?dept=${encodeURIComponent(dept)}`);
  } catch (err) {
    console.error('[getDepartmentKpis]', err);
    return FALLBACK.kpis;
  }
}

/**
 * POST /api/v1/score
 * Submits a defect, gets an AI priority score back, and the backend persists it.
 *
 * The defect form passes a rich payload; we map it to what the score endpoint needs.
 */
export async function postDefect(defectPayload) {
  try {
    const body = {
      asset_type: defectPayload.category || defectPayload.assetCategory || defectPayload.assetType || 'Track & Permanent Way (P-Way)',
      department: defectPayload.department || 'Civil',
      section: defectPayload.section || '',
      defect_type: defectPayload.defectType || '',
      asset: defectPayload.asset || defectPayload.specificMarker || '',
      speed_drop: Number(defectPayload.speedRestriction || defectPayload.speed_drop || 0),
      days_overdue: Number(defectPayload.daysOverdue || defectPayload.days_overdue || 0),
      repeat_incidents: Number(defectPayload.repeatDefectCount || defectPayload.repeat_incidents || 0),
      detailed_description: defectPayload.detailedDescription || '',
      target_date: defectPayload.targetDate || '',
      possession_window: Number(defectPayload.possessionWindow || 2.0),
    };

    const result = await apiFetch(`${BASE}/score`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Shape the response to match what DepartmentDashboard.jsx expects
    return {
      id: result.task_id || `TSK-LIVE-${Math.floor(Math.random() * 9000 + 1000)}`,
      asset: defectPayload.asset || defectPayload.assetType || 'New Asset',
      defectType: defectPayload.defectType || 'Live Submission',
      priorityScore: result.predicted_priority ?? 0,
      status: 'Awaiting Approval',
      section: defectPayload.section || '',
      department: defectPayload.department || 'Civil',
      assetType: defectPayload.category || defectPayload.assetCategory || defectPayload.assetType || '',
      daysOverdue: Number(defectPayload.daysOverdue || 0),
      repeatDefectCount: Number(defectPayload.repeatDefectCount || 0),
      safetyRiskLevel: defectPayload.safetyRiskLevel || '',
      detailedDescription: defectPayload.detailedDescription || '',
      targetDate: defectPayload.targetDate || '',
      possessionWindow: defectPayload.possessionWindow || '',
    };
  } catch (err) {
    console.error('[postDefect]', err);
    throw err;
  }
}
