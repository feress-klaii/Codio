from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
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

MODEL_PATH = "harmony_model.pkl"
try:
    harmony_model = joblib.load(MODEL_PATH)
    print(f"✅ Harmony model loaded from {MODEL_PATH}")
except FileNotFoundError:
    harmony_model = None
    print(f"⚠ No model found at {MODEL_PATH}. Run train_model.py first.")

JS_ANALYZER_PATH = os.path.join(os.path.dirname(__file__), "analyze_js.js")

BLOCKED_IMPORTS = {
    "os", "sys", "subprocess", "shutil", "socket",
    "requests", "urllib", "http", "ftplib", "smtplib",
    "pickle", "shelve", "importlib", "builtins",
    "ctypes", "multiprocessing", "threading", "signal",
    "pathlib", "glob", "tempfile", "io", "pty",
    "atexit", "gc", "inspect", "pdb", "traceback",
}

# ═══════════════════════════════════════════════════════════════════════════
# CRITERIA — server-side authoritative. The backend never trusts the
# frontend to send correct scoring rules; it looks them up here by
# level_id. This is what makes scoring immune to stale frontend builds,
# browser cache, or any frontend/backend drift.
# ═══════════════════════════════════════════════════════════════════════════

LEVEL_CRITERIA = {
    0: [
        {"key": "loops",           "layer": "drums",  "weight": 35},
        {"key": "no_syntax_error", "layer": "chords", "weight": 35},
        {"key": "correct_output",  "layer": "bass",   "weight": 30},
    ],
    1: [
        {"key": "functions",         "layer": "drums",  "weight": 25},
        {"key": "no_syntax_error",   "layer": "chords", "weight": 25},
        {"key": "correct_output",    "layer": "bass",   "weight": 20},
        {"key": "all_hidden_passed", "layer": "melody", "weight": 30},
    ],
    3: [
        {"key": "all_hidden_passed", "layer": "drums",  "weight": 30},
        {"key": "conditions",        "layer": "chords", "weight": 25},
        {"key": "functions",         "layer": "bass",   "weight": 25},
        {"key": "no_syntax_error",   "layer": "melody", "weight": 20},
    ],
    2: [
        {"key": "loops",             "layer": "drums",  "weight": 25},
        {"key": "conditions",        "layer": "chords", "weight": 25},
        {"key": "no_syntax_error",   "layer": "bass",   "weight": 20},
        {"key": "all_hidden_passed", "layer": "melody", "weight": 30},
    ],
    4: [
        {"key": "functions",         "layer": "drums",  "weight": 25},
        {"key": "no_syntax_error",   "layer": "chords", "weight": 25},
        {"key": "correct_output",    "layer": "bass",   "weight": 20},
        {"key": "all_hidden_passed", "layer": "melody", "weight": 30},
    ],
    5: [
        {"key": "functions",         "layer": "drums",  "weight": 25},
        {"key": "no_syntax_error",   "layer": "chords", "weight": 25},
        {"key": "correct_output",    "layer": "bass",   "weight": 20},
        {"key": "all_hidden_passed", "layer": "melody", "weight": 30},
    ],
    6: [
        {"key": "functions",         "layer": "drums",  "weight": 25},
        {"key": "no_syntax_error",   "layer": "chords", "weight": 25},
        {"key": "correct_output",    "layer": "bass",   "weight": 20},
        {"key": "all_hidden_passed", "layer": "melody", "weight": 30},
    ],
    7: [
        {"key": "functions",         "layer": "drums",  "weight": 25},
        {"key": "no_syntax_error",   "layer": "chords", "weight": 25},
        {"key": "correct_output",    "layer": "bass",   "weight": 20},
        {"key": "all_hidden_passed", "layer": "melody", "weight": 30},
    ],
    8: [  # Boss #1 — Signal Report — 5 layers
        {"key": "functions",         "layer": "drums",  "weight": 15},
        {"key": "conditions",        "layer": "chords", "weight": 15},
        {"key": "no_syntax_error",   "layer": "bass",   "weight": 15},
        {"key": "correct_output",    "layer": "melody", "weight": 25},
        {"key": "all_hidden_passed", "layer": "lead",   "weight": 30},
    ],
    9: [
        {"key": "functions",         "layer": "drums",  "weight": 25},
        {"key": "no_syntax_error",   "layer": "chords", "weight": 25},
        {"key": "correct_output",    "layer": "bass",   "weight": 20},
        {"key": "all_hidden_passed", "layer": "melody", "weight": 30},
    ],
}

