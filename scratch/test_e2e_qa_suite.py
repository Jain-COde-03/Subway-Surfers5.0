#!/usr/bin/env python3
"""
Comprehensive End-to-End QA Testing Suite for SAMAY Railway Optimization System.
Tests Authentication, RBAC, Data Isolation, Defect Submissions, ML Scoring,
CP-SAT Optimization, Approvals, Rejections, Calendar Scheduling, Notifications,
Database Integrity, Security/Injection Resilience, Concurrency, and Sample Data.
"""

import sys
import os
import time
import json
import sqlite3
from fastapi.testclient import TestClient

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app
from backend import database, auth as auth_module

client = TestClient(app)

class QAResults:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.failures = []
        self.matrix = []

    def record(self, module, test_name, expected, actual, passed, details=None):
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            status_str = "PASSED"
        else:
            self.tests_failed += 1
            status_str = "FAILED"
            self.failures.append({
                "module": module,
                "test_name": test_name,
                "expected": expected,
                "actual": actual,
                "details": details
            })
        self.matrix.append({
            "module": module,
            "test_name": test_name,
            "expected": expected,
            "actual": actual,
            "status": status_str
        })
        print(f"[{status_str}] {module} -> {test_name}")
        if not passed and details:
            print(f"    ERROR DETAILS: {details}")

qa = QAResults()

def get_auth_client(username, password):
    c = TestClient(app)
    res = c.post("/api/auth/login", json={"username": username, "password": password})
    return c, res

print("\n=======================================================")
print("STARTING COMPLETE END-TO-END QA AUTOMATED TEST SUITE")
print("=======================================================\n")

# -------------------------------------------------------------------
# MODULE 1: AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
# -------------------------------------------------------------------
print("\n--- SECTION 1: AUTHENTICATION & RBAC ---")

# 1.1 Unauthenticated requests
res = client.get("/api/v1/tasks")
qa.record("RBAC", "Unauthenticated /api/v1/tasks blocked", 401, res.status_code, res.status_code == 401)

res = client.get("/api/v1/admin/tasks")
qa.record("RBAC", "Unauthenticated /api/v1/admin/tasks blocked", 401, res.status_code, res.status_code == 401)

# 1.2 Invalid login credentials
res = client.post("/api/auth/login", json={"username": "fake_user", "password": "wrong_password"})
qa.record("Auth", "Invalid login returns 401", 401, res.status_code, res.status_code == 401)

# 1.3 Department user logins
admin_client, res_admin = get_auth_client("admin_control", "ir_password_2026")
qa.record("Auth", "Admin login successful", 200, res_admin.status_code, res_admin.status_code == 200)

tms_client, res_tms = get_auth_client("tms_engineer", "ir_password_2026")
qa.record("Auth", "TMS (Civil) login successful", 200, res_tms.status_code, res_tms.status_code == 200)

smms_client, res_smms = get_auth_client("smms_dste", "ir_password_2026")
qa.record("Auth", "SMMS (Signal) login successful", 200, res_smms.status_code, res_smms.status_code == 200)

tdms_client, res_tdms = get_auth_client("tdms_dee", "ir_password_2026")
qa.record("Auth", "TDMS (Electrical) login successful", 200, res_tdms.status_code, res_tdms.status_code == 200)

# 1.4 Department attempting Admin-only routes (403 Forbidden)
res = tms_client.get("/api/v1/admin/tasks")
qa.record("RBAC", "TMS blocked from /api/v1/admin/tasks", 403, res.status_code, res.status_code == 403)

res = smms_client.post("/api/v1/optimize")
qa.record("RBAC", "SMMS blocked from /api/v1/optimize", 403, res.status_code, res.status_code == 403)

res = tdms_client.post("/api/v1/clear-data")
qa.record("RBAC", "TDMS blocked from /api/v1/clear-data", 403, res.status_code, res.status_code == 403)

res = tms_client.put("/api/v1/blocks/BLK-OPT-GZB-101/approve")
qa.record("RBAC", "TMS blocked from approving blocks", 403, res.status_code, res.status_code == 403)

# -------------------------------------------------------------------
# MODULE 2: RESET & CLEAN STATE VALIDATION
# -------------------------------------------------------------------
print("\n--- SECTION 2: CLEAN STATE VALIDATION ---")
res = admin_client.post("/api/v1/clear-data")
qa.record("System", "Clear data returns success", 200, res.status_code, res.status_code == 200)

