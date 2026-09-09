"""
database.py

A minimal SQLite persistence layer, built to slot into your existing
pandas-heavy backend with as little new code as possible. Uses raw
sqlite3 + pandas.to_sql/read_sql_query rather than an ORM, since your
priority_model.py and optimizer.py already operate on DataFrames.

Import this in main.py and call init_db() once on startup.
"""

import sqlite3
import pandas as pd
import os

DB_PATH = os.getenv(
    "DB_PATH",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "railway.db"),
)


def get_connection():
    """Call this to get a connection whenever an endpoint needs to read/write."""
    return sqlite3.connect(DB_PATH)


def init_db():
    """
    Creates the tasks, blocks, and notifications tables if they don't
    already exist. Safe to call every time the app starts -- it won't
    wipe existing data.
    """
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            asset_id TEXT,
            department TEXT,
            section_id TEXT,
            division TEXT,
            asset_type TEXT,
            defect_type TEXT,
            defect_severity TEXT,
            days_overdue INTEGER,
            due_date TEXT,
            estimated_block_duration_hours REAL,
            repeat_defect_count INTEGER,
            sla_flag INTEGER,
            asset_criticality_class TEXT,
            safety_risk_flag INTEGER,
            priority_score REAL,
            status TEXT DEFAULT 'Pending Scoring',
            submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS blocks (
            id TEXT PRIMARY KEY,
            section_id TEXT,
            window_date TEXT,
            start_hour INTEGER,
            duration_hours REAL,
            is_bundled INTEGER,
            departments_bundled TEXT,
            associated_task_ids TEXT,
            summary TEXT,
            priority_score REAL,
            tasks_merged INTEGER,
            status TEXT DEFAULT 'Confirmed',
            generated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            department TEXT,
            message TEXT,
            type TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            department TEXT NOT NULL,
            label TEXT NOT NULL,
            percent INTEGER NOT NULL
        )
    """)

    # Safe migrations for blocks table
    for col, col_type in [("summary", "TEXT"), ("priority_score", "REAL"), ("tasks_merged", "INTEGER")]:
        try:
            cur.execute(f"ALTER TABLE blocks ADD COLUMN {col} {col_type}")
        except Exception:
            pass

    conn.commit()
    conn.close()





def seed_if_empty(unified_csv_path: str):
    """
    Call this once on startup, after init_db(). If the tasks table is
    empty, loads your existing unified_maintenance_dataset.csv into it so
    the demo starts populated instead of blank. If the table already has
    rows (e.g. from a previous run or live-submitted tasks), does nothing
    -- this prevents re-seeding from wiping real submissions.
    """
    conn = get_connection()
    existing_count = pd.read_sql_query("SELECT COUNT(*) as n FROM tasks", conn).iloc[0]["n"]

    if existing_count == 0 and os.path.exists(unified_csv_path):
        df = pd.read_csv(unified_csv_path)
        df["id"] = df["asset_id"]  # reuse asset_id as the primary key
        df["status"] = "Pending Scoring"
        # keep only columns that exist in the tasks table -- drops extras
        # like 'source_system' from the merge step, or 'corridor_name' etc.
        known_columns = [
            "id", "asset_id", "department", "section_id", "division", "asset_type",
            "defect_type", "defect_severity", "days_overdue", "due_date",
            "estimated_block_duration_hours", "repeat_defect_count", "sla_flag",
            "asset_criticality_class", "safety_risk_flag", "priority_score", "status",
        ]
        df = df[[c for c in known_columns if c in df.columns]]
        df.to_sql("tasks", conn, if_exists="append", index=False)
        print(f"Seeded {len(df)} tasks from {unified_csv_path}")
    else:
        print(f"Tasks table already has {existing_count} rows -- skipping seed")

    conn.close()


def get_tasks(department: str = None) -> pd.DataFrame:
    """Fetch tasks, optionally filtered by department. Supports department keyword aliases."""
    init_db()
    conn = get_connection()
    dept_keywords = []
    if department:
        d = str(department).upper()
        if d in ("ADMIN", "ALL", "CENTRAL OPERATIONS"):
            dept_keywords = []
        elif any(k in d for k in ("ENGG", "CIVIL", "TMS", "TRACK", "P-WAY")):
            dept_keywords = ["ENGG", "Civil", "Track", "TMS", "P-Way"]
        elif any(k in d for k in ("S&T", "SIGNAL", "SMMS", "TELECOM")):
            dept_keywords = ["S&T", "Signal", "SMMS", "Telecom"]
        elif any(k in d for k in ("TRD", "ELECTRICAL", "TDMS", "TRACTION", "ELECT")):
            dept_keywords = ["TRD", "Electrical", "TDMS", "Traction"]
        else:
            dept_keywords = [department]

    if dept_keywords:
        like_clauses = " OR ".join(["department LIKE ?" for _ in dept_keywords])
        params = [f"%{k}%" for k in dept_keywords]
        df = pd.read_sql_query(
            f"SELECT * FROM tasks WHERE ({like_clauses})",
            conn, params=tuple(params),
        )
    else:
        df = pd.read_sql_query("SELECT * FROM tasks", conn)
    conn.close()
    return df


def insert_task(task_row: dict):
    """Insert one new task submitted via the defect form. task_row keys must match the tasks table columns."""
    conn = get_connection()
    df = pd.DataFrame([task_row])
    df.to_sql("tasks", conn, if_exists="append", index=False)
    conn.close()


def update_task_scores(scored_df: pd.DataFrame):
    """
    After running the priority model, write the updated priority_score
    (and status, if changed) back to the tasks table. Expects scored_df
    to have an 'id' column matching existing rows.
    """
    conn = get_connection()
    cur = conn.cursor()
    for _, row in scored_df.iterrows():
        cur.execute(
            "UPDATE tasks SET priority_score = ?, status = ? WHERE id = ?",
            (row["priority_score"], row.get("status", "Awaiting Admin Approval"), row["id"]),
        )
    conn.commit()
    conn.close()


def insert_block(row: dict):
    """Insert or replace a single block in the database."""
    init_db()
    conn = get_connection()
    cur = conn.cursor()
    b_id = str(row.get("id") or row.get("bundle_id") or row.get("block_id") or "")
    sec = str(row.get("section_id") or row.get("location") or row.get("track") or "")
    w_date = str(row.get("window_date") or (row.get("startTime", "")[:10]) or "")
    s_hour = int(row.get("start_hour") or (int(row.get("startTime", "T02")[11:13]) if "T" in str(row.get("startTime", "")) else 2))
    dur = float(row.get("duration_hours") or row.get("window_hrs") or 3.0)
    is_b = 1 if row.get("is_bundled") or (row.get("departments") and len(row.get("departments")) > 1) else 0
    depts = row.get("departments_bundled") or row.get("departments") or row.get("depts") or ""
    if isinstance(depts, list):
        depts = ",".join(depts)
    depts = str(depts or "")
    tasks = row.get("associated_task_ids") or row.get("associatedTasks") or ""
    if isinstance(tasks, list):
        tasks = ",".join(tasks)
    tasks = str(tasks or "")
    summary = str(row.get("summary") or "")
    score = float(row.get("priority_score") or row.get("priorityScore") or 90.0)
    t_merged = int(row.get("tasks_merged") or row.get("tasksMerged") or (len(tasks.split(",")) if tasks else 1))
    stat = str(row.get("status") or "pending_approval")

    # If block is already Confirmed, Approved, Cancelled, or Rejected in database, preserve that status
    cur.execute("SELECT status FROM blocks WHERE id = ?", (b_id,))
    existing_row = cur.fetchone()
    if existing_row and existing_row[0] in ("Confirmed", "Approved", "Cancelled", "Rejected") and stat == "pending_approval":
        stat = existing_row[0]

    cur.execute("""
        INSERT OR REPLACE INTO blocks 
        (id, section_id, window_date, start_hour, duration_hours, is_bundled, departments_bundled, associated_task_ids, summary, priority_score, tasks_merged, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (b_id, sec, w_date, s_hour, dur, is_b, depts, tasks, summary, score, t_merged, stat))
    conn.commit()
    conn.close()


