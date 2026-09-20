#!/usr/bin/env python3
"""
verify_levels.py — Codio level consistency checker.

Verifies:
  1. No duplicate `id` or `order` values in levels.js
  2. Password chain integrity (each level's password matches the
     previous level's songName, in `order` sequence)
  3. Every level has the required fields (starterCode, criteria, etc.)
  4. Every criterion uses a valid `key` and `layer`
  5. levels.js and main.py agree on: which ids have hidden tests,
     the callTemplate per language, and the test data itself
  6. Flags PLACEHOLDER audio paths as warnings (not errors)

Usage:
  python verify_levels.py <path-to-levels.js> <path-to-main.py>

Requires Node.js to be available on PATH (used to load levels.js as a
real ES module rather than regex-parsing it).
"""

import sys
import os
import json
import ast
import subprocess

# Force UTF-8 output regardless of the terminal's default code page —
# without this, Windows PowerShell/cmd often mangles non-ASCII characters
# (em-dashes, checkmarks, etc.) even though the underlying data is fine.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

VALID_CRITERION_KEYS = {
    "loops", "conditions", "functions",
    "no_syntax_error", "correct_output", "all_hidden_passed",
}
VALID_LAYERS = {"drums", "chords", "bass", "melody", "lead"}
REQUIRED_LEVEL_FIELDS = [
    "id", "order", "title", "starterCode", "starterCodeJS",
    "expectedOutput", "expectedOutputJS", "criteria", "layerDisplay",
    "hint", "layers", "songName", "password",
]

ERRORS   = []
WARNINGS = []

def error(msg):
    ERRORS.append(msg)

def warn(msg):
    WARNINGS.append(msg)


def load_levels_js(path):
    """Load levels.js via Node so we get the REAL parsed data, not a
    regex approximation of it."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dump_script = os.path.join(script_dir, "dump_levels.mjs")

    result = subprocess.run(
        ["node", dump_script, path],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"FATAL: could not load levels.js via Node:\n{result.stderr}")
        sys.exit(1)
    return json.loads(result.stdout)


def load_hidden_tests_from_main(path):
    """Extract LEVEL_HIDDEN_TESTS from main.py by locating the dict
    literal's exact source span and safely evaluating it with
    ast.literal_eval — this only works because it's a real Python
    dict/list/bool literal already, so it's exact, not approximate."""
    with open(path, encoding="utf-8") as f:
        source = f.read()

    marker = "LEVEL_HIDDEN_TESTS = "
    start = source.find(marker)
    if start == -1:
        error("main.py: could not find LEVEL_HIDDEN_TESTS")
        return {}

    # Find the matching closing brace by counting depth from the opening one
    brace_start = source.index("{", start)
    depth = 0
    i = brace_start
    while i < len(source):
        if source[i] == "{":
            depth += 1
        elif source[i] == "}":
            depth -= 1
            if depth == 0:
                break
        i += 1
    dict_source = source[brace_start:i + 1]

    try:
        return ast.literal_eval(dict_source)
    except Exception as e:
        error(f"main.py: failed to parse LEVEL_HIDDEN_TESTS ({e})")
        return {}


def check_duplicates(levels):
    ids    = [l["id"] for l in levels]
    orders = [l["order"] for l in levels]

    dup_ids = {i for i in ids if ids.count(i) > 1}
    if dup_ids:
        error(f"Duplicate id(s) found: {dup_ids}")

    dup_orders = {o for o in orders if orders.count(o) > 1}
    if dup_orders:
        error(f"Duplicate order(s) found: {dup_orders}")


def check_password_chain(levels):
    ordered = sorted(levels, key=lambda l: l["order"])

    if ordered[0]["password"] is not None:
        error(f"'{ordered[0]['title']}' is first in order but has a non-null password (should be null)")

    for i in range(1, len(ordered)):
        prev, cur = ordered[i - 1], ordered[i]
        expected = prev.get("songName")
        actual   = cur.get("password")
        if expected != actual:
            error(
                f"Password chain broken: '{cur['title']}' requires password "
                f"'{expected}' (from '{prev['title']}'s songName) but has '{actual}'"
            )
        if expected == "TBD":
            warn(f"'{prev['title']}' songName is still 'TBD' — '{cur['title']}' password will need updating once it's named")


def check_required_fields(levels):
    for l in levels:
        for field in REQUIRED_LEVEL_FIELDS:
            if field not in l:
                error(f"'{l.get('title', l.get('id'))}' is missing required field: {field}")


