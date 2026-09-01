import pandas as pd
import os

def compute_priority_score(row):
    """Calculates priority score (0-100) based on business rules."""
    severity_map = {'Critical': 1.0, 'Major': 0.6, 'Minor': 0.25}
    s_sev = severity_map.get(row.get('defect_severity', 'Minor'), 0.25)
    s_over = max(0, min(row.get('days_overdue', 0) / 30.0, 1.0))
    s_safe = 1.0 if row.get('safety_risk_flag', False) else 0.0
    s_sla = 1.0 if row.get('sla_flag', False) else 0.0
    s_rec = min(row.get('repeat_defect_count', 0) / 3.0, 1.0)
    s_crit = 1.0 if row.get('asset_criticality_class', '') == 'Trunk Route' else 0.5
    
    score = 100 * (0.30 * s_sev + 0.20 * s_over + 0.20 * s_safe + 0.10 * s_sla + 0.10 * s_rec + 0.10 * s_crit)
    return round(score, 1)

def score_tasks(tasks_df):
    """
    Importable function for FastAPI: 
    Takes a DataFrame of tasks, applies scores, and sorts them.
    (Notice there are no print statements here—perfect for the backend!)
    """
    tasks_df['priority_score'] = tasks_df.apply(compute_priority_score, axis=1)
    return tasks_df.sort_values(by='priority_score', ascending=False)

# CLI Testing Block (Only runs when you execute this file directly)
import os

# CLI Testing Block (Only runs when you execute this file directly)
if __name__ == "__main__":
    print("Testing Priority Model...")
    
    # Dynamically find the backend/ folder, then point to data/input/uni.csv
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    UNI_CSV = os.path.join(BASE_DIR, "data", "input", "uni.csv")
    
    try:
        df = pd.read_csv(UNI_CSV) 
        df = score_tasks(df)
        df.to_csv(UNI_CSV, index=False)
        print(f"✅ Success: Calculated scores and updated uni.csv at {UNI_CSV}!\n")
        
        print("=== 🔥 TOP 5 HIGHEST PRIORITY TASKS 🔥 ===")
        print(df[['asset_id', 'department', 'defect_severity', 'priority_score']].head(5))
        
    except FileNotFoundError:
        print(f"Error: Could not find 'uni.csv' at {UNI_CSV}")