def get_blocks(department: str = None, status: str = "Confirmed") -> pd.DataFrame:
    init_db()
    conn = get_connection()
    
    if status is not None and not isinstance(status, str):
        try:
            status = str(status.default) if hasattr(status, "default") else str(status)
        except Exception:
            status = "Confirmed"

    if status and str(status).strip().lower() in ("all", "any", "none", "*"):
        status = None

    dept_keywords = []
    if department:
        d = str(department).upper()
        if d in ("ADMIN", "ALL", "CENTRAL OPERATIONS", "CENTRAL CONTROL & OPERATIONS"):
            dept_keywords = []
        elif any(k in d for k in ("ENGG", "CIVIL", "TMS", "TRACK", "P-WAY")):
            dept_keywords = ["Civil", "ENGG", "Track", "TMS", "P-Way"]
        elif any(k in d for k in ("S&T", "SIGNAL", "SMMS", "TELECOM")):
            dept_keywords = ["Signal", "S&T", "SMMS", "Telecom"]
        elif any(k in d for k in ("TRD", "ELECTRICAL", "TDMS", "TRACTION")):
            dept_keywords = ["Electrical", "TRD", "TDMS", "Traction"]
        else:
            dept_keywords = [department]

    is_confirmed_scope = status and str(status).strip().lower() in ("confirmed", "approved")

    if dept_keywords and status:
        like_clauses = " OR ".join(["departments_bundled LIKE ?" for _ in dept_keywords])
        if is_confirmed_scope:
            params = [f"%{k}%" for k in dept_keywords]
            df = pd.read_sql_query(
                f"SELECT * FROM blocks WHERE status IN ('Confirmed', 'Approved', 'confirmed', 'approved') AND ({like_clauses})",
                conn, params=tuple(params),
            )
        else:
            params = [status] + [f"%{k}%" for k in dept_keywords]
            df = pd.read_sql_query(
                f"SELECT * FROM blocks WHERE status = ? AND ({like_clauses})",
                conn, params=tuple(params),
            )
    elif dept_keywords:
        like_clauses = " OR ".join(["departments_bundled LIKE ?" for _ in dept_keywords])
        params = [f"%{k}%" for k in dept_keywords]
        df = pd.read_sql_query(
            f"SELECT * FROM blocks WHERE ({like_clauses})",
            conn, params=tuple(params),
        )
    elif status:
        if is_confirmed_scope:
            df = pd.read_sql_query("SELECT * FROM blocks WHERE status IN ('Confirmed', 'Approved', 'confirmed', 'approved')", conn)
        else:
            df = pd.read_sql_query("SELECT * FROM blocks WHERE status = ?", conn, params=(status,))
    else:
        df = pd.read_sql_query("SELECT * FROM blocks", conn)
    conn.close()
    return df


