import os
import json
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import our custom ML and Optimizer modules
from backend.models.priority_model import score_tasks
from backend.models.optimizer import RailwayBlockOptimizer, OptimizerConfig

app = FastAPI(title="SIH 2026 Railway Optimization API")

# --- CORS Configuration (Crucial for React Frontend) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- File Paths ---
# BASE_DIR points to the 'backend' folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Input files
UNI_CSV = os.path.join(BASE_DIR, "data", "input", "uni.csv")
COA_CSV = os.path.join(BASE_DIR, "data", "input", "coa.csv")

# Output files
PLAN_WEEKLY = os.path.join(BASE_DIR, "data", "output", "plan_weekly.json")


# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Railway Optimization API is running. Hit /docs to test endpoints."}

@app.post("/generate-plan")
def api_generate_plan():
    """
    1. Scores tasks using XGBoost ML Regressor.
    2. Optimizes scheduling using Google OR-Tools (CP-SAT).
    3. Returns the output for the React frontend dashboard.
    """
    if not os.path.exists(UNI_CSV) or not os.path.exists(COA_CSV):
        return {"error": f"Missing input CSV files. Ensure uni.csv and coa.csv are inside {os.path.join(BASE_DIR, 'data', 'input')}"}

    try:
        # Step 1: Score Tasks using the new ML brain
        tasks_df = pd.read_csv(UNI_CSV)
        tasks_df = score_tasks(tasks_df)
        
        # Save the scored tasks back to the CSV for the optimizer to read
        tasks_df.to_csv(UNI_CSV, index=False) 

        # Step 2: Run OR-Tools Optimizer
        # 30-second time limit so the API doesn't hang forever during the frontend demo
        config = OptimizerConfig(time_limit_seconds=30.0) 
        optimizer = RailwayBlockOptimizer(config)
        
        output_dir = os.path.join(BASE_DIR, "data", "output")
        
        # The solver handles complex overlapping section constraints natively
        schedule, unscheduled, block_summary, metrics = optimizer.run(
            maintenance_path=UNI_CSV,
            coa_path=COA_CSV,
            output_dir=output_dir
        )

        # Step 3: Save results for the React dashboard
        # Ensure the output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        with open(PLAN_WEEKLY, "w") as f:
            json.dump(json.loads(schedule.to_json(orient="records")), f, indent=4)

        return {
            "status": "success",
            "message": "AI schedule generated successfully.",
            "metrics": metrics.to_dict(orient="records")
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}