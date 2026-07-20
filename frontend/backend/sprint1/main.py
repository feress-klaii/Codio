from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any
import subprocess
import tempfile
import os
import ast
import json
import re
import numpy as np
import joblib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load ML model (fallback path only — criteria-based levels don't need it) ──
MODEL_PATH = "harmony_model.pkl"
try:
    harmony_model = joblib.load(MODEL_PATH)
    print(f"✅ Harmony model loaded from {MODEL_PATH}")
except FileNotFoundError:
    harmony_model = None
    print(f"⚠ No model found at {MODEL_PATH}. Run train_model.py first.")

JS_ANALYZER_PATH = os.path.join(os.path.dirname(__file__), "analyze_js.js")

# ── Security: blocked imports ──
BLOCKED_IMPORTS = {
    "os", "sys", "subprocess", "shutil", "socket",
    "requests", "urllib", "http", "ftplib", "smtplib",
    "pickle", "shelve", "importlib", "builtins",
    "ctypes", "multiprocessing", "threading", "signal",
    "pathlib", "glob", "tempfile", "io", "pty",
    "atexit", "gc", "inspect", "pdb", "traceback",
}

# ═══════════════════════════════════════════════════════════════════════════
# HIDDEN TESTS — server-side ONLY, authoritative.
#
# IMPORTANT: even though levels.js has a matching `hiddenTests`/`callTemplate`
# field for documentation, the frontend NEVER sends these to the backend and
# this dict is never influenced by the request body. If it were client-
# supplied, anyone could fake `all_hidden_passed: true` by editing the network
# request. The only thing the client controls is which level_id is being
# played — the actual test data always comes from here.
#
# callTemplate uses "{args}" as a placeholder for the comma-joined,
# Python-literal-safe representation of each test's positional arguments.
# ═══════════════════════════════════════════════════════════════════════════

LEVEL_HIDDEN_TESTS = {
    1: {  # Data Echoes — formatReport
        "callTemplate": "formatReport({args})",
        "tests": [
            {"args": ["Zoe", 45, 60],   "expected": "Name: Zoe, Age: 45, Score: 60.00"},
            {"args": ["Max", 8, 99.99], "expected": "Name: Max, Age: 8, Score: 99.99"},
            {"args": ["Ivy", 100, 0],   "expected": "Name: Ivy, Age: 100, Score: 0.00"},
        ],
    },
    2: {  # Even Frequency — sumEven
        "callTemplate": "sumEven({args})",
        "tests": [
            {"args": [[]],              "expected": 0},
            {"args": [[-2, -4, 1]],     "expected": -6},
            {"args": [[0, 1, 2]],       "expected": 2},
            {"args": [[100, 99]],       "expected": 100},
            {"args": [[7, 13, 21]],     "expected": 0},
            {"args": [[2, 2, 2]],       "expected": 6},
            {"args": [[-1, -2, -3, -4]],"expected": -6},
        ],
    },
    3: {  # Mirror Logic — isPalindrome
        "callTemplate": "Solution().isPalindrome({args})",
        "tests": [
            {"args": [12321], "expected": True},
            {"args": [123],   "expected": False},
            {"args": [0],     "expected": True},
            {"args": [-5],    "expected": False},
            {"args": [1],     "expected": True},
        ],
    },
}


# ── Request models ──

class CodeRequest(BaseModel):
    code: str
    language: str = "python"
    expected_output: str = ""

class Criterion(BaseModel):
    key: str      # loops | conditions | functions | no_syntax_error | correct_output | all_hidden_passed
    layer: str    # drums | chords | bass | melody
    weight: float

class AnalyzeRequest(BaseModel):
    code: str
    language: str = "python"
    expected_output: str = ""
    loops_required: int = 0
    conditions_required: int = 0
    functions_required: int = 0
    test_runner: str = ""
    level_id: int = 0
    criteria: Optional[List[Criterion]] = None

LANGUAGE_CONFIG = {
    "python":     {"runner": "python", "suffix": ".py",  "use_ast": True},
    "javascript": {"runner": "node",   "suffix": ".js",  "use_ast": False},
}


# ═══════════════════════════════════════════════════════════════════════════
# GENERIC CRITERIA-BASED SCORER
# ═══════════════════════════════════════════════════════════════════════════

def evaluate_criterion(key: str, analysis: dict, correct_output: bool, all_hidden_passed: bool) -> bool:
    if key == "loops":
        return analysis.get("loops", 0) > 0
    if key == "conditions":
        return analysis.get("conditions", 0) > 0
    if key == "functions":
        return bool(analysis.get("function_presence", False))
    if key == "no_syntax_error":
        return not analysis.get("syntax_error", False)
    if key == "correct_output":
        return correct_output
    if key == "all_hidden_passed":
        return all_hidden_passed
    return False


def score_from_criteria(criteria: list, analysis: dict, correct_output: bool, all_hidden_passed: bool):
    layers = {
        "drums":  {"weight": 0.0, "synced": False},
        "chords": {"weight": 0.0, "synced": False},
        "bass":   {"weight": 0.0, "synced": False},
        "melody": {"weight": 0.0, "synced": False},
    }
    score = 0.0
    max_score = 0.0

    for c in criteria:
        key, layer, weight = c["key"], c["layer"], c["weight"]
        max_score += weight
        satisfied = evaluate_criterion(key, analysis, correct_output, all_hidden_passed)
        if layer in layers:
            layers[layer]["weight"] = 1.0 if satisfied else 0.0
            layers[layer]["synced"] = satisfied and correct_output
        if satisfied:
            score += weight

    harmony_score = (score / max_score * 100) if max_score > 0 else 0.0
    return layers, float(min(100, round(harmony_score)))


# ═══════════════════════════════════════════════════════════════════════════
# GENERIC HIDDEN TEST RUNNER
# Replaces the old per-level "if level_id == 2: build sumEven-specific
# script" approach. Any function/class-method-based level just needs an
# entry in LEVEL_HIDDEN_TESTS above — zero new code required here.
# ═══════════════════════════════════════════════════════════════════════════

def run_hidden_tests(user_code: str, level_id: int) -> bool:
    config = LEVEL_HIDDEN_TESTS.get(level_id)
    if not config:
        # No hidden tests defined for this level — treat as passed
        # (e.g. Level 0, which is structurally cheat-resistant via the
        # `loops` criterion requiring a real AST loop node to exist).
        return True

    call_template = config["callTemplate"]
    tests         = config["tests"]

    lines = [user_code, ""]
    for i, t in enumerate(tests):
        # repr() produces valid Python source for str/int/float/bool/list/None,
        # which is what we need since the call template is substituted
        # directly into a Python script.
        args_literal = ", ".join(repr(a) for a in t["args"])
        call_expr    = call_template.replace("{args}", args_literal)
        expected_literal = repr(t["expected"])

        lines.append(f'_r{i} = {call_expr}')
        lines.append(f'print("HIDDEN_PASS" if _r{i} == {expected_literal} else "HIDDEN_FAIL")')

    test_code = "\n".join(lines)

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode="w", encoding="utf-8") as f:
            f.write(test_code)
            fname = f.name
        result = subprocess.run(["python", fname], capture_output=True, text=True, timeout=5)
        os.unlink(fname)

        if result.returncode != 0:
            return False

        out_lines = result.stdout.strip().split("\n")
        results   = [l.strip() for l in out_lines if l.strip() in ("HIDDEN_PASS", "HIDDEN_FAIL")]
        return len(results) == len(tests) and all(r == "HIDDEN_PASS" for r in results)

    except Exception:
        return False


