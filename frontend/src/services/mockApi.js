/**
 * S.A.M.A.Y — Mock API Service Layer
 * Simulates backend REST endpoints with asynchronous delays (600-800ms).
 *
 * REAL API NOTE:
 * When FastAPI backend endpoints are live, swap the contents of these functions
 * with real fetch() or axios calls to `/api/v1/...` as indicated in the comments.
 */

// Simulated In-Memory Database scoped by Department
const MOCK_DB = {
  Civil: {
    tasks: [
      {
        id: 'TSK-TRK-101',
        asset: 'Track Km 142/8-12 (Delhi-Kanpur UP)',
        defectType: 'Track Geometry - Twist (3.8 mm/m)',
        priorityScore: 94.5,
        status: 'Confirmed',
      },
      {
        id: 'TSK-TRK-102',
        asset: 'Turnout #24B (Ghaziabad Yard Approach)',
        defectType: 'Switch Rail Head Wear (6.2 mm)',
        priorityScore: 88.2,
        status: 'Awaiting Admin Approval',
      },
      {
        id: 'TSK-TRK-103',
        asset: 'Bridge #88 Approach (Yamuna Bridge Dn)',
        defectType: 'Ballast Cushion Deficiency (-120mm)',
        priorityScore: 72.0,
        status: 'Pending Scoring',
      },
      {
        id: 'TSK-TRK-104',
        asset: 'Track Km 88/14 (Ambala-Saharanpur Single)',
        defectType: 'USFD Rail Flaw - Transverse Fatigue',
        priorityScore: 96.1,
        status: 'Rejected',
      },
      {
        id: 'TSK-TRK-105',
        asset: 'Track Km 210/4 (Aligarh Jn Main)',
        defectType: 'Gauge Deviation (+14mm deviation)',
        priorityScore: 68.4,
        status: 'Confirmed',
      },
    ],
    blocks: [
      {
        id: 'BLK-CR-401',
        track: 'Delhi - Kanpur UP Main (Km 140-146)',
        startTime: '2026-09-08T01:30:00',
        endTime: '2026-09-08T05:00:00',
        isBundled: true,
        associatedTasks: ['TSK-TRK-101'],
        bundledWith: ['Signal & Telecom (SMMS)', 'Electrical TRD (TDMS)'],
      },
      {
        id: 'BLK-CR-402',
        track: 'Ghaziabad - Meerut Dn Single (Km 22-26)',
        startTime: '2026-09-10T02:00:00',
        endTime: '2026-09-10T04:30:00',
        isBundled: false,
        associatedTasks: ['TSK-TRK-102'],
      },
      {
        id: 'BLK-CR-403',
        track: 'Tilak Bridge - Hazrat Nizamuddin 3rd Line',
        startTime: '2026-09-12T00:30:00',
        endTime: '2026-09-12T04:00:00',
        isBundled: true,
        associatedTasks: ['TSK-TRK-105'],
        bundledWith: ['Signal & Telecom (SMMS)'],
      },
      {
        id: 'BLK-CR-404',
        track: 'Ambala Cantt - Saharanpur Dn Track',
        startTime: '2026-09-13T01:00:00',
        endTime: '2026-09-13T04:30:00',
        isBundled: false,
        associatedTasks: [],
      },
    ],
    notifications: [
      {
        id: 'NOTIF-01',
        timestamp: '12m ago',
        message: 'Corridor Block for Km 142/8-12 confirmed by Central Operations (01:30 - 05:00 hrs).',
        type: 'approval',
      },
      {
        id: 'NOTIF-02',
        timestamp: '38m ago',
        message: 'Shared Corridor Block BLK-CR-401 gazetted for Tuesday: Bundled with SMMS & TDMS.',
        type: 'schedule',
      },
      {
        id: 'NOTIF-03',
        timestamp: '2h ago',
        message: 'Defect TSK-TRK-104 rejected: Insufficient machine slot on Ambala line. Modify work method and resubmit.',
        type: 'rejection',
      },
      {
        id: 'NOTIF-04',
        timestamp: '4h ago',
        message: 'AI Solver completed TGI re-scoring for Moradabad Division section 4.',
        type: 'schedule',
      },
    ],
    kpis: {
      activeBacklog: 14,
      awaitingApproval: 5,
      confirmedBlockHours: 18.5,
      resourceUtilizationPct: 84,
    },
    resources: [
      { label: 'Crane / Heavy Track Machines', percent: 78 },
      { label: 'P-Way Maintenance Gangs', percent: 88 },
      { label: 'Tamping Unit Fleet (CSM 09-32)', percent: 24 }, // Capacity warning (< 30%)
      { label: 'Ballast Regulators & Hoppers', percent: 65 },
    ],
  },
  Signal: {
    tasks: [
      {
        id: 'TSK-SIG-201',
        asset: 'Point Machine #104A (Ghaziabad West)',
        defectType: 'Point Machine Stalling Current (5.8A)',
        priorityScore: 92.4,
        status: 'Confirmed',
      },
      {
        id: 'TSK-SIG-202',
        asset: 'Axle Counter 34B (Sahibabad Outer)',
        defectType: 'Intermittent Reset Failure / Count Drift',
        priorityScore: 86.0,
        status: 'Awaiting Admin Approval',
      },
      {
        id: 'TSK-SIG-203',
        asset: 'Track Circuit TC-12 (Tilak Bridge)',
        defectType: 'Ballast Resistance Drop (< 2.0 ohm/km)',
        priorityScore: 78.5,
        status: 'Pending Scoring',
      },
      {
        id: 'TSK-SIG-204',
        asset: 'Automatic Signal S-42 (Anand Vihar)',
        defectType: 'Lamp Proving Relay (ECR) Chatter',
        priorityScore: 91.0,
        status: 'Rejected',
      },
    ],
    blocks: [
      {
        id: 'BLK-SIG-501',
        track: 'Ghaziabad West Yard Interlocking Zone',
        startTime: '2026-09-08T01:30:00',
        endTime: '2026-09-08T05:00:00',
        isBundled: true,
        associatedTasks: ['TSK-SIG-201'],
        bundledWith: ['Civil (TMS)', 'Electrical (TDMS)'],
      },
    ],
    notifications: [
      {
        id: 'NOTIF-SIG-1',
        timestamp: '18m ago',
        message: 'Point Machine #104A joint block approved for Tuesday night.',
        type: 'approval',
      },
      {
        id: 'NOTIF-SIG-2',
        timestamp: '1h ago',
        message: 'Signal S-42 block rejected: Overlaps with Vande Bharat Express slot.',
        type: 'rejection',
      },
    ],
    kpis: {
      activeBacklog: 8,
      awaitingApproval: 3,
      confirmedBlockHours: 12.0,
      resourceUtilizationPct: 76,
    },
    resources: [
      { label: 'S&T Inspection Teams', percent: 82 },
      { label: 'Relay Testing Kits', percent: 70 },
      { label: 'Emergency Signal Vans', percent: 28 }, // Capacity warning (< 30%)
      { label: 'Cable Jointing Crews', percent: 60 },
    ],
  },
  Electrical: {
    tasks: [
      {
        id: 'TSK-ELC-301',
        asset: 'OHE Catenary Mast 142/18 (Delhi-Aligarh)',
        defectType: 'Contact Wire Wear (< 74 mm² cross-section)',
        priorityScore: 95.0,
        status: 'Confirmed',
      },
      {
        id: 'TSK-ELC-302',
        asset: 'Traction Substation TSS-04 (Khurja)',
        defectType: 'Circuit Breaker Gas Pressure Drop (SF6)',
        priorityScore: 84.5,
        status: 'Awaiting Admin Approval',
      },
      {
        id: 'TSK-ELC-303',
        asset: 'Section Insulator SI-12 (Palwal South)',
        defectType: 'Runner Alignment Stagger (120mm)',
        priorityScore: 71.0,
        status: 'Pending Scoring',
      },
      {
        id: 'TSK-ELC-304',
        asset: 'Tower Wagon Track Km 92/2',
        defectType: 'Dropper Broken / Neutral Section Spark',
        priorityScore: 93.2,
        status: 'Rejected',
      },
    ],
    blocks: [
      {
        id: 'BLK-ELC-601',
        track: 'Delhi - Aligarh Power Isolation Zone (Km 140-146)',
        startTime: '2026-09-08T01:30:00',
        endTime: '2026-09-08T05:00:00',
        isBundled: true,
        associatedTasks: ['TSK-ELC-301'],
        bundledWith: ['Civil (TMS)', 'Signal (SMMS)'],
      },
    ],
    notifications: [
      {
        id: 'NOTIF-ELC-1',
        timestamp: '25m ago',
        message: '25kV Traction Power Block confirmed for Sector 142 on Tuesday.',
        type: 'approval',
      },
      {
        id: 'NOTIF-ELC-2',
        timestamp: '3h ago',
        message: 'Tower Wagon schedule rescheduled to 02:00 hrs.',
        type: 'schedule',
      },
    ],
    kpis: {
      activeBacklog: 11,
      awaitingApproval: 4,
      confirmedBlockHours: 16.0,
      resourceUtilizationPct: 80,
    },
    resources: [
      { label: '8-Wheeler Tower Wagons', percent: 85 },
      { label: 'TRD OHE Linemen Gangs', percent: 90 },
      { label: 'Earth Discharge Rod Sets', percent: 22 }, // Capacity warning (< 30%)
      { label: 'Catenary Tensioning Winches', percent: 55 },
    ],
  },
};

