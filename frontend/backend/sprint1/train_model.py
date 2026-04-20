"""
train_model.py — Codio Harmony Model (Expanded)
~60 samples covering more edge cases and diversity.

Run: python train_model.py
"""

import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error

# Features: [loops, conditions, function_presence, correct_output, nested_depth,
#            loops_req, conditions_req, functions_req]
# Targets:  [harmony_score, drum_weight, chord_weight, bass_weight]

samples = [
    # ══ LEVEL 0 TYPE: loops only required ══════════════════════════════════

    # Perfect solutions — different approaches, all score 100
    [1, 0, 0, 1, 1,  1, 0, 0,   100, 1.0, 0.0, 0.0],  # for loop
    [1, 0, 0, 1, 1,  1, 0, 0,   100, 1.0, 0.0, 0.0],  # while loop
    [1, 0, 0, 1, 2,  1, 0, 0,   100, 1.0, 0.0, 0.0],  # nested slightly, still correct
    [2, 0, 0, 1, 2,  1, 0, 0,   100, 1.0, 0.0, 0.0],  # two loops, correct

    # Bonus structure — correct + extra constructs = still 100
    [1, 1, 0, 1, 2,  1, 0, 0,   100, 1.0, 0.5, 0.0],  # loop + condition + correct
    [1, 0, 1, 1, 2,  1, 0, 0,   100, 1.0, 0.0, 0.6],  # loop + function + correct
    [1, 1, 1, 1, 2,  1, 0, 0,   100, 1.0, 0.5, 0.5],  # all + correct

    # Loop present, wrong output
    [1, 0, 0, 0, 1,  1, 0, 0,    45, 0.6, 0.0, 0.0],
    [2, 0, 0, 0, 2,  1, 0, 0,    48, 0.6, 0.0, 0.0],
    [1, 1, 0, 0, 2,  1, 0, 0,    50, 0.5, 0.3, 0.0],

    # No loop at all
    [0, 0, 0, 1, 0,  1, 0, 0,    20, 0.0, 0.0, 0.0],  # correct output but no loop
    [0, 0, 0, 0, 0,  1, 0, 0,     0, 0.0, 0.0, 0.0],  # nothing works
    [0, 1, 0, 1, 1,  1, 0, 0,    15, 0.0, 0.2, 0.0],  # condition but no loop

    # Syntax errors
    [0, 0, 0, 0, 0,  1, 0, 0,     0, 0.0, 0.0, 0.0],
    [1, 0, 0, 0, 0,  1, 0, 0,     5, 0.1, 0.0, 0.0],  # loop detected but syntax err

    # ══ LEVEL 1 TYPE: loops + conditions required ═══════════════════════════

    # Perfect
    [1, 1, 0, 1, 2,  1, 1, 0,   100, 1.0, 1.0, 0.0],
    [1, 2, 0, 1, 3,  1, 1, 0,   100, 1.0, 1.0, 0.0],  # multiple conditions
    [2, 1, 0, 1, 3,  1, 1, 0,   100, 1.0, 1.0, 0.0],  # multiple loops
    [1, 1, 1, 1, 2,  1, 1, 0,   100, 1.0, 1.0, 0.8],  # + function bonus

    # Missing condition
    [1, 0, 0, 1, 1,  1, 1, 0,    50, 0.8, 0.0, 0.0],
    [1, 0, 0, 0, 1,  1, 1, 0,    30, 0.5, 0.0, 0.0],

    # Missing loop
    [0, 1, 0, 1, 1,  1, 1, 0,    35, 0.0, 0.6, 0.0],
    [0, 2, 0, 1, 2,  1, 1, 0,    38, 0.0, 0.6, 0.0],

    # Both present, wrong output
    [1, 1, 0, 0, 2,  1, 1, 0,    48, 0.5, 0.5, 0.0],
    [2, 2, 0, 0, 3,  1, 1, 0,    52, 0.5, 0.5, 0.0],

    # Nothing
    [0, 0, 0, 0, 0,  1, 1, 0,     0, 0.0, 0.0, 0.0],
    [0, 0, 0, 1, 0,  1, 1, 0,    10, 0.0, 0.0, 0.0],  # correct but no constructs

    # ══ LEVEL 2 TYPE: functions required ════════════════════════════════════

    # Perfect
    [1, 1, 1, 1, 2,  1, 1, 1,   100, 1.0, 1.0, 1.0],
    [1, 0, 1, 1, 2,  1, 0, 1,   100, 1.0, 0.0, 1.0],
    [0, 1, 1, 1, 1,  0, 1, 1,   100, 0.0, 1.0, 1.0],
    [0, 0, 1, 1, 1,  0, 0, 1,   100, 0.0, 0.0, 1.0],  # function only, correct

    # Missing function
    [1, 1, 0, 1, 2,  1, 1, 1,    55, 0.8, 0.8, 0.0],
    [1, 0, 0, 1, 1,  1, 0, 1,    40, 0.7, 0.0, 0.0],

    # Function present, wrong output
    [1, 1, 1, 0, 2,  1, 1, 1,    45, 0.5, 0.5, 0.5],
    [0, 0, 1, 0, 1,  0, 0, 1,    20, 0.0, 0.0, 0.3],

    # Nothing
    [0, 0, 0, 0, 0,  1, 1, 1,     0, 0.0, 0.0, 0.0],

    # ══ EDGE CASES & DIVERSITY ═══════════════════════════════════════════════

    # Deeply nested, everything correct
    [3, 3, 1, 1, 5,  1, 1, 1,   100, 1.0, 1.0, 1.0],
    [3, 3, 1, 0, 5,  1, 1, 1,    55, 0.6, 0.6, 0.6],

    # Minimal code, no requirements, just correct output
    [0, 0, 0, 1, 0,  0, 0, 0,   100, 0.0, 0.0, 0.0],
    [0, 0, 0, 0, 0,  0, 0, 0,     0, 0.0, 0.0, 0.0],

    # Correct output with extra unneeded constructs
    [2, 3, 1, 1, 4,  1, 0, 0,   100, 1.0, 0.3, 0.3],
    [3, 0, 2, 1, 3,  1, 0, 0,   100, 1.0, 0.0, 0.5],

    # Partial credit cases
    [1, 0, 0, 0, 1,  1, 1, 1,    20, 0.3, 0.0, 0.0],  # only loop, need all 3
    [0, 1, 0, 0, 1,  1, 1, 1,    15, 0.0, 0.2, 0.0],  # only condition, need all 3
    [0, 0, 1, 0, 1,  1, 1, 1,    18, 0.0, 0.0, 0.3],  # only function, need all 3

    # Wrong output but good structure
    [1, 1, 1, 0, 3,  1, 1, 1,    42, 0.4, 0.4, 0.4],
    [1, 1, 0, 0, 2,  1, 1, 0,    40, 0.4, 0.4, 0.0],

    # Correct output, no structure needed
    [0, 0, 0, 1, 0,  0, 0, 0,   100, 0.0, 0.0, 0.0],

    # Loop with high nesting, correct
    [1, 0, 0, 1, 4,  1, 0, 0,   100, 1.0, 0.0, 0.0],

    # Many conditions, loops required only
    [1, 4, 0, 1, 4,  1, 0, 0,   100, 1.0, 0.2, 0.0],

    # Function wrapping everything, loops required
    [1, 0, 1, 1, 3,  1, 0, 0,   100, 1.0, 0.0, 0.5],
]