# ── Security: scan for blocked imports ──

def check_blocked_imports(code: str):
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return None
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                base = alias.name.split(".")[0]
                if base in BLOCKED_IMPORTS:
                    return alias.name
        if isinstance(node, ast.ImportFrom):
            if node.module:
                base = node.module.split(".")[0]
                if base in BLOCKED_IMPORTS:
                    return node.module
    return None


# ── Error line extraction ──

def extract_error_line(error_output: str):
    py_match = re.search(r'line (\d+)', error_output)
    if py_match:
        return int(py_match.group(1))
    js_match = re.search(r':(\d+):\d+\)', error_output)
    if js_match:
        return int(js_match.group(1))
    return None


# ── /run-code ──

@app.post("/run-code")
def run_code(request: CodeRequest):
    lang   = request.language.lower()
    config = LANGUAGE_CONFIG.get(lang, LANGUAGE_CONFIG["python"])
    code   = request.code

    if config["use_ast"]:
        blocked = check_blocked_imports(code)
        if blocked:
            return {
                "output": f"SecurityError: import '{blocked}' is not allowed.",
                "analysis": {
                    "loops": 0, "conditions": 0, "function_presence": False,
                    "nested_depth": 0, "syntax_error": True, "correct_output": False,
                    "error_line": None,
                }
            }

    analysis = analyze_python(code) if config["use_ast"] else analyze_js(code)

    if config["use_ast"] and analysis["syntax_error"]:
        return {"output": "SyntaxError: invalid syntax", "analysis": analysis}

    try:
        output = execute_code(code, config)
        analysis["correct_output"] = output.strip() == request.expected_output.strip()
        analysis["error_line"] = extract_error_line(output) if "Error" in output else None
        return {"output": output, "analysis": analysis}
    except subprocess.TimeoutExpired:
        return {"output": "Error: timed out (5s)", "analysis": {**analysis, "correct_output": False, "error_line": None}}
    except Exception as e:
        return {"output": str(e), "analysis": {**analysis, "correct_output": False, "error_line": None}}