LEVEL_HIDDEN_TESTS = {
    1: {
        "callTemplate": {"python": "formatReport({args})", "javascript": "formatReport({args})"},
        "tests": [
            {"args": ["Zoe", 45, 60],    "expected": "Name: Zoe, Age: 45, Score: 60.00"},
            {"args": ["Max", 8, 99.99], "expected": "Name: Max, Age: 8, Score: 99.99"},
            {"args": ["Ivy", 100, 0],   "expected": "Name: Ivy, Age: 100, Score: 0.00"},
        ],
    },
    2: {
        "callTemplate": {"python": "sumEven({args})", "javascript": "sumEven({args})"},
        "tests": [
            {"args": [[]],               "expected": 0},
            {"args": [[-2, -4, 1]],     "expected": -6},
            {"args": [[0, 1, 2]],       "expected": 2},
            {"args": [[100, 99]],       "expected": 100},
            {"args": [[7, 13, 21]],     "expected": 0},
            {"args": [[2, 2, 2]],       "expected": 6},
            {"args": [[-1, -2, -3, -4]],"expected": -6},
        ],
    },
    3: {
        "callTemplate": {"python": "Solution().isPalindrome({args})", "javascript": "isPalindrome({args})"},
        "tests": [
            {"args": [12321], "expected": True},
            {"args": [123],   "expected": False},
            {"args": [0],     "expected": True},
            {"args": [-5],    "expected": False},
            {"args": [1],     "expected": True},
        ],
    },
    4: {
        "callTemplate": {"python": "filterSquares({args})", "javascript": "filterSquares({args})"},
        "tests": [
            {"args": [[3, -3, 0, 9]],   "expected": [9, 81]},
            {"args": [[]],              "expected": []},
            {"args": [[-5, -10]],       "expected": []},
            {"args": [[7]],             "expected": [49]},
            {"args": [[1, 2, 3, 4, 5]], "expected": [1, 4, 9, 16, 25]},
        ],
    },
    5: {
        "callTemplate": {"python": "uniqueValues({args})", "javascript": "uniqueValues({args})"},
        "tests": [
            {"args": [[9, 9, 8, 7, 8, 9]],  "expected": [9, 8, 7]},
            {"args": [[1, 1, 1, 1]],        "expected": [1]},
            {"args": [[]],                  "expected": []},
            {"args": [[4, 3, 2, 1]],        "expected": [4, 3, 2, 1]},
            {"args": [[0, 0, -1, -1, 2]],   "expected": [0, -1, 2]},
        ],
    },
    6: {
        "callTemplate": {"python": "mostFrequent({args})", "javascript": "mostFrequent({args})"},
        "tests": [
            {"args": [[4, 4, 4, 2, 2, 2, 2]], "expected": 2},
            {"args": [[1, 1, 2, 2]],          "expected": 1},
            {"args": [[9]],                   "expected": 9},
            {"args": [[3, 3, 3, 3]],          "expected": 3},
            {"args": [[-1, -1, -2, -3, -3]],  "expected": -3},
            {"args": [[0, 1, 0, 1, 2]],       "expected": 0},
        ],
    },
    7: {
        "callTemplate": {"python": "topScorer({args})", "javascript": "topScorer({args})"},
        "tests": [
            {"args": [[{"name": "Zoe", "score": 10}, {"name": "Bo", "score": 99}]], "expected": "Bo"},
            {"args": [[{"name": "A", "score": 0}, {"name": "B", "score": 0}, {"name": "C", "score": 5}]], "expected": "C"},
            {"args": [[{"name": "Solo", "score": 1}]], "expected": "Solo"},
            {"args": [[{"name": "X", "score": -5}, {"name": "Y", "score": -1}]], "expected": "Y"},
            {"args": [[{"name": "T1", "score": 100}, {"name": "T2", "score": 100}, {"name": "T3", "score": 100}]], "expected": "T1"},
        ],
    },
    8: {  # Boss #1 — Signal Report — processSignals
        "callTemplate": {"python": "processSignals({args})", "javascript": "processSignals({args})"},
        "tests": [
            {"args": [[{"type": "audio", "value": 4}, {"type": "audio", "value": 5}, {"type": "video", "value": 2}]], "expected": "audio: 4.50, video: 2.00"},
            {"args": [[{"type": "audio", "value": -1}, {"type": "video", "value": 3}]], "expected": "video: 3.00"},
            {"args": [[]], "expected": ""},
            {"args": [[{"type": "z", "value": 10}, {"type": "a", "value": 20}]], "expected": "a: 20.00, z: 10.00"},
            {"args": [[{"type": "x", "value": 0}, {"type": "x", "value": 6}]], "expected": "x: 6.00"},
        ],
    },
     9: {
        "callTemplate": {"python": "fib({args})", "javascript": "fib({args})"},
        "tests": [
            {"args": [2],  "expected": 1},
            {"args": [3],  "expected": 2},
            {"args": [6],  "expected": 8},
            {"args": [8],  "expected": 21},
            {"args": [10], "expected": 55},
        ],
    },
}


