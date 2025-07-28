import pandas as pd
import numpy as np
import os
import joblib
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
import warnings

warnings.filterwarnings("ignore")  # Suppress UndefinedMetricWarning

# Paths
BASE_DIR = 'C:/Users/Aniket Naik/OneDrive/Desktop/IntelliHealth/ml-models'
DATA_PATH = os.path.join(BASE_DIR, 'data', 'medical_dataset.csv')
MODEL_DIR = os.path.join(BASE_DIR, 'models')

# Load dataset
df = pd.read_csv(DATA_PATH).fillna(0)

# Encode categorical columns
def encode_column(col, value):
    value = str(value).lower()
    if value in ['yes', 'non-vegetarian']:
        return 1
    elif value in ['no', 'vegetarian']:
        return 0
    elif value == 'mixed':
        return 2
    elif value == 'male':
        return 0
    elif value == 'female':
        return 1
    return 2  # fallback/other

for col in ['gender', 'dietType', 'smoking', 'alcohol']:
    df[col] = df[col].apply(lambda x: encode_column(col, x))

# Define feature set
features = [
    'age', 'gender', 'height', 'weight', 'bmi',
    'fastingBloodSugar', 'hba1c', 'systolicBP', 'diastolicBP',
    'cholesterol', 'triglycerides', 'dietType', 'smoking', 'alcohol', 'waterIntake'
]

X = df[features]

# Evaluation function
def evaluate_model(target_column, model_filename):
    if target_column not in df.columns:
        print(f"❌ Column '{target_column}' not found in dataset.")
        return

    y = df[target_column]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model_path = os.path.join(MODEL_DIR, model_filename)
    if not os.path.exists(model_path):
        print(f"❌ Model file not found: {model_path}")
        return

    model = joblib.load(model_path)

    print(f"\n📊 Evaluation for {target_column.upper()} ({model.__class__.__name__})")
    y_pred = model.predict(X_test)
    accuracy = round(accuracy_score(y_test, y_pred) * 100, 2)

    print("✅ Accuracy:", accuracy, "%")
    print("📋 Classification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))
    print("=" * 60)

# Evaluate all three models
evaluate_model('diabetes', 'diabetes_model.pkl')
evaluate_model('blood_pressure', 'blood_pressure_model.pkl')
evaluate_model('heart_disease', 'med_heart_disease_model.pkl')