# ── /analyze-code ──

@app.post("/analyze-code")
def analyze_code_ml(request: AnalyzeRequest):
    lang      = request.language.lower()
    config    = LANGUAGE_CONFIG.get(lang, LANGUAGE_CONFIG["python"])
    code      = request.code
    full_code = code + "\n\n" + request.test_runner if request.test_runner.strip() else code

    if config["use_ast"]:
        blocked = check_blocked_imports(code)
        if blocked:
            return {
                "output": f"SecurityError: import '{blocked}' is not allowed.\nThis import is blocked for security reasons.",
                "harmony_score": 0,
                "layers": {
                    "drums":  {"weight": 0.0, "synced": False},
                    "chords": {"weight": 0.0, "synced": False},
                    "bass":   {"weight": 0.0, "synced": False},
                    "melody": {"weight": 0.0, "synced": False},
                },
                "analysis": {
                    "loops": 0, "conditions": 0, "function_presence": False,
                    "nested_depth": 0, "syntax_error": True, "correct_output": False,
                    "error_line": None, "all_hidden_passed": False,
                }
            }

    ast_analysis = analyze_python(code) if config["use_ast"] else analyze_js(code)

    if config["use_ast"] and ast_analysis["syntax_error"]:
        return {
            "output": ast_analysis.get("error_message", "SyntaxError: invalid syntax"),
            "harmony_score": 0,
            "layers": {
                "drums":  {"weight": 0.0, "synced": False},
                "chords": {"weight": 0.0, "synced": False},
                "bass":   {"weight": 0.0, "synced": False},
                "melody": {"weight": 0.0, "synced": False},
            },
            "analysis": {**ast_analysis, "error_line": ast_analysis.get("error_line"), "all_hidden_passed": False}
        }

    output         = ""
    correct_output = False
    error_line     = None
    try:
        output         = execute_code(full_code, config)
        correct_output = output.strip() == request.expected_output.strip()
        if "Error" in output or "error" in output:
            error_line = extract_error_line(output)
    except subprocess.TimeoutExpired:
        output = "Error: timed out (5s)"
    except Exception as e:
        output = str(e)

    # ── Hidden tests — Python only for now (JS parity is a fast-follow) ──
    all_hidden_passed = True
    if lang == "python" and request.level_id in LEVEL_HIDDEN_TESTS:
        all_hidden_passed = correct_output and run_hidden_tests(code, request.level_id)
    elif lang != "python" and request.level_id in LEVEL_HIDDEN_TESTS:
        # JS hidden-test harness not generalized yet — don't silently grant
        # full credit, but don't unfairly block JS solutions either.
        # For now: fall back to public correctness only for JS on these levels.
        all_hidden_passed = correct_output

    ast_analysis["correct_output"]    = correct_output
    ast_analysis["error_line"]        = error_line
    ast_analysis["all_hidden_passed"] = all_hidden_passed

    # ── Generic scoring ──
    if request.criteria:
        criteria_dicts = [c.dict() for c in request.criteria]
        layers, harmony_score = score_from_criteria(
            criteria_dicts, ast_analysis, correct_output, all_hidden_passed
        )
    else:
        # Fallback for any level not yet migrated to criteria
        features = np.array([[
            ast_analysis["loops"],
            ast_analysis["conditions"],
            1 if ast_analysis["function_presence"] else 0,
            1 if correct_output else 0,
            ast_analysis["nested_depth"],
            request.loops_required,
            request.conditions_required,
            request.functions_required,
        ]])
        if harmony_model is not None:
            prediction    = harmony_model.predict(features)[0]
            harmony_score = float(np.clip(round(prediction[0]), 0, 100))
            layers = {
                "drums":  {"weight": float(np.clip(prediction[1], 0, 1)), "synced": correct_output and ast_analysis["loops"] > 0},
                "chords": {"weight": float(np.clip(prediction[2], 0, 1)), "synced": correct_output and ast_analysis["conditions"] > 0},
                "bass":   {"weight": float(np.clip(prediction[3], 0, 1)), "synced": correct_output and ast_analysis["function_presence"]},
                "melody": {"weight": 1.0 if all_hidden_passed else 0.0,  "synced": all_hidden_passed},
            }
        else:
            harmony_score = 100.0 if correct_output else 30.0
            layers = {
                "drums":  {"weight": 1.0 if ast_analysis["loops"] > 0 else 0.0,      "synced": correct_output},
                "chords": {"weight": 1.0 if ast_analysis["conditions"] > 0 else 0.0, "synced": correct_output},
                "bass":   {"weight": 1.0 if ast_analysis["function_presence"] else 0.0, "synced": correct_output},
                "melody": {"weight": 0.0, "synced": False},
            }

    return {
        "output": output,
        "harmony_score": harmony_score,
        "layers": layers,
        "analysis": ast_analysis
    }