class CodeRequest(BaseModel):
    code: str
    language: str = "python"
    expected_output: str = ""

class Criterion(BaseModel):
    key: str
    layer: str
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


def evaluate_criterion(key, analysis, correct_output, all_hidden_passed):
    if key == "loops": return analysis.get("loops", 0) > 0
    if key == "conditions": return analysis.get("conditions", 0) > 0
    if key == "functions": return bool(analysis.get("function_presence", False))
    if key == "no_syntax_error": return not analysis.get("syntax_error", False)
    if key == "correct_output": return correct_output
    if key == "all_hidden_passed": return all_hidden_passed
    return False


def score_from_criteria(criteria: list, analysis: dict, correct_output: bool, all_hidden_passed: bool):
    # Layers are built dynamically from whatever `layer` names appear in
    # this level's criteria — NOT a hardcoded 4-key dict. Any level (boss
    # or otherwise) can use any number of layers just by defining them in
    # its criteria; no backend code change is ever needed for more layers.
    layers = {}
    score = 0.0
    max_score = 0.0

    for c in criteria:
        key, layer, weight = c["key"], c["layer"], c["weight"]
        if layer not in layers:
            layers[layer] = {"weight": 0.0, "synced": False}
        max_score += weight
        satisfied = evaluate_criterion(key, analysis, correct_output, all_hidden_passed)
        layers[layer]["weight"] = 1.0 if satisfied else 0.0
        layers[layer]["synced"] = satisfied and correct_output
        if satisfied:
            score += weight

    harmony_score = (score / max_score * 100) if max_score > 0 else 0.0
    return layers, float(min(100, round(harmony_score)))


def check_blocked_imports(code):
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return None
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name.split(".")[0] in BLOCKED_IMPORTS:
                    return alias.name
        if isinstance(node, ast.ImportFrom):
            if node.module and node.module.split(".")[0] in BLOCKED_IMPORTS:
                return node.module
    return None


def extract_error_line(error_output):
    m = re.search(r'line (\d+)', error_output)
    if m: return int(m.group(1))
    m = re.search(r':(\d+):\d+\)', error_output)
    if m: return int(m.group(1))
    return None


def _run_test_script(script, suffix, runner):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, mode="w", encoding="utf-8") as f:
            f.write(script)
            fname = f.name
        result = subprocess.run([runner, fname], capture_output=True, text=True, timeout=5)
        os.unlink(fname)
        if result.returncode != 0:
            return False
        out_lines = result.stdout.strip().split("\n")
        results = [l.strip() for l in out_lines if l.strip() in ("HIDDEN_PASS", "HIDDEN_FAIL")]
        return len(results) > 0 and all(r == "HIDDEN_PASS" for r in results)
    except Exception:
        return False


