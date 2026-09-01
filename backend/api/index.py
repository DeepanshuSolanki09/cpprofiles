import sys
import os

# Add all relevant directory paths to sys.path so modules are found regardless of Vercel working directory
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
grandparent_dir = os.path.dirname(parent_dir)

for path in [current_dir, parent_dir, grandparent_dir]:
    if path and path not in sys.path:
        sys.path.insert(0, path)

app = None

try:
    from main import app as _app
    app = _app
except Exception:
    try:
        from backend.main import app as _app
        app = _app
    except Exception:
        # Fallback inline minimal FastAPI app if main fails to import
        from fastapi import FastAPI
        app = FastAPI()
        @app.get("/(.*)")
        def fallback():
            return {"error": "Failed to import main FastAPI application"}

