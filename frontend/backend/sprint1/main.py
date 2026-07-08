from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

# ── Load ML model ──
MODEL_PATH = "harmony_model.pkl"
try:
    harmony_model = joblib.load(MODEL_PATH)
    print(f"✅ Harmony model loaded from {MODEL_PATH}")
except FileNotFoundError:
    harmony_model = None
    print(f"⚠ No model found at {MODEL_PATH}. Run train_model.py first.")

JS_ANALYZER_PATH = os.path.join(os.path.dirname(__file__), "analyze_js.js")

# ── Blocked imports (security) ──
BLOCKED_IMPORTS = {
    "os", "sys", "subprocess", "shutil", "socket",
    "requests", "urllib", "http", "ftplib", "smtplib",
    "pickle", "shelve", "importlib", "builtins",
    "ctypes", "multiprocessing", "threading", "signal",
    "pathlib", "glob", "tempfile", "io", "pty",
    "atexit", "gc", "inspect", "pdb", "traceback",
}

# ── Hidden test cases per level ──
HIDDEN_TESTS = {
    2: [
        {"input": [],            "expected": 0  },
        {"input": [-2, -4, 1],  "expected": -6 },
        {"input": [0, 1, 2],    "expected": 2  },
        {"input": [100, 99],    "expected": 100},
        {"input": [7, 13, 21],  "expected": 0  },
        {"input": [2, 2, 2],    "expected": 6  },
        {"input": [-1,-2,-3,-4],"expected": -6 },
    ]
}

# ── Request models ──

class CodeRequest(BaseModel):
    code: str
    language: str = "python"
    expected_output: str = ""

class AnalyzeRequest(BaseModel):
    code: str
    language: str = "python"
    expected_output: str = ""
    loops_required: int = 0
    conditions_required: int = 0
    functions_required: int = 0
    test_runner: str = ""
    level_id: int = 0

LANGUAGE_CONFIG = {
    "python":     {"runner": "python", "suffix": ".py",  "use_ast": True},
    "javascript": {"runner": "node",   "suffix": ".js",  "use_ast": False},
}


# ── Security: scan for blocked imports ──

