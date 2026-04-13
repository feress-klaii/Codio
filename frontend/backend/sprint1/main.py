from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import tempfile
import os
import ast

app = FastAPI()

# Allow React dev server to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


class CodeRequest(BaseModel):
    code: str
    expected_output: str = ""  # added — frontend sends this


@app.post("/run-code")
def run_code(request: CodeRequest):
    code = request.code

    # Check for syntax errors before running
    analysis = analyze_code(code)

    if analysis["syntax_error"]:
        try:
            ast.parse(code)
        except SyntaxError as e:
            error_msg = f"SyntaxError: {e.msg} (line {e.lineno})"
        else:
            error_msg = "SyntaxError: invalid syntax"
        return {
            "output": error_msg,
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

        os.unlink(file_name)  # clean up temp file

        output = result.stdout if result.returncode == 0 else result.stderr or result.stdout

        # Compare output to expected (strip trailing whitespace on both sides)
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


def analyze_code(code: str):
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return {
            "loops": 0,
            "conditions": 0,
            "function_presence": False,  # renamed + boolean
            "syntax_error": True,
            "correct_output": False
        }

    loops = 0
    conditions = 0
    functions = 0

    def visit(node):
        nonlocal loops, conditions, functions

        if isinstance(node, (ast.For, ast.While)):
            loops += 1
        elif isinstance(node, ast.If):
            conditions += 1
        elif isinstance(node, ast.FunctionDef):
            functions += 1

        for child in ast.iter_child_nodes(node):
            visit(child)

    visit(tree)

    return {
        "loops": loops,
        "conditions": conditions,
        "function_presence": functions > 0,  # boolean, matches frontend
        "syntax_error": False,
        # correct_output added after execution
    }