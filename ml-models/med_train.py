import pandas as pd
import joblib
import shap
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from xgboost import XGBClassifier
import os

# Updated path to reflect subdirectory "data"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "medical_smart_data.csv")
df = pd.read_csv(DATA_PATH)

# Encode categorical variables
df['gender'] = df['gender'].map({'male': 0, 'female': 1})
df['smoking'] = df['smoking'].map({'no': 0, 'yes': 1, 'occasionally': 1})
df['alcohol'] = df['alcohol'].map({'no': 0, 'yes': 1})
df = pd.get_dummies(df, columns=['dietType'])

# Feature columns
features = [
    'age', 'gender', 'height', 'weight', 'bmi', 'fastingBloodSugar', 'hba1c',
    'systolicBP', 'diastolicBP', 'cholesterol', 'triglycerides',
    'smoking', 'alcohol', 'waterIntake', 'sleep',
    'dietType_mixed', 'dietType_non-vegetarian', 'dietType_vegetarian'
]

# Target labels and output model files
targets = {
    "diabetes": "med_diabetes_model.pkl",
    "bp": "med_blood_pressure_model.pkl",
    "heart": "med_heart_disease_model.pkl"
}

# Train, evaluate, and save each model
for label, model_file in targets.items():
    print(f"\n🔍 Training model for: {label.upper()}")
    X = df[features]
    y = df[label]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = XGBClassifier(use_label_encoder=False, eval_metric='logloss')
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred))

    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(5, 4))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title(f"Confusion Matrix: {label.upper()}")
    plt.tight_layout()
    plt.savefig(os.path.join(BASE_DIR, f"cm_{label}.png"))
    plt.close()
    X_shap = X_train.astype(float)  # Ensure float dtype for SHAP
    explainer = shap.Explainer(model, X_shap)
    shap_values = explainer(X_test[:100].astype(float))  # Also ensure float for test data
    shap.plots.beeswarm(shap_values, max_display=10, show=False)
    plt.title(f"SHAP: {label.upper()}")
    plt.tight_layout()
    plt.savefig(os.path.join(BASE_DIR, f"shap_{label}.png"))
    plt.close()

    # Save trained model
    joblib.dump(model, os.path.join(BASE_DIR, model_file))
    print(f"✅ Model saved: {model_file}")