# Verify DB is 100% blank
tasks_df = database.get_tasks()
blocks_df = database.get_blocks()
notifs = database.get_notifications()
blank_ok = len(tasks_df) == 0 and len(blocks_df) == 0 and len(notifs) == 0
qa.record("Database", "Database wiped completely (0 tasks, 0 blocks, 0 notifs)", True, blank_ok, blank_ok)

# -------------------------------------------------------------------
# MODULE 3: DEFECT SUBMISSIONS (CIVIL, SIGNAL, ELECTRICAL)
# -------------------------------------------------------------------
print("\n--- SECTION 3: DEFECT SUBMISSION & ML SCORING ---")

# 3.1 Civil (TMS) Defect Submission
civil_payload = {
    "department": "TMS (P-Way)",
    "asset_type": "Track / P-Way",
    "section": "NDLS - GZB · Quadruple Track Corridor (Km 12-24)",
    "asset": "Track KM 14/2 - 17/8",
    "defect_type": "Rail Head USFD Ultrasonic Flaw Detection Anomaly",
    "speed_drop": 30.0,
    "days_overdue": 5.0,
    "repeat_incidents": 2.0,
    "possession_window": 3.5,
    "detailed_description": "Detected 0.4mm transverse crack on high speed UP mainline.",
    "target_date": "2026-09-15"
}
res_civ = tms_client.post("/api/v1/score", json=civil_payload)
civ_data = res_civ.json()
civ_id = civ_data.get("task_id")
civ_score = civ_data.get("predicted_priority")
qa.record("Submission", "Civil defect submission status 200", 200, res_civ.status_code, res_civ.status_code == 200)
qa.record("Submission", "Civil task ID generated with TSK-LIVE prefix", True, str(civ_id).startswith("TSK-LIVE-"), str(civ_id).startswith("TSK-LIVE-"))
qa.record("ML Scoring", "Civil defect AI priority score in range [0, 100]", True, 0.0 <= civ_score <= 100.0, 0.0 <= civ_score <= 100.0)

# 3.2 Signal (SMMS) Defect Submission
signal_payload = {
    "department": "SMMS (S&T)",
    "asset_type": "Signaling & Interlocking",
    "section": "NDLS - GZB · Quadruple Track Corridor (Km 12-24)",
    "asset": "Point Machine 104A",
    "defect_type": "Point Machine Stalling Current Surge",
    "speed_drop": 20.0,
    "days_overdue": 3.0,
    "repeat_incidents": 1.0,
    "possession_window": 2.5,
    "detailed_description": "Point Machine 104A intermittent throw stalling and contact resistance surge.",
    "target_date": "2026-09-14"
}
res_sig = smms_client.post("/api/v1/score", json=signal_payload)
sig_data = res_sig.json()
sig_id = sig_data.get("task_id")
sig_score = sig_data.get("predicted_priority")
qa.record("Submission", "Signal defect submission status 200", 200, res_sig.status_code, res_sig.status_code == 200)
qa.record("ML Scoring", "Signal defect AI priority score in range [0, 100]", True, 0.0 <= sig_score <= 100.0, 0.0 <= sig_score <= 100.0)

# 3.3 Electrical (TDMS) Defect Submission
elect_payload = {
    "department": "TDMS (TRD)",
    "asset_type": "Traction Distribution (OHE)",
    "section": "NDLS - CNB · UP Main Line (Km 120-155)",
    "asset": "OHE Catenary Dropper Mast 142/8",
    "defect_type": "25kV OHE Catenary Sag & Dropper Loose",
    "speed_drop": 35.0,
    "days_overdue": 6.0,
    "repeat_incidents": 3.0,
    "possession_window": 3.0,
    "detailed_description": "Excessive sag under temperature oscillation causing pantograph sparking.",
    "target_date": "2026-09-16"
}
res_ele = tdms_client.post("/api/v1/score", json=elect_payload)
ele_data = res_ele.json()
ele_id = ele_data.get("task_id")
ele_score = ele_data.get("predicted_priority")
qa.record("Submission", "Electrical defect submission status 200", 200, res_ele.status_code, res_ele.status_code == 200)
qa.record("ML Scoring", "Electrical defect AI priority score in range [0, 100]", True, 0.0 <= ele_score <= 100.0, 0.0 <= ele_score <= 100.0)
qa.record("ML Severity Ordering", "Critical defects (Civil/Electrical) scored higher than Major (Signal)", True, (civ_score > sig_score and ele_score > sig_score), (civ_score > sig_score and ele_score > sig_score))