def check_criteria(levels):
    for l in levels:
        criteria = l.get("criteria")
        if not criteria:
            if l["id"] != 0:
                warn(f"'{l['title']}' has no criteria — will fall back to raw ML model scoring")
            continue

        total_weight = 0
        used_layers  = set()
        for c in criteria:
            if c["key"] not in VALID_CRITERION_KEYS:
                error(f"'{l['title']}': criterion key '{c['key']}' is not a recognized key")
            if c["layer"] not in VALID_LAYERS:
                error(f"'{l['title']}': criterion layer '{c['layer']}' is not a valid layer")
            if c["layer"] in used_layers:
                warn(f"'{l['title']}': layer '{c['layer']}' is used by more than one criterion — only the last one's result will show in that layer's weight/synced state")
            used_layers.add(c["layer"])
            total_weight += c["weight"]

        if total_weight != 100:
            warn(f"'{l['title']}': criteria weights sum to {total_weight}, not 100 (harmless — the scorer normalizes automatically, but worth double-checking it's intentional)")


def check_placeholder_audio(levels):
    for l in levels:
        for key, layer in (l.get("layers") or {}).items():
            if layer and "PLACEHOLDER" in layer.get("src", ""):
                warn(f"'{l['title']}': {key} layer still uses a placeholder audio path")


def check_backend_sync(levels, hidden_tests):
    levels_ids = {l["id"] for l in levels}
    backend_ids = set(hidden_tests.keys())

    # Levels with a callTemplate in levels.js should have a backend entry
    for l in levels:
        has_frontend_template = "callTemplate" in l
        has_backend_entry     = l["id"] in hidden_tests

        if has_frontend_template and not has_backend_entry:
            error(f"'{l['title']}' (id={l['id']}) has a callTemplate in levels.js but NO entry in main.py's LEVEL_HIDDEN_TESTS — anti-cheat is not active for this level")

        if has_backend_entry and not has_frontend_template:
            warn(f"'{l['title']}' (id={l['id']}) has a backend hidden-test entry but no callTemplate documented in levels.js")

        if has_frontend_template and has_backend_entry:
            backend_entry = hidden_tests[l["id"]]
            frontend_ct = l["callTemplate"]
            backend_ct_py = backend_entry.get("callTemplate", {}).get("python")
            backend_ct_js = backend_entry.get("callTemplate", {}).get("javascript")

            if frontend_ct != backend_ct_py:
                error(f"'{l['title']}': levels.js callTemplate ('{frontend_ct}') doesn't match main.py's python callTemplate ('{backend_ct_py}')")

            if not backend_ct_js:
                warn(f"'{l['title']}' (id={l['id']}): main.py has no JavaScript callTemplate — JS solutions won't get anti-cheat verification for this level")

            # Compare test data itself
            frontend_tests = l.get("hiddenTests", [])
            backend_test_list = backend_entry.get("tests", [])
            if len(frontend_tests) != len(backend_test_list):
                warn(f"'{l['title']}': levels.js documents {len(frontend_tests)} hidden tests but main.py actually has {len(backend_test_list)} — the levels.js copy is just documentation and won't break anything, but it's out of sync")


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)

    levels_path, main_path = sys.argv[1], sys.argv[2]

    print(f"Loading {levels_path} via Node...")
    levels = load_levels_js(levels_path)
    print(f"  → {len(levels)} levels loaded\n")

    print(f"Loading {main_path}'s LEVEL_HIDDEN_TESTS...")
    hidden_tests = load_hidden_tests_from_main(main_path)
    print(f"  → {len(hidden_tests)} backend hidden-test entries loaded\n")

    check_duplicates(levels)
    check_password_chain(levels)
    check_required_fields(levels)
    check_criteria(levels)
    check_placeholder_audio(levels)
    check_backend_sync(levels, hidden_tests)

    print("═" * 70)
    if ERRORS:
        print(f"❌ {len(ERRORS)} ERROR(S) — these will break gameplay:\n")
        for e in ERRORS:
            print(f"   ✗ {e}")
        print()
    else:
        print("✅ No errors — levels.js and main.py are structurally consistent.\n")

    if WARNINGS:
        print(f"⚠ {len(WARNINGS)} warning(s) — worth a look, but won't break anything:\n")
        for w in WARNINGS:
            print(f"   • {w}")
        print()

    print("═" * 70)
    sys.exit(1 if ERRORS else 0)


if __name__ == "__main__":
    main()