def check_blocked_imports(code: str) -> str | None:
    """
    Returns the name of the first blocked import found,
    or None if the code is safe.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return None  # syntax errors handled elsewhere

    for node in ast.walk(tree):
        # import os / import sys
        if isinstance(node, ast.Import):
            for alias in node.names:
                base = alias.name.split(".")[0]
                if base in BLOCKED_IMPORTS:
                    return alias.name
        # from os import path / from sys import argv
        if isinstance(node, ast.ImportFrom):
            if node.module:
                base = node.module.split(".")[0]
                if base in BLOCKED_IMPORTS:
                    return node.module

    return None


# ── Error line extraction ──

def extract_error_line(error_output: str) -> int | None:
    """
    Parses Python/JS error output to find the line number.
    Python: '  File "...", line 4'
    JS:     'at Object.<anonymous> (...:16:1)'
    """
    # Python format
    py_match = re.search(r'line (\d+)', error_output)
    if py_match:
        return int(py_match.group(1))

    # JS format: filename:line:col
    js_match = re.search(r':(\d+):\d+\)', error_output)
    if js_match:
        return int(js_match.group(1))

    return None


# ── Hidden test runner (Python only for now) ──

def run_hidden_tests(user_code: str, level_id: int) -> bool:
    """
    Runs hidden test cases for the given level against the user's function.
    Returns True if all hidden tests pass, False otherwise.
    Never reveals test cases or results to the user.
    """
    tests = HIDDEN_TESTS.get(level_id)
    if not tests:
        return True  # no hidden tests for this level

    if level_id == 2:
        # Build a test script that imports the user's function
        # and runs all hidden cases, printing PASS/FAIL
        test_lines = [user_code, "\n"]
        for i, test in enumerate(tests):
            inp = json.dumps(test["input"])
            exp = test["expected"]
            test_lines.append(
                f'_r{i} = sumEven({inp})\n'
                f'print("HIDDEN_PASS" if _r{i} == {exp} else "HIDDEN_FAIL")\n'
            )
        test_code = "\n".join(test_lines)

        try:
            with tempfile.NamedTemporaryFile(
                delete=False, suffix=".py", mode="w", encoding="utf-8"
            ) as f:
                f.write(test_code)
                fname = f.name

            result = subprocess.run(
                ["python", fname],
                capture_output=True, text=True, timeout=5
            )
            os.unlink(fname)

            if result.returncode != 0:
                return False

            lines = result.stdout.strip().split("\n")
            results = [l.strip() for l in lines if l.strip() in ("HIDDEN_PASS", "HIDDEN_FAIL")]
            return len(results) == len(tests) and all(r == "HIDDEN_PASS" for r in results)

        except Exception:
            return False

    return True


# ── /run-code ──

@app.post("/run-code")
def run_code(request: CodeRequest):
    lang   = request.language.lower()
    config = LANGUAGE_CONFIG.get(lang, LANGUAGE_CONFIG["python"])
    code   = request.code

    # Security check
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

    # Security check
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

    # AST analysis
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

    # Execute public test runner
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

    # Run hidden tests (only if public tests pass, to save time)
    all_hidden_passed = False
    if correct_output and request.level_id in HIDDEN_TESTS:
        all_hidden_passed = run_hidden_tests(code, request.level_id)
    elif request.level_id not in HIDDEN_TESTS:
        all_hidden_passed = True  # no hidden tests for this level

    ast_analysis["correct_output"]    = correct_output
    ast_analysis["error_line"]        = error_line
    ast_analysis["all_hidden_passed"] = all_hidden_passed

    # ML prediction
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
        drum_weight   = float(np.clip(prediction[1], 0.0, 1.0))
        chord_weight  = float(np.clip(prediction[2], 0.0, 1.0))
        bass_weight   = float(np.clip(prediction[3], 0.0, 1.0))
    else:
        harmony_score = 100.0 if correct_output else 30.0
        drum_weight   = 1.0 if ast_analysis["loops"] > 0 else 0.0
        chord_weight  = 1.0 if ast_analysis["conditions"] > 0 else 0.0
        bass_weight   = 1.0 if ast_analysis["function_presence"] else 0.0

    # ── Level-aware layer mapping ──

    if request.level_id == 0:
        # drums=loops, chords=no_syntax_error, bass=correct_output
        drum_weight   = 1.0 if ast_analysis["loops"] > 0 else 0.0
        chord_weight  = 0.0 if ast_analysis["syntax_error"] else 1.0
        bass_weight   = 1.0 if correct_output else 0.0
        melody_weight = 0.0
        drum_synced   = drum_weight  > 0 and correct_output
        chord_synced  = chord_weight > 0 and correct_output
        bass_synced   = correct_output
        melody_synced = False
        score = 0
        if drum_weight  > 0: score += 35 if drum_synced  else 20
        if chord_weight > 0: score += 35 if chord_synced else 20
        if bass_weight  > 0: score += 30
        harmony_score = float(min(100, score))

    elif request.level_id == 1:
        # drums=correct_output, chords=conditions, bass=functions, melody=no_syntax_error
        drum_weight   = 1.0 if correct_output else 0.0
        chord_weight  = 1.0 if ast_analysis["conditions"] > 0 else 0.0
        bass_weight   = 1.0 if ast_analysis["function_presence"] else 0.0
        melody_weight = 0.0 if ast_analysis["syntax_error"] else 1.0
        drum_synced   = correct_output
        chord_synced  = correct_output and ast_analysis["conditions"] > 0
        bass_synced   = correct_output and ast_analysis["function_presence"]
        melody_synced = correct_output and not ast_analysis["syntax_error"]
        score = 0
        if drum_weight   > 0: score += 30 if drum_synced   else 15
        if chord_weight  > 0: score += 25 if chord_synced  else 12
        if bass_weight   > 0: score += 25 if bass_synced   else 12
        if melody_weight > 0: score += 20 if melody_synced else 10
        harmony_score = float(min(100, score))

    elif request.level_id == 2:
        # drums=loops, chords=conditions, bass=no_syntax_error, melody=all_hidden_passed
        drum_weight   = 1.0 if ast_analysis["loops"] > 0 else 0.0
        chord_weight  = 1.0 if ast_analysis["conditions"] > 0 else 0.0
        bass_weight   = 0.0 if ast_analysis["syntax_error"] else 1.0
        melody_weight = 1.0 if all_hidden_passed else 0.0
        drum_synced   = drum_weight  > 0 and correct_output
        chord_synced  = chord_weight > 0 and correct_output
        bass_synced   = bass_weight  > 0 and correct_output
        melody_synced = all_hidden_passed
        score = 0
        if drum_weight   > 0: score += 25 if drum_synced   else 12
        if chord_weight  > 0: score += 25 if chord_synced  else 12
        if bass_weight   > 0: score += 20 if bass_synced   else 10
        if melody_weight > 0: score += 30 if melody_synced else 0
        harmony_score = float(min(100, score))

    else:
        melody_weight = 1.0 if all_hidden_passed else 0.0
        melody_synced = all_hidden_passed
        drum_synced   = correct_output and ast_analysis["loops"] > 0
        chord_synced  = correct_output and ast_analysis["conditions"] > 0
        bass_synced   = correct_output and ast_analysis["function_presence"]

    return {
        "output": output,
        "harmony_score": harmony_score,
        "layers": {
            "drums":  {"weight": drum_weight,   "synced": drum_synced  },
            "chords": {"weight": chord_weight,  "synced": chord_synced },
            "bass":   {"weight": bass_weight,   "synced": bass_synced  },
            "melody": {"weight": melody_weight, "synced": melody_synced},
        },
        "analysis": ast_analysis
    }


# ── Code execution ──

def execute_code(code, config):
    with tempfile.NamedTemporaryFile(
        delete=False, suffix=config["suffix"], mode="w", encoding="utf-8"
    ) as f:
        f.write(code)
        fname = f.name
    try:
        r = subprocess.run(
            [config["runner"], fname],
            capture_output=True, text=True, timeout=5
        )
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
        "syntax_error": False, "correct_output": False,
        "error_line": None,
    }


# ── JS AST analysis via Node.js + acorn ──

def analyze_js(code):
    try:
        result = subprocess.run(
            ["node", JS_ANALYZER_PATH],
            input=code,
            capture_output=True, text=True, timeout=5
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
    import re
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