# -------------------------------------------------------------------
# MODULE 4: DATA ISOLATION & DEPARTMENT VIEWS
# -------------------------------------------------------------------
print("\n--- SECTION 4: DATA ISOLATION & DEPARTMENT QUEUES ---")

# TMS should see only ENGG tasks
res_tms_tasks = tms_client.get("/api/v1/tasks?dept=Civil")
tms_tasks = res_tms_tasks.json()
tms_only = all(t["id"] == civ_id for t in tms_tasks) and len(tms_tasks) == 1
qa.record("Data Isolation", "TMS sees only Civil tasks", True, tms_only, tms_only)

# SMMS should see only S&T tasks
res_smms_tasks = smms_client.get("/api/v1/tasks?dept=Signal")
smms_tasks = res_smms_tasks.json()
smms_only = all(t["id"] == sig_id for t in smms_tasks) and len(smms_tasks) == 1
qa.record("Data Isolation", "SMMS sees only Signal tasks", True, smms_only, smms_only)

# TDMS should see only TRD tasks
res_tdms_tasks = tdms_client.get("/api/v1/tasks?dept=Electrical")
tdms_tasks = res_tdms_tasks.json()
tdms_only = all(t["id"] == ele_id for t in tdms_tasks) and len(tdms_tasks) == 1
qa.record("Data Isolation", "TDMS sees only Electrical tasks", True, tdms_only, tdms_only)

# Admin should see ALL 3 tasks across all departments
res_admin_tasks = admin_client.get("/api/v1/admin/tasks")
admin_tasks = res_admin_tasks.json()
admin_has_all = len(admin_tasks) == 3 and {t["id"] for t in admin_tasks} == {civ_id, sig_id, ele_id}
qa.record("Admin View", "Admin sees all 3 departmental tasks", True, admin_has_all, admin_has_all)

# -------------------------------------------------------------------
# MODULE 5: CP-SAT CORRIDOR OPTIMIZER & MULTI-DEPT BUNDLING
# -------------------------------------------------------------------
print("\n--- SECTION 5: CP-SAT OPTIMIZER & MULTI-DEPT BUNDLING ---")

res_opt = admin_client.post("/api/v1/optimize")
proposals = res_opt.json()
qa.record("Optimizer", "Optimizer solver runs successfully (200 OK)", 200, res_opt.status_code, res_opt.status_code == 200)
qa.record("Optimizer", "Optimizer synthesized corridor proposals (>= 2 corridors)", True, len(proposals) >= 2, len(proposals) >= 2)

# Find GZB proposal (Civil + Signal co-located on GZB corridor)
gzb_prop = next((p for p in proposals if "GZB" in p["id"]), None)
qa.record("Optimizer", "GZB corridor bundled Civil & Signal defects", True, gzb_prop is not None, gzb_prop is not None)

if gzb_prop:
    depts = gzb_prop.get("departments", [])
    is_multi_dept = "Civil" in depts and "Signal" in depts
    qa.record("Bundling", "GZB proposal bundles both Civil and Signal departments", True, is_multi_dept, is_multi_dept)
    
    tasks_merged = gzb_prop.get("tasksMerged", 0)
    qa.record("Bundling", "GZB proposal reports 2 constituent tasks", 2, tasks_merged, tasks_merged == 2)
    
    constituent = gzb_prop.get("constituentTasks", [])
    has_live_ids = {t["id"] for t in constituent} == {civ_id, sig_id}
    qa.record("Telemetry", "Proposal constituentTasks contains real live task IDs (civ_id, sig_id)", True, has_live_ids, has_live_ids)
    
    hours_saved = gzb_prop.get("hoursSaved", 0)
    qa.record("Synergy", "Possession hours saved computed correctly (> 0)", True, hours_saved > 0, hours_saved > 0)

# -------------------------------------------------------------------
# MODULE 6: APPROVAL WORKFLOW & CALENDAR SYNCHRONIZATION
# -------------------------------------------------------------------
print("\n--- SECTION 6: APPROVAL WORKFLOW & CALENDAR ---")