/**
 * Normalizes input department string to recognized store key.
 */
function resolveDeptKey(dept) {
  if (!dept) return 'Civil';
  const lower = dept.toLowerCase();
  if (lower.includes('civil') || lower.includes('track') || lower.includes('tms') || lower.includes('p-way')) {
    return 'Civil';
  }
  if (lower.includes('signal') || lower.includes('smms') || lower.includes('s&t') || lower.includes('telecom')) {
    return 'Signal';
  }
  if (lower.includes('elect') || lower.includes('tdms') || lower.includes('trd') || lower.includes('traction')) {
    return 'Electrical';
  }
  return 'Civil';
}

const delay = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GET /api/v1/tasks?dept={department}
 * Fetches all maintenance tasks scoped to the authenticated department.
 */
export async function getDepartmentTasks(department) {
  // -------------------------------------------------------------
  // REAL API SWAP:
  // const res = await fetch(`/api/v1/tasks?dept=${encodeURIComponent(department)}`);
  // if (!res.ok) throw new Error(`Tasks API error: ${res.statusText}`);
  // return await res.json();
  // -------------------------------------------------------------
  await delay(650);
  const key = resolveDeptKey(department);
  const data = MOCK_DB[key]?.tasks || MOCK_DB.Civil.tasks;
  return JSON.parse(JSON.stringify(data));
}