def run_hidden_tests(user_code, level_id, language="python"):
    config = LEVEL_HIDDEN_TESTS.get(level_id)
    if not config:
        return True
    lang = language if language in ("python", "javascript") else "python"
    call_template = config["callTemplate"].get(lang)
    tests = config["tests"]
    if not call_template:
        return False

    if lang == "python":
        lines = [user_code, ""]
        for i, t in enumerate(tests):
            args_literal = ", ".join(repr(a) for a in t["args"])
            call_expr = call_template.replace("{args}", args_literal)
            expected_literal = repr(t["expected"])
            lines.append(f'_r{i} = {call_expr}')
            lines.append(f'print("HIDDEN_PASS" if _r{i} == {expected_literal} else "HIDDEN_FAIL")')
        return _run_test_script("\n".join(lines), ".py", "python")
    else:
        lines = [user_code, ""]
        for i, t in enumerate(tests):
            args_literal = ", ".join(json.dumps(a) for a in t["args"])
            call_expr = call_template.replace("{args}", args_literal)
            expected_literal = json.dumps(t["expected"])
            lines.append(f'var _r{i} = {call_expr};')
            lines.append(f'console.log(JSON.stringify(_r{i}) === JSON.stringify({expected_literal}) ? "HIDDEN_PASS" : "HIDDEN_FAIL");')
        return _run_test_script("\n".join(lines), ".js", "node")


@app.post("/run-code")
def run_code(request: CodeRequest):
    lang = request.language.lower()
    config = LANGUAGE_CONFIG.get(lang, LANGUAGE_CONFIG["python"])
    code = request.code

    if config["use_ast"]:
        blocked = check_blocked_imports(code)
        if blocked:
            return {"output": f"SecurityError: import '{blocked}' is not allowed.",
                    "analysis": {"loops": 0, "conditions": 0, "function_presence": False,
                                 "nested_depth": 0, "syntax_error": True, "correct_output": False, "error_line": None}}

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