# Approve GZB proposal
gzb_id = gzb_prop["id"] if gzb_prop else "BLK-OPT-GZB-101"
res_app = admin_client.put(f"/api/v1/blocks/{gzb_id}/approve")
qa.record("Approval", f"Admin approves block {gzb_id}", 200, res_app.status_code, res_app.status_code == 200)

# Check database status
blk_db = database.get_block_by_id(gzb_id)
is_confirmed = blk_db and blk_db.get("status") == "Confirmed"
qa.record("Database", "Block status updated to 'Confirmed' in SQLite", True, is_confirmed, is_confirmed)

# Check Schedule / Calendar API for Admin
res_sched_admin = admin_client.get("/api/v1/schedule")
sched_admin = res_sched_admin.json()
in_admin_sched = any(s["id"] == gzb_id for s in sched_admin)
qa.record("Calendar", "Confirmed block appears in Admin Master Schedule", True, in_admin_sched, in_admin_sched)

# Check Department Calendars (Civil & Signal should see it, Electrical should not)
res_sched_civ = tms_client.get("/api/v1/schedule?dept=Civil")
in_civ_sched = any(s["id"] == gzb_id for s in res_sched_civ.json())
qa.record("Calendar", "Confirmed block appears on Civil department calendar", True, in_civ_sched, in_civ_sched)

res_sched_sig = smms_client.get("/api/v1/schedule?dept=Signal")
in_sig_sched = any(s["id"] == gzb_id for s in res_sched_sig.json())
qa.record("Calendar", "Confirmed block appears on Signal department calendar", True, in_sig_sched, in_sig_sched)

res_sched_ele = tdms_client.get("/api/v1/schedule?dept=Electrical")
in_ele_sched = any(s["id"] == gzb_id for s in res_sched_ele.json())
qa.record("Calendar Isolation", "Confirmed GZB block does NOT appear on uninvolved Electrical calendar", False, in_ele_sched, not in_ele_sched)

# -------------------------------------------------------------------
# MODULE 7: REJECTION WORKFLOW
# -------------------------------------------------------------------
print("\n--- SECTION 7: REJECTION WORKFLOW ---")

# Find CNB proposal (Electrical defect)
cnb_prop = next((p for p in proposals if "CNB" in p["id"]), None)
cnb_id = cnb_prop["id"] if cnb_prop else "BLK-OPT-CNB-102"

res_rej = admin_client.put(f"/api/v1/blocks/{cnb_id}/reject?reason=Corridor+density+peak+clash")
qa.record("Rejection", f"Admin rejects block {cnb_id} with reason", 200, res_rej.status_code, res_rej.status_code == 200)

blk_rej_db = database.get_block_by_id(cnb_id)
is_rejected = blk_rej_db and blk_rej_db.get("status") == "Rejected"
qa.record("Database", "Block status updated to 'Rejected' in SQLite", True, is_rejected, is_rejected)

# Verify rejected block is NOT on confirmed calendar
res_sched_after_rej = admin_client.get("/api/v1/schedule")
in_sched_rej = any(s["id"] == cnb_id for s in res_sched_after_rej.json())
qa.record("Calendar", "Rejected block is excluded from Confirmed Schedule", False, in_sched_rej, not in_sched_rej)

# -------------------------------------------------------------------
# MODULE 8: NOTIFICATION PIPELINE VERIFICATION
# -------------------------------------------------------------------
print("\n--- SECTION 8: NOTIFICATION PIPELINE ---")

# Civil notifications (should have submission ack + block approval)
civ_notifs = tms_client.get("/api/v1/notifications?dept=Civil").json()
has_civ_app = any("confirmed" in n.get("message", "").lower() or "approval" in n.get("type", "").lower() for n in civ_notifs)
qa.record("Notifications", "Civil department received block approval notification", True, has_civ_app, has_civ_app)

# Electrical notifications (should have rejection alert)
ele_notifs = tdms_client.get("/api/v1/notifications?dept=Electrical").json()
has_ele_rej = any("rejected" in n.get("message", "").lower() or "rejection" in n.get("type", "").lower() for n in ele_notifs)
qa.record("Notifications", "Electrical department received block rejection notification", True, has_ele_rej, has_ele_rej)

# Admin notifications (received submission alerts and optimizer alert)
admin_notifs = admin_client.get("/api/v1/notifications?dept=Admin").json()
has_admin_notifs = len(admin_notifs) >= 3
qa.record("Notifications", "Admin received defect logging and CP-SAT synthesis alerts", True, has_admin_notifs, has_admin_notifs)

