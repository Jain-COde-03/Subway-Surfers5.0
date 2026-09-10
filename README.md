# SAMAY – Synchronized Asset Management & Accelerated Yield

> **AI-Driven Railway Corridor Traffic & Synchronized Maintenance Possession Engine**  
> Developed for **Smart India Hackathon (SIH) 2026** · Northern Railway (Delhi Division) Trunk Corridors

---

## 1. Project Information

- **Project Title:** SAMAY (Subway Surfers) – AI-Driven Railway Corridor Traffic & Synchronized Maintenance Engine
- **PS ID:** SIH26027
- **PS Title:** Intelligent Scheduling & Synchronized Multi-Department Railway Corridor Possession System
- **Category:** Software
- **Theme:** Smart Automation / Transportation & Logistics
- **Target Domain:** Indian Railways (Northern Railway, Delhi Division) Trunk Corridors

---

## 2. Problem Statement

Indian Railways operates one of the densest rail networks in the world. Maintenance activities are distributed across siloed engineering departments:
1. **Civil Engineering** (Track Maintenance System - TMS)
2. **Signal & Telecommunication** (SMMS)
3. **Electrical / Traction Distribution** (TDMS)

### Key Operational Challenges
- **Siloed Corridor Blocks**: Each department independently demands traffic possession windows. Sequential, unsynchronized block allocations cause compounding passenger and freight train delays.
- **Static Defect Prioritization**: Maintenance queues often prioritize simple tasks rather than critical, high-risk safety defects nearing SLA breaches.
- **Section Congestion & Throughput Loss**: High-density trunk corridors (e.g., NDLS–GZB, NDLS–TKD) suffer severe punctuality drops when unplanned maintenance conflicts with express train movements (e.g., Vande Bharat, Rajdhani).

---

## 3. Proposed Solution

**SAMAY** is an intelligent dual-engine platform combining **Machine Learning** with **Operations Research**:

1. **AI Defect Prioritization Model (XGBoost)**: Evaluates dynamic variables (repetition counts, asset criticality, track geometry deviations, safety risk flags, and days overdue) to assign an objective urgency score ($0 - 100$).
2. **Synchronized Corridor Possession Optimizer (Google OR-Tools CP-SAT)**: Solves a multi-commodity constraint satisfaction problem. It clusters geographically co-located defects across Civil, Signal, and Electrical into unified "shadow possession" blocks.
3. **VIP Conflict Detection & Auto-Clearance Engine**: Simulates real-time corridor operations, alerting controllers to train schedule clashes and optimizing buffer clearance windows.
4. **Interactive Master Schedule**: Provides Section Controllers and Chief Controllers with a unified Gantt-style view of approved, pending, and live corridor possession windows.

---

## 4. Key Features

- **Multi-Department Defect Logging**: Dedicated telemetry interfaces for Civil (TMS), Signal (SMMS), and Electrical (TDMS) field teams.
- **AI-Driven Urgency Scoring**: Instant XGBoost regression prioritizing defects based on safety impact and failure probability.
- **Multi-Department Task Bundling**: Mathematical constraint solver that combines cross-departmental work into a single possession window, saving hundreds of passenger delay minutes.
- **VIP Train Auto-Clearance Protocol**: Automated conflict alert and clearance simulation for priority rakes.
- **Role-Based Access Control (RBAC)**: Secure JWT-authenticated access separating Central Traffic Controllers from Departmental Field Engineers.
- **Auditable Proposal Approval Pipeline**: Section In-Charge can inspect constituent task breakdowns, approve, reject, or re-run solver iterations.

---

## 5. Technology Stack

- **Backend API**: Python 3.11, FastAPI, Uvicorn, Pydantic
- **Database**: SQLite3 (persisted via Docker volumes)
- **Machine Learning**: XGBoost, Scikit-learn, Pandas, NumPy
- **Optimization Engine**: Google OR-Tools CP-SAT Constraint Solver
- **Frontend Client**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Containerization & Deployment**: Docker, Docker Compose, Nginx

---

## 6. System Architecture

For in-depth architectural breakdown, constraint formulations, and database schemas, see [docs/architecture.md](docs/architecture.md).

