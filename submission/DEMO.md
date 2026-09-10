# Demo Video & Walkthrough

The demo video is **optional**, but strongly recommended if your project has a working prototype.

## Demo Video Link

- **YouTube / Google Drive Video Link:** `<PASTE_YOUTUBE_OR_GOOGLE_DRIVE_VIDEO_LINK_HERE>`

---

## Demonstration Flow / Key Highlights

1. **Departmental Defect Logging (Civil, Signal, Electrical)**:
   - Live logging of critical corridor defects through role-specific interfaces (TMS, SMMS, TDMS).
   - Instant dynamic risk and urgency scoring using the XGBoost Defect Priority Model.

2. **Corridor Possession Optimization (CP-SAT Solver)**:
   - CP-SAT engine clusters dispersed defect requests into synchronized corridor possession blocks.
   - Generates multi-department bundled possession proposals maximizing throughput and passenger delay minutes saved.

3. **Traffic Controller & Section In-Charge Review**:
   - Central Traffic Control dashboard reviewing pending proposals.
   - Deep constituent task telemetry inspection, approval, or rejection.

4. **Live Conflict Resolution & VIP Auto-Clearance**:
   - Simulation of high-priority / VIP train movements (e.g., Vande Bharat Express).
   - Auto-clearance protocols and emergency corridor release mechanisms.

5. **Interactive Master Schedule & Corridor Gantt Matrix**:
   - Real-time visualization of confirmed possession windows across Delhi Division trunk routes (NDLS–GZB, NDLS–TKD, DLI–SNP).

---

## Verification / Demo Credentials

| Role | Username | Password | Access Domain |
| :--- | :--- | :--- | :--- |
| **Central Traffic Controller (Admin)** | `controller_admin` | `ir_password_2026` | Full Control, CP-SAT Run, Master Schedule |
| **Track Machine Dept (Civil - TMS)** | `tms_engineer` | `ir_password_2026` | Track defects, possession requests |
| **Signal Dept (Signal - SMMS)** | `smms_engineer` | `ir_password_2026` | Signal & Interlocking defect logging |
| **Traction & OHE (Electrical - TDMS)**| `tdms_engineer` | `ir_password_2026` | Overhead Equipment defect logging |

