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

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "railway.db")


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
    """Fetch tasks, optionally filtered by department. This replaces reading uni.csv directly."""
    conn = get_connection()
    if department:
        df = pd.read_sql_query("SELECT * FROM tasks WHERE department = ?", conn, params=(department,))
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


def save_blocks(blocks_df: pd.DataFrame):
    """After the optimizer runs, save the generated block plan. Replaces prior blocks entirely."""
    conn = get_connection()
    blocks_df.to_sql("blocks", conn, if_exists="replace", index=False)
    conn.close()


def get_blocks(department: str = None, status: str = "Confirmed") -> pd.DataFrame:
    conn = get_connection()
    if department:
        df = pd.read_sql_query(
            "SELECT * FROM blocks WHERE status = ? AND departments_bundled LIKE ?",
            conn, params=(status, f"%{department}%"),
        )
    else:
        df = pd.read_sql_query("SELECT * FROM blocks WHERE status = ?", conn, params=(status,))
    conn.close()
    return df