/**
 * GET /api/v1/blocks?dept={department}&status=Confirmed
 * Fetches confirmed corridor maintenance blocks for this department.
 */
export async function getConfirmedBlocks(department) {
  // -------------------------------------------------------------
  // REAL API SWAP:
  // const res = await fetch(`/api/v1/blocks?dept=${encodeURIComponent(department)}&status=Confirmed`);
  // if (!res.ok) throw new Error(`Blocks API error: ${res.statusText}`);
  // return await res.json();
  // -------------------------------------------------------------
  await delay(700);
  const key = resolveDeptKey(department);
  const data = MOCK_DB[key]?.blocks || MOCK_DB.Civil.blocks;
  return JSON.parse(JSON.stringify(data));
}

/**
 * GET /api/v1/notifications?dept={department}
 * Fetches real-time notifications for the department feed.
 */
export async function getDepartmentNotifications(department) {
  // -------------------------------------------------------------
  // REAL API SWAP:
  // const res = await fetch(`/api/v1/notifications?dept=${encodeURIComponent(department)}`);
  // if (!res.ok) throw new Error(`Notifications API error: ${res.statusText}`);
  // return await res.json();
  // -------------------------------------------------------------
  await delay(500);
  const key = resolveDeptKey(department);
  const data = MOCK_DB[key]?.notifications || MOCK_DB.Civil.notifications;
  return JSON.parse(JSON.stringify(data));
}

