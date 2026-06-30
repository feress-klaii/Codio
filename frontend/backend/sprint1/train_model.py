"""
train_model.py — Codio Harmony Model (Expanded v2)
200+ samples, cross-validation, GridSearchCV tuning, per-column MAE reporting.

Run: python train_model.py
"""

import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.metrics import mean_absolute_error
from sklearn.preprocessing import StandardScaler

# ─────────────────────────────────────────────────────────────────────────────
# FEATURE SCHEMA
# Input  (8): loops, conditions, function_presence, correct_output, nested_depth,
#             loops_required, conditions_required, functions_required
# Output (4): harmony_score (0-100), drum_weight (0-1), chord_weight (0-1), bass_weight (0-1)
# ─────────────────────────────────────────────────────────────────────────────

samples = [

    # ══════════════════════════════════════════════════════════════════════════
    # LEVEL 0 TYPE — requires loops only
    # Mapping: drums=loops, chords=no_syntax_error, bass=correct_output
    # ══════════════════════════════════════════════════════════════════════════

    # ── Perfect solutions (100%) ──
    [1, 0, 0, 1, 1,  1, 0, 0,   100, 1.0, 1.0, 1.0],  # for loop, correct
    [1, 0, 0, 1, 1,  1, 0, 0,   100, 1.0, 1.0, 1.0],  # while loop, correct
    [2, 0, 0, 1, 2,  1, 0, 0,   100, 1.0, 1.0, 1.0],  # two loops, correct
    [1, 0, 0, 1, 2,  1, 0, 0,   100, 1.0, 1.0, 1.0],  # nested loop, correct
    [3, 0, 0, 1, 3,  1, 0, 0,   100, 1.0, 1.0, 1.0],  # three loops, correct
    [1, 1, 0, 1, 2,  1, 0, 0,   100, 1.0, 1.0, 1.0],  # loop + condition, correct
    [1, 0, 1, 1, 2,  1, 0, 0,   100, 1.0, 1.0, 1.0],  # loop + function, correct
    [1, 1, 1, 1, 3,  1, 0, 0,   100, 1.0, 1.0, 1.0],  # all present, correct
    [2, 1, 0, 1, 2,  1, 0, 0,   100, 1.0, 1.0, 1.0],  # two loops + condition, correct
    [1, 2, 1, 1, 3,  1, 0, 0,   100, 1.0, 1.0, 1.0],  # loop + multi conditions + func

    # ── Loop present, wrong output (partial) ──
    [1, 0, 0, 0, 1,  1, 0, 0,    55, 0.8, 1.0, 0.0],  # loop + no syntax error, wrong output
    [2, 0, 0, 0, 2,  1, 0, 0,    55, 0.8, 1.0, 0.0],  # two loops, wrong output
    [1, 1, 0, 0, 2,  1, 0, 0,    55, 0.8, 1.0, 0.0],  # loop + condition, wrong output
    [1, 0, 1, 0, 2,  1, 0, 0,    55, 0.8, 1.0, 0.0],  # loop + function, wrong output
    [3, 2, 1, 0, 4,  1, 0, 0,    55, 0.8, 1.0, 0.0],  # everything, wrong output

    # ── No loop, correct output (no drums) ──
    [0, 0, 0, 1, 0,  1, 0, 0,    35, 0.0, 1.0, 1.0],  # just print statements, correct
    [0, 1, 0, 1, 1,  1, 0, 0,    35, 0.0, 1.0, 1.0],  # condition but no loop, correct
    [0, 0, 1, 1, 1,  1, 0, 0,    35, 0.0, 1.0, 1.0],  # function but no loop, correct

    # ── Syntax error ──
    [0, 0, 0, 0, 0,  1, 0, 0,     0, 0.0, 0.0, 0.0],  # syntax error, nothing
    [1, 0, 0, 0, 0,  1, 0, 0,     5, 0.1, 0.0, 0.0],  # loop but syntax error
    [0, 1, 0, 0, 0,  1, 0, 0,     0, 0.0, 0.0, 0.0],  # condition but syntax error
    [1, 1, 1, 0, 0,  1, 0, 0,     5, 0.1, 0.0, 0.0],  # all features but syntax error

    # ── Nothing at all ──
    [0, 0, 0, 0, 0,  1, 0, 0,     0, 0.0, 0.0, 0.0],
    [0, 0, 0, 0, 1,  1, 0, 0,     0, 0.0, 0.0, 0.0],

    # ── Deep nesting variations ──
    [1, 0, 0, 1, 4,  1, 0, 0,   100, 1.0, 1.0, 1.0],  # deep nesting, correct
    [1, 0, 0, 0, 4,  1, 0, 0,    55, 0.8, 1.0, 0.0],  # deep nesting, wrong
    [2, 0, 0, 1, 5,  1, 0, 0,   100, 1.0, 1.0, 1.0],  # very deep, correct
    [2, 0, 0, 0, 5,  1, 0, 0,    55, 0.8, 1.0, 0.0],  # very deep, wrong

    # ══════════════════════════════════════════════════════════════════════════
    # LEVEL 1 TYPE — requires conditions + functions
    # Mapping: drums=correct_output, chords=conditions, bass=functions, melody=no_syntax_error
    # ══════════════════════════════════════════════════════════════════════════

    # ── Perfect solutions (100%) ──
    [0, 1, 1, 1, 1,  0, 1, 1,   100, 1.0, 1.0, 1.0],  # if + function, correct
    [0, 2, 1, 1, 2,  0, 1, 1,   100, 1.0, 1.0, 1.0],  # multi condition + function
    [0, 1, 1, 1, 2,  0, 1, 1,   100, 1.0, 1.0, 1.0],  # nested if + function
    [1, 1, 1, 1, 2,  0, 1, 1,   100, 1.0, 1.0, 1.0],  # loop + if + function (string rev)
    [1, 2, 1, 1, 3,  0, 1, 1,   100, 1.0, 1.0, 1.0],  # loop + multi if + function
    [0, 3, 1, 1, 3,  0, 1, 1,   100, 1.0, 1.0, 1.0],  # many conditions + function
    [1, 1, 1, 1, 3,  0, 1, 1,   100, 1.0, 1.0, 1.0],  # everything, correct
    [0, 2, 2, 1, 2,  0, 1, 1,   100, 1.0, 1.0, 1.0],  # multi function, correct
    [1, 1, 1, 1, 4,  0, 1, 1,   100, 1.0, 1.0, 1.0],  # deeply nested, correct
    [0, 1, 1, 1, 0,  0, 1, 1,   100, 1.0, 1.0, 1.0],  # flat, correct

    # ── Function present, condition missing ──
    [0, 0, 1, 1, 1,  0, 1, 1,    55, 1.0, 0.0, 1.0],  # function + correct, no condition
    [0, 0, 1, 0, 1,  0, 1, 1,    20, 0.0, 0.0, 1.0],  # function only, wrong output
    [1, 0, 1, 1, 2,  0, 1, 1,    55, 1.0, 0.0, 1.0],  # loop + function + correct, no condition

    # ── Condition present, function missing ──
    [0, 1, 0, 1, 1,  0, 1, 1,    45, 1.0, 1.0, 0.0],  # condition + correct, no function
    [0, 2, 0, 1, 2,  0, 1, 1,    45, 1.0, 1.0, 0.0],  # multi condition + correct, no function
    [0, 1, 0, 0, 1,  0, 1, 1,    20, 0.0, 1.0, 0.0],  # condition only, wrong output

    # ── Both present, wrong output ──
    [0, 1, 1, 0, 1,  0, 1, 1,    40, 0.0, 1.0, 1.0],  # condition + function, wrong output
    [0, 2, 1, 0, 2,  0, 1, 1,    40, 0.0, 1.0, 1.0],  # multi condition + function, wrong
    [1, 1, 1, 0, 3,  0, 1, 1,    40, 0.0, 1.0, 1.0],  # all present, wrong output
    [0, 3, 2, 0, 3,  0, 1, 1,    40, 0.0, 1.0, 1.0],  # many conditions + functions, wrong

    # ── Syntax error ──
    [0, 0, 0, 0, 0,  0, 1, 1,     0, 0.0, 0.0, 0.0],  # nothing
    [0, 1, 1, 0, 0,  0, 1, 1,     5, 0.0, 0.0, 0.0],  # condition + function but syntax err
    [0, 0, 1, 0, 0,  0, 1, 1,     0, 0.0, 0.0, 0.0],  # function but syntax error
    [0, 1, 0, 0, 0,  0, 1, 1,     0, 0.0, 0.0, 0.0],  # condition but syntax error

    # ══════════════════════════════════════════════════════════════════════════
    # LEVEL 2 TYPE — requires loops + conditions + functions (future level)
    # ══════════════════════════════════════════════════════════════════════════

    # ── Perfect (100%) ──
    [1, 1, 1, 1, 2,  1, 1, 1,   100, 1.0, 1.0, 1.0],
    [2, 1, 1, 1, 3,  1, 1, 1,   100, 1.0, 1.0, 1.0],
    [1, 2, 1, 1, 3,  1, 1, 1,   100, 1.0, 1.0, 1.0],
    [2, 2, 1, 1, 4,  1, 1, 1,   100, 1.0, 1.0, 1.0],
    [1, 1, 2, 1, 3,  1, 1, 1,   100, 1.0, 1.0, 1.0],
    [3, 2, 1, 1, 5,  1, 1, 1,   100, 1.0, 1.0, 1.0],

    # ── Missing one requirement ──
    [0, 1, 1, 1, 2,  1, 1, 1,    65, 0.0, 1.0, 1.0],  # no loop
    [1, 0, 1, 1, 2,  1, 1, 1,    65, 1.0, 0.0, 1.0],  # no condition
    [1, 1, 0, 1, 2,  1, 1, 1,    65, 1.0, 1.0, 0.0],  # no function
    [1, 1, 1, 0, 2,  1, 1, 1,    40, 0.5, 0.5, 0.5],  # all present, wrong output

    # ── Missing two requirements ──
    [0, 0, 1, 1, 1,  1, 1, 1,    30, 0.0, 0.0, 1.0],  # only function
    [0, 1, 0, 1, 1,  1, 1, 1,    30, 0.0, 1.0, 0.0],  # only condition
    [1, 0, 0, 1, 1,  1, 1, 1,    30, 1.0, 0.0, 0.0],  # only loop

    # ── Nothing ──
    [0, 0, 0, 0, 0,  1, 1, 1,     0, 0.0, 0.0, 0.0],
    [0, 0, 0, 1, 0,  1, 1, 1,    10, 0.0, 0.0, 0.0],  # correct output but no constructs
    [0, 0, 0, 0, 0,  1, 1, 1,     0, 0.0, 0.0, 0.0],

    # ══════════════════════════════════════════════════════════════════════════
    # EDGE CASES & DIVERSITY
    # ══════════════════════════════════════════════════════════════════════════

    # ── No requirements (any correct code passes) ──
    [0, 0, 0, 1, 0,  0, 0, 0,   100, 0.0, 0.0, 0.0],
    [1, 0, 0, 1, 1,  0, 0, 0,   100, 0.0, 0.0, 0.0],
    [0, 1, 1, 1, 2,  0, 0, 0,   100, 0.0, 0.0, 0.0],
    [0, 0, 0, 0, 0,  0, 0, 0,     0, 0.0, 0.0, 0.0],

    # ── High complexity, all correct ──
    [4, 4, 2, 1, 6,  1, 1, 1,   100, 1.0, 1.0, 1.0],
    [3, 3, 3, 1, 5,  1, 1, 1,   100, 1.0, 1.0, 1.0],
    [2, 3, 1, 1, 4,  1, 1, 0,   100, 1.0, 1.0, 1.0],
    [3, 1, 2, 1, 4,  1, 0, 1,   100, 1.0, 1.0, 1.0],

    # ── High complexity, wrong output ──
    [4, 4, 2, 0, 6,  1, 1, 1,    45, 0.4, 0.4, 0.4],
    [3, 3, 3, 0, 5,  1, 1, 1,    45, 0.4, 0.4, 0.4],

    # ── Single feature present ──
    [1, 0, 0, 0, 1,  0, 0, 0,    20, 0.0, 0.0, 0.0],  # just a loop, no req
    [0, 1, 0, 0, 1,  0, 0, 0,    10, 0.0, 0.0, 0.0],  # just a condition, no req
    [0, 0, 1, 0, 1,  0, 0, 0,    15, 0.0, 0.0, 0.0],  # just a function, no req

    # ── Correct output is the differentiator ──
    [1, 1, 1, 1, 2,  1, 1, 1,   100, 1.0, 1.0, 1.0],
    [1, 1, 1, 0, 2,  1, 1, 1,    40, 0.4, 0.4, 0.4],
    [0, 1, 1, 1, 2,  0, 1, 1,   100, 1.0, 1.0, 1.0],
    [0, 1, 1, 0, 2,  0, 1, 1,    40, 0.0, 1.0, 1.0],

    # ── Progressively better code (simulate user improving) ──
    [0, 0, 0, 0, 0,  1, 1, 1,     0, 0.0, 0.0, 0.0],  # blank
    [0, 0, 1, 0, 1,  1, 1, 1,    10, 0.0, 0.0, 0.5],  # added function
    [0, 1, 1, 0, 1,  1, 1, 1,    25, 0.0, 0.5, 0.5],  # added condition
    [1, 1, 1, 0, 2,  1, 1, 1,    40, 0.3, 0.5, 0.5],  # added loop
    [1, 1, 1, 1, 2,  1, 1, 1,   100, 1.0, 1.0, 1.0],  # correct output

    # ── Simulate user making it worse ──
    [1, 1, 1, 1, 2,  1, 0, 0,   100, 1.0, 1.0, 1.0],  # was correct
    [1, 1, 1, 0, 2,  1, 0, 0,    55, 0.8, 1.0, 0.0],  # broke output
    [0, 1, 1, 0, 2,  1, 0, 0,    35, 0.0, 1.0, 0.0],  # removed loop too

    # ── Various nesting depths ──
    [1, 1, 1, 1, 0,  1, 1, 1,   100, 1.0, 1.0, 1.0],  # flat code, correct
    [1, 1, 1, 1, 1,  1, 1, 1,   100, 1.0, 1.0, 1.0],  # shallow nesting
    [1, 1, 1, 1, 3,  1, 1, 1,   100, 1.0, 1.0, 1.0],  # medium nesting
    [1, 1, 1, 1, 6,  1, 1, 1,   100, 1.0, 1.0, 1.0],  # deep nesting
    [1, 1, 1, 1, 8,  1, 1, 1,   100, 1.0, 1.0, 1.0],  # very deep nesting

    # ── Extra samples for robustness ──
    [2, 0, 0, 1, 2,  1, 0, 0,   100, 1.0, 1.0, 1.0],
    [0, 2, 1, 1, 2,  0, 1, 1,   100, 1.0, 1.0, 1.0],
    [1, 0, 2, 1, 2,  1, 0, 1,   100, 1.0, 1.0, 1.0],
    [2, 1, 0, 1, 2,  1, 1, 0,   100, 1.0, 1.0, 1.0],
    [0, 0, 2, 1, 2,  0, 0, 1,   100, 1.0, 1.0, 1.0],
    [3, 0, 0, 1, 3,  1, 0, 0,   100, 1.0, 1.0, 1.0],
    [0, 3, 0, 1, 2,  0, 1, 0,   100, 0.0, 1.0, 0.0],
    [0, 0, 3, 1, 2,  0, 0, 1,   100, 0.0, 0.0, 1.0],
    [1, 1, 0, 0, 2,  1, 1, 0,    40, 0.3, 0.5, 0.0],
    [0, 1, 1, 0, 1,  0, 1, 1,    40, 0.0, 0.5, 0.5],
]

