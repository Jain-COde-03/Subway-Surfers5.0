# System Architecture – SAMAY (Subway Surfers)

**AI-Driven Railway Corridor Traffic & Synchronized Maintenance Engine**  
**Target Domain**: Indian Railways (Northern Railway, Delhi Division) Trunk Corridors

---

## 1. High-Level Architecture Overview

SAMAY synchronizes maintenance possession blocks across railway departments (Civil/TMS, Signal/SMMS, Electrical/TDMS) while minimizing passenger train traffic delays and section throughput degradation.

```text
                                  ┌────────────────────────────────────────┐
                                  │      Department Field Engineers        │
                                  │  (Civil - TMS / Signal / Electrical)   │
                                  └───────────────────┬────────────────────┘
                                                      │
                                                      │ 1. Log Defects & Asset Data
                                                      ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       SAMAY FRONTEND CLIENT                                            │
│                                 (React 18 + Vite + Tailwind CSS)                                       │
│                                                                                                        │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │   Department Log UI    │  │   Review & Telemetry   │  │   Interactive Master Schedule (Gantt)    │  │
│  └────────────────────────┘  └────────────────────────┘  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┬──────────────────────────────────────────────────────┘
                                                  │
                                                  │ REST API Calls (JWT Authenticated)
                                                  ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       FASTAPI BACKEND ENGINE                                           │
│                                                                                                        │
│   ┌───────────────────────────────┐                  ┌──────────────────────────────────────────────┐  │
│   │       SQLite3 Database        │                  │           Security & RBAC Module             │  │
│   │ (tasks, blocks, notifications)│                  │     (Role-Based Token Verification)          │  │
│   └───────────────┬───────────────┘                  └──────────────────────────────────────────────┘  │
│                   │                                                                                    │
│                   │ Data Pipeline                                                                      │
│                   ▼                                                                                    │
│   ┌───────────────────────────────────────────┐      ┌──────────────────────────────────────────────┐  │
│   │    XGBoost Defect Priority Model          │      │     OR-Tools CP-SAT Possession Solver        │  │
│   │  • Defect severity & SLA overrun risks    │ ───> │  • Multi-department task bundling            │  │
│   │  • Track geometry & repetition scoring    │      │  • Corridor traffic conflict avoidance       │  │
│   │  • Dynamic Priority Score (0–100)         │      │  • Passenger delay minimization              │  │
│   └───────────────────────────────────────────┘      └──────────────────────┬───────────────────────┘  │
│                                                                             │                          │
│                                                                             ▼                          │
│                                                      ┌──────────────────────────────────────────────┐  │
│                                                      │       Corridor Possession Proposals          │  │
│                                                      │  (Bundled Windows, Risk Avoided, Delay Mins) │  │
│                                                      └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Subsystems

### 2.1 Departmental Ingestion & Defect Management
- **Civil Engineering (Track Maintenance System - TMS)**: Tracks rail fractures, sleeper damage, switch/crossing misalignments, ballast deficiency.
- **Signal & Telecommunication (SMMS)**: Tracks point machine failures, track circuit glitches, axle counter errors, interlocking issues.
- **Electrical / Traction (Traction Distribution - TDMS)**: Tracks OHE cantenary/contact wire wear, neutral section defects, pantograph flashover risks.

### 2.2 Machine Learning Prioritization Engine
- **Algorithm**: XGBoost Regressor trained on historical defect logs, repetition metrics, asset criticality classes, safety flags, and SLA overruns.
- **Input Features**:
  - `asset_type`, `defect_type`, `defect_severity` (Low, Medium, High, Critical)
  - `days_overdue`, `repeat_defect_count`, `asset_criticality_class` (A, B, C)
  - `safety_risk_flag`, `sla_flag`
- **Output**: Normalized continuous Priority Score ($0 - 100$).

### 2.3 Optimization & Corridor Possession Engine (CP-SAT)
- Built using **Google OR-Tools CP-SAT (Constraint Programming - Satisfiability)**.
- **Objective Function**:
  $$\max \sum_{b \in \text{Blocks}} \left( w_1 \cdot \text{PriorityScore}(b) + w_2 \cdot \text{RiskAvoided}(b) - w_3 \cdot \text{PassengerDelay}(b) \right)$$
- **Constraints Handled**:
  - Mutual corridor exclusion (no overlapping possession on identical line/track sections).
  - Maximum contiguous work window limits per division guidelines.
  - Multi-department shadow possession: whenever Civil acquires a block, Signal and Electrical tasks in the same physical section are automatically bundled into the shadow window.

### 2.4 Central Traffic Control & VIP Clearance Engine
- Real-time simulation of express traffic (e.g., Vande Bharat, Rajdhani).
- Auto-clearance protocols evaluate scheduled train paths against ongoing possession blocks, initiating alerts or buffer compression when conflicts arise.

---

## 3. Database Schema (SQLite3)

### `tasks` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT PRIMARY KEY | UUID identifier for defect task |
| `asset_id` | TEXT | Physical asset tag (e.g., TRK-NDLS-04) |
| `department` | TEXT | Department code (`Civil`, `Signal`, `Electrical`) |
| `section_id` | TEXT | Railway section code (`NDLS-GZB`, `NDLS-TKD`, `DLI-SNP`) |
| `defect_type` | TEXT | Categorical defect name |
| `defect_severity` | TEXT | Severity ranking (`Critical`, `High`, `Medium`, `Low`) |
| `priority_score` | REAL | ML-computed urgency score (0–100) |
| `status` | TEXT | Task lifecycle (`Pending`, `Bundled`, `Confirmed`, `Completed`) |

### `blocks` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT PRIMARY KEY | Proposal identifier |
| `section_id` | TEXT | Corridor section identifier |
| `window_date` | TEXT | Scheduled block calendar date |
| `start_hour` | INTEGER | Starting hour (24-hour format) |
| `duration_hours` | INTEGER | Possession duration |
| `is_bundled` | BOOLEAN | Whether multiple departments are co-located |
| `departments_bundled` | TEXT | JSON list of participating departments |
| `priority_score` | REAL | Aggregate score of bundled tasks |
| `passenger_delay_minutes_saved` | INTEGER | Calculated minutes of passenger train delays saved |
| `status` | TEXT | `Proposed`, `Approved`, `Rejected` |

---

## 4. Deployment Topology

The system is fully containerized via `docker-compose.yml`:
- **Backend Container**: FastAPI uvicorn server running Python 3.11 with SQLite volume mount at `/data/railway.db`.
- **Frontend Container**: Multi-stage build producing production React assets served via an optimized Nginx alpine container on port 80.

