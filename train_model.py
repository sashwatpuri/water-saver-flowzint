"""
AquaGuard AI - Model Training Script
=====================================
Trains and compares Random Forest vs XGBoost for binary water quality
classification (SAFE / UNSAFE) on aquaguard_data.csv.

Applies Feature Scaling (StandardScaler) and saves the scaler along with 
the winning model. Produces diagnostic visualizations.
"""

import json
import time
import warnings
import os
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    accuracy_score, f1_score, roc_auc_score,
    classification_report, confusion_matrix,
)
from xgboost import XGBClassifier

# For rendering plots headlessly (no display required)
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

warnings.filterwarnings("ignore")

# --------------------------------------------------------------------------
# Config
# --------------------------------------------------------------------------
CSV_PATH     = "aquaguard_data.csv"
MODEL_DIR    = "model"
FEATURES     = ["pH", "TDS", "DO", "turbidity", "temperature"]
TARGET       = "quality_status"
TEST_SIZE    = 0.20
RANDOM_STATE = 42
CV_FOLDS     = 5

os.makedirs(MODEL_DIR, exist_ok=True)

SEP  = "=" * 62
DASH = "-" * 62

# --------------------------------------------------------------------------
# 1. Load dataset
# --------------------------------------------------------------------------
print(SEP)
print("  AquaGuard AI - Model Training")
print(SEP)

df = pd.read_csv(CSV_PATH)
print(f"\n[DATA] Loaded {len(df):,} rows x {len(df.columns)} columns")
print(f"       Features : {FEATURES}")
print(f"       Target   : {TARGET}")

vc = df[TARGET].value_counts()
print(f"\n[DATA] Class distribution:")
for cls, cnt in vc.items():
    print(f"         {cls:<8} {cnt:>5}  ({cnt / len(df) * 100:.1f}%)")

# --------------------------------------------------------------------------
# 2. Prepare features, scale features & encode labels
# --------------------------------------------------------------------------
X = df[FEATURES].copy()

# Fit and apply feature scaling
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_scaled_df = pd.DataFrame(X_scaled, columns=FEATURES)

le = LabelEncoder()
y  = le.fit_transform(df[TARGET])          # SAFE->0, UNSAFE->1 (alphabetical)

print(f"\n[PREP] Feature scaling (StandardScaler) applied.")
print(f"[PREP] Label encoding: {dict(zip(le.classes_, le.transform(le.classes_)))}")

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled_df, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
)
print(f"[PREP] Split: {len(X_train):,} train  /  {len(X_test):,} test")

# --------------------------------------------------------------------------
# 3. Define models
# --------------------------------------------------------------------------
scale_pos = float((y == 0).sum()) / float((y == 1).sum())

models = {
    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        max_depth=8,                # Lower max_depth to prevent overfitting
        min_samples_split=10,
        min_samples_leaf=4,
        class_weight="balanced",
        random_state=RANDOM_STATE,
        n_jobs=-1,
    ),
    "XGBoost": XGBClassifier(
        n_estimators=150,
        max_depth=4,                # Shallower trees for regularization
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos,
        eval_metric="logloss",
        random_state=RANDOM_STATE,
        verbosity=0,
    ),
}

# --------------------------------------------------------------------------
# 4. Train + evaluate each model
# --------------------------------------------------------------------------
results = {}
skf = StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_STATE)

for name, model in models.items():
    print(f"\n{DASH}")
    print(f"  Training: {name}")
    print(DASH)

    t0 = time.time()
    model.fit(X_train, y_train)
    elapsed = time.time() - t0

    y_pred  = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    f1  = f1_score(y_test, y_pred, average="weighted")
    auc = roc_auc_score(y_test, y_proba)

    # Cross-validation
    cv_scores = cross_val_score(
        model, X_scaled_df, y, cv=skf, scoring="f1_weighted", n_jobs=-1
    )

    results[name] = {
        "model"      : model,
        "accuracy"   : acc,
        "f1"         : f1,
        "auc"        : auc,
        "cv_mean"    : cv_scores.mean(),
        "cv_std"     : cv_scores.std(),
        "train_time" : elapsed,
        "y_pred"     : y_pred,
        "y_proba"    : y_proba,
    }

    print(f"  Accuracy     : {acc:.4f}  ({acc * 100:.2f}%)")
    print(f"  F1 (weighted): {f1:.4f}")
    print(f"  ROC-AUC      : {auc:.4f}")
    print(f"  CV F1        : {cv_scores.mean():.4f} +/- {cv_scores.std():.4f}")
    print(f"  Training time: {elapsed:.2f}s")

    print(f"\n  Classification Report:")
    print(classification_report(
        y_test, y_pred, target_names=le.classes_, labels=[0, 1]
    ))

