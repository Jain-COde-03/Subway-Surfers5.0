import pandas as pd
import os
import joblib

# Setup Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "rf_priority_model.pkl")

# Load the ML model into memory when the API starts
try:
    rf_model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    rf_model = None
    print(f"Warning: ML model not found at {MODEL_PATH}. Run train_model.py first.")

def preprocess_for_prediction(df):
    """Formats incoming API data to match the ML model's expected inputs."""
    df_ml = pd.DataFrame()
    severity_map = {'Critical': 3, 'Major': 2, 'Minor': 1}
    
    df_ml['severity_num'] = df.get('defect_severity', 'Minor').map(severity_map).fillna(1)
    df_ml['days_overdue'] = df.get('days_overdue', 0)
    df_ml['safety_num'] = df.get('safety_risk_flag', False).astype(int)
    df_ml['sla_num'] = df.get('sla_flag', False).astype(int)
    df_ml['repeat_defect_count'] = df.get('repeat_defect_count', 0)
    
    # Handle criticality mapping safely
    if 'asset_criticality_class' in df.columns:
        df_ml['criticality_num'] = df['asset_criticality_class'].apply(lambda x: 1 if x == 'Trunk Route' else 0)
    else:
        df_ml['criticality_num'] = 0
        
    return df_ml[['severity_num', 'days_overdue', 'safety_num', 'sla_num', 'repeat_defect_count', 'criticality_num']]

def score_tasks(tasks_df):
    """Passes tasks to the Random Forest ML Model to predict priority."""
    if rf_model is None:
        raise Exception("ML Model not loaded! Please run train_model.py to generate the .pkl file.")
        
    # Format the data for the AI
    X_predict = preprocess_for_prediction(tasks_df)
    
    # 🔮 The AI Prediction!
    tasks_df['priority_score'] = rf_model.predict(X_predict).round(1)
    
    return tasks_df.sort_values(by='priority_score', ascending=False)

# CLI Testing Block
if __name__ == "__main__":
    print("Testing ML Priority Model...")
    UNI_CSV = os.path.join(BASE_DIR, "data", "input", "uni.csv")
    
    try:
        df = pd.read_csv(UNI_CSV) 
        df = score_tasks(df)
        df.to_csv(UNI_CSV, index=False)
        print(f"✅ Success: ML Model predicted scores and updated {UNI_CSV}!\n")
        print("=== 🔥 TOP 5 PREDICTIONS 🔥 ===")
        print(df[['asset_id', 'department', 'defect_severity', 'priority_score']].head(5))
    except Exception as e:
        print(f"Error: {e}")