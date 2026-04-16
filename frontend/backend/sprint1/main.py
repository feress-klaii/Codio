from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import tempfile
import os
import ast
import numpy as np
import joblib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load ML model once at startup ──
MODEL_PATH = "harmony_model.pkl"
try:
    harmony_model = joblib.load(MODEL_PATH)
    print(f"✅ Harmony model loaded from {MODEL_PATH}")
except FileNotFoundError:
    harmony_model = None
    print(f"⚠ No model found at {MODEL_PATH}. Run train_model.py first.")


# ── Request models ──

class CodeRequest(BaseModel):
    code: str
    expected_output: str = ""

class AnalyzeRequest(BaseModel):
    code: str
    expected_output: str = ""
    loops_required: int = 0
    conditions_required: int = 0
    functions_required: int = 0


# ── /run-code — execute + basic AST analysis ──

@app.post("/run-code")
def run_code(request: CodeRequest):
    code = request.code
    analysis = analyze_code(code)

    if analysis["syntax_error"]:
        return {
            "output": "SyntaxError: missing colon or invalid syntax",
            "analysis": analysis
        }

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode="w") as f:
            f.write(code)
            file_name = f.name

        result = subprocess.run(
            ["python", file_name],
            capture_output=True,
            text=True,
            timeout=5
        )

        os.unlink(file_name)

        output = result.stdout if result.returncode == 0 else result.stderr
        correct_output = output.strip() == request.expected_output.strip()
        analysis["correct_output"] = correct_output

        return {
            "output": output,
            "analysis": analysis
        }

    except subprocess.TimeoutExpired:
        return {
            "output": "Error: code execution timed out (5s limit)",
            "analysis": {**analysis, "correct_output": False}
        }
    except Exception as e:
        return {
            "output": str(e),
            "analysis": {**analysis, "correct_output": False}
        }


# ── /analyze-code — ML-based harmony mapping ──

@app.post("/analyze-code")
def analyze_code_ml(request: AnalyzeRequest):
    code = request.code

    # Step 1: extract features via AST
    ast_analysis = analyze_code(code)

    # Step 2: check output correctness
    correct_output = False
    output = ""

    if not ast_analysis["syntax_error"]:
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode="w") as f:
                f.write(code)
                file_name = f.name

            result = subprocess.run(
                ["python", file_name],
                capture_output=True,
                text=True,
                timeout=5
            )
            os.unlink(file_name)

            output = result.stdout if result.returncode == 0 else result.stderr
            correct_output = output.strip() == request.expected_output.strip()

        except Exception:
            correct_output = False

    # Step 3: build feature vector
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

    # Step 4: ML prediction
    if harmony_model is not None:
        prediction = harmony_model.predict(features)[0]
        harmony_score  = float(np.clip(round(prediction[0]), 0, 100))
        drum_weight    = float(np.clip(prediction[1], 0.0, 1.0))
        chord_weight   = float(np.clip(prediction[2], 0.0, 1.0))
        bass_weight    = float(np.clip(prediction[3], 0.0, 1.0))
    else:
        # Fallback to rule-based if model not loaded
        harmony_score  = 100.0 if correct_output else 30.0
        drum_weight    = 1.0 if ast_analysis["loops"] > 0 else 0.0
        chord_weight   = 1.0 if ast_analysis["conditions"] > 0 else 0.0
        bass_weight    = 1.0 if ast_analysis["function_presence"] else 0.0

    # Step 5: sync score per layer
    # A layer is "synced" when correct_output is true AND the feature is present
    drum_synced  = correct_output and ast_analysis["loops"] > 0
    chord_synced = correct_output and ast_analysis["conditions"] > 0
    bass_synced  = correct_output and ast_analysis["function_presence"]

    return {
        "output": output,
        "harmony_score": harmony_score,
        "layers": {
            "drums":  { "weight": drum_weight,  "synced": drum_synced  },
            "chords": { "weight": chord_weight, "synced": chord_synced },
            "bass":   { "weight": bass_weight,  "synced": bass_synced  },
        },
        "analysis": {
            **ast_analysis,
            "correct_output": correct_output,
        }
    }


# ── AST feature extractor ──

def analyze_code(code: str):
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return {
            "loops": 0,
            "conditions": 0,
            "function_presence": False,
            "nested_depth": 0,
            "syntax_error": True,
            "correct_output": False,
        }

    loops = 0
    conditions = 0
    functions = 0
    max_depth = [0]

    def visit(node, depth=0):
        nonlocal loops, conditions, functions
        max_depth[0] = max(max_depth[0], depth)

        if isinstance(node, (ast.For, ast.While)):
            loops += 1
        elif isinstance(node, ast.If):
            conditions += 1
        elif isinstance(node, ast.FunctionDef):
            functions += 1

        for child in ast.iter_child_nodes(node):
            visit(child, depth + 1)

    visit(tree)

    return {
        "loops": loops,
        "conditions": conditions,
        "function_presence": functions > 0,
        "nested_depth": max_depth[0],
        "syntax_error": False,
    }