# ── Code execution ──

def execute_code(code, config):
    with tempfile.NamedTemporaryFile(delete=False, suffix=config["suffix"], mode="w", encoding="utf-8") as f:
        f.write(code)
        fname = f.name
    try:
        r = subprocess.run([config["runner"], fname], capture_output=True, text=True, timeout=5)
        return r.stdout if r.returncode == 0 else r.stderr
    finally:
        if os.path.exists(fname):
            os.unlink(fname)


# ── Python AST analysis ──

def analyze_python(code):
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return {
            "loops": 0, "conditions": 0, "function_presence": False,
            "nested_depth": 0, "syntax_error": True, "correct_output": False,
            "error_line": e.lineno, "error_message": str(e),
        }

    loops = conditions = functions = 0
    max_depth = [0]

    def visit(node, depth=0):
        nonlocal loops, conditions, functions
        max_depth[0] = max(max_depth[0], depth)
        if isinstance(node, (ast.For, ast.While)):
            loops += 1
        elif isinstance(node, ast.If):
            conditions += 1
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions += 1
        for child in ast.iter_child_nodes(node):
            visit(child, depth + 1)

    visit(tree)
    return {
        "loops": loops, "conditions": conditions,
        "function_presence": functions > 0, "nested_depth": max_depth[0],
        "syntax_error": False, "correct_output": False, "error_line": None,
    }


# ── JS AST analysis via Node.js + acorn ──

def analyze_js(code):
    try:
        result = subprocess.run(
            ["node", JS_ANALYZER_PATH],
            input=code, capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0 and result.stdout:
            data = json.loads(result.stdout)
            return {
                "loops":             data.get("loops", 0),
                "conditions":        data.get("conditions", 0),
                "function_presence": data.get("function_presence", False),
                "nested_depth":      data.get("nested_depth", 0),
                "syntax_error":      data.get("syntax_error", False),
                "correct_output":    False,
                "error_line":        None,
            }
    except Exception:
        pass
    return analyze_js_regex(code)


def analyze_js_regex(code):
    loops      = len(re.findall(r'\b(for|while)\b', code))
    conditions = len(re.findall(r'\bif\b', code))
    functions  = bool(re.search(
        r'\b(function\s+\w+|\w+\s*=\s*function|const\s+\w+\s*=\s*(\(.*?\)|[\w]+)\s*=>)', code
    ))
    lines     = code.split("\n")
    max_depth = max(((len(l) - len(l.lstrip())) // 2) for l in lines if l.strip()) if lines else 0
    return {
        "loops": loops, "conditions": conditions,
        "function_presence": functions, "nested_depth": max_depth,
        "syntax_error": False, "correct_output": False, "error_line": None,
    }