/**
 * GET /api/v1/resources?dept={department}
 * Fetches resource capacity and utilization metrics.
 */
export async function getDepartmentResources(department) {
  // -------------------------------------------------------------
  // REAL API SWAP:
  // const res = await fetch(`/api/v1/resources?dept=${encodeURIComponent(department)}`);
  // if (!res.ok) throw new Error(`Resources API error: ${res.statusText}`);
  // return await res.json();
  // -------------------------------------------------------------
  await delay(600);
  const key = resolveDeptKey(department);
  const data = MOCK_DB[key]?.resources || MOCK_DB.Civil.resources;
  return JSON.parse(JSON.stringify(data));
}

/**
 * GET Department KPIs summary
 */
export async function getDepartmentKpis(department) {
  await delay(550);
  const key = resolveDeptKey(department);
  const data = MOCK_DB[key]?.kpis || MOCK_DB.Civil.kpis;
  return JSON.parse(JSON.stringify(data));
}

/**
 * POST /api/v1/defects
 * Submits a new or updated defect. Resolves with a Task object having status 'Pending Scoring'.
 */
export async function postDefect(defectPayload) {
  // -------------------------------------------------------------
  // REAL API SWAP:
  // const res = await fetch('/api/v1/defects', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(defectPayload),
  // });
  // if (!res.ok) throw new Error(`Defect submission failed: ${res.statusText}`);
  // return await res.json();
  // -------------------------------------------------------------
  await delay(800);

  const key = resolveDeptKey(defectPayload.department);
  const store = MOCK_DB[key] || MOCK_DB.Civil;

  // Compute realistic priority score from severity or TGI input
  const rawScore = Number(defectPayload.severity) || 75;
  const computedPriority = Math.min(99.4, Math.max(45.0, rawScore * 0.95 + (Math.random() * 4 - 2)));

  const newTask = {
    id: defectPayload.id || `TSK-${key.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    asset: defectPayload.asset || 'Track Km 108/12 - 110/0',
    defectType: defectPayload.defectType || 'General Wear & Tear',
    priorityScore: parseFloat(computedPriority.toFixed(1)),
    status: 'Pending Scoring',
    section: defectPayload.section,
    trackClassification: defectPayload.trackClassification,
    detailedDescription: defectPayload.detailedDescription,
    speedRestriction: defectPayload.speedRestriction,
    safetyRiskLevel: defectPayload.safetyRiskLevel,
    daysOverdue: defectPayload.daysOverdue,
    repeatDefectCount: defectPayload.repeatDefectCount,
    possessionWindow: defectPayload.possessionWindow,
    targetDate: defectPayload.targetDate,
  };

  // If editing an existing task, replace it in store
  const existingIdx = store.tasks.findIndex((t) => t.id === newTask.id);
  if (existingIdx >= 0) {
    store.tasks[existingIdx] = newTask;
  } else {
    store.tasks.unshift(newTask);
    if (store.kpis) {
      store.kpis.activeBacklog += 1;
    }
  }

  // Also push a live notification into feed
  store.notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    timestamp: 'Just now',
    message: `Defect ${newTask.id} submitted for AI scoring: ${newTask.defectType} (${newTask.asset})`,
    type: 'schedule',
  });

  return JSON.parse(JSON.stringify(newTask));
}

