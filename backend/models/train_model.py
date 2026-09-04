import pandas as pd
import os
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UNI_CSV = os.path.join(BASE_DIR, "data", "input", "uni.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "rf_priority_model.pkl")

def preprocess_data(df):
    """Converts text data into numbers the ML model can understand."""
    df_ml = df.copy()
    
    # 1. Map Severity to numbers
    severity_map = {'Critical': 3, 'Major': 2, 'Minor': 1}
    df_ml['severity_num'] = df_ml['defect_severity'].map(severity_map).fillna(1)
    
    # 2. Map Criticality to numbers
    df_ml['criticality_num'] = df_ml['asset_criticality_class'].apply(lambda x: 1 if x == 'Trunk Route' else 0)
    
    # 3. Convert booleans to 1/0
    df_ml['safety_num'] = df_ml['safety_risk_flag'].astype(int)
    df_ml['sla_num'] = df_ml['sla_flag'].astype(int)
    
    # Features (Inputs) and Target (Output)
    features = ['severity_num', 'days_overdue', 'safety_num', 'sla_num', 'repeat_defect_count', 'criticality_num']
    X = df_ml[features]
    
    # The target is the score we previously generated via the formula (our historical "Ground Truth")
    y = df_ml['priority_score']
    
    return X, y, features

if __name__ == "__main__":
    print("🚀 Starting Machine Learning Training Process...")
    
    # 1. Load Data
    df = pd.read_csv(UNI_CSV)
    if 'priority_score' not in df.columns:
        print("Error: priority_score not found in uni.csv. Run your old priority_model.py once first to generate targets!")
        exit()
        
    X, y, feature_names = preprocess_data(df)
    
    # 2. Split into Training (80%) and Testing (20%) data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 3. Initialize and Train the Model
    print("🧠 Training Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # 4. Evaluate the Model (For the Judges)
    predictions = model.predict(X_test)
    r2 = r2_score(y_test, predictions)
    mse = mean_squared_error(y_test, predictions)
    
    print("\n📊 MODEL METRICS (Put this on your PPT!):")
    print(f"Accuracy (R2 Score): {r2 * 100:.2f}%")
    print(f"Mean Squared Error: {mse:.2f}")
    
    # 5. Extract Feature Importance (What the AI thinks is most important)
    print("\n🔍 AI FEATURE IMPORTANCE:")
    importances = model.feature_importances_
    for name, importance in zip(feature_names, importances):
        print(f" - {name}: {importance * 100:.1f}%")
        
    # 6. Save the trained model to a file
    joblib.dump(model, MODEL_PATH)
    print(f"\n✅ Model successfully saved to {MODEL_PATH}")