# -------------------------------------------------------------------
# MODULE 9: SECURITY, INJECTION RESILIENCE & INPUT VALIDATION
# -------------------------------------------------------------------
print("\n--- SECTION 9: SECURITY & INJECTION RESILIENCE ---")

# SQL Injection attempt in defect submission
sqli_payload = {
    "department": "TMS (P-Way)",
    "asset_type": "Track",
    "section": "NDLS - GZB'; DROP TABLE tasks; --",
    "asset": "Track KM 10' OR '1'='1",
    "defect_type": "Malicious Track Input",
    "speed_drop": 10.0,
    "days_overdue": 1.0,
    "repeat_incidents": 0.0,
    "possession_window": 2.0,
    "detailed_description": "SQL injection test payload"
}
res_sqli = tms_client.post("/api/v1/score", json=sqli_payload)
qa.record("Security", "SQL Injection payload safely handled (No Crash)", 200, res_sqli.status_code, res_sqli.status_code == 200)

# Verify tasks table still exists and is intact
try:
    check_df = database.get_tasks()
    sqli_safe = not check_df.empty
except Exception:
    sqli_safe = False
qa.record("Security", "Database tables intact after SQL injection attempt", True, sqli_safe, sqli_safe)

# XSS HTML payload attempt
xss_payload = {
    "department": "SMMS (S&T)",
    "asset_type": "Signal",
    "section": "NDLS - CNB <script>alert('xss')</script>",
    "asset": "<img src=x onerror=alert(1)>",
    "defect_type": "<b>XSS Test Defect</b>",
    "speed_drop": 15.0,
    "days_overdue": 2.0,
    "repeat_incidents": 1.0,
    "possession_window": 2.0
}
res_xss = smms_client.post("/api/v1/score", json=xss_payload)
qa.record("Security", "XSS payload processed without unhandled exception", 200, res_xss.status_code, res_xss.status_code == 200)

# -------------------------------------------------------------------
# MODULE 11: INDIVIDUAL TASK STATUS STATE MACHINE & REASONS
# -------------------------------------------------------------------
print("\n--- SECTION 11: INDIVIDUAL TASK STATUS UPDATES ---")

# Seed single task
single_task = {
    "department": "TMS (P-Way)",
    "asset_type": "Track",
    "section": "NDLS - GZB",
    "asset": "Switch Point 101",
    "defect_type": "Switch Rail Wear",
    "speed_drop": 20.0,
    "days_overdue": 2.0,
    "repeat_incidents": 0.0,
    "possession_window": 2.0,
}
res_st = tms_client.post("/api/v1/score", json=single_task)
st_id = res_st.json().get("task_id")

# Admin approves task individually
res_st_app = admin_client.put(f"/api/v1/tasks/{st_id}/status", json={"status": "Approved"})
qa.record("Task State Machine", "Admin updates task to 'Approved'", 200, res_st_app.status_code, res_st_app.status_code == 200)

# Admin rejects task with reason
res_st_rej = admin_client.put(f"/api/v1/tasks/{st_id}/status", json={"status": "Rejected", "reason": "No block window available on corridor"})
qa.record("Task State Machine", "Admin updates task to 'Rejected' with reason", 200, res_st_rej.status_code, res_st_rej.status_code == 200)

# Check notification sent to TMS for rejection
tms_notifs_after = tms_client.get("/api/v1/notifications?dept=Civil").json()
has_st_rej_notif = any(st_id in n.get("message", "") and "rejected" in n.get("message", "").lower() for n in tms_notifs_after)
qa.record("Notifications", "TMS received specific rejection notification with reason", True, has_st_rej_notif, has_st_rej_notif)

# -------------------------------------------------------------------
# MODULE 12: BLOCK CANCELLATION & COMMIT ALL
# -------------------------------------------------------------------
print("\n--- SECTION 12: CANCELLATION & COMMIT ALL ---")

# Seed demo data for rich block state testing
admin_client.post("/api/v1/seed-demo")

