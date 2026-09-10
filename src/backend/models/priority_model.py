import pandas as pd
import os
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "priority_classifier_model.joblib") 

# Load the brain into memory when the server starts
try:
    bundle = joblib.load(MODEL_PATH)
    pipeline = bundle["pipeline"]
    feature_cols = bundle["feature_cols"]
except FileNotFoundError:
    pipeline, feature_cols = None, None

def score_tasks(tasks_df: pd.DataFrame) -> pd.DataFrame:
    """Passes tasks through the XGBoost Regressor to predict 0-100 scores."""
    if pipeline is None:
        raise Exception("ML Model not loaded! Missing .joblib file.")

    predict_df = tasks_df.copy()
    
    # Safely handle missing columns to prevent API crashes
    for col in feature_cols:
        if col not in predict_df.columns:
            predict_df[col] = 0 if col in ['sla_flag', 'safety_risk_flag', 'days_overdue', 'repeat_defect_count', 'estimated_block_duration_hours'] else "UNKNOWN"
                
    # 🔮 The actual AI prediction
    predict_df['priority_score'] = pipeline.predict(predict_df[feature_cols])
    predict_df['priority_score'] = predict_df['priority_score'].clip(lower=0, upper=100).round(2)
    
    return predict_df.sort_values(by='priority_score', ascending=False)