# ─────────────────────────────────────────────
data  = np.array(samples)
X     = data[:, :8]
y     = data[:, 8:]

print(f"Training on {len(X)} samples")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.15, random_state=42
)

model = MultiOutputRegressor(
    RandomForestRegressor(
        n_estimators=300,
        max_depth=10,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
    )
)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)
mae    = mean_absolute_error(y_test, y_pred)
print(f"Test MAE: {mae:.3f}")

# ── Sanity checks ──
print("\n── Sanity checks ──")
checks = [
    ([1, 0, 0, 1, 1, 1, 0, 0], "for loop + correct (Level 0) → 100 drums"),
    ([1, 0, 0, 0, 1, 1, 0, 0], "for loop + wrong output      → ~45 drums partial"),
    ([0, 0, 0, 0, 0, 1, 0, 0], "nothing at all               → 0"),
    ([1, 1, 0, 1, 2, 1, 1, 0], "loop+cond+correct (Level 1)  → 100"),
    ([1, 0, 0, 1, 1, 1, 1, 0], "loop only, cond required     → ~50"),
    ([1, 1, 1, 1, 2, 1, 1, 1], "all present + correct        → 100"),
    ([0, 0, 0, 1, 0, 0, 0, 0], "no requirements, correct     → 100"),
]

for features, desc in checks:
    p = model.predict([features])[0]
    print(f"  {desc}")
    print(f"  → score={p[0]:.1f} drums={p[1]:.2f} chords={p[2]:.2f} bass={p[3]:.2f}\n")

joblib.dump(model, "harmony_model.pkl")
print("✅ Model saved → harmony_model.pkl")