import sys
import os

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")

for path in [backend_dir, root_dir]:
    if path and path not in sys.path:
        sys.path.insert(0, path)

app = None

try:
    from backend.main import app as _app
    app = _app
except Exception as e1:
    try:
        from main import app as _app
        app = _app
    except Exception as e2:
        from fastapi import FastAPI
        app = FastAPI()

        @app.get("/api/health")
        def health():
            return {"status": "error", "message": f"e1: {e1}, e2: {e2}"}