```text
┌────────────────────────────────┐       ┌────────────────────────────────┐
│   Department Field Engineers   │       │    Central Traffic Control     │
│   (Civil / Signal / Electrical)│       │    (Section Controllers)       │
└───────────────┬────────────────┘       └───────────────┬────────────────┘
                │                                        │
                ▼                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               SAMAY Unified Web Client (React 18 + Vite)                │
│    [Defect Logger] · [Proposal Review Queue] · [Master Schedule Gantt]  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ REST API (JSON / JWT)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend Orchestrator                         │
│                                                                         │
│   ┌──────────────────────────┐           ┌──────────────────────────┐   │
│   │  XGBoost Priority Model  │           │   OR-Tools CP-SAT Solver │   │
│   │ (Dynamic Defect Scoring) │ ────────> │(Corridor Window Bundler) │   │
│   └──────────────────────────┘           └──────────────────────────┘   │
│                 │                                      │                │
│                 └──────────────────┬───────────────────┘                │
│                                    ▼                                    │
│                     SQLite3 Relational Storage                         │
│                    (tasks, blocks, notifications)                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Repository Structure

```text
SUBWAY-SURFERS-2.0/
├── README.md                      # Primary project overview & documentation
├── SUBMISSION_GUIDE.md            # SIH 2026 checklist & compliance guide
├── LICENSE                        # MIT License
├── docker-compose.yml             # Docker multi-container orchestration
├── requirements.txt               # Backend Python dependencies
├── submission/
│   ├── PRESENTATION.md            # Pitch deck details & links
│   ├── DEMO.md                    # Demo video link & demonstration flow
│   └── SIH26027_Pitch_Deck.pptx   # Final presentation deck
├── docs/
│   └── architecture.md            # Complete system design & mathematical model
├── assets/
│   ├── ml/                        # Confusion matrix & feature importance plots
│   └── screenshots/               # UI dashboard screenshots
└── src/
    ├── backend/                   # FastAPI application, database & ML models
    │   ├── main.py                # Core REST API routes
    │   ├── database.py            # SQLite schema & queries
    │   ├── auth.py                # JWT authentication & RBAC
    │   ├── models/                # XGBoost model & CP-SAT optimizer
    │   ├── data/                  # Input corridor CSVs and plan outputs
    │   └── Dockerfile             # Backend container definition
    └── frontend/                  # React 18 frontend application
        ├── src/                   # Dashboards, modals & state stores
        ├── package.json           # Frontend dependencies
        ├── vite.config.js         # Vite configuration & dev proxy
        └── Dockerfile             # Multi-stage Nginx container definition
```

---

## 8. Installation & Setup Instructions

### Prerequisites
- [Git](https://git-scm.com/)
- [Python 3.11+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/) & npm
- [Docker](https://www.docker.com/) & Docker Compose *(optional for container deployment)*

---

### Option A: Docker Deployment (Recommended)

Run the entire application (Backend + Frontend + Database) with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/NSUT-SIH-26/NSUT-SIH-DEMO.git
cd SUBWAY-SURFERS-2.0

# 2. Build and start services
docker-compose up --build -d

# 3. Open your browser
# Frontend Client: http://localhost:80
# Backend API Docs: http://localhost:8000/docs
```

---

### Option B: Local Development Setup

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd src/backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```
*Backend runs on `http://127.0.0.1:8000` with Swagger UI at `http://127.0.0.1:8000/docs`.*

#### 2. Frontend Setup

```bash
# Navigate to frontend directory in a new terminal
cd src/frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 9. Default Demo Credentials

| Role | Username | Password | Dashboard Access |
| :--- | :--- | :--- | :--- |
| **Central Traffic Controller** | `controller_admin` | `ir_password_2026` | Optimizer Runner, Master Schedule, Clearance |
| **Civil Track Engineer (TMS)** | `tms_engineer` | `ir_password_2026` | Civil Defect Logging & Track Queue |
| **Signal Engineer (SMMS)** | `smms_engineer` | `ir_password_2026` | Signal & Interlocking Maintenance Queue |
| **Electrical Engineer (TDMS)** | `tdms_engineer` | `ir_password_2026` | OHE & Traction Equipment Defect Queue |

---

## 10. Presentation & Demo

- **Pitch Deck**: [submission/PRESENTATION.md](submission/PRESENTATION.md) (or open [SIH26027_Pitch_Deck.pptx](submission/SIH26027_Pitch_Deck.pptx))
- **Demo Video & Flow**: [submission/DEMO.md](submission/DEMO.md)
- **ML Performance Visualizations**: Located in [assets/ml/](assets/ml/)

---

## 11. Team Members & Roles

- **Team Name**: Subway Surfers
- **Team Lead**: Dhairya Jain *(System Architecture, ML & Full-Stack Engineering)*
- **Team Members**:
  - Full-Stack & Algorithm Engineering: *Subway Surfers Core Team*
  - Operations Research & CP-SAT Optimization: *Optimization Lead*
  - Data Pipeline & Domain Modeling: *Railway Domain Lead*

---

## 12. License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

