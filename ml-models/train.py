import pandas as pd
import numpy as np
import os
import joblib
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error

# === Path ===
BASE_PATH = 'C:/Users/Aniket Naik/OneDrive/Desktop/IntelliHealth/ml-models/data'
DATA_FILE = os.path.join(BASE_PATH, "data",'lifestyle_synthetic_dataset.csv')

# === Load Dataset ===
df = pd.read_csv(DATA_FILE)

# === Features & Labels ===
X = df.drop(columns=['diabetes', 'blood_pressure', 'heart_disease'])
y_diabetes = df['diabetes']
y_bp = df['blood_pressure']
y_heart = df['heart_disease']

# === Split ===
X_train, X_test, y_train_d, y_test_d = train_test_split(X, y_diabetes, test_size=0.2, random_state=42)
_, _, y_train_bp, y_test_bp = train_test_split(X, y_bp, test_size=0.2, random_state=42)
_, _, y_train_h, y_test_h = train_test_split(X, y_heart, test_size=0.2, random_state=42)

# === Train Models ===
def train_model(name, y_train, y_test):
    print(f"🚀 Training model for {name}")
    model = XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    r2 = r2_score(y_test, preds)
    mse = mean_squared_error(y_test, preds)
    print(f"✅ {name} R² Score: {r2:.4f}, MSE: {mse:.4f}")

    joblib.dump(model, os.path.join(BASE_PATH, f'{name}_model.pkl'))
    return model

diabetes_model = train_model('diabetes', y_train_d, y_test_d)
bp_model = train_model('bp', y_train_bp, y_test_bp)
heart_model = train_model('heart', y_train_h, y_test_h)