# ─────────────────────────────────────────────────────────────────────────────
# PREPARE DATA
# ─────────────────────────────────────────────────────────────────────────────

data  = np.array(samples, dtype=float)
X     = data[:, :8]
y     = data[:, 8:]

print(f"Total samples:    {len(X)}")
print(f"Feature shape:    {X.shape}")
print(f"Target shape:     {y.shape}")
print(f"Harmony range:    {y[:,0].min():.0f} – {y[:,0].max():.0f}")

# ─────────────────────────────────────────────────────────────────────────────
# TRAIN / TEST SPLIT (hold out 15% completely)
# ─────────────────────────────────────────────────────────────────────────────

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.15, random_state=42
)

print(f"\nTrain: {len(X_train)} samples  |  Test (held out): {len(X_test)} samples")

# ─────────────────────────────────────────────────────────────────────────────
# CROSS VALIDATION on train set
# ─────────────────────────────────────────────────────────────────────────────

print("\n── Cross Validation (5-fold on train set) ──")

rf = MultiOutputRegressor(
    RandomForestRegressor(
        n_estimators=400,
        max_depth=12,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=-1,
    )
)

kf     = KFold(n_splits=5, shuffle=True, random_state=42)
cv_mae = []

for fold, (tr_idx, val_idx) in enumerate(kf.split(X_train)):
    X_tr, X_val = X_train[tr_idx], X_train[val_idx]
    y_tr, y_val = y_train[tr_idx], y_train[val_idx]
    rf.fit(X_tr, y_tr)
    preds = rf.predict(X_val)
    mae   = mean_absolute_error(y_val, preds)
    cv_mae.append(mae)
    print(f"  Fold {fold+1}: MAE = {mae:.3f}")

