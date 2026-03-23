from fastapi import FastAPI 
from pydantic import BaseModel 
import subprocess
import tempfile

app = FastAPI()

class CodeRequest(BaseModel):
    code: str 
    language: str ="python"


@app.post("/run-code")
def run_code(request: CodeRequest):
    code = request.code

    try:
        #create tem file  (short time memory )
        #On ne peut pas exécuter directement une chaîne de caractères avec subprocess
        #Donc on écrit le code dans un fichier temporaire.
        with tempfile.NamedTemporaryFile(delete=False , suffix=".py" , mode="w") as f:
            f.write(code)
            file_name=f.name

            #run the code 
            result = subprocess.run(["python",file_name],capture_output=True,text=True,timeout=5)

            output= result.stdout if result.stdout else result.stderr
# output is what happend when the user ran the code (stdout or stderr)
#analisis is the know what kind of sturcter is like if it is loop or a if/else 
            return { 
                "success": result.returncode == 0,
                "output": result.stdout if result.returncode == 0 else result.stderr,
                "analysis": analyze_code(code)
}
        
    except Exception as e:
        return{"output": str(e), "analisis": {}} 
    
def analyze_code(code: str):
    loops = code.count("for") + code.count("while")
    conditions = code.count("if")

    return {
        "loops": loops,
        "conditions": conditions,
        "prints": code.count("print"),
        "has_error": "error" in code.lower()
    }

