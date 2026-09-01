import sys
import os

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")

for path in [backend_dir, root_dir]:
    if path and path not in sys.path:
        sys.path.insert(0, path)

try:
    from backend.main import app
except Exception:
    try:
        from main import app
    except Exception as e:
        from fastapi import FastAPI
        app = FastAPI()

        @app.get("/api/health")
        def health():
            return {"status": "error", "message": str(e)}