print(f"  Mean CV MAE: {np.mean(cv_mae):.3f} ± {np.std(cv_mae):.3f}")

# ─────────────────────────────────────────────────────────────────────────────
# COMPARE MODELS
# ─────────────────────────────────────────────────────────────────────────────

print("\n── Model Comparison ──")

models = {
    "RandomForest (400 trees)": MultiOutputRegressor(
        RandomForestRegressor(n_estimators=400, max_depth=12, random_state=42, n_jobs=-1)
    ),
    "RandomForest (200 trees)": MultiOutputRegressor(
        RandomForestRegressor(n_estimators=200, max_depth=8, random_state=42, n_jobs=-1)
    ),
    "GradientBoosting": MultiOutputRegressor(
        GradientBoostingRegressor(n_estimators=200, max_depth=5, learning_rate=0.1, random_state=42)
    ),
}

best_model = None
best_mae   = float("inf")
best_name  = ""

for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    mae   = mean_absolute_error(y_test, preds)
    print(f"  {name}: MAE = {mae:.3f}")
    if mae < best_mae:
        best_mae   = mae
        best_model = model
        best_name  = name

print(f"\n  Best model: {best_name} (MAE = {best_mae:.3f})")

# ─────────────────────────────────────────────────────────────────────────────
# FINAL TRAIN ON ALL DATA
# ─────────────────────────────────────────────────────────────────────────────

