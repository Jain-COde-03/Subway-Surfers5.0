import os
import pandas as pd
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from xgboost import XGBRegressor
from sklearn.metrics import r2_score

# Fix Paths for your local Windows machine
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "input"
OUT_DIR = BASE_DIR / "models"
OUT_DIR.mkdir(parents=True, exist_ok=True)

RANDOM_STATE = 42

print("🚀 Starting XGBoost Regressor Training...")

# 1. LOAD & MERGE DATA
sources = {
    "TMS": [f for f in os.listdir(DATA_DIR) if f.startswith("tms") and f.endswith(".csv")][0],
    "SMMS": [f for f in os.listdir(DATA_DIR) if f.startswith("smms") and f.endswith(".csv")][0],
    "TDMS": [f for f in os.listdir(DATA_DIR) if f.startswith("tdms") and f.endswith(".csv")][0]
}

frames = []
for source_name, fname in sources.items():
    d = pd.read_csv(DATA_DIR / fname)
    d["source_system"] = source_name
    frames.append(d)

df = pd.concat(frames, ignore_index=True)

# 2. COMPUTE TARGET SCORE (Ground Truth)
SEVERITY_MAP = {"Critical": 1.0, "Major": 0.6, "Minor": 0.25}
CRITICALITY_MAP = {"Trunk Route": 1.0, "Branch Line": 0.5}

df["severity_score"] = df["defect_severity"].map(SEVERITY_MAP)
df["overdue_score"] = (df["days_overdue"].clip(lower=0) / 30).clip(upper=1)
df["safety_score"] = df["safety_risk_flag"].astype(float)
df["sla_score"] = df["sla_flag"].astype(float)
df["recurrence_score"] = (df["repeat_defect_count"] / 3).clip(upper=1)
df["criticality_score"] = df["asset_criticality_class"].map(CRITICALITY_MAP)

# This is the 0-100 numerical target we want the AI to predict
df["priority_score_computed"] = 100 * (
    0.30 * df["severity_score"] + 0.20 * df["overdue_score"] +
    0.20 * df["safety_score"] + 0.10 * df["sla_score"] +
    0.10 * df["recurrence_score"] + 0.10 * df["criticality_score"]
)

# 3. FEATURES & TARGET
categorical_features = ["department", "defect_severity", "asset_criticality_class", "division"]
boolean_features = ["sla_flag", "safety_risk_flag"]
numeric_features = ["days_overdue", "estimated_block_duration_hours", "repeat_defect_count"]

feature_cols = categorical_features + boolean_features + numeric_features
X = df[feature_cols].copy()
for c in boolean_features:
    X[c] = X[c].astype(int)

# TARGET is now the number, not the text bucket
y = df["priority_score_computed"]

# 4. TRAIN / TEST SPLIT
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=RANDOM_STATE)

# 5. PIPELINE & XGBREGRESSOR
preprocessor = ColumnTransformer(
    transformers=[("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
                  ("num", "passthrough", boolean_features + numeric_features)]
)

clf = XGBRegressor(n_estimators=300, max_depth=4, learning_rate=0.08, random_state=RANDOM_STATE)
model_pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("classifier", clf)])

print("🧠 Training the AI...")
model_pipeline.fit(X_train, y_train)

# 6. EVALUATE
predictions = model_pipeline.predict(X_test)
accuracy = r2_score(y_test, predictions)
print(f"📊 Accuracy (R2 Score): {accuracy * 100:.2f}%")

# 7. SAVE MODEL
model_bundle = {
    "pipeline": model_pipeline,
    "feature_cols": feature_cols,
    "categorical_features": categorical_features,
    "boolean_features": boolean_features,
    "numeric_features": numeric_features,
}

model_path = OUT_DIR / "priority_classifier_model.joblib"
joblib.dump(model_bundle, model_path)
print(f"✅ Model successfully saved to: {model_path}")