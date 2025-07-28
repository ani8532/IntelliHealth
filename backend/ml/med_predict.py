import sys
import json
import joblib
import os
import pandas as pd
import shap
import warnings
warnings.filterwarnings("ignore")

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = BASE_DIR

# Load trained models
diabetes_model = joblib.load(os.path.join(MODEL_DIR, 'med_diabetes_model.pkl'))
bp_model = joblib.load(os.path.join(MODEL_DIR, 'med_blood_pressure_model.pkl'))
heart_model = joblib.load(os.path.join(MODEL_DIR, 'med_heart_disease_model.pkl'))

# Read JSON input from stdin
try:
    input_json = sys.stdin.read()
    input_data = json.loads(input_json)
except Exception as e:
    print(json.dumps({"error": f"Invalid input: {str(e)}"}))
    sys.exit(1)

# Convert to DataFrame
df = pd.DataFrame([input_data])

# Encode categorical variables
df['gender'] = df['gender'].map({'male': 0, 'female': 1}).fillna(2)
df['smoking'] = df['smoking'].map({'no': 0, 'yes': 1, 'occasionally': 1}).fillna(0)
df['alcohol'] = df['alcohol'].map({'no': 0, 'yes': 1}).fillna(0)
df = pd.get_dummies(df, columns=['dietType'])

# Expected feature columns
expected_columns = [
    'age', 'gender', 'height', 'weight', 'bmi', 'fastingBloodSugar', 'hba1c',
    'systolicBP', 'diastolicBP', 'cholesterol', 'triglycerides',
    'smoking', 'alcohol', 'waterIntake', 'sleep',
    'dietType_mixed', 'dietType_non-vegetarian', 'dietType_vegetarian'
]

# Add missing columns
for col in expected_columns:
    if col not in df.columns:
        df[col] = 0

# Reorder and cast columns
df = df[expected_columns].astype(float)

# Helper functions
def safe_predict_proba(model, X):
    try:
        return float(model.predict_proba(X)[0][1])
    except:
        return 0.0

def risk_message(prob):
    if prob > 0.66:
        return "Your risk appears high. Please consult a healthcare provider."
    elif prob > 0.33:
        return "Your risk appears moderate. Maintain a healthy lifestyle and monitor regularly."
    else:
        return "Your risk appears low. Maintain your healthy habits."

def top_shap_features(model, X, feature_names, top_n=3):
    explainer = shap.Explainer(model, X)
    shap_values = explainer(X)
    values = shap_values.values[0]
    contributions = sorted(zip(feature_names, values), key=lambda x: abs(x[1]), reverse=True)
    top_features = []
    for name, val in contributions[:top_n]:
        direction = "increased" if val > 0 else "decreased"
        top_features.append(f"{name} has {direction} the risk.")
    return top_features

# Compute predictions and explanations
probs = {
    "diabetesRisk": safe_predict_proba(diabetes_model, df),
    "bpRisk": safe_predict_proba(bp_model, df),
    "heartDiseaseRisk": safe_predict_proba(heart_model, df)
}

reasons = {
    "diabetesReasons": top_shap_features(diabetes_model, df, expected_columns),
    "bpReasons": top_shap_features(bp_model, df, expected_columns),
    "heartReasons": top_shap_features(heart_model, df, expected_columns)
}

# Build final report string
report_lines = [
    f"Diabetes: {risk_message(probs['diabetesRisk'])}",
    f"Blood Pressure: {risk_message(probs['bpRisk'])}",
    f"Heart Disease: {risk_message(probs['heartDiseaseRisk'])}",
    "\nTop Contributing Factors:",
    "Diabetes: " + "; ".join(reasons['diabetesReasons']),
    "BP: " + "; ".join(reasons['bpReasons']),
    "Heart Disease: " + "; ".join(reasons['heartReasons'])
]

# Output JSON
result = {
    **probs,
    "suggestions": {
        "diabetes": risk_message(probs["diabetesRisk"]),
        "blood_pressure": risk_message(probs["bpRisk"]),
        "heart_disease": risk_message(probs["heartDiseaseRisk"])
    },
    "reasons": reasons,
    "report": "\n".join(report_lines)
}

print(json.dumps(result))