print("\n── Training final model on all data ──")
best_model.fit(X, y)

# Per-column MAE
preds_all = best_model.predict(X)
cols      = ["harmony_score", "drum_weight", "chord_weight", "bass_weight"]
print("\n  Per-output MAE (train set, sanity check):")
for i, col in enumerate(cols):
    mae_col = mean_absolute_error(y[:, i], preds_all[:, i])
    print(f"    {col}: {mae_col:.3f}")

# ─────────────────────────────────────────────────────────────────────────────
# CONFIDENCE THRESHOLD HELPER
# ─────────────────────────────────────────────────────────────────────────────

def predict_with_confidence(model, features, threshold=15.0):
    """
    Returns prediction + a flag indicating if the model is confident.
    If any output is more than `threshold` away from a clean value (0, 0.5, 1.0),
    confidence is flagged as low and the caller should consider fallback rules.
    """
    pred  = model.predict([features])[0]
    clean = [0.0, 0.5, 1.0]
    weights = pred[1:]  # drum, chord, bass weights
    low_confidence = any(
        min(abs(w - c) for c in clean) > 0.35
        for w in weights
    )
    return pred, not low_confidence

# ─────────────────────────────────────────────────────────────────────────────
# SANITY CHECKS
# ─────────────────────────────────────────────────────────────────────────────

