import pandas as pd
import numpy as np
import random
import os
def assign_label_diabetes(fbs, hba1c, bmi):
    if fbs >= 126 or hba1c >= 6.5 or bmi >= 30:
        return 1
    elif fbs >= 100 or hba1c >= 5.7:
        return 1 if random.random() < 0.6 else 0
    return 0

def assign_label_bp(sys, dia, sleep):
    if sys >= 140 or dia >= 90:
        return 1
    elif sys >= 130 or dia >= 85 or sleep < 6:
        return 1 if random.random() < 0.5 else 0
    return 0

def assign_label_heart(chol, trig, smoke, diet, bmi):
    risk = 0
    risk += 1 if chol >= 240 or trig >= 200 else 0
    risk += 1 if smoke != 'no' else 0
    risk += 1 if diet in ['non-vegetarian', 'mixed'] else 0
    risk += 1 if bmi >= 28 else 0
    return 1 if risk >= 2 else 0

def generate_sample(n=3000):
    rows = []
    for _ in range(n):
        age = random.randint(18, 75)
        gender = random.choice(['male', 'female'])
        height = random.randint(150, 185)
        weight = random.randint(50, 110)
        bmi = round(weight / ((height / 100) ** 2), 2)

        fbs = random.randint(80, 160)
        hba1c = round(random.uniform(4.5, 8.5), 1)
        sys = random.randint(100, 160)
        dia = random.randint(60, 100)
        chol = random.randint(150, 300)
        trig = random.randint(100, 300)

        diet = random.choice(['vegetarian', 'mixed', 'non-vegetarian'])
        smoke = random.choice(['no', 'yes', 'occasionally'])
        alcohol = random.choice(['no', 'yes'])
        water = round(random.uniform(0.5, 4), 1)
        sleep = random.randint(4, 9)

        diabetes = assign_label_diabetes(fbs, hba1c, bmi)
        bp = assign_label_bp(sys, dia, sleep)
        heart = assign_label_heart(chol, trig, smoke, diet, bmi)

        rows.append({
            "age": age,
            "gender": gender,
            "height": height,
            "weight": weight,
            "bmi": bmi,
            "fastingBloodSugar": fbs,
            "hba1c": hba1c,
            "systolicBP": sys,
            "diastolicBP": dia,
            "cholesterol": chol,
            "triglycerides": trig,
            "dietType": diet,
            "smoking": smoke,
            "alcohol": alcohol,
            "waterIntake": water,
            "sleep": sleep,
            "diabetes": diabetes,
            "bp": bp,
            "heart": heart
        })

    df = pd.DataFrame(rows)
    output_dir = os.path.join(os.path.dirname(__file__), "ml-models")
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, "medical_smart_data.csv")
    df.to_csv(output_path, index=False)
    print(f"✅ Saved: {output_path}")


if __name__ == "__main__":
    generate_sample()
