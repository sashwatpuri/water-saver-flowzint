import os
import json
import time
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

def main():
    csv_path = "ecosphere_data.csv"
    model_dir = "model"
    os.makedirs(model_dir, exist_ok=True)
    
    print("=" * 60)
    print("  EcoSphere AI - Air Quality Forecasting Model Training")
    print("=" * 60)
    
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found. Please run the data generator first.")
        return
        
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df):,} rows of telemetry data.")
    
    # Sort by location and timestamp to create lagged features correctly
    df = df.sort_values(by=["location", "timestamp"]).reset_index(drop=True)
    
    # Define features for forecasting
    feature_cols = [
        "AQI", "PM25", "PM10", "CO", "NO2", "SO2", "O3", 
        "air_temperature", "humidity", "wind_speed", "traffic_index"
    ]
    
    # Create target: AQI 24 hours in the future
    # Group by location and shift AQI back by 24 steps (representing 24 hours)
    df["future_AQI"] = df.groupby("location")["AQI"].shift(-24)
    
    # Drop rows with NaN targets (the last 24 hours of each location)
    df_clean = df.dropna(subset=["future_AQI"]).reset_index(drop=True)
    
    X = df_clean[feature_cols].copy()
    y = df_clean["future_AQI"].copy()
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )
    
    print(f"Training features: {feature_cols}")
    print(f"Train size: {X_train.shape[0]} | Test size: {X_test.shape[0]}")
    
    # Train Random Forest Regressor
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    
    t0 = time.time()
    model.fit(X_train, y_train)
    elapsed = time.time() - t0
    
    # Evaluate model
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Model trained in {elapsed:.2f} seconds.")
    print(f"Mean Squared Error (MSE): {mse:.4f}")
    print(f"Root Mean Squared Error (RMSE): {rmse:.4f}")
    print(f"R-squared Score (R2): {r2:.4f}")
    
    # Save the models
    model_path = os.path.join(model_dir, "ecosphere_air_model.joblib")
    scaler_path = os.path.join(model_dir, "ecosphere_air_scaler.joblib")
    metadata_path = os.path.join(model_dir, "air_model_metadata.json")
    
    joblib.dump(model, model_path, compress=3)
    joblib.dump(scaler, scaler_path, compress=3)
    
    metadata = {
        "model_type": "RandomForestRegressor",
        "features": feature_cols,
        "metrics": {
            "rmse": round(rmse, 4),
            "r2": round(r2, 4)
        },
        "trained_at": pd.Timestamp.now().isoformat()
    }
    
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"[SAVE] Model  -> {model_path}")
    print(f"[SAVE] Scaler -> {scaler_path}")
    print("=" * 60)

if __name__ == "__main__":
    main()
