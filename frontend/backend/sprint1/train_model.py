"""
train_model.py — Codio Harmony Model Training Script
Trains a RandomForestRegressor on manually crafted samples.
Run this once to generate harmony_model.pkl

Usage:
    python train_model.py
"""

import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

# ─────────────────────────────────────────────
# TRAINING DATA
# Each sample represents one code submission:
#
# Features (input):
#   loops            — number of loops detected (0, 1, 2+)
#   conditions       — number of if statements detected
#   function_presence — 1 if def present, 0 if not
#   correct_output   — 1 if output matches expected, 0 if not
#   nested_depth     — max nesting depth detected
#   loops_required   — does this level require loops? (1/0)
#   conditions_required — does this level require conditions? (1/0)
#   functions_required  — does this level require functions? (1/0)
#
# Targets (output):
#   harmony_score    — 0 to 100
#   drum_weight      — 0.0 to 1.0
#   chord_weight     — 0.0 to 1.0
#   bass_weight      — 0.0 to 1.0
# ─────────────────────────────────────────────

# Format: [loops, conditions, function_presence, correct_output, nested_depth,
#          loops_req, conditions_req, functions_req,
#          harmony_score, drum_weight, chord_weight, bass_weight]

samples = [
    # ── LEVEL 0 TYPE: requires loops only ──────────────────────────────────

    # Perfect: for loop, correct output
    [1, 0, 0, 1, 1,  1, 0, 0,  100, 1.0, 0.0, 0.0],
    # Perfect: while loop, correct output
    [1, 0, 0, 1, 1,  1, 0, 0,  100, 1.0, 0.0, 0.0],
    # Loop present but wrong output
    [1, 0, 0, 0, 1,  1, 0, 0,   45, 0.6, 0.0, 0.0],
    # No loop, correct output (e.g. print statements only)
    [0, 0, 0, 1, 0,  1, 0, 0,   30, 0.0, 0.0, 0.0],
    # No loop, wrong output
    [0, 0, 0, 0, 0,  1, 0, 0,    0, 0.0, 0.0, 0.0],
    # Loop + extra condition, correct output (bonus structure)
    [1, 1, 0, 1, 2,  1, 0, 0,  100, 1.0, 0.5, 0.0],
    # Loop + function wrapping, correct output
    [1, 0, 1, 1, 2,  1, 0, 0,  100, 1.0, 0.0, 0.7],
    # Loop present, syntax error
    [1, 0, 0, 0, 0,  1, 0, 0,    5, 0.1, 0.0, 0.0],
    # Two loops, correct output
    [2, 0, 0, 1, 2,  1, 0, 0,  100, 1.0, 0.0, 0.0],
    # Two loops, wrong output
    [2, 0, 0, 0, 2,  1, 0, 0,   50, 0.6, 0.0, 0.0],

    # ── LEVEL 1 TYPE: requires loops + conditions ───────────────────────────

    # Perfect: loop + condition, correct output
    [1, 1, 0, 1, 2,  1, 1, 0,  100, 1.0, 1.0, 0.0],
    # Loop only, missing condition, correct output
    [1, 0, 0, 1, 1,  1, 1, 0,   55, 0.8, 0.0, 0.0],
    # Condition only, no loop, correct output
    [0, 1, 0, 1, 1,  1, 1, 0,   40, 0.0, 0.6, 0.0],
    # Loop + condition, wrong output
    [1, 1, 0, 0, 2,  1, 1, 0,   50, 0.6, 0.6, 0.0],
    # Loop + condition + function, correct output
    [1, 1, 1, 1, 2,  1, 1, 0,  100, 1.0, 1.0, 0.8],
    # No constructs at all, wrong output
    [0, 0, 0, 0, 0,  1, 1, 0,    0, 0.0, 0.0, 0.0],
    # Loop + multiple conditions, correct output
    [1, 2, 0, 1, 3,  1, 1, 0,  100, 1.0, 1.0, 0.0],
    # Loop + condition, wrong output, nested deeply
    [1, 1, 0, 0, 3,  1, 1, 0,   48, 0.5, 0.5, 0.0],

    # ── FUTURE LEVEL TYPE: requires functions ───────────────────────────────

    # Perfect: function + loop + condition, correct output
    [1, 1, 1, 1, 2,  1, 1, 1,  100, 1.0, 1.0, 1.0],
    # Function present, no loop/condition, correct output
    [0, 0, 1, 1, 1,  1, 1, 1,   40, 0.0, 0.0, 0.7],
    # Function + loop, missing condition, correct output
    [1, 0, 1, 1, 2,  1, 1, 1,   65, 0.8, 0.0, 0.8],
    # Function + condition, missing loop, correct output
    [0, 1, 1, 1, 1,  1, 1, 1,   55, 0.0, 0.8, 0.8],
    # All present, wrong output
    [1, 1, 1, 0, 2,  1, 1, 1,   45, 0.5, 0.5, 0.5],
    # Nothing present, wrong output
    [0, 0, 0, 0, 0,  1, 1, 1,    0, 0.0, 0.0, 0.0],
    # Function only, correct output
    [0, 0, 1, 1, 1,  0, 0, 1,  100, 0.0, 0.0, 1.0],

    # ── EDGE CASES ──────────────────────────────────────────────────────────

    # Deeply nested, all features, correct
    [2, 3, 1, 1, 4,  1, 1, 1,  100, 1.0, 1.0, 1.0],
    # Deeply nested, all features, wrong output
    [2, 3, 1, 0, 4,  1, 1, 1,   55, 0.6, 0.6, 0.6],
    # Minimal correct: just print, no constructs, level requires nothing
    [0, 0, 0, 1, 0,  0, 0, 0,  100, 0.0, 0.0, 0.0],
    # Syntax error, nothing works
    [0, 0, 0, 0, 0,  1, 1, 1,    0, 0.0, 0.0, 0.0],
    # Loop correct, condition correct, function correct, wrong output
    [1, 1, 1, 0, 2,  1, 1, 1,   40, 0.4, 0.4, 0.4],
]

