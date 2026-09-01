from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
import os
import sys

# --- NEW PATH SETUP ---
# BASE_DIR is now your 'backend' folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Pointing to the new 'data/input' and 'data/output' folders
UNI_CSV = os.path.join(BASE_DIR, "data", "input", "uni.csv")
COA_CSV = os.path.join(BASE_DIR, "data", "input", "coa.csv")
PLAN_WEEKLY = os.path.join(BASE_DIR, "data", "output", "plan_weekly.json")
PLAN_MONTHLY = os.path.join(BASE_DIR, "data", "output", "plan_monthly.json")

# Tell Python to look in the 'models' folder for your AI logic
sys.path.append(os.path.join(BASE_DIR, "models"))
from priority_model import score_tasks
from optimizer_model import load_availability, generate_plan 

app = FastAPI(title="SIH26027 Block Planning API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/score-tasks")
def api_score_tasks():
    """Runs the priority model on uni.csv and saves the updated file."""
    if not os.path.exists(UNI_CSV):
        return {"error": f"uni.csv not found at {UNI_CSV}"}

    df = pd.read_csv(UNI_CSV)
    df = score_tasks(df)
    df.to_csv(UNI_CSV, index=False)

    return {
        "status": "success",
        "message": "Tasks prioritized successfully.",
        "top_tasks": df.sort_values("priority_score", ascending=False).head(5).to_dict(orient="records"),
    }


@app.post("/generate-plan")
def api_generate_plan():
    """Runs the FULL pipeline and saves both weekly and monthly plans."""
    if not os.path.exists(UNI_CSV):
        return {"error": f"uni.csv not found at {UNI_CSV}"}
    if not os.path.exists(COA_CSV):
        return {"error": f"coa.csv not found at {COA_CSV}"}

    # 1. Score Tasks
    tasks_df = pd.read_csv(UNI_CSV)
    tasks_df = score_tasks(tasks_df)
    tasks_df.to_csv(UNI_CSV, index=False)
    tasks_df = tasks_df.sort_values("priority_score", ascending=False)

    # 2. Load COA properly (needs to read CSV first!)
    df_coa_full = pd.read_csv(COA_CSV)
    
    # 3. Generate Monthly Plan (Master)
    # Re-use the filter_coa_by_days function from your optimizer_model here
    from optimizer_model import filter_coa_by_days 
    df_coa_monthly = filter_coa_by_days(df_coa_full, 30)
    availability = load_availability(df_coa_monthly)
    plan_monthly, _, metrics = generate_plan(tasks_df, availability)
    
    # 4. Derive Weekly Plan
    plan_df = pd.DataFrame(plan_monthly)
    plan_df['date_obj'] = pd.to_datetime(plan_df['date'])
    min_date = plan_df['date_obj'].min()
    plan_weekly_df = plan_df[plan_df['date_obj'] <= min_date + pd.Timedelta(days=7)]
    
    # Drop temp objects
    plan_df = plan_df.drop(columns=['date_obj'])
    plan_weekly_df = plan_weekly_df.drop(columns=['date_obj'])

    # 5. Save BOTH files
    plan_df.to_json(PLAN_MONTHLY, orient="records", indent=4)
    plan_weekly_df.to_json(PLAN_WEEKLY, orient="records", indent=4)

    return {
        "status": "success",
        "message": "Full plan regenerated.",
        "metrics": metrics,
    }


@app.get("/plan/weekly")
def get_weekly_plan():
    if not os.path.exists(PLAN_WEEKLY):
        return {"error": "plan_weekly.json not found. Call POST /generate-plan first."}
    with open(PLAN_WEEKLY, "r") as f:
        return json.load(f)


@app.get("/plan/monthly")
def get_monthly_plan():
    if not os.path.exists(PLAN_MONTHLY):
        return {"error": "plan_monthly.json not found. Call POST /generate-plan first."}
    with open(PLAN_MONTHLY, "r") as f:
        return json.load(f)


@app.get("/")
def root():
    return {"status": "ok", "message": "SIH26027 Block Planning API is running. See /docs for endpoints."}