import pandas as pd
import numpy as np
import joblib
import json
import sys
import os

# === Paths ===
BASE_PATH = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_PATH, 'diabetes_model.pkl')
BP_MODEL_PATH = os.path.join(BASE_PATH, 'bp_model.pkl')
HEART_MODEL_PATH = os.path.join(BASE_PATH, 'heart_model.pkl')

# === Load Models ===
diabetes_model = joblib.load(MODEL_PATH)
bp_model = joblib.load(BP_MODEL_PATH)
heart_model = joblib.load(HEART_MODEL_PATH)

# === Read Input JSON from stdin ===
input_json = sys.stdin.read()
input_data = json.loads(input_json)

# === Create DataFrame ===
df = pd.DataFrame([input_data])

# === Drop irrelevant fields ===
drop_cols = ['name', 'contact', 'state', 'district', 'city', 'diet', 'smoking',
             'alcohol', 'area', 'fastfood', 'symptoms', 'familyHistory',
             'currentSymptoms', 'dietType', 'areaType', 'fastFoodFreq',
             'diabetesSymptoms', 'bpSymptoms', 'heartSymptoms']

df.drop(columns=[col for col in drop_cols if col in df.columns], inplace=True)

# === One-hot encode categorical columns ===
df = pd.get_dummies(df)

# === Align features with training data ===
expected_features = diabetes_model.feature_names_in_
missing_cols = set(expected_features) - set(df.columns)
for col in missing_cols:
    df[col] = 0
df = df[expected_features]

# === Prediction ===
diabetes_prob = float(diabetes_model.predict(df)[0])
bp_prob = float(bp_model.predict(df)[0])
heart_prob = float(heart_model.predict(df)[0])

# === Risk Categorization Function ===
def get_risk_level(score):
    if score > 0.7:
        return "High"
    elif score > 0.4:
        return "Borderline"
    else:
        return "Low"

# === Output ===
output = {
    "isDiabetes": round(diabetes_prob, 4),
    "diabetesLevel": get_risk_level(diabetes_prob),
    "isBP": round(bp_prob, 4),
    "bpLevel": get_risk_level(bp_prob),
    "isHeartDisease": round(heart_prob, 4),
    "heartLevel": get_risk_level(heart_prob)
}

print(json.dumps(output))