# Cancel a confirmed block
all_confirmed = admin_client.get("/api/v1/blocks?status=Confirmed").json()
if all_confirmed:
    target_cancel_id = all_confirmed[0]["id"]
    res_cancel = admin_client.put(f"/api/v1/blocks/{target_cancel_id}/cancel?reason=Emergency+monsoon+patrol")
    qa.record("Cancellation", f"Admin cancels confirmed block {target_cancel_id}", 200, res_cancel.status_code, res_cancel.status_code == 200)
    
    # Verify cancelled block is no longer on confirmed schedule
    sched_now = admin_client.get("/api/v1/schedule").json()
    is_not_in_sched = not any(s["id"] == target_cancel_id for s in sched_now)
    qa.record("Cancellation", "Cancelled block removed from Confirmed Calendar", True, is_not_in_sched, is_not_in_sched)

# Test Commit-All Gazette Endpoint
res_commit_all = admin_client.post("/api/v1/blocks/commit-all")
qa.record("Gazette Horizon", "Commit-all proposals endpoint returns 200 OK", 200, res_commit_all.status_code, res_commit_all.status_code == 200)

# -------------------------------------------------------------------
# MODULE 13: KPIS & RESOURCE TRACKING
# -------------------------------------------------------------------
print("\n--- SECTION 13: KPIS & RESOURCE UTILIZATION ---")

res_kpis = tms_client.get("/api/v1/kpis?dept=Civil")
qa.record("Analytics", "GET /api/v1/kpis?dept=Civil returns 200", 200, res_kpis.status_code, res_kpis.status_code == 200)
kpi_data = res_kpis.json()
has_kpi_metrics = "critical_backlog" in kpi_data or "hours_saved" in kpi_data or len(kpi_data) > 0
qa.record("Analytics", "Department KPI payload contains operational metrics", True, has_kpi_metrics, has_kpi_metrics)

res_res = tms_client.get("/api/v1/resources?dept=Civil")
qa.record("Resources", "GET /api/v1/resources?dept=Civil returns 200", 200, res_res.status_code, res_res.status_code == 200)
res_data = res_res.json()
has_res_data = len(res_data) > 0
qa.record("Resources", "Department machinery & crew utilization list populated", True, has_res_data, has_res_data)

# -------------------------------------------------------------------
# MODULE 14: CONCURRENCY & RAPID DEFECT LOGGING
# -------------------------------------------------------------------
print("\n--- SECTION 14: CONCURRENT & RAPID LOGGING ---")

admin_client.post("/api/v1/clear-data")
rapid_ids = []
start_time = time.time()

for i in range(5):
    payload = {
        "department": "SMMS (S&T)",
        "asset_type": "Signal",
        "section": "NDLS - CNB",
        "asset": f"Axle Counter HAC-{i+1}",
        "defect_type": "Track Circuit False Occupancy",
        "speed_drop": 20.0,
        "days_overdue": 1.0,
        "repeat_incidents": 0.0,
        "possession_window": 2.0,
    }
    r = smms_client.post("/api/v1/score", json=payload)
    if r.status_code == 200:
        rapid_ids.append(r.json().get("task_id"))

duration = time.time() - start_time
qa.record("Concurrency", "5 rapid consecutive defect submissions succeed", 5, len(rapid_ids), len(rapid_ids) == 5)
qa.record("Performance", "5 submissions processed under 3 seconds", True, duration < 3.0, duration < 3.0)

# Verify all 5 unique IDs are in database
stored_tasks = database.get_tasks()
all_stored = set(rapid_ids).issubset(set(stored_tasks["id"].tolist()))
qa.record("Database Consistency", "All 5 rapidly submitted tasks persisted without race conditions", True, all_stored, all_stored)

# Reset back to clean blank state
admin_client.post("/api/v1/clear-data")

# -------------------------------------------------------------------
# FINAL SUMMARY
# -------------------------------------------------------------------
print("\n=======================================================")
print("E2E QA AUTOMATED TEST EXECUTION SUMMARY")
print("=======================================================")
print(f"Total Test Cases Executed: {qa.tests_run}")
print(f"Passed:                    {qa.tests_passed} ({(qa.tests_passed/qa.tests_run)*100:.1f}%)")
print(f"Failed:                    {qa.tests_failed}")
print("=======================================================\n")

if qa.failures:
    print("FAILED TESTS BREAKDOWN:")
    for f in qa.failures:
        print(f"  - [{f['module']}] {f['test_name']}: Expected {f['expected']}, got {f['actual']}")
else:
    print("ALL TEST CASES PASSED PERFECTLY!")

# Save matrix to json for reporting
with open("scratch/qa_test_matrix.json", "w") as fp:
    json.dump(qa.matrix, fp, indent=2)