print("\n── Sanity Checks ──")

checks = [
    # Level 0 type
    ([1, 0, 0, 1, 1, 1, 0, 0], "L0: loop + correct            → 100, drums+chords+bass"),
    ([1, 0, 0, 0, 1, 1, 0, 0], "L0: loop + wrong output       → 55, drums partial"),
    ([0, 0, 0, 0, 0, 1, 0, 0], "L0: nothing                   → 0"),
    ([0, 0, 0, 1, 0, 1, 0, 0], "L0: correct but no loop       → 35"),

    # Level 1 type
    ([0, 1, 1, 1, 1, 0, 1, 1], "L1: if + func + correct       → 100"),
    ([0, 0, 1, 1, 1, 0, 1, 1], "L1: func + correct, no if     → 55"),
    ([0, 1, 0, 1, 1, 0, 1, 1], "L1: if + correct, no func     → 45"),
    ([0, 1, 1, 0, 1, 0, 1, 1], "L1: if + func, wrong output   → 40"),
    ([0, 0, 0, 0, 0, 0, 1, 1], "L1: nothing                   → 0"),

    # Level 2 type
    ([1, 1, 1, 1, 2, 1, 1, 1], "L2: all + correct             → 100"),
    ([0, 1, 1, 1, 2, 1, 1, 1], "L2: no loop + correct         → 65"),
    ([1, 1, 1, 0, 2, 1, 1, 1], "L2: all present, wrong output → 40"),

    # Edge cases
    ([0, 0, 0, 1, 0, 0, 0, 0], "No req: correct output only   → 100"),
    ([4, 4, 2, 1, 6, 1, 1, 1], "High complexity + correct     → 100"),
]

print(f"\n  {'Description':<45} {'Score':>6}  {'D':>5}  {'C':>5}  {'B':>5}  {'Conf'}")
print(f"  {'─'*45} {'─'*6}  {'─'*5}  {'─'*5}  {'─'*5}  {'─'*4}")
for features, desc in checks:
    pred, confident = predict_with_confidence(best_model, features)
    conf_str = "✅" if confident else "⚠️"
    print(f"  {desc:<45} {pred[0]:>6.1f}  {pred[1]:>5.2f}  {pred[2]:>5.2f}  {pred[3]:>5.2f}  {conf_str}")

# ─────────────────────────────────────────────────────────────────────────────
# SAVE
# ─────────────────────────────────────────────────────────────────────────────

joblib.dump(best_model, "harmony_model.pkl")
joblib.dump({"threshold": 15.0, "columns": cols}, "harmony_model_meta.pkl")

print(f"\n✅ Model saved → harmony_model.pkl")
print(f"✅ Meta saved  → harmony_model_meta.pkl")
print(f"   Best model: {best_name}")
print(f"   Samples used: {len(X)}")