@app.post("/analyze-code")
def analyze_code_ml(request: AnalyzeRequest):
    lang = request.language.lower()
    config = LANGUAGE_CONFIG.get(lang, LANGUAGE_CONFIG["python"])
    code = request.code
    full_code = code + "\n\n" + request.test_runner if request.test_runner.strip() else code

    if config["use_ast"]:
        blocked = check_blocked_imports(code)
        if blocked:
            return {"output": f"SecurityError: import '{blocked}' is not allowed.\nThis import is blocked for security reasons.",
                    "harmony_score": 0,
                    "layers": {"drums": {"weight": 0.0, "synced": False}, "chords": {"weight": 0.0, "synced": False},
                               "bass": {"weight": 0.0, "synced": False}, "melody": {"weight": 0.0, "synced": False}},
                    "analysis": {"loops": 0, "conditions": 0, "function_presence": False, "nested_depth": 0,
                                 "syntax_error": True, "correct_output": False, "error_line": None, "all_hidden_passed": False}}

    ast_analysis = analyze_python(code) if config["use_ast"] else analyze_js(code)

    if config["use_ast"] and ast_analysis["syntax_error"]:
        return {"output": ast_analysis.get("error_message", "SyntaxError: invalid syntax"), "harmony_score": 0,
                "layers": {"drums": {"weight": 0.0, "synced": False}, "chords": {"weight": 0.0, "synced": False},
                           "bass": {"weight": 0.0, "synced": False}, "melody": {"weight": 0.0, "synced": False}},
                "analysis": {**ast_analysis, "error_line": ast_analysis.get("error_line"), "all_hidden_passed": False}}

    output = ""
    correct_output = False
    error_line = None
    try:
        output = execute_code(full_code, config)
        correct_output = output.strip() == request.expected_output.strip()
        if "Error" in output or "error" in output:
            error_line = extract_error_line(output)
    except subprocess.TimeoutExpired:
        output = "Error: timed out (5s)"
    except Exception as e:
        output = str(e)

    all_hidden_passed = True
    if request.level_id in LEVEL_HIDDEN_TESTS:
        all_hidden_passed = correct_output and run_hidden_tests(code, request.level_id, lang)

    ast_analysis["correct_output"] = correct_output
    ast_analysis["error_line"] = error_line
    ast_analysis["all_hidden_passed"] = all_hidden_passed

    server_criteria = LEVEL_CRITERIA.get(request.level_id)

    if server_criteria:
        layers, harmony_score = score_from_criteria(server_criteria, ast_analysis, correct_output, all_hidden_passed)
    elif request.criteria:
        criteria_dicts = [c.dict() for c in request.criteria]
        layers, harmony_score = score_from_criteria(criteria_dicts, ast_analysis, correct_output, all_hidden_passed)
    else:
        features = np.array([[ast_analysis["loops"], ast_analysis["conditions"],
                               1 if ast_analysis["function_presence"] else 0, 1 if correct_output else 0,
                               ast_analysis["nested_depth"], request.loops_required,
                               request.conditions_required, request.functions_required]])
        if harmony_model is not None:
            prediction = harmony_model.predict(features)[0]
            harmony_score = float(np.clip(round(prediction[0]), 0, 100))
            layers = {
                "drums": {"weight": float(np.clip(prediction[1], 0, 1)), "synced": correct_output and ast_analysis["loops"] > 0},
                "chords": {"weight": float(np.clip(prediction[2], 0, 1)), "synced": correct_output and ast_analysis["conditions"] > 0},
                "bass": {"weight": float(np.clip(prediction[3], 0, 1)), "synced": correct_output and ast_analysis["function_presence"]},
                "melody": {"weight": 1.0 if all_hidden_passed else 0.0, "synced": all_hidden_passed},
            }
        else:
            harmony_score = 100.0 if correct_output else 30.0
            layers = {
                "drums": {"weight": 1.0 if ast_analysis["loops"] > 0 else 0.0, "synced": correct_output},
                "chords": {"weight": 1.0 if ast_analysis["conditions"] > 0 else 0.0, "synced": correct_output},
                "bass": {"weight": 1.0 if ast_analysis["function_presence"] else 0.0, "synced": correct_output},
                "melody": {"weight": 0.0, "synced": False},
            }

    return {"output": output, "harmony_score": harmony_score, "layers": layers, "analysis": ast_analysis}


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


def analyze_python(code):
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return {"loops": 0, "conditions": 0, "function_presence": False, "nested_depth": 0,
                "syntax_error": True, "correct_output": False, "error_line": e.lineno, "error_message": str(e)}
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
        elif isinstance(node, ast.comprehension):
            loops += 1
            conditions += len(node.ifs)
        elif isinstance(node, ast.BoolOp):
            conditions += 1
        for child in ast.iter_child_nodes(node):
            visit(child, depth + 1)
    visit(tree)
    return {"loops": loops, "conditions": conditions, "function_presence": functions > 0,
            "nested_depth": max_depth[0], "syntax_error": False, "correct_output": False, "error_line": None}


def analyze_js(code):
    try:
        result = subprocess.run(["node", JS_ANALYZER_PATH], input=code, capture_output=True, text=True, timeout=5)
        if result.returncode == 0 and result.stdout:
            data = json.loads(result.stdout)
            return {"loops": data.get("loops", 0), "conditions": data.get("conditions", 0),
                    "function_presence": data.get("function_presence", False), "nested_depth": data.get("nested_depth", 0),
                    "syntax_error": data.get("syntax_error", False), "correct_output": False, "error_line": None}
    except Exception:
        pass
    return analyze_js_regex(code)


def analyze_js_regex(code):
    loops = len(re.findall(r'\b(for|while)\b', code))
    conditions = len(re.findall(r'\bif\b', code))
    functions = bool(re.search(r'\b(function\s+\w+|\w+\s*=\s*function|const\s+\w+\s*=\s*(\(.*?\)|[\w]+)\s*=>)', code))
    lines = code.split("\n")
    max_depth = max(((len(l) - len(l.lstrip())) // 2) for l in lines if l.strip()) if lines else 0
    return {"loops": loops, "conditions": conditions, "function_presence": functions, "nested_depth": max_depth,
            "syntax_error": False, "correct_output": False, "error_line": None}