from fastapi import FastAPI
from pydantic import BaseModel
import subprocess
import tempfile
import ast

app = FastAPI()

class CodeRequest(BaseModel):
    code: str
    language: str = "python"


@app.post("/run-code")
def run_code(request: CodeRequest):
    code = request.code

    try:
        # create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode="w") as f:
            f.write(code)
            file_name = f.name

        # run the code
        result = subprocess.run(
            ["python", file_name],
            capture_output=True,
            text=True,
            timeout=5
        )

        return {
            "success": result.returncode == 0,
            "output": result.stdout if result.returncode == 0 else result.stderr,
            "analysis": analyze_code(code)
        }

    except Exception as e:
        return {"output": str(e), "analysis": {}}


def analyze_code(code: str):
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return {
            "loops": 0,
            "conditions": 0,
            "nested_depth": 0,
            "functions": 0,
            "syntax_error": True
        }

    loops = 0
    conditions = 0
    functions = 0
    max_depth = 0

    def visit(node, depth=0):
        nonlocal loops, conditions, functions, max_depth

        new_depth = depth

        # Count loops
        if isinstance(node, (ast.For, ast.While)):
            loops += 1
            new_depth += 1

        # Count conditions
        elif isinstance(node, ast.If):
            conditions += 1
            new_depth += 1

        # Count functions
        elif isinstance(node, ast.FunctionDef):
            functions += 1
            new_depth += 1

        # Update max depth
        max_depth = max(max_depth, new_depth)

        # Visit children
        for child in ast.iter_child_nodes(node):
            visit(child, new_depth)

    visit(tree)

    return {
        "loops": loops,
        "conditions": conditions,
        "nested_depth": max_depth,
        "functions": functions,
        "syntax_error": False
    }