def update_task_status(task_id: str, new_status: str):
    """Updates the status of a specific task."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE tasks SET status = ? WHERE id = ?", (new_status, task_id))
    conn.commit()
    conn.close()


def update_block_status(block_id: str, new_status: str, block_data: dict = None):
    """Updates the status of a specific block and any associated tasks with flexible ID matching."""
    conn = get_connection()
    cur = conn.cursor()
    clean_id = str(block_id).replace("BLK-OPT-", "").replace("BLK-MST-", "").strip()
    cur.execute(
        """UPDATE blocks SET status = ? 
           WHERE id = ? 
              OR id = ? 
              OR id = ? 
              OR id = ?
              OR id LIKE ?""",
        (new_status, block_id, clean_id, f"BLK-OPT-{clean_id}", f"BLK-MST-{clean_id}", f"%{clean_id}%")
    )
    rows_updated = cur.rowcount
    
    # If block did not exist in database and is being approved/confirmed, insert it directly
    if rows_updated == 0 and new_status in ("Confirmed", "Approved", "confirmed", "approved"):
        conn.close()
        b_data = block_data or {}
        sec = b_data.get("section_id") or b_data.get("location") or b_data.get("track") or "Northern Railway Corridor"
        w_date = b_data.get("window_date") or b_data.get("date") or (str(b_data.get("startTime", ""))[:10]) or "2026-09-09"
        s_hour = b_data.get("start_hour") or b_data.get("startHour") or 2
        dur = b_data.get("duration_hours") or b_data.get("window_hrs") or b_data.get("duration") or 3.5
        depts = b_data.get("departments_bundled") or b_data.get("departments") or b_data.get("depts") or "Civil,Signal,Electrical"
        tasks = b_data.get("associated_task_ids") or b_data.get("associatedTasks") or ""
        summ = b_data.get("summary") or f"Confirmed Corridor Possession ({block_id})"
        score = float(b_data.get("priority_score") or b_data.get("priorityScore") or 95.0)
        
        insert_block({
            "id": block_id,
            "section_id": sec,
            "window_date": w_date,
            "start_hour": s_hour,
            "duration_hours": dur,
            "departments_bundled": depts,
            "associated_task_ids": tasks,
            "summary": summ,
            "priority_score": score,
            "status": "Confirmed",
        })
        conn = get_connection()
        cur = conn.cursor()

    # Also fetch associated tasks and update their status to reflect block status
    cur.execute(
        """SELECT associated_task_ids FROM blocks 
           WHERE id = ? OR id = ? OR id = ? OR id LIKE ? LIMIT 1""",
        (block_id, clean_id, f"BLK-OPT-{clean_id}", f"%{clean_id}%")
    )
    row = cur.fetchone()
    if row and row[0]:
        t_ids = [t.strip() for t in str(row[0]).split(",") if t.strip()]
        task_status_map = {
            "Confirmed": "Confirmed",
            "Approved": "Confirmed",
            "Rejected": "Rejected",
            "Cancelled": "Rejected",
        }
        target_task_stat = task_status_map.get(new_status, new_status)
        for t_id in t_ids:
            cur.execute("UPDATE tasks SET status = ? WHERE id = ? OR id LIKE ?", (target_task_stat, t_id, f"%{t_id}%"))

    conn.commit()
    conn.close()


def get_block_by_id(block_id: str):
    """Fetch a block by ID with robust prefix matching."""
    conn = get_connection()
    clean_id = str(block_id).replace("BLK-OPT-", "").replace("BLK-MST-", "").strip()
    df = pd.read_sql_query(
        """SELECT * FROM blocks 
           WHERE id = ? 
              OR id = ? 
              OR id = ? 
              OR id = ? 
              OR id LIKE ? LIMIT 1""",
        conn, params=(block_id, clean_id, f"BLK-OPT-{clean_id}", f"BLK-MST-{clean_id}", f"%{clean_id}%")
    )
    conn.close()
    if df.empty:
        return None
    return df.iloc[0].to_dict()


def clear_all_data():
    """Wipes all tasks, blocks, notifications, and resets resources so the app starts 100% blank."""
    init_db()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM tasks")
    cur.execute("DELETE FROM blocks")
    cur.execute("DELETE FROM notifications")
    cur.execute("DELETE FROM resources")
    conn.commit()
    conn.close()
    print("Database cleared: 0 tasks, 0 blocks, 0 notifications.")


def seed_demo_data():
    """
    Cleans and seeds rich, realistic multi-department tasks, blocks, and notifications
    for the prototype live demo.
    """
    init_db()
    conn = get_connection()
    cur = conn.cursor()

    # Clear existing demo rows
    cur.execute("DELETE FROM tasks")
    cur.execute("DELETE FROM blocks")
    cur.execute("DELETE FROM notifications")
    cur.execute("DELETE FROM resources")

    # 1. Seed 15 Realistic Tasks (5 Civil, 5 Signal, 5 Electrical)
    demo_tasks = [
        # Civil (ENGG)
        {
            "id": "TSK-TRK-101",
            "asset_id": "Track Km 142/8-12 (Delhi-Kanpur UP)",
            "department": "ENGG",
            "section_id": "Delhi-Kanpur UP (Km 140-146)",
            "division": "DLI",
            "asset_type": "Track & Permanent Way (P-Way)",
            "defect_type": "Track Geometry - Twist (3.8 mm/m)",
            "defect_severity": "Critical",
            "days_overdue": 5,
            "due_date": "2026-09-08",
            "estimated_block_duration_hours": 3.5,
            "repeat_defect_count": 3,
            "sla_flag": 1,
            "asset_criticality_class": "Trunk Route",
            "safety_risk_flag": 1,
            "priority_score": 96.5,
            "status": "Confirmed",
        },
        {
            "id": "TSK-TRK-102",
            "asset_id": "Turnout #24B (Ghaziabad Yard Approach)",
            "department": "ENGG",
            "section_id": "Ghaziabad - Meerut Dn (Km 22-26)",
            "division": "DLI",
            "asset_type": "Points & Crossings",
            "defect_type": "Switch Rail Head Wear (6.2 mm)",
            "defect_severity": "Major",
            "days_overdue": 2,
            "due_date": "2026-09-10",
            "estimated_block_duration_hours": 2.5,
            "repeat_defect_count": 1,
            "sla_flag": 0,
            "asset_criticality_class": "Trunk Route",
            "safety_risk_flag": 1,
            "priority_score": 88.2,
            "status": "Awaiting Approval",
        },
        {
            "id": "TSK-TRK-103",
            "asset_id": "Bridge #88 Approach (Yamuna Bridge Dn)",
            "department": "ENGG",
            "section_id": "Delhi-Ghaziabad UP (Km 14-18)",
            "division": "DLI",
            "asset_type": "Bridges & Formation",
            "defect_type": "Ballast Cushion Deficiency (-120mm)",
            "defect_severity": "Minor",
            "days_overdue": 0,
            "due_date": "2026-09-15",
            "estimated_block_duration_hours": 2.0,
            "repeat_defect_count": 0,
            "sla_flag": 0,
            "asset_criticality_class": "Main Line",
            "safety_risk_flag": 0,
            "priority_score": 72.0,
            "status": "Pending Scoring",
        },
        {
            "id": "TSK-TRK-104",
            "asset_id": "Track Km 88/14 (Ambala-Saharanpur Single)",
            "department": "ENGG",
            "section_id": "Ambala Cantt - Saharanpur Dn Track",
            "division": "UMB",
            "asset_type": "Track & Permanent Way (P-Way)",
            "defect_type": "USFD Rail Flaw - Transverse Fatigue",
            "defect_severity": "Critical",
            "days_overdue": 6,
            "due_date": "2026-09-07",
            "estimated_block_duration_hours": 4.0,
            "repeat_defect_count": 2,
            "sla_flag": 1,
            "asset_criticality_class": "Trunk Route",
            "safety_risk_flag": 1,
            "priority_score": 96.1,
            "status": "Rejected",
        },
        {
            "id": "TSK-TRK-105",
            "asset_id": "Track Km 210/4 (Aligarh Jn Main)",
            "department": "ENGG",
            "section_id": "Tilak Bridge - Hazrat Nizamuddin 3rd Line",
            "division": "DLI",
            "asset_type": "Track & Permanent Way (P-Way)",
            "defect_type": "Gauge Deviation (+14mm deviation)",
            "defect_severity": "Major",
            "days_overdue": 1,
            "due_date": "2026-09-12",
            "estimated_block_duration_hours": 3.0,
            "repeat_defect_count": 1,
            "sla_flag": 0,
            "asset_criticality_class": "Trunk Route",
            "safety_risk_flag": 0,
            "priority_score": 78.4,
            "status": "Confirmed",
        },
        # Signal & Telecom (S&T)
        {
            "id": "TSK-SIG-201",
            "asset_id": "Point Machine #104A (Ghaziabad West)",
            "department": "S&T",
            "section_id": "Delhi-Kanpur UP (Km 140-146)",
            "division": "DLI",
            "asset_type": "Points & Signal Machines",
            "defect_type": "Point Machine Stalling Current (5.8A)",
            "defect_severity": "Critical",
            "days_overdue": 4,
            "due_date": "2026-09-08",
            "estimated_block_duration_hours": 3.5,
            "repeat_defect_count": 2,
            "sla_flag": 1,
            "asset_criticality_class": "Trunk Route",
            "safety_risk_flag": 1,
            "priority_score": 94.2,
            "status": "Confirmed",
        },
        {
            "id": "TSK-SIG-202",
            "asset_id": "Axle Counter 34B (Sahibabad Outer)",
            "department": "S&T",
            "section_id": "Delhi-Ghaziabad UP (Km 14-18)",
            "division": "DLI",
            "asset_type": "Axle Counter / Track Circuit",
            "defect_type": "Intermittent Reset Failure / Count Drift",
            "defect_severity": "Major",
            "days_overdue": 3,
            "due_date": "2026-09-09",
            "estimated_block_duration_hours": 2.5,
            "repeat_defect_count": 1,
            "sla_flag": 0,
            "asset_criticality_class": "Trunk Route",
            "safety_risk_flag": 1,
            "priority_score": 86.0,
            "status": "Awaiting Approval",
        },
        {
            "id": "TSK-SIG-203",
            "asset_id": "Track Circuit TC-12 (Tilak Bridge)",
            "department": "S&T",
            "section_id": "Tilak Bridge - Hazrat Nizamuddin 3rd Line",
            "division": "DLI",
            "asset_type": "Axle Counter / Track Circuit",
            "defect_type": "Ballast Resistance Drop (< 2.0 ohm/km)",
            "defect_severity": "Minor",
            "days_overdue": 0,
            "due_date": "2026-09-12",
            "estimated_block_duration_hours": 2.0,
            "repeat_defect_count": 0,
            "sla_flag": 0,
            "asset_criticality_class": "Main Line",
            "safety_risk_flag": 0,
            "priority_score": 78.5,
            "status": "Confirmed",
        },
        {
            "id": "TSK-SIG-204",
            "asset_id": "Automatic Signal S-42 (Anand Vihar)",
            "department": "S&T",
            "section_id": "Anand Vihar - Sahibabad Chord",
            "division": "DLI",
            "asset_type": "Signals & Relays",
            "defect_type": "Lamp Proving Relay (ECR) Chatter",
            "defect_severity": "Critical",
            "days_overdue": 4,
            "due_date": "2026-09-06",
            "estimated_block_duration_hours": 2.0,
            "repeat_defect_count": 3,
            "sla_flag": 1,
            "asset_criticality_class": "Trunk Route",
            "safety_risk_flag": 1,
            "priority_score": 91.0,
            "status": "Rejected",
        },
        {
            "id": "TSK-SIG-205",
            "asset_id": "Level Crossing Gate LC-18 Interlock",
            "department": "S&T",
            "section_id": "Moradabad - Bareilly Dn Line (Km 42-46)",
            "division": "MB",
            "asset_type": "Level Crossing Interlocking",
            "defect_type": "Gate Circuit Contact Resistance High",
            "defect_severity": "Major",
            "days_overdue": 2,
            "due_date": "2026-09-09",
            "estimated_block_duration_hours": 3.0,
            "repeat_defect_count": 1,
            "sla_flag": 0,
            "asset_criticality_class": "Trunk Route",
            "safety_risk_flag": 1,
            "priority_score": 87.5,
            "status": "Awaiting Approval",
        },
        # Electrical (TRD)
        {
            "id": "TSK-ELC-301",
            "asset_id": "OHE Catenary Mast 142/18 (Delhi-Aligarh)",
            "department": "TRD",
            "section_id": "Delhi-Kanpur UP (Km 140-146)",
            "division": "DLI",
            "asset_type": "25kV OHE Catenary",
            "defect_type": "Contact Wire Wear (< 74 mm² cross-section)",
            "defect_severity": "Critical",
            "days_overdue": 4,
            "due_date": "2026-09-08",
            "estimated_block_duration_hours": 3.5,
            "repeat_defect_count": 2,
            "sla_flag": 1,
            "asset_criticality_class": "Trunk Route",
            "safety_risk_flag": 1,
            "priority_score": 95.0,
            "status": "Confirmed",
        },
        {
            "id": "TSK-ELC-302",
            "asset_id": "Traction Substation TSS-04 (Khurja)",
            "department": "TRD",
            "section_id": "Moradabad - Bareilly Dn Line (Km 42-46)",
            "division": "DLI",
            "asset_type": "Traction Substation (TSS)",
            "defect_type": "Circuit Breaker Gas Pressure Drop (SF6)",
            "defect_severity": "Major",
            "days_overdue": 3,
            "due_date": "2026-09-09",
            "estimated_block_duration_hours": 3.5,
            "repeat_defect_count": 1,
            "sla_flag": 0,
            "asset_criticality_class": "Trunk Route",
            "safety_risk_flag": 1,
            "priority_score": 89.5,
            "status": "Awaiting Approval",
        },
        {
            "id": "TSK-ELC-303",
            "asset_id": "Section Insulator SI-12 (Palwal South)",
            "department": "TRD",
            "section_id": "Palwal - Mathura 3rd Line (Km 92-96)",
            "division": "DLI",
            "asset_type": "25kV OHE Catenary",
            "defect_type": "Runner Alignment Stagger (120mm)",
            "defect_severity": "Major",
            "days_overdue": 1,
            "due_date": "2026-09-10",
            "estimated_block_duration_hours": 5.0,
            "repeat_defect_count": 0,
            "sla_flag": 0,
            "asset_criticality_class": "Trunk Route",
            "safety_risk_flag": 0,
            "priority_score": 84.0,
            "status": "Confirmed",
        },
        {
            "id": "TSK-ELC-304",
            "asset_id": "Tower Wagon Track Km 92/2",
            "department": "TRD",
            "section_id": "Ambala Cantt - Saharanpur Dn Track",
            "division": "UMB",
            "asset_type": "25kV OHE Catenary",
            "defect_type": "Dropper Broken / Neutral Section Spark",
            "defect_severity": "Critical",
            "days_overdue": 5,
            "due_date": "2026-09-07",
            "estimated_block_duration_hours": 3.0,
            "repeat_defect_count": 2,
            "sla_flag": 1,
            "asset_criticality_class": "Trunk Route",
            "safety_risk_flag": 1,
            "priority_score": 93.2,
            "status": "Rejected",
        },
        {
            "id": "TSK-ELC-305",
            "asset_id": "OHE Isolator Switch IS-08 (Ghaziabad East)",
            "department": "TRD",
            "section_id": "Delhi-Ghaziabad UP (Km 14-18)",
            "division": "DLI",
            "asset_type": "25kV OHE Catenary",
            "defect_type": "Isolator Blade Contact Oxidation",
            "defect_severity": "Minor",
            "days_overdue": 0,
            "due_date": "2026-09-14",
            "estimated_block_duration_hours": 2.0,
            "repeat_defect_count": 0,
            "sla_flag": 0,
            "asset_criticality_class": "Main Line",
            "safety_risk_flag": 0,
            "priority_score": 68.0,
            "status": "Pending Scoring",
        },
    ]

    for t in demo_tasks:
        cur.execute("""
            INSERT INTO tasks 
            (id, asset_id, department, section_id, division, asset_type, defect_type, defect_severity, days_overdue, due_date, estimated_block_duration_hours, repeat_defect_count, sla_flag, asset_criticality_class, safety_risk_flag, priority_score, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            t["id"], t["asset_id"], t["department"], t["section_id"], t["division"],
            t["asset_type"], t["defect_type"], t["defect_severity"], t["days_overdue"],
            t["due_date"], t["estimated_block_duration_hours"], t["repeat_defect_count"],
            t["sla_flag"], t["asset_criticality_class"], t["safety_risk_flag"],
            t["priority_score"], t["status"]
        ))

    # 2. Seed 7 Schedule Blocks (Monday to Sunday)
    demo_blocks = [
        {
            "id": "BLK-MST-101",
            "section_id": "Delhi - Kanpur UP Main (Km 140-146)",
            "window_date": "2026-09-08",
            "start_hour": 1,
            "duration_hours": 3.5,
            "is_bundled": 1,
            "departments_bundled": "Civil,Signal,Electrical",
            "associated_task_ids": "TSK-TRK-101,TSK-SIG-201,TSK-ELC-301",
            "summary": "Synchronized Corridor Block: Geometry Tamping, Point 104A Recalibration & OHE Catenary Wear Rectification",
            "priority_score": 97.4,
            "tasks_merged": 3,
            "status": "Confirmed",
        },
        {
            "id": "BLK-MST-102",
            "section_id": "Moradabad - Bareilly Dn Line (Km 42-46)",
            "window_date": "2026-09-09",
            "start_hour": 2,
            "duration_hours": 3.5,
            "is_bundled": 1,
            "departments_bundled": "Civil,Electrical",
            "associated_task_ids": "TSK-SIG-205,TSK-ELC-302",
            "summary": "Combined USFD Rail Flaw Repair & Substation TSS-04 SF6 Circuit Breaker Overhaul",
            "priority_score": 94.8,
            "tasks_merged": 2,
            "status": "pending_approval",
        },
        {
            "id": "BLK-MST-103",
            "section_id": "Palwal - Mathura 3rd Line (Km 92-96)",
            "window_date": "2026-09-10",
            "start_hour": 1,
            "duration_hours": 5.0,
            "is_bundled": 1,
            "departments_bundled": "Signal,Electrical",
            "associated_task_ids": "TSK-ELC-303",
            "summary": "Digital Axle Counter Reset & 25kV OHE Section Insulator SI-12 Realignment",
            "priority_score": 98.2,
            "tasks_merged": 2,
            "status": "Confirmed",
        },
        {
            "id": "BLK-MST-104",
            "section_id": "Ghaziabad - Meerut Dn Single (Km 22-26)",
            "window_date": "2026-09-11",
            "start_hour": 2,
            "duration_hours": 2.5,
            "is_bundled": 0,
            "departments_bundled": "Civil",
            "associated_task_ids": "TSK-TRK-102",
            "summary": "Switch Rail Head Replacement & Manual Cross-Level Packing",
            "priority_score": 88.2,
            "tasks_merged": 1,
            "status": "pending_approval",
        },
        {
            "id": "BLK-MST-105",
            "section_id": "Tilak Bridge - Hazrat Nizamuddin 3rd Line",
            "window_date": "2026-09-12",
            "start_hour": 0,
            "duration_hours": 4.0,
            "is_bundled": 1,
            "departments_bundled": "Civil,Signal",
            "associated_task_ids": "TSK-TRK-105,TSK-SIG-203",
            "summary": "Joint Track Geometry Realignment & Track Circuit TC-12 Ballast Resistance Rectification",
            "priority_score": 89.5,
            "tasks_merged": 2,
            "status": "Confirmed",
        },
        {
            "id": "BLK-MST-106",
            "section_id": "Ambala Cantt - Saharanpur Dn Track",
            "window_date": "2026-09-13",
            "start_hour": 1,
            "duration_hours": 3.5,
            "is_bundled": 0,
            "departments_bundled": "Civil",
            "associated_task_ids": "TSK-TRK-104",
            "summary": "Ultrasonic Flaw Detection Spot Replacement & Emergency Clamping",
            "priority_score": 96.1,
            "tasks_merged": 1,
            "status": "Rejected",
        },
        {
            "id": "BLK-MST-107",
            "section_id": "Delhi-Ghaziabad UP (Km 14-18)",
            "window_date": "2026-09-14",
            "start_hour": 2,
            "duration_hours": 4.5,
            "is_bundled": 1,
            "departments_bundled": "Civil,Signal,Electrical",
            "associated_task_ids": "TSK-TRK-103,TSK-SIG-202,TSK-ELC-305",
            "summary": "Multi-Department Mega Block: Heavy BCM Ballast Cleaning & OHE Power Isolation",
            "priority_score": 93.8,
            "tasks_merged": 3,
            "status": "pending_approval",
        },
    ]

    for b in demo_blocks:
        cur.execute("""
            INSERT INTO blocks 
            (id, section_id, window_date, start_hour, duration_hours, is_bundled, departments_bundled, associated_task_ids, summary, priority_score, tasks_merged, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            b["id"], b["section_id"], b["window_date"], b["start_hour"], b["duration_hours"],
            b["is_bundled"], b["departments_bundled"], b["associated_task_ids"],
            b["summary"], b["priority_score"], b["tasks_merged"], b["status"]
        ))

    # 3. Seed 10 Notifications
    demo_notifs = [
        ("ENGG", "Corridor Block BLK-MST-101 confirmed by Central Operations (01:30 - 05:00 hrs).", "approval"),
        ("ENGG", "Shared Corridor Block BLK-MST-101 gazetted for Tuesday: Bundled with SMMS & TDMS.", "schedule"),
        ("ENGG", "Defect TSK-TRK-104 rejected: Insufficient machine slot on Ambala line. Modify work method and resubmit.", "rejection"),
        ("S&T", "Point Machine #104A joint block approved for Tuesday night (BLK-MST-101).", "approval"),
        ("S&T", "Signal S-42 block rejected: Overlaps with Vande Bharat Express slot. Rescheduling recommended.", "rejection"),
        ("TRD", "25kV Traction Power Block confirmed for Sector 142 on Tuesday (BLK-MST-101).", "approval"),
        ("TRD", "Tower Wagon schedule rescheduled to 02:00 hrs due to freight precedence.", "schedule"),
        ("ENGG", "AI Solver completed TGI re-scoring for Moradabad Division section 4.", "schedule"),
        ("S&T", "Defect TSK-SIG-202 submitted for AI scoring: Axle Counter 34B drift.", "schedule"),
        ("TRD", "Defect TSK-ELC-302 submitted for AI scoring: TSS-04 SF6 Circuit Breaker.", "schedule"),
    ]

    for dept, msg, n_type in demo_notifs:
        import uuid, datetime
        cur.execute(
            "INSERT INTO notifications (id, department, message, type, created_at) VALUES (?, ?, ?, ?, ?)",
            (
                f"NOTIF-{str(uuid.uuid4())[:8].upper()}",
                dept,
                msg,
                n_type,
                datetime.datetime.utcnow().isoformat(),
            ),
        )

    # 4. Seed Resources
    for dept_key, defaults in RESOURCE_DEPT_DEFAULTS.items():
        for r in defaults:
            cur.execute(
                "INSERT INTO resources (department, label, percent) VALUES (?, ?, ?)",
                (dept_key, r["label"], r["percent"]),
            )

    conn.commit()
    conn.close()
    print("Demo data seeded successfully with 15 tasks, 7 blocks, 10 notifications.")



def insert_notification(department: str, message: str, notif_type: str = "schedule"):
    """Insert a single notification into the notifications table."""
    import uuid, datetime
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO notifications (id, department, message, type, created_at) VALUES (?, ?, ?, ?, ?)",
        (
            f"NOTIF-{str(uuid.uuid4())[:8].upper()}",
            department,
            message,
            notif_type,
            datetime.datetime.utcnow().isoformat(),
        ),
    )
    conn.commit()
    conn.close()


def get_notifications(department: str = None, limit: int = 30) -> list:
    """Fetch recent notifications. Admin receives all system and defect submissions."""
    import datetime
    conn = get_connection()
    if department and department.upper() not in ("ADMIN", "ALL", "CENTRAL OPERATIONS"):
        df = pd.read_sql_query(
            "SELECT * FROM notifications WHERE department = ? OR department = 'ALL' OR department = 'Admin' ORDER BY id DESC LIMIT ?",
            conn, params=(department, limit),
        )
    else:
        df = pd.read_sql_query(
            "SELECT * FROM notifications ORDER BY id DESC LIMIT ?",
            conn, params=(limit,),
        )
    conn.close()
    records = df.to_dict(orient="records")
    now = datetime.datetime.utcnow()
    for r in records:
        try:
            dt = datetime.datetime.fromisoformat(r["created_at"])
            diff = now - dt
            mins = int(diff.total_seconds() // 60)
            if mins < 1:
                r["timestamp"] = "Just now"
            elif mins < 60:
                r["timestamp"] = f"{mins}m ago"
            else:
                r["timestamp"] = f"{mins // 60}h ago"
        except Exception:
            r["timestamp"] = r.get("created_at", "")
    return records


def get_kpis(department: str = None) -> dict:
    """Compute live KPI metrics from the tasks and blocks tables."""
    conn = get_connection()
    if department:
        tasks_df = pd.read_sql_query(
            "SELECT status FROM tasks WHERE department = ?", conn, params=(department,)
        )
        blocks_df = pd.read_sql_query(
            "SELECT duration_hours FROM blocks WHERE departments_bundled LIKE ? AND status = 'Confirmed'",
            conn, params=(f"%{department}%",),
        )
    else:
        tasks_df = pd.read_sql_query("SELECT status FROM tasks", conn)
        blocks_df = pd.read_sql_query(
            "SELECT duration_hours FROM blocks WHERE status = 'Confirmed'", conn
        )
    conn.close()

    total = len(tasks_df)
    awaiting = int((tasks_df["status"] == "Awaiting Approval").sum()) if total else 0
    confirmed_hours = float(blocks_df["duration_hours"].sum()) if len(blocks_df) else 0.0
    utilization = min(99, int((total / max(total, 1)) * 84)) if total else 0

    return {
        "activeBacklog": total,
        "awaitingApproval": awaiting,
        "confirmedBlockHours": round(confirmed_hours, 1),
        "resourceUtilizationPct": utilization,
    }


# ---------------------------------------------------------------------------
# Resources table – persistent utilization percentages per department
# ---------------------------------------------------------------------------
RESOURCE_DEPT_DEFAULTS = {
    "Civil": [
        {"label": "Crane / Heavy Track Machines", "percent": 78},
        {"label": "P-Way Maintenance Gangs", "percent": 88},
        {"label": "Tamping Unit Fleet (CSM 09-32)", "percent": 24},
        {"label": "Ballast Regulators & Hoppers", "percent": 65},
    ],
    "Signal": [
        {"label": "S&T Inspection Teams", "percent": 82},
        {"label": "Relay Testing Kits", "percent": 70},
        {"label": "Emergency Signal Vans", "percent": 28},
        {"label": "Cable Jointing Crews", "percent": 60},
    ],
    "Electrical": [
        {"label": "8-Wheeler Tower Wagons", "percent": 85},
        {"label": "TRD OHE Linemen Gangs", "percent": 90},
        {"label": "Earth Discharge Rod Sets", "percent": 22},
        {"label": "Catenary Tensioning Winches", "percent": 55},
    ],
}


def _ensure_resources_table(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            department TEXT NOT NULL,
            label TEXT NOT NULL,
            percent INTEGER NOT NULL
        )
    """)
    conn.commit()


def get_resources(department: str = "Civil") -> list:
    """Return resource utilization rows for the given department key."""
    conn = get_connection()
    _ensure_resources_table(conn)
    df = pd.read_sql_query(
        "SELECT label, percent FROM resources WHERE department = ?", conn, params=(department,)
    )
    conn.close()
    if df.empty:
        defaults = RESOURCE_DEPT_DEFAULTS.get(department, RESOURCE_DEPT_DEFAULTS["Civil"])
        upsert_resources(department, defaults)
        return defaults
    return df.to_dict(orient="records")


def upsert_resources(department: str, rows: list):
    """Overwrite resource rows for a department."""
    conn = get_connection()
    _ensure_resources_table(conn)
    conn.execute("DELETE FROM resources WHERE department = ?", (department,))
    for r in rows:
        conn.execute(
            "INSERT INTO resources (department, label, percent) VALUES (?, ?, ?)",
            (department, r["label"], r["percent"]),
        )
    conn.commit()
    conn.close()