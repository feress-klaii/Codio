from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import tempfile
import os
import ast
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


LANGUAGE_CONFIG = {
    "python":     {"runner": "python", "suffix": ".py",  "use_ast": True},
    "javascript": {"runner": "node",   "suffix": ".js",  "use_ast": False},
}


@app.post("/run-code")
def run_code(request: CodeRequest):
    lang   = request.language.lower()
    config = LANGUAGE_CONFIG.get(lang, LANGUAGE_CONFIG["python"])
    code   = request.code
    analysis = analyze_python(code) if config["use_ast"] else analyze_js_basic(code)
    if config["use_ast"] and analysis["syntax_error"]:
        return {"output": "SyntaxError: invalid syntax", "analysis": analysis}
    try:
        output = execute_code(code, config)
        analysis["correct_output"] = output.strip() == request.expected_output.strip()
        return {"output": output, "analysis": analysis}
    except subprocess.TimeoutExpired:
        return {"output": "Error: timed out (5s)", "analysis": {**analysis, "correct_output": False}}
    except Exception as e:
        return {"output": str(e), "analysis": {**analysis, "correct_output": False}}


@app.post("/analyze-code")
def analyze_code_ml(request: AnalyzeRequest):
    lang      = request.language.lower()
    config    = LANGUAGE_CONFIG.get(lang, LANGUAGE_CONFIG["python"])
    code      = request.code
    full_code = code + "\n\n" + request.test_runner if request.test_runner.strip() else code

    ast_analysis = analyze_python(code) if config["use_ast"] else analyze_js_basic(code)

    if config["use_ast"] and ast_analysis["syntax_error"]:
        return {
            "output": "SyntaxError: invalid syntax",
            "harmony_score": 0,
            "layers": {
                "drums":  {"weight": 0.0, "synced": False},
                "chords": {"weight": 0.0, "synced": False},
                "bass":   {"weight": 0.0, "synced": False},
                "melody": {"weight": 0.0, "synced": False},
            },
            "analysis": ast_analysis
        }

    output = ""
    correct_output = False
    try:
        output = execute_code(full_code, config)
        correct_output = output.strip() == request.expected_output.strip()
    except subprocess.TimeoutExpired:
        output = "Error: timed out (5s)"
    except Exception as e:
        output = str(e)

    ast_analysis["correct_output"] = correct_output

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

    melody_weight = 1.0 if correct_output else 0.0
    melody_synced = correct_output
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


def execute_code(code, config):
    with tempfile.NamedTemporaryFile(delete=False, suffix=config["suffix"], mode="w", encoding="utf-8") as f:
        f.write(code)
        fname = f.name
    try:
        r = subprocess.run([config["runner"], fname], capture_output=True, text=True, timeout=5)
        return r.stdout if r.returncode == 0 else r.stderr
    finally:
        if os.path.exists(fname): os.unlink(fname)


def analyze_python(code):
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return {"loops": 0, "conditions": 0, "function_presence": False,
                "nested_depth": 0, "syntax_error": True, "correct_output": False}
    loops = conditions = functions = 0
    max_depth = [0]
    def visit(node, depth=0):
        nonlocal loops, conditions, functions
        max_depth[0] = max(max_depth[0], depth)
        if isinstance(node, (ast.For, ast.While)): loops += 1
        elif isinstance(node, ast.If): conditions += 1
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)): functions += 1
        for child in ast.iter_child_nodes(node): visit(child, depth + 1)
    visit(tree)
    return {"loops": loops, "conditions": conditions, "function_presence": functions > 0,
            "nested_depth": max_depth[0], "syntax_error": False, "correct_output": False}


def analyze_js_basic(code):
    loops      = len(re.findall(r'\b(for|while)\b', code))
    conditions = len(re.findall(r'\bif\b', code))
    functions  = bool(re.search(r'\b(function\s+\w+|const\s+\w+\s*=\s*(\(.*?\)|[\w]+)\s*=>)', code))
    lines      = code.split("\n")
    max_depth  = max(((len(l) - len(l.lstrip())) // 2) for l in lines if l.strip()) if lines else 0
    return {"loops": loops, "conditions": conditions, "function_presence": functions,
            "nested_depth": max_depth, "syntax_error": False, "correct_output": False}