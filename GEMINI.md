# Project Memory & Architecture Context

**Project Name**: SAMAY (Subway Surfers) – AI-Driven Railway Corridor Traffic & Synchronized Maintenance Engine  
**Target Domain**: Indian Railways (Northern Railway, Delhi Division) Trunk Corridors

---

## 1. System Architecture & Tech Stack

- **Backend**: FastAPI (`backend/main.py`)
  - **Database**: SQLite3 (`backend/database.py`, `backend/railway.db`)
  - **AI / ML**: XGBoost Defect Priority Model (`backend/models/priority_model.py`)
  - **Optimization**: OR-Tools CP-SAT Corridor Possession Solver (`backend/models/optimizer.py`)
  - **Python Environment**: `backend/.venv/bin/python`
- **Frontend**: React 18 + Vite + Tailwind CSS (`frontend/src/`)
  - **State Management**: Centralized React State + Polling / REST API synchronization
  - **Routing**: Tab/view-based navigation (`AdminDashboard.jsx`, `DepartmentDashboard.jsx`, `ControllerDashboard.jsx`)

---

## 2. Key Database Tables (`backend/database.py`)

1. **`tasks`**: Department-submitted maintenance requests & defects.
   - `id`, `asset_id`, `department`, `section_id`, `division`, `asset_type`, `defect_type`, `defect_severity`, `days_overdue`, `due_date`, `estimated_block_duration_hours`, `repeat_defect_count`, `sla_flag`, `asset_criticality_class`, `safety_risk_flag`, `priority_score`, `status`, `submitted_at`.
2. **`blocks`**: Corridor possession blocks and CP-SAT proposals.
   - `id`, `section_id`, `window_date`, `start_hour`, `duration_hours`, `is_bundled`, `departments_bundled`, `priority_score`, `risk_avoided_score`, `passenger_delay_minutes_saved`, `status`, `created_at`.
3. **`notifications`**: Real-time cross-department alerts.
   - `id`, `department`, `message`, `timestamp`, `read`, `type`.

---

## 3. Core API Endpoints (`backend/main.py`)

- `POST /api/v1/tasks`: Log new defect from department, triggers ML scoring and stores in SQLite.
- `GET /api/v1/tasks`: Fetch all tasks (supports department filtering).
- `POST /api/v1/optimize`: CP-SAT solver clusters active defects by corridor and generates multi-department bundled proposals with rich constituent tasks.
- `GET /api/v1/proposals`: Fetch all synthesized proposals.
- `POST /api/v1/blocks/approve/{id}`: Approve a proposal, syncs constituent tasks to Confirmed, and updates Master Schedule.
- `POST /api/v1/blocks/reject/{id}`: Reject a proposal.
- `POST /api/v1/clear-data`: Clears all tasks, blocks, and notifications to start 100% clean/blank.
- `POST /api/v1/seed-sample-data`: Loads curated demo dataset on demand.

---

## 4. Frontend Component Hierarchy

- `frontend/src/components/dashboards/`:
  - `AdminDashboard.jsx`: Central traffic control, CP-SAT optimizer runner, Proposal Review Queue (Pending/Approved/All tabs), Telemetry modal (`ProposalDetailModal`), Master Schedule.
  - `DepartmentDashboard.jsx`: Departmental view for Civil (TMS), Signal (SMMS), and Electrical (TDMS).
- `frontend/src/components/department/`:
  - `LogDepartmentDefect.jsx`: Real-time defect submission form.
  - `DepartmentTaskQueue.jsx`: Department task list and status tracker.
  - `ConfirmedBlockCalendar.jsx`: Interactive calendar displaying confirmed corridor possession windows.