# ─────────────────────────────────────────────
# PREPARE DATA
# ─────────────────────────────────────────────

data = np.array(samples)

X = data[:, :8]   # features
y = data[:, 8:]   # targets: [harmony_score, drum_weight, chord_weight, bass_weight]

print(f"Training on {len(X)} samples")
print(f"Features shape: {X.shape}")
print(f"Targets shape:  {y.shape}")

# ─────────────────────────────────────────────
# TRAIN MODEL
# ─────────────────────────────────────────────

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = MultiOutputRegressor(
    RandomForestRegressor(
        n_estimators=200,
        max_depth=8,
        min_samples_split=2,
        random_state=42,
    )
)

model.fit(X_train, y_train)

# ─────────────────────────────────────────────
# EVALUATE
# ─────────────────────────────────────────────

y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)

print(f"\nModel trained successfully.")
print(f"Test MAE: {mae:.3f}")
print(f"Target columns: harmony_score, drum_weight, chord_weight, bass_weight")

# Quick sanity check
print("\n── Sanity checks ──")
test_cases = [
    # [loops, conditions, function_presence, correct_output, nested_depth, loops_req, cond_req, func_req]
    ([1, 0, 0, 1, 1, 1, 0, 0], "Loop + correct → should be ~100 drums"),
    ([0, 0, 0, 0, 0, 1, 0, 0], "Nothing → should be ~0"),
    ([1, 1, 0, 1, 2, 1, 1, 0], "Loop + condition + correct → should be ~100"),
    ([1, 0, 0, 0, 1, 1, 0, 0], "Loop but wrong output → should be ~45"),
]

for features, description in test_cases:
    pred = model.predict([features])[0]
    print(f"\n  {description}")
    print(f"  harmony={pred[0]:.1f}, drums={pred[1]:.2f}, chords={pred[2]:.2f}, bass={pred[3]:.2f}")

# SAVE

joblib.dump(model, "harmony_model.pkl")
print("\n✅ Model saved to harmony_model.pkl")