# --------------------------------------------------------------------------
# 5. Compare and pick winner
# --------------------------------------------------------------------------
print(f"\n{SEP}")
print("  Model Comparison")
print(SEP)
print(f"  {'Model':<22} {'F1':>8} {'AUC':>8} {'CV F1':>10} {'Time':>8}")
print(f"  {'-'*22} {'-'*8} {'-'*8} {'-'*10} {'-'*8}")
for name, r in results.items():
    print(
        f"  {name:<22} {r['f1']:>8.4f} {r['auc']:>8.4f} "
        f"{r['cv_mean']:>10.4f} {r['train_time']:>7.2f}s"
    )

best_name  = max(results, key=lambda n: results[n]["f1"])
best       = results[best_name]
runner_up  = [k for k in results if k != best_name][0]
f1_margin  = best["f1"] - results[runner_up]["f1"]

print(f"\n  Winner  : {best_name}")
print(f"  F1 lead : {f1_margin:+.4f} over {runner_up}")

# --------------------------------------------------------------------------
# 6. Save winner & scaler
# --------------------------------------------------------------------------
MODEL_PATH    = os.path.join(MODEL_DIR, "aquaguard_model.joblib")
SCALER_PATH   = os.path.join(MODEL_DIR, "aquaguard_scaler.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "model_metadata.json")

joblib.dump(best["model"], MODEL_PATH, compress=3)
joblib.dump(scaler, SCALER_PATH, compress=3)

metadata = {
    "model_type"     : best_name,
    "features"       : FEATURES,
    "classes"        : list(le.classes_),
    "label_encoding" : {
        str(cls): int(le.transform([cls])[0]) for cls in le.classes_
    },
    "metrics": {
        "accuracy"    : round(best["accuracy"], 4),
        "f1_weighted" : round(best["f1"],       4),
        "roc_auc"     : round(best["auc"],      4),
        "cv_f1_mean"  : round(best["cv_mean"],  4),
        "cv_f1_std"   : round(best["cv_std"],   4),
    },
    "hyperparameters": {
        str(k): str(v) for k, v in best["model"].get_params().items()
    },
    "dataset": {
        "total_rows" : int(len(df)),
        "train_rows" : int(len(X_train)),
        "test_rows"  : int(len(X_test)),
        "safe_pct"   : round((df[TARGET] == "SAFE").mean() * 100,   1),
        "unsafe_pct" : round((df[TARGET] == "UNSAFE").mean() * 100, 1),
    },
    "trained_at": pd.Timestamp.now().isoformat(),
}

with open(METADATA_PATH, "w") as f:
    json.dump(metadata, f, indent=2)

print(f"\n[SAVE] Model    -> {MODEL_PATH}")
print(f"[SAVE] Scaler   -> {SCALER_PATH}")
print(f"[SAVE] Metadata -> {METADATA_PATH}")

# --------------------------------------------------------------------------
# 7. Data Visualizations
# --------------------------------------------------------------------------
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Plot Feature Importances
if hasattr(best["model"], "feature_importances_"):
    importances = best["model"].feature_importances_
    indices = np.argsort(importances)
    axes[0].barh(range(len(indices)), importances[indices], align='center', color='#0F3B6F')
    axes[0].set_yticks(range(len(indices)))
    axes[0].set_yticklabels([FEATURES[i] for i in indices])
    axes[0].set_title('Feature Importances')
    axes[0].set_xlabel('Relative Importance')

# Plot Confusion Matrix
cm = confusion_matrix(y_test, best["y_pred"])
im = axes[1].imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
axes[1].figure.colorbar(im, ax=axes[1])
axes[1].set(xticks=np.arange(cm.shape[1]),
       yticks=np.arange(cm.shape[0]),
       xticklabels=le.classes_, yticklabels=le.classes_,
       title='Confusion Matrix',
       ylabel='True status',
       xlabel='Predicted status')
plt.setp(axes[1].get_xticklabels(), rotation=45, ha="right", rotation_mode="anchor")

# Loop over data dimensions and create text annotations.
fmt = 'd'
thresh = cm.max() / 2.
for i in range(cm.shape[0]):
    for j in range(cm.shape[1]):
        axes[1].text(j, i, format(cm[i, j], fmt),
                ha="center", va="center",
                color="white" if cm[i, j] > thresh else "black")

fig.tight_layout()
viz_path = os.path.join(MODEL_DIR, "model_evaluation.png")
plt.savefig(viz_path, dpi=150)
plt.close()

print(f"[VIZ] Saved model evaluation plots -> {viz_path}")
print(f"\n{SEP}")
print("  Model ready for inference via backend/